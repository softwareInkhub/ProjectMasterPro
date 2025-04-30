import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Task, insertTaskSchema, TaskStatusEnum, TaskPriorityEnum } from '@shared/schema';
import { storage } from './storage';
import { authenticateJwt, AuthRequest } from './auth';
import { broadcastEvent, EventType } from './websocket';

const router = Router();

// Initialize the router with WebSocket support for real-time updates
export function initTaskRoutes(): Router {
  /**
   * @api {get} /api/tasks Get all tasks with optional filters
   * @apiDescription Get all tasks with support for filtering by various criteria
   * @apiName GetTasks
   * @apiGroup Tasks
   * 
   * @apiQuery {String} [storyId] Filter tasks by story ID
   * @apiQuery {String} [assignedToId] Filter tasks by assignee ID
   * @apiQuery {String} [parentTaskId] Filter tasks by parent task ID
   * @apiQuery {String} [projectId] Filter tasks by project ID
   * @apiQuery {String} [sprintId] Filter tasks by sprint ID
   * @apiQuery {String} [status] Filter tasks by status
   * @apiQuery {String} [priority] Filter tasks by priority
   * @apiQuery {Boolean} [includeSubtasks=false] Include subtasks in response
   * @apiQuery {Boolean} [flattenHierarchy=false] Flatten task hierarchy in response
   * 
   * @apiSuccess {Object[]} tasks List of tasks matching filters
   */
  router.get('/', authenticateJwt, async (req: AuthRequest, res: Response) => {
    try {
      const {
        storyId,
        assignedToId,
        parentTaskId,
        projectId,
        sprintId,
        status,
        priority,
        includeSubtasks = false,
        flattenHierarchy = false,
      } = req.query;
      
      const options: any = {};
      
      if (storyId) options.storyId = storyId as string;
      if (assignedToId) options.assignedToId = assignedToId as string;
      if (parentTaskId) options.parentTaskId = parentTaskId as string;
      if (projectId) options.projectId = projectId as string;
      if (sprintId) options.sprintId = sprintId as string;
      if (status) options.status = status as string;
      if (priority) options.priority = priority as string;
      
      const tasks = await storage.getTasks(options);
      
      // Process tasks based on hierarchy options
      let processedTasks = tasks;
      
      if (flattenHierarchy) {
        // Return all tasks in a flat structure
        res.json(processedTasks);
        return;
      }
      
      if (!includeSubtasks) {
        // Filter out subtasks when not explicitly requested
        processedTasks = tasks.filter((task) => !task.parentTaskId);
      } else if (!parentTaskId) {
        // When includeSubtasks is true but no specific parent is requested,
        // organize tasks into a hierarchical structure
        const taskMap = new Map<string, Task & { subtasks?: Task[] }>();
        
        // First pass: create map of all tasks
        tasks.forEach(task => {
          taskMap.set(task.id, { ...task, subtasks: [] });
        });
        
        // Second pass: organize into hierarchy
        const rootTasks: (Task & { subtasks?: Task[] })[] = [];
        
        tasks.forEach(task => {
          const taskWithSubtasks = taskMap.get(task.id);
          if (!taskWithSubtasks) return;
          
          if (task.parentTaskId && taskMap.has(task.parentTaskId)) {
            const parent = taskMap.get(task.parentTaskId);
            if (parent && parent.subtasks) {
              parent.subtasks.push(taskWithSubtasks);
            }
          } else {
            rootTasks.push(taskWithSubtasks);
          }
        });
        
        processedTasks = rootTasks;
      }
      
      res.json(processedTasks);
    } catch (error) {
      console.error('Error getting tasks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * @api {get} /api/tasks/:id Get task by ID
   * @apiDescription Get detailed information about a specific task including audit trail
   * @apiName GetTaskById
   * @apiGroup Tasks
   * 
   * @apiParam {String} id Task ID
   * @apiQuery {Boolean} [includeSubtasks=false] Include subtasks in response
   * @apiQuery {Boolean} [includeComments=false] Include comments in response
   * @apiQuery {Boolean} [includeAttachments=false] Include attachments in response
   * @apiQuery {Boolean} [includeTimeEntries=false] Include time entries in response
   * 
   * @apiSuccess {Object} task Task details
   * @apiSuccess {Object[]} [subtasks] Subtasks (if requested)
   * @apiSuccess {Object[]} [comments] Comments (if requested)
   * @apiSuccess {Object[]} [attachments] Attachments (if requested)
   * @apiSuccess {Object[]} [timeEntries] Time entries (if requested)
   */
  router.get('/:id', authenticateJwt, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        includeSubtasks = false,
        includeComments = false,
        includeAttachments = false,
        includeTimeEntries = false
      } = req.query;
      
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // Create response object with task details
      const response: any = { task };
      
      // Add requested related data
      if (includeSubtasks === 'true') {
        response.subtasks = await storage.getTasks({ parentTaskId: id });
      }
      
      if (includeComments === 'true') {
        response.comments = await storage.getComments('TASK', id);
      }
      
      if (includeAttachments === 'true') {
        response.attachments = await storage.getAttachments('TASK', id);
      }
      
      if (includeTimeEntries === 'true') {
        response.timeEntries = await storage.getTimeEntries(id);
      }
      
      res.json(response);
    } catch (error) {
      console.error('Error getting task:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * @api {post} /api/tasks Create a new task
   * @apiDescription Create a new task with support for all available fields
   * @apiName CreateTask
   * @apiGroup Tasks
   * 
   * @apiBody {Object} taskData Data for the new task
   * 
   * @apiSuccess {Object} task The created task
   */
  router.post('/', authenticateJwt, async (req: Request, res: Response) => {
    try {
      // Get the user ID from the authenticated request
      const userId = req.user?.id;
      
      // Parse and validate the request body
      const validatedData = insertTaskSchema.parse({
        ...req.body,
        // Automatically set the creator if not provided
        createdById: req.body.createdById || userId,
        // Set last updated by to the current user
        lastUpdatedById: userId
      });
      
      // Create the task
      const task = await storage.createTask(validatedData);
      
      // Broadcast the new task via WebSocket
      broadcastEvent({
        type: EventType.TASK_CREATED,
        payload: task
      });
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      } else {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  /**
   * @api {put} /api/tasks/:id Update an existing task
   * @apiDescription Update task details with comprehensive validation
   * @apiName UpdateTask
   * @apiGroup Tasks
   * 
   * @apiParam {String} id Task ID
   * @apiBody {Object} taskData Updated task data
   * 
   * @apiSuccess {Object} task The updated task
   */
  router.put('/:id', authenticateJwt, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      // Check if task exists
      const existingTask = await storage.getTask(id);
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // If assignee is changing, record previous assignee
      let previousAssignees = existingTask.previousAssignees || [];
      if (req.body.assignedToId && 
          existingTask.assignedToId && 
          req.body.assignedToId !== existingTask.assignedToId) {
        // Add previous assignee to the history with timestamp
        previousAssignees = [
          ...previousAssignees,
          {
            userId: existingTask.assignedToId,
            assignedAt: existingTask.updatedAt,
            unassignedAt: new Date(),
            unassignedById: userId
          }
        ];
      }
      
      // Handle status transitions for automated timestamps
      let updatedData: any = {
        ...req.body,
        previousAssignees,
        lastUpdatedById: userId
      };
      
      // Automatically set actualStartDate when status changes from TODO to IN_PROGRESS
      if (existingTask.status === 'TODO' && req.body.status === 'IN_PROGRESS' && !existingTask.actualStartDate) {
        updatedData.actualStartDate = new Date();
      }
      
      // Automatically set actualDueDate when status changes to DONE
      if (req.body.status === 'DONE' && !existingTask.actualDueDate) {
        updatedData.actualDueDate = new Date();
        
        // Calculate slippage if we have planned and actual dates
        if (existingTask.plannedDueDate && updatedData.actualDueDate) {
          const plannedDate = new Date(existingTask.plannedDueDate);
          const actualDate = new Date(updatedData.actualDueDate);
          
          if (actualDate > plannedDate) {
            const diffTime = Math.abs(actualDate.getTime() - plannedDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // Assuming an 8-hour workday for slippage calculation
            updatedData.slippageHours = (diffDays * 8).toString();
          }
        }
      }
      
      // Update the task
      const updatedTask = await storage.updateTask(id, updatedData);
      
      // Broadcast the update via WebSocket
      broadcastEvent({
        type: EventType.TASK_UPDATED,
        payload: { task: updatedTask }
      });
      
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      } else {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  /**
   * @api {delete} /api/tasks/:id Delete a task
   * @apiDescription Delete a task and optionally reassign or delete its subtasks
   * @apiName DeleteTask
   * @apiGroup Tasks
   * 
   * @apiParam {String} id Task ID
   * @apiQuery {String} [subtaskAction=move_up] Action for subtasks: 'delete', 'move_up', or 'reassign'
   * @apiQuery {String} [reassignToId] If action is 'reassign', the ID of the task to reassign subtasks to
   * 
   * @apiSuccess {Boolean} success Whether the deletion was successful
   * @apiSuccess {Object} summary Summary of actions taken
   */
  router.delete('/:id', authenticateJwt, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { 
        subtaskAction = 'move_up',
        reassignToId 
      } = req.query as { subtaskAction?: string, reassignToId?: string };
      
      // Check if task exists
      const existingTask = await storage.getTask(id);
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // Get subtasks
      const subtasks = await storage.getTasks({ parentTaskId: id });
      
      // Handle subtasks according to the specified action
      const summary = { taskDeleted: false, subtasksAffected: 0, action: subtaskAction };
      
      if (subtasks.length > 0) {
        switch (subtaskAction) {
          case 'delete':
            // Delete all subtasks
            for (const subtask of subtasks) {
              await storage.deleteTask(subtask.id);
              summary.subtasksAffected++;
            }
            break;
            
          case 'move_up':
            // Move subtasks up to the parent of the deleted task
            for (const subtask of subtasks) {
              await storage.updateTask(subtask.id, {
                parentTaskId: existingTask.parentTaskId || null
              });
              summary.subtasksAffected++;
            }
            break;
            
          case 'reassign':
            // Reassign subtasks to a specified task
            if (!reassignToId) {
              return res.status(400).json({ 
                error: 'reassignToId is required when subtaskAction is "reassign"' 
              });
            }
            
            // Verify the target task exists
            const targetTask = await storage.getTask(reassignToId);
            if (!targetTask) {
              return res.status(404).json({ 
                error: 'Target task for reassignment not found' 
              });
            }
            
            // Reassign all subtasks
            for (const subtask of subtasks) {
              await storage.updateTask(subtask.id, { parentTaskId: reassignToId });
              summary.subtasksAffected++;
            }
            break;
            
          default:
            return res.status(400).json({ 
              error: 'Invalid subtaskAction. Valid values are "delete", "move_up", or "reassign"'
            });
        }
      }
      
      // Delete the task
      const result = await storage.deleteTask(id);
      summary.taskDeleted = result;
      
      // Broadcast the deletion via WebSocket
      broadcastEvent({
        type: EventType.TASK_DELETED,
        payload: { taskId: id, summary }
      });
      
      res.json({ success: result, summary });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * @api {post} /api/tasks/:id/attachments Add attachment to a task
   * @apiDescription Upload and attach a file to a task
   * @apiName AddTaskAttachment
   * @apiGroup Tasks
   * 
   * @apiParam {String} id Task ID
   * @apiBody {Object} attachmentData Attachment data including file information
   * 
   * @apiSuccess {Object} attachment The created attachment
   */
  router.post('/:id/attachments', authenticateJwt, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      // Check if task exists
      const existingTask = await storage.getTask(id);
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // Create attachment with task as entity
      const attachment = await storage.createAttachment({
        ...req.body,
        entityType: 'TASK',
        entityId: id,
        uploadedById: userId
      });
      
      // Broadcast attachment addition via WebSocket
      broadcastEvent({
        type: EventType.ATTACHMENT_CREATED,
        payload: { taskId: id, attachment }
      });
      
      res.status(201).json(attachment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      } else {
        console.error('Error adding attachment to task:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  /**
   * @api {post} /api/tasks/:id/comments Add comment to a task
   * @apiDescription Add a comment to a task with support for mentions and parent comments
   * @apiName AddTaskComment
   * @apiGroup Tasks
   * 
   * @apiParam {String} id Task ID
   * @apiBody {Object} commentData Comment data
   * 
   * @apiSuccess {Object} comment The created comment
   */
  router.post('/:id/comments', authenticateJwt, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      // Check if task exists
      const existingTask = await storage.getTask(id);
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // Create comment
      const comment = await storage.createComment({
        ...req.body,
        entityType: 'TASK',
        entityId: id,
        userId
      });
      
      // Process mentions if any
      if (req.body.mentions && Array.isArray(req.body.mentions) && req.body.mentions.length > 0) {
        for (const mentionedUserId of req.body.mentions) {
          // Create notification for each mentioned user
          await storage.createNotification({
            userId: mentionedUserId,
            type: 'MENTION',
            message: `You were mentioned in a comment on task ${existingTask.taskId}: "${existingTask.title}"`,
            entityType: 'COMMENT',
            entityId: comment.id
          });
        }
      }
      
      // Broadcast comment addition via WebSocket
      broadcastEvent({
        type: EventType.COMMENT_CREATED,
        payload: { taskId: id, comment }
      });
      
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      } else {
        console.error('Error adding comment to task:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  /**
   * @api {post} /api/tasks/:id/time-entries Record time spent on a task
   * @apiDescription Add a time entry to track time spent on a task
   * @apiName AddTaskTimeEntry
   * @apiGroup Tasks
   * 
   * @apiParam {String} id Task ID
   * @apiBody {Object} timeEntryData Time entry data
   * 
   * @apiSuccess {Object} timeEntry The created time entry
   */
  router.post('/:id/time-entries', authenticateJwt, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      // Check if task exists
      const existingTask = await storage.getTask(id);
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // Calculate duration if start and end times are provided
      let duration = req.body.duration;
      if (!duration && req.body.startTime && req.body.endTime) {
        const startTime = new Date(req.body.startTime);
        const endTime = new Date(req.body.endTime);
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
        duration = durationMinutes.toString();
      }
      
      // Create time entry
      const timeEntry = await storage.createTimeEntry({
        ...req.body,
        taskId: id,
        userId: userId,
        duration
      });
      
      // Update task's actual hours
      if (timeEntry.duration) {
        // Get all time entries for this task
        const timeEntries = await storage.getTimeEntries(id);
        
        // Calculate total hours from all time entries
        const totalMinutes = timeEntries.reduce((total, entry) => {
          return total + (parseInt(entry.duration || '0', 10) || 0);
        }, 0);
        
        // Convert minutes to hours (rounded to 2 decimal places)
        const totalHours = (totalMinutes / 60).toFixed(2);
        
        // Update the task with new actual hours
        await storage.updateTask(id, {
          actualEffortHours: totalHours,
          lastUpdatedById: userId
        });
      }
      
      // Broadcast time entry addition via WebSocket
      broadcastEvent({
        type: EventType.TIME_ENTRY_CREATED,
        payload: { taskId: id, timeEntry }
      });
      
      res.status(201).json(timeEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      } else {
        console.error('Error adding time entry to task:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  /**
   * @api {put} /api/tasks/:id/status Update task status
   * @apiDescription Update the status of a task with validation and automatic timestamp updates
   * @apiName UpdateTaskStatus
   * @apiGroup Tasks
   * 
   * @apiParam {String} id Task ID
   * @apiBody {String} status New status
   * @apiBody {String} [comment] Optional comment about the status change
   * 
   * @apiSuccess {Object} task The updated task
   */
  router.put('/:id/status', authenticateJwt, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { status, comment } = req.body;
      
      // Validate status
      const validatedStatus = TaskStatusEnum.safeParse(status);
      if (!validatedStatus.success) {
        return res.status(400).json({
          error: 'Invalid status',
          validValues: TaskStatusEnum.options
        });
      }
      
      // Check if task exists
      const existingTask = await storage.getTask(id);
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // Prepare update data
      const updateData: any = {
        status: validatedStatus.data,
        lastUpdatedById: userId
      };
      
      // Set timestamps based on status transitions
      if (existingTask.status === 'TODO' && status === 'IN_PROGRESS' && !existingTask.actualStartDate) {
        updateData.actualStartDate = new Date();
      }
      
      if (status === 'DONE' && !existingTask.actualDueDate) {
        updateData.actualDueDate = new Date();
        
        // Calculate slippage if we have planned and actual dates
        if (existingTask.plannedDueDate) {
          const plannedDate = new Date(existingTask.plannedDueDate);
          const actualDate = new Date();
          
          if (actualDate > plannedDate) {
            const diffTime = Math.abs(actualDate.getTime() - plannedDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // Assuming an 8-hour workday for slippage calculation
            updateData.slippageHours = (diffDays * 8).toString();
          }
        }
      }
      
      // Update the task
      const updatedTask = await storage.updateTask(id, updateData);
      
      // Add a comment about the status change if provided
      if (comment) {
        await storage.createComment({
          content: `Status changed from "${existingTask.status}" to "${status}": ${comment}`,
          userId,
          entityType: 'TASK',
          entityId: id
        });
      }
      
      // Create a notification for the assignee (if one exists and is different from updater)
      if (existingTask.assignedToId && existingTask.assignedToId !== userId) {
        await storage.createNotification({
          userId: existingTask.assignedToId,
          type: 'STATUS_CHANGE',
          message: `Status of task ${existingTask.taskId} changed from "${existingTask.status}" to "${status}"`,
          entityType: 'TASK',
          entityId: id
        });
      }
      
      // Broadcast status update via WebSocket
      broadcastEvent({
        type: EventType.TASK_UPDATED,
        payload: {
          taskId: id,
          oldStatus: existingTask.status,
          newStatus: status,
          task: updatedTask
        }
      });
      
      res.json(updatedTask);
    } catch (error) {
      console.error('Error updating task status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * @api {put} /api/tasks/:id/priority Update task priority
   * @apiDescription Update the priority of a task
   * @apiName UpdateTaskPriority
   * @apiGroup Tasks
   * 
   * @apiParam {String} id Task ID
   * @apiBody {String} priority New priority
   * @apiBody {String} [comment] Optional comment about the priority change
   * 
   * @apiSuccess {Object} task The updated task
   */
  router.put('/:id/priority', authenticateJwt, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { priority, comment } = req.body;
      
      // Validate priority
      const validatedPriority = TaskPriorityEnum.safeParse(priority);
      if (!validatedPriority.success) {
        return res.status(400).json({
          error: 'Invalid priority',
          validValues: TaskPriorityEnum.options
        });
      }
      
      // Check if task exists
      const existingTask = await storage.getTask(id);
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // Update the task
      const updatedTask = await storage.updateTask(id, {
        priority: validatedPriority.data,
        lastUpdatedById: userId
      });
      
      // Add a comment about the priority change if provided
      if (comment) {
        await storage.createComment({
          content: `Priority changed from "${existingTask.priority}" to "${priority}": ${comment}`,
          userId,
          entityType: 'TASK',
          entityId: id
        });
      }
      
      // Create a notification for the assignee (if one exists and is different from updater)
      if (existingTask.assignedToId && existingTask.assignedToId !== userId) {
        await storage.createNotification({
          userId: existingTask.assignedToId,
          type: 'PRIORITY_CHANGE',
          message: `Priority of task ${existingTask.taskId} changed from "${existingTask.priority}" to "${priority}"`,
          entityType: 'TASK',
          entityId: id
        });
      }
      
      // Broadcast priority update via WebSocket
      broadcastEvent({
        type: EventType.TASK_UPDATED,
        payload: {
          taskId: id, 
          oldPriority: existingTask.priority,
          newPriority: priority,
          task: updatedTask
        }
      });
      
      res.json(updatedTask);
    } catch (error) {
      console.error('Error updating task priority:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * @api {put} /api/tasks/:id/steps Update task steps/checklist
   * @apiDescription Update the steps/checklist items of a task
   * @apiName UpdateTaskSteps
   * @apiGroup Tasks
   * 
   * @apiParam {String} id Task ID
   * @apiBody {Object[]} steps Array of step objects
   * 
   * @apiSuccess {Object} task The updated task with updated steps
   */
  router.put('/:id/steps', authenticateJwt, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { steps } = req.body;
      
      // Validate steps array
      if (!Array.isArray(steps)) {
        return res.status(400).json({
          error: 'Steps must be an array'
        });
      }
      
      // Check if task exists
      const existingTask = await storage.getTask(id);
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // Process steps to add completion data
      const processedSteps = steps.map(step => {
        // If a step is newly marked as completed, add completion metadata
        if (step.isCompleted && !step.completedAt) {
          return {
            ...step,
            completedAt: new Date(),
            completedById: userId
          };
        }
        return step;
      });
      
      // Update the task
      const updatedTask = await storage.updateTask(id, {
        steps: processedSteps,
        lastUpdatedById: userId
      });
      
      // Calculate and update progress based on completed steps
      const totalSteps = processedSteps.length;
      if (totalSteps > 0) {
        const completedSteps = processedSteps.filter(step => step.isCompleted).length;
        const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
        
        // If all steps are complete and task isn't done, suggest updating status
        let suggestedAction = null;
        if (completionPercentage === 100 && existingTask.status !== 'DONE') {
          suggestedAction = {
            type: 'SUGGEST_STATUS_UPDATE',
            message: 'All steps are complete. Consider marking the task as done.',
            currentStatus: existingTask.status,
            suggestedStatus: 'DONE'
          };
        }
        
        // Broadcast steps update via WebSocket with completion info
        broadcastEvent({
          type: EventType.TASK_UPDATED,
          payload: {
            taskId: id,
            steps: processedSteps,
            completion: {
              total: totalSteps,
              completed: completedSteps,
              percentage: completionPercentage
            },
            suggestedAction,
            task: updatedTask
          }
        });
      } else {
        // Broadcast basic steps update
        broadcastEvent({
          type: EventType.TASK_UPDATED,
          payload: {
            taskId: id,
            steps: processedSteps,
            task: updatedTask
          }
        });
      }
      
      res.json(updatedTask);
    } catch (error) {
      console.error('Error updating task steps:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * @api {post} /api/tasks/:id/assign Assign a task to a user
   * @apiDescription Assign or reassign a task to a user
   * @apiName AssignTask
   * @apiGroup Tasks
   * 
   * @apiParam {String} id Task ID
   * @apiBody {String} assignedToId User ID to assign the task to
   * @apiBody {String} [comment] Optional comment about the assignment
   * 
   * @apiSuccess {Object} task The updated task
   */
  router.post('/:id/assign', authenticateJwt, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { assignedToId, comment } = req.body;
      
      // Check if task exists
      const existingTask = await storage.getTask(id);
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // Check if user exists
      const assignee = await storage.getUser(assignedToId);
      if (!assignee) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Handle previous assignees tracking
      let previousAssignees = existingTask.previousAssignees || [];
      if (existingTask.assignedToId && existingTask.assignedToId !== assignedToId) {
        // Add previous assignee to the history with timestamp
        previousAssignees = [
          ...previousAssignees,
          {
            userId: existingTask.assignedToId,
            assignedAt: existingTask.updatedAt,
            unassignedAt: new Date(),
            unassignedById: userId
          }
        ];
      }
      
      // Update the task
      const updatedTask = await storage.updateTask(id, {
        assignedToId,
        previousAssignees,
        lastUpdatedById: userId
      });
      
      // Add a comment about the assignment if provided
      if (comment) {
        await storage.createComment({
          content: existingTask.assignedToId 
            ? `Task reassigned from previous assignee to ${assignee.firstName} ${assignee.lastName}: ${comment}`
            : `Task assigned to ${assignee.firstName} ${assignee.lastName}: ${comment}`,
          userId,
          entityType: 'TASK',
          entityId: id
        });
      }
      
      // Create a notification for the new assignee
      await storage.createNotification({
        userId: assignedToId,
        type: 'TASK_ASSIGNED',
        message: `You have been assigned to task ${existingTask.taskId}: "${existingTask.title}"`,
        entityType: 'TASK',
        entityId: id
      });
      
      // Broadcast assignment via WebSocket
      broadcastEvent({
        type: EventType.TASK_UPDATED,
        payload: {
          taskId: id,
          previousAssigneeId: existingTask.assignedToId,
          newAssigneeId: assignedToId,
          task: updatedTask,
          action: 'ASSIGNED'
        }
      });
      
      res.json(updatedTask);
    } catch (error) {
      console.error('Error assigning task:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * @api {post} /api/tasks/:id/subtasks Create a subtask
   * @apiDescription Create a new subtask under a parent task
   * @apiName CreateSubtask
   * @apiGroup Tasks
   * 
   * @apiParam {String} id Parent task ID
   * @apiBody {Object} taskData Data for the new subtask
   * 
   * @apiSuccess {Object} task The created subtask
   */
  router.post('/:id/subtasks', authenticateJwt, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      // Check if parent task exists
      const parentTask = await storage.getTask(id);
      if (!parentTask) {
        return res.status(404).json({ error: 'Parent task not found' });
      }
      
      // Create the subtask
      const subtask = await storage.createTask({
        ...req.body,
        parentTaskId: id,
        // Inherit project and story from parent if not specified
        projectId: req.body.projectId || parentTask.projectId,
        storyId: req.body.storyId || parentTask.storyId,
        // Set creator
        createdById: userId,
        lastUpdatedById: userId
      });
      
      // Broadcast subtask creation via WebSocket
      broadcastEvent({
        type: EventType.TASK_CREATED,
        payload: {
          parentTaskId: id,
          subtask
        }
      });
      
      res.status(201).json(subtask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      } else {
        console.error('Error creating subtask:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  return router;
}

export default initTaskRoutes;