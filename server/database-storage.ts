import {
  Company, InsertCompany, Department, InsertDepartment,
  Group, InsertGroup, User, InsertUser, Team, InsertTeam,
  Project, InsertProject, Epic, InsertEpic, Story, InsertStory,
  Task, InsertTask, TimeEntry, InsertTimeEntry, Comment, InsertComment, 
  Attachment, InsertAttachment, Notification, InsertNotification, 
  Location, InsertLocation, Device, InsertDevice,
  // Schema tables
  companies, departments, groups, users, teams, teamMembers, projects, epics,
  stories, tasks, timeEntries, comments, attachments, notifications, locations, devices
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, and, desc, asc, isNull, or, sql } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import { broadcastEvent, EventType } from "./websocket";

/**
 * PostgreSQL database implementation of the storage interface
 */
export class DatabaseStorage implements IStorage {
  constructor() {
    // Create default admin user if it doesn't exist
    this.createDefaultAdminIfNotExists();
  }

  private async createDefaultAdminIfNotExists() {
    try {
      const adminExists = await this.getUserByEmail("admin@example.com");
      
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash("password", 10);
        
        await this.createUser({
          email: "admin@example.com",
          password: hashedPassword,
          firstName: "Admin",
          lastName: "User",
          role: "ADMIN",
          status: "ACTIVE"
        });
        
        console.log("Default admin user created");
      }
    } catch (error) {
      console.error("Error creating default admin:", error);
    }
  }

  // Company operations
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const result = await db.select().from(companies).where(eq(companies.id, id));
    return result[0];
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const result = await db.insert(companies).values(company).returning();
    return result[0];
  }

  async updateCompany(id: string, companyUpdate: Partial<InsertCompany>): Promise<Company | undefined> {
    const result = await db
      .update(companies)
      .set({ ...companyUpdate, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return result[0];
  }

  async deleteCompany(id: string): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id));
    return result.rowCount > 0;
  }

  // Department operations
  async getDepartments(companyId?: string): Promise<Department[]> {
    if (companyId) {
      return await db
        .select()
        .from(departments)
        .where(eq(departments.companyId, companyId));
    }
    return await db.select().from(departments);
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const result = await db.select().from(departments).where(eq(departments.id, id));
    return result[0];
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const result = await db.insert(departments).values(department).returning();
    return result[0];
  }

  async updateDepartment(id: string, departmentUpdate: Partial<InsertDepartment>): Promise<Department | undefined> {
    const result = await db
      .update(departments)
      .set({ ...departmentUpdate, updatedAt: new Date() })
      .where(eq(departments.id, id))
      .returning();
    return result[0];
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const result = await db.delete(departments).where(eq(departments.id, id));
    return result.rowCount > 0;
  }

  // Group operations
  async getGroups(companyId?: string): Promise<Group[]> {
    if (companyId) {
      return await db
        .select()
        .from(groups)
        .where(eq(groups.companyId, companyId));
    }
    return await db.select().from(groups);
  }

  async getGroup(id: string): Promise<Group | undefined> {
    const result = await db.select().from(groups).where(eq(groups.id, id));
    return result[0];
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const result = await db.insert(groups).values(group).returning();
    return result[0];
  }

  async updateGroup(id: string, groupUpdate: Partial<InsertGroup>): Promise<Group | undefined> {
    const result = await db
      .update(groups)
      .set({ ...groupUpdate, updatedAt: new Date() })
      .where(eq(groups.id, id))
      .returning();
    return result[0];
  }

  async deleteGroup(id: string): Promise<boolean> {
    const result = await db.delete(groups).where(eq(groups.id, id));
    return result.rowCount > 0;
  }

  // User operations
  async getUsers(companyId?: string, departmentId?: string): Promise<User[]> {
    let query = db.select().from(users);
    
    if (companyId && departmentId) {
      query = query.where(
        and(
          eq(users.companyId, companyId),
          eq(users.departmentId, departmentId)
        )
      );
    } else if (companyId) {
      query = query.where(eq(users.companyId, companyId));
    } else if (departmentId) {
      query = query.where(eq(users.departmentId, departmentId));
    }
    
    return await query;
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ ...userUpdate, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  // Team operations
  async getTeams(companyId?: string): Promise<Team[]> {
    if (companyId) {
      return await db
        .select()
        .from(teams)
        .where(eq(teams.companyId, companyId));
    }
    return await db.select().from(teams);
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const result = await db.select().from(teams).where(eq(teams.id, id));
    return result[0];
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const result = await db.insert(teams).values(team).returning();
    return result[0];
  }

  async updateTeam(id: string, teamUpdate: Partial<InsertTeam>): Promise<Team | undefined> {
    const result = await db
      .update(teams)
      .set({ ...teamUpdate, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return result[0];
  }

  async deleteTeam(id: string): Promise<boolean> {
    // First delete all team members
    await db.delete(teamMembers).where(eq(teamMembers.teamId, id));
    
    // Then delete the team
    const result = await db.delete(teams).where(eq(teams.id, id));
    return result.rowCount > 0;
  }

  async addUserToTeam(teamId: string, userId: string, role: string): Promise<boolean> {
    try {
      await db.insert(teamMembers).values({
        teamId,
        userId,
        role
      });
      return true;
    } catch (error) {
      console.error("Error adding user to team:", error);
      return false;
    }
  }

  async removeUserFromTeam(teamId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId)
        )
      );
    return result.rowCount > 0;
  }

  async getTeamMembers(teamId: string): Promise<User[]> {
    const result = await db
      .select()
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));
    
    return result.map(row => row.users);
  }

  // Project operations
  async getProjects(companyId?: string, teamId?: string): Promise<Project[]> {
    let query = db.select().from(projects);
    
    if (companyId && teamId) {
      query = query.where(
        and(
          eq(projects.companyId, companyId),
          eq(projects.teamId, teamId)
        )
      );
    } else if (companyId) {
      query = query.where(eq(projects.companyId, companyId));
    } else if (teamId) {
      query = query.where(eq(projects.teamId, teamId));
    }
    
    return await query;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const projectToInsert = {
      ...project,
      progress: project.progress || { percentage: 0 }
    };
    
    const result = await db.insert(projects).values(projectToInsert).returning();
    return result[0];
  }

  async updateProject(id: string, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    // Get current project state before update to check for status changes
    const currentProject = await db.select().from(projects).where(eq(projects.id, id)).then(res => res[0]);
    
    const result = await db
      .update(projects)
      .set({ ...projectUpdate, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    
    const updatedProject = result[0];
    
    // If status changed to anything other than COMPLETED, make sure to update epics
    if (updatedProject && 
        projectUpdate.status && 
        projectUpdate.status !== 'COMPLETED' && 
        currentProject && 
        currentProject.status === 'COMPLETED') {
      
      // Get all epics to update their status as needed
      const projectEpics = await db.select().from(epics).where(eq(epics.projectId, id));
      
      // Update progress based on actual epic statuses
      await this.updateProjectProgress(id);
      
      // Broadcast the project status change
      // This will be handled by the WebSocket server to notify clients
    }
    
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }

  // This method is replaced by the private updateProjectProgress method
  // which handles both progress percentage and status updates based on epic statuses
  async setProjectProgress(id: string, progress: number): Promise<boolean> {
    const result = await db
      .update(projects)
      .set({ 
        progress: { percentage: progress },
        updatedAt: new Date()
      })
      .where(eq(projects.id, id));
    return result.rowCount! > 0;
  }

  // Epic operations
  async getEpics(projectId?: string): Promise<Epic[]> {
    if (projectId) {
      return await db
        .select()
        .from(epics)
        .where(eq(epics.projectId, projectId));
    }
    return await db.select().from(epics);
  }

  async getEpic(id: string): Promise<Epic | undefined> {
    const result = await db.select().from(epics).where(eq(epics.id, id));
    return result[0];
  }

  async createEpic(epic: InsertEpic): Promise<Epic> {
    const epicToInsert = {
      ...epic,
      progress: { percentage: 0 }
    };
    
    const result = await db.insert(epics).values(epicToInsert).returning();
    return result[0];
  }

  async updateEpic(id: string, epicUpdate: Partial<InsertEpic>): Promise<Epic | undefined> {
    const result = await db
      .update(epics)
      .set({ ...epicUpdate, updatedAt: new Date() })
      .where(eq(epics.id, id))
      .returning();
    
    const updatedEpic = result[0];
    
    // If epic status has changed, update parent project progress and status
    if (updatedEpic && epicUpdate.status) {
      await this.updateProjectProgress(updatedEpic.projectId);
    }
    
    return updatedEpic;
  }
  
  // Helper method to update project progress based on child epics status
  private async updateProjectProgress(projectId: string): Promise<void> {
    console.log(`Updating progress and status for project: ${projectId}`);
    
    // Get the current project first
    const projectBefore = await db.select().from(projects).where(eq(projects.id, projectId));
    const oldStatus = projectBefore[0]?.status;
    
    // Get all epics for this project
    const projectEpics = await db.select().from(epics).where(eq(epics.projectId, projectId));
    
    // If there are no epics, don't try to update
    if (projectEpics.length === 0) return;
    
    // Calculate the progress percentage based on completed epics
    const completedEpics = projectEpics.filter(epic => 
      epic.status === 'COMPLETED'
    ).length;
    
    const progressPercentage = Math.round((completedEpics / projectEpics.length) * 100);
    console.log(`Project ${projectId} progress: ${completedEpics}/${projectEpics.length} epics completed (${progressPercentage}%)`);
    
    // Determine if all epics are completed
    const allEpicsCompleted = projectEpics.every(epic => epic.status === 'COMPLETED');
    
    // Create the update object with correct typing
    const projectUpdate: Record<string, any> = {};
    
    // Set the progress
    projectUpdate.progress = { percentage: progressPercentage };
    
    // Determine appropriate status based on epics
    let newStatus = oldStatus;
    
    if (allEpicsCompleted) {
      newStatus = 'COMPLETED';
    } else if (completedEpics > 0) {
      // If at least one epic is completed but not all, set to IN_PROGRESS
      newStatus = 'IN_PROGRESS';
    } else if (projectEpics.some(epic => epic.status === 'IN_PROGRESS')) {
      // If any epic is in progress, the project should be in progress too
      newStatus = 'IN_PROGRESS';
    }
    
    // Only update status if it has changed
    if (newStatus !== oldStatus) {
      projectUpdate.status = newStatus;
      console.log(`Updating project ${projectId} status from ${oldStatus} to ${newStatus}`);
    }
    
    // Update the project
    await db
      .update(projects)
      .set({ ...projectUpdate, updatedAt: new Date() })
      .where(eq(projects.id, projectId));
    
    // Broadcast the project update via WebSocket
    const updatedProject = await db.select().from(projects).where(eq(projects.id, projectId)).then(res => res[0]);
    if (updatedProject) {
      console.log(`Broadcasting project update for ${projectId}`);
      broadcastEvent({
        type: EventType.PROJECT_UPDATED,
        payload: updatedProject
      });
    }
  }

  async deleteEpic(id: string): Promise<boolean> {
    const result = await db.delete(epics).where(eq(epics.id, id));
    return result.rowCount > 0;
  }

  async updateEpicProgress(id: string, progress: number): Promise<boolean> {
    const result = await db
      .update(epics)
      .set({ 
        progress: { percentage: progress },
        updatedAt: new Date()
      })
      .where(eq(epics.id, id));
    return result.rowCount > 0;
  }

  // Story operations
  async getStories(epicId?: string): Promise<Story[]> {
    if (epicId) {
      return await db
        .select()
        .from(stories)
        .where(eq(stories.epicId, epicId));
    }
    return await db.select().from(stories);
  }

  async getStory(id: string): Promise<Story | undefined> {
    const result = await db.select().from(stories).where(eq(stories.id, id));
    return result[0];
  }

  async createStory(story: InsertStory): Promise<Story> {
    const result = await db.insert(stories).values(story).returning();
    return result[0];
  }

  async updateStory(id: string, storyUpdate: Partial<InsertStory>): Promise<Story | undefined> {
    const result = await db
      .update(stories)
      .set({ ...storyUpdate, updatedAt: new Date() })
      .where(eq(stories.id, id))
      .returning();
    
    const updatedStory = result[0];
    
    // If story status has changed, update parent epic progress and status
    if (updatedStory && storyUpdate.status) {
      await this.updateEpicProgressAndStatus(updatedStory.epicId);
    }
    
    return updatedStory;
  }
  
  // Helper method to update epic progress based on child stories status
  private async updateEpicProgressAndStatus(epicId: string): Promise<void> {
    console.log(`Updating progress and status for epic: ${epicId}`);
    
    // Get the current epic first to compare status later
    const epicBefore = await db.select().from(epics).where(eq(epics.id, epicId));
    const oldStatus = epicBefore[0]?.status;
    
    // Get all stories for this epic
    const epicStories = await db.select().from(stories).where(eq(stories.epicId, epicId));
    
    // If there are no stories, don't try to update
    if (epicStories.length === 0) return;
    
    // Calculate the progress percentage based on completed stories
    const completedStories = epicStories.filter(story => 
      story.status === 'DONE'
    ).length;
    
    const progressPercentage = Math.round((completedStories / epicStories.length) * 100);
    console.log(`Epic ${epicId} progress: ${completedStories}/${epicStories.length} stories completed (${progressPercentage}%)`);
    
    // Determine if all stories are done
    const allStoriesCompleted = epicStories.every(story => story.status === 'DONE');
    
    // Create the update object with correct typing
    const epicUpdate: Record<string, any> = {}; 
    
    // Set the progress
    epicUpdate.progress = { percentage: progressPercentage };
    
    // Determine appropriate status based on stories
    let newStatus = oldStatus;
    
    if (allStoriesCompleted) {
      newStatus = 'COMPLETED';
    } else if (completedStories > 0) {
      // If at least one story is done but not all, set to IN_PROGRESS
      newStatus = 'IN_PROGRESS';
    } else if (epicStories.some(story => story.status === 'IN_PROGRESS')) {
      // If any story is in progress, the epic should be in progress too
      newStatus = 'IN_PROGRESS';
    }
    
    // Only update status if it has changed
    if (newStatus !== oldStatus) {
      epicUpdate.status = newStatus;
      console.log(`Updating epic ${epicId} status from ${oldStatus} to ${newStatus}`);
    }
    
    // Update the epic
    const updatedEpic = await db
      .update(epics)
      .set({ ...epicUpdate, updatedAt: new Date() })
      .where(eq(epics.id, epicId))
      .returning();
    
    // If epic was updated and has a project, update project progress
    if (updatedEpic[0] && updatedEpic[0].projectId) {
      console.log(`Cascading updates to parent project: ${updatedEpic[0].projectId}`);
      await this.updateProjectProgress(updatedEpic[0].projectId);
    }
  }

  async deleteStory(id: string): Promise<boolean> {
    const result = await db.delete(stories).where(eq(stories.id, id));
    return result.rowCount > 0;
  }

  // Task operations
  async getTasks(options?: { storyId?: string, assigneeId?: string, parentTaskId?: string }): Promise<Task[]> {
    let query = db.select().from(tasks);
    
    if (options) {
      const conditions = [];
      
      if (options.storyId) {
        conditions.push(eq(tasks.storyId, options.storyId));
      }
      
      if (options.assigneeId) {
        conditions.push(eq(tasks.assigneeId, options.assigneeId));
      }
      
      if (options.parentTaskId !== undefined) {
        if (options.parentTaskId === null) {
          // For top-level tasks (no parent)
          conditions.push(isNull(tasks.parentTaskId));
        } else {
          // For subtasks of a specific parent
          conditions.push(eq(tasks.parentTaskId, options.parentTaskId));
        }
      }
      
      if (conditions.length === 1) {
        query = query.where(conditions[0]);
      } else if (conditions.length > 1) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query;
  }

  async getTask(id: string): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(task).returning();
    return result[0];
  }

  async updateTask(id: string, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const result = await db
      .update(tasks)
      .set({ ...taskUpdate, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    
    const updatedTask = result[0];
    
    // If task status has changed, update parent story progress and status
    if (updatedTask && taskUpdate.status) {
      await this.updateStoryProgressAndStatus(updatedTask.storyId);
    }
    
    return updatedTask;
  }
  
  // Helper method to update story progress based on child tasks status
  private async updateStoryProgressAndStatus(storyId: string): Promise<void> {
    console.log(`Updating progress and status for story: ${storyId}`);
    
    // Get the current story first
    const storyBefore = await db.select().from(stories).where(eq(stories.id, storyId));
    const oldStatus = storyBefore[0]?.status;
    
    // Get all tasks for this story
    const storyTasks = await db.select().from(tasks).where(eq(tasks.storyId, storyId));
    
    // If there are no tasks, don't try to update
    if (storyTasks.length === 0) return;
    
    // Calculate the progress percentage based on completed tasks
    const completedTasks = storyTasks.filter(task => 
      task.status === 'DONE'
    ).length;
    
    const progressPercentage = Math.round((completedTasks / storyTasks.length) * 100);
    console.log(`Story ${storyId} progress: ${completedTasks}/${storyTasks.length} tasks completed (${progressPercentage}%)`);
    
    // Determine if all tasks are done
    const allTasksCompleted = storyTasks.every(task => task.status === 'DONE');
    
    // Update the story
    const storyUpdate: Record<string, any> = {};
    
    // Set the progress
    storyUpdate.progress = { percentage: progressPercentage };
    
    // Determine appropriate status based on tasks
    let newStatus = oldStatus;
    
    if (allTasksCompleted) {
      newStatus = 'DONE';
    } else if (completedTasks > 0) {
      // If at least one task is done but not all, set to IN_PROGRESS
      newStatus = 'IN_PROGRESS';
    } else if (storyTasks.some(task => task.status === 'IN_PROGRESS')) {
      // If any task is in progress, the story should be in progress too
      newStatus = 'IN_PROGRESS';
    } else if (storyTasks.some(task => task.status === 'IN_REVIEW')) {
      // If any task is in review, the story should be in progress too
      newStatus = 'IN_PROGRESS';
    }
    
    // Only update status if it has changed
    if (newStatus !== oldStatus) {
      storyUpdate.status = newStatus;
      console.log(`Updating story ${storyId} status from ${oldStatus} to ${newStatus}`);
    }
    
    // Update the story
    const updatedStory = await db
      .update(stories)
      .set({ ...storyUpdate, updatedAt: new Date() })
      .where(eq(stories.id, storyId))
      .returning();
    
    // If status has changed or progress updated, also update parent epic
    if (updatedStory[0] && updatedStory[0].epicId) {
      console.log(`Cascading updates to parent epic: ${updatedStory[0].epicId}`);
      await this.updateEpicProgressAndStatus(updatedStory[0].epicId);
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    // First get the task so we can update the parent story after deletion
    const taskToDelete = await db.select().from(tasks).where(eq(tasks.id, id));
    const storyId = taskToDelete[0]?.storyId;
    
    // Delete the task
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    const success = result.rowCount > 0;
    
    // If deletion was successful and we have a story ID, update the story progress
    if (success && storyId) {
      console.log(`Task deleted, updating parent story ${storyId} progress`);
      await this.updateStoryProgressAndStatus(storyId);
    }
    
    return success;
  }

  // TimeEntry operations
  async getTimeEntries(taskId?: string, userId?: string): Promise<TimeEntry[]> {
    let query = db.select().from(timeEntries);
    
    if (taskId && userId) {
      query = query.where(
        and(
          eq(timeEntries.taskId, taskId),
          eq(timeEntries.userId, userId)
        )
      );
    } else if (taskId) {
      query = query.where(eq(timeEntries.taskId, taskId));
    } else if (userId) {
      query = query.where(eq(timeEntries.userId, userId));
    }
    
    return await query.orderBy(desc(timeEntries.startTime));
  }

  async getTimeEntry(id: string): Promise<TimeEntry | undefined> {
    const result = await db.select().from(timeEntries).where(eq(timeEntries.id, id));
    return result[0];
  }

  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const result = await db.insert(timeEntries).values(timeEntry).returning();
    return result[0];
  }

  async updateTimeEntry(id: string, timeEntryUpdate: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> {
    const result = await db
      .update(timeEntries)
      .set({ ...timeEntryUpdate, updatedAt: new Date() })
      .where(eq(timeEntries.id, id))
      .returning();
    return result[0];
  }

  async deleteTimeEntry(id: string): Promise<boolean> {
    const result = await db.delete(timeEntries).where(eq(timeEntries.id, id));
    return result.rowCount > 0;
  }

  // Comment operations
  async getComments(entityType: string, entityId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.entityType, entityType as any),
          eq(comments.entityId, entityId)
        )
      );
  }

  async getComment(id: string): Promise<Comment | undefined> {
    const result = await db.select().from(comments).where(eq(comments.id, id));
    return result[0];
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments).values(comment).returning();
    return result[0];
  }

  async updateComment(id: string, commentUpdate: Partial<InsertComment>): Promise<Comment | undefined> {
    const result = await db
      .update(comments)
      .set({ ...commentUpdate, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return result[0];
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await db.delete(comments).where(eq(comments.id, id));
    return result.rowCount > 0;
  }

  // Attachment operations
  async getAttachments(entityType: string, entityId: string): Promise<Attachment[]> {
    return await db
      .select()
      .from(attachments)
      .where(
        and(
          eq(attachments.entityType, entityType as any),
          eq(attachments.entityId, entityId)
        )
      );
  }

  async getAttachment(id: string): Promise<Attachment | undefined> {
    const result = await db.select().from(attachments).where(eq(attachments.id, id));
    return result[0];
  }

  async createAttachment(attachment: InsertAttachment): Promise<Attachment> {
    const result = await db.insert(attachments).values(attachment).returning();
    return result[0];
  }

  async deleteAttachment(id: string): Promise<boolean> {
    const result = await db.delete(attachments).where(eq(attachments.id, id));
    return result.rowCount > 0;
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getNotification(id: string): Promise<Notification | undefined> {
    const result = await db.select().from(notifications).where(eq(notifications.id, id));
    return result[0];
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: "true" })
      .where(eq(notifications.id, id));
    return result.rowCount > 0;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return result.rowCount > 0;
  }

  // Location operations
  async getLocations(companyId?: string): Promise<Location[]> {
    if (companyId) {
      return await db
        .select()
        .from(locations)
        .where(eq(locations.companyId, companyId));
    }
    return await db.select().from(locations);
  }

  async getLocation(id: string): Promise<Location | undefined> {
    const result = await db.select().from(locations).where(eq(locations.id, id));
    return result[0];
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const result = await db.insert(locations).values(location).returning();
    return result[0];
  }

  async updateLocation(id: string, locationUpdate: Partial<InsertLocation>): Promise<Location | undefined> {
    const result = await db
      .update(locations)
      .set({ ...locationUpdate, updatedAt: new Date() })
      .where(eq(locations.id, id))
      .returning();
    return result[0];
  }

  async deleteLocation(id: string): Promise<boolean> {
    const result = await db.delete(locations).where(eq(locations.id, id));
    return result.rowCount > 0;
  }

  // Device operations
  async getDevices(companyId?: string, departmentId?: string, locationId?: string, assignedToId?: string, status?: string): Promise<Device[]> {
    let query = db.select().from(devices);
    const conditions = [];
    
    if (companyId) conditions.push(eq(devices.companyId, companyId));
    if (departmentId) conditions.push(eq(devices.departmentId, departmentId));
    if (locationId) conditions.push(eq(devices.locationId, locationId));
    if (assignedToId) conditions.push(eq(devices.assignedToId, assignedToId));
    if (status) conditions.push(eq(devices.status, status as any));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query;
  }

  async getDevice(id: string): Promise<Device | undefined> {
    const result = await db.select().from(devices).where(eq(devices.id, id));
    return result[0];
  }

  async getDeviceBySerialNumber(serialNumber: string): Promise<Device | undefined> {
    const result = await db.select().from(devices).where(eq(devices.serialNumber, serialNumber));
    return result[0];
  }

  async createDevice(device: InsertDevice): Promise<Device> {
    const result = await db.insert(devices).values(device).returning();
    return result[0];
  }

  async updateDevice(id: string, deviceUpdate: Partial<InsertDevice>): Promise<Device | undefined> {
    const result = await db
      .update(devices)
      .set({ ...deviceUpdate, updatedAt: new Date() })
      .where(eq(devices.id, id))
      .returning();
    return result[0];
  }

  async deleteDevice(id: string): Promise<boolean> {
    const result = await db.delete(devices).where(eq(devices.id, id));
    return result.rowCount > 0;
  }

  async assignDevice(id: string, userId: string): Promise<Device | undefined> {
    const result = await db
      .update(devices)
      .set({ 
        assignedToId: userId,
        status: "ASSIGNED",
        updatedAt: new Date()
      })
      .where(eq(devices.id, id))
      .returning();
    return result[0];
  }

  async unassignDevice(id: string): Promise<Device | undefined> {
    const result = await db
      .update(devices)
      .set({ 
        assignedToId: null,
        status: "AVAILABLE",
        updatedAt: new Date()
      })
      .where(eq(devices.id, id))
      .returning();
    return result[0];
  }
}