import { Task } from "@shared/schema";
import { storage } from "./storage";

/**
 * Task with nested subtasks
 */
export interface TaskWithSubtasks extends Task {
  subtasks: TaskWithSubtasks[];
  parent?: TaskWithSubtasks;
  level: number;
  path: string[];
}

/**
 * Recursively fetches a task with all its subtasks
 * @param taskId The ID of the parent task to fetch
 * @param parentPath Path array of parent task IDs
 * @param level Current nesting level (0 for top level tasks)
 * @returns The task with all subtasks nested
 */
export async function getTaskWithSubtasks(
  taskId: string,
  parentPath: string[] = [],
  level: number = 0
): Promise<TaskWithSubtasks | undefined> {
  const task = await storage.getTask(taskId);
  
  if (!task) {
    return undefined;
  }
  
  // Current task's path includes all parent IDs plus this task's ID
  const path = [...parentPath, taskId];
  
  // Fetch all direct subtasks
  const subtasks = await storage.getTasks({ 
    parentTaskId: taskId 
  });
  
  // Convert the task to a TaskWithSubtasks
  const taskWithSubtasks: TaskWithSubtasks = {
    ...task,
    subtasks: [],
    level,
    path,
  };
  
  // Recursively fetch subtasks for each direct subtask
  taskWithSubtasks.subtasks = await Promise.all(
    subtasks.map(async (subtask) => {
      const subtaskWithChildren = await getTaskWithSubtasks(
        subtask.id,
        path,
        level + 1
      );
      // Set parent reference
      if (subtaskWithChildren) {
        subtaskWithChildren.parent = taskWithSubtasks;
      }
      return subtaskWithChildren as TaskWithSubtasks;
    })
  );
  
  return taskWithSubtasks;
}

/**
 * Recursively deletes a task and all its subtasks
 * @param taskId The ID of the parent task to delete
 * @returns true if the deletion was successful
 */
export async function deleteTaskRecursive(taskId: string): Promise<boolean> {
  try {
    // Get all subtasks for this task
    const subtasks = await storage.getTasks({ 
      parentTaskId: taskId 
    });
    
    // Recursively delete each subtask first
    for (const subtask of subtasks) {
      await deleteTaskRecursive(subtask.id);
    }
    
    // After all subtasks are deleted, delete this task
    return await storage.deleteTask(taskId);
  } catch (error) {
    console.error(`Error deleting task ${taskId} recursively:`, error);
    return false;
  }
}

/**
 * Recursively calculates the progress of a task based on its subtasks
 * @param task The task to calculate progress for
 * @returns Progress as a percentage (0-100)
 */
export function calculateTaskProgress(task: TaskWithSubtasks): number {
  // If the task has no subtasks, use its status
  if (task.subtasks.length === 0) {
    return task.status === "DONE" ? 100 : 
           task.status === "IN_REVIEW" ? 75 :
           task.status === "IN_PROGRESS" ? 50 :
           task.status === "TODO" ? 0 : 25; // BLOCKED = 25%
  }
  
  // Calculate the average progress of all subtasks
  const totalProgress = task.subtasks.reduce(
    (sum, subtask) => sum + calculateTaskProgress(subtask),
    0
  );
  
  return Math.round(totalProgress / task.subtasks.length);
}

/**
 * Recursively determines the effective status of a task based on its subtasks
 * @param task The task to determine status for
 * @returns The calculated status
 */
export function calculateTaskStatus(task: TaskWithSubtasks): string {
  // If the task has no subtasks, return its own status
  if (task.subtasks.length === 0) {
    return task.status;
  }
  
  // Count statuses of subtasks
  const statusCounts = {
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0, 
    DONE: 0,
    BLOCKED: 0
  };
  
  task.subtasks.forEach(subtask => {
    const status = calculateTaskStatus(subtask);
    statusCounts[status as keyof typeof statusCounts]++;
  });
  
  // Define logic for determining parent status based on subtasks
  
  // If any subtask is blocked, parent is blocked
  if (statusCounts.BLOCKED > 0) {
    return "BLOCKED";
  }
  
  // If all subtasks are done, parent is done
  if (statusCounts.DONE === task.subtasks.length) {
    return "DONE";
  }
  
  // If any subtask is in review and rest are done, parent is in review
  if (statusCounts.IN_REVIEW > 0 && 
      statusCounts.IN_REVIEW + statusCounts.DONE === task.subtasks.length) {
    return "IN_REVIEW";
  }
  
  // If any subtask is in progress, parent is in progress
  if (statusCounts.IN_PROGRESS > 0) {
    return "IN_PROGRESS";
  }
  
  // Default to parent's own status
  return task.status;
}