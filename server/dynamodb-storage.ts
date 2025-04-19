import { 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  ScanCommand, 
  UpdateCommand, 
  DeleteCommand,
  BatchGetCommand
} from '@aws-sdk/lib-dynamodb';
import { docClient } from './aws-config';
// Import just the IStorage interface
import { IStorage } from './storage';

// Import the types from shared schema
import {
  Company, InsertCompany,
  Department, InsertDepartment,
  Group, InsertGroup,
  User, InsertUser,
  Team, InsertTeam,
  Project, InsertProject,
  Epic, InsertEpic,
  Story, InsertStory,
  Task, InsertTask,
  TimeEntry, InsertTimeEntry,
  Comment, InsertComment,
  Attachment, InsertAttachment,
  Notification, InsertNotification,
  Location, InsertLocation,
  Device, InsertDevice
} from '@shared/schema';
import { v4 as uuid } from 'uuid';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

// AWS DynamoDB table names
const TABLE_PREFIX = 'ProjectManagement';
const TABLES = {
  COMPANIES: `${TABLE_PREFIX}_Companies`,
  DEPARTMENTS: `${TABLE_PREFIX}_Departments`,
  GROUPS: `${TABLE_PREFIX}_Groups`,
  USERS: `${TABLE_PREFIX}_Users`,
  TEAMS: `${TABLE_PREFIX}_Teams`,
  TEAM_MEMBERS: `${TABLE_PREFIX}_TeamMembers`,
  PROJECTS: `${TABLE_PREFIX}_Projects`,
  EPICS: `${TABLE_PREFIX}_Epics`,
  STORIES: `${TABLE_PREFIX}_Stories`,
  TASKS: `${TABLE_PREFIX}_Tasks`,
  TIME_ENTRIES: `${TABLE_PREFIX}_TimeEntries`,
  COMMENTS: `${TABLE_PREFIX}_Comments`,
  ATTACHMENTS: `${TABLE_PREFIX}_Attachments`,
  NOTIFICATIONS: `${TABLE_PREFIX}_Notifications`,
  LOCATIONS: `${TABLE_PREFIX}_Locations`,
  DEVICES: `${TABLE_PREFIX}_Devices`,
};

// Helper for password hashing
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return derivedKey.toString('hex') + '.' + salt;
}

async function verifyPassword(stored: string, supplied: string): Promise<boolean> {
  const [hashedPassword, salt] = stored.split('.');
  const derivedKey = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return derivedKey.toString('hex') === hashedPassword;
}

/**
 * DynamoDB implementation of the storage interface
 */
export class DynamoDBStorage implements IStorage {
  
  constructor() {
    this.initializeTables();
    this.createDefaultAdminIfNotExists();
  }

  // Initialize DynamoDB tables
  private async initializeTables() {
    // In a production implementation, DynamoDB tables would be created
    // using AWS CloudFormation, CDK, or terraform, not in the application code
    console.log('DynamoDB tables should be set up separately in AWS console');
  }

  // Create default admin user if none exists
  private async createDefaultAdminIfNotExists() {
    try {
      const users = await this.getUsers();
      if (users.length === 0) {
        const adminUser: InsertUser = {
          email: 'admin@example.com',
          password: await hashPassword('admin123'),
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          // Note: jobTitle is not in the schema
          // Instead, setting department and status
          departmentId: null, 
          companyId: null,
          status: 'ACTIVE',
        };
        
        await this.createUser(adminUser);
        console.log('Default admin user created');
      }
    } catch (error) {
      console.error('Failed to check or create default admin user:', error);
    }
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    try {
      const command = new ScanCommand({
        TableName: TABLES.COMPANIES,
      });

      const response = await docClient.send(command);
      return response.Items as Company[] || [];
    } catch (error) {
      console.error('Error getting companies:', error);
      return [];
    }
  }

  async getCompany(id: string): Promise<Company | undefined> {
    try {
      const command = new GetCommand({
        TableName: TABLES.COMPANIES,
        Key: { id },
      });

      const response = await docClient.send(command);
      return response.Item as Company;
    } catch (error) {
      console.error(`Error getting company ${id}:`, error);
      return undefined;
    }
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const newCompany: Company = {
      ...company,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await docClient.send(new PutCommand({
        TableName: TABLES.COMPANIES,
        Item: newCompany,
      }));

      return newCompany;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  async updateCompany(id: string, companyUpdate: Partial<InsertCompany>): Promise<Company | undefined> {
    try {
      const existingCompany = await this.getCompany(id);
      if (!existingCompany) return undefined;

      const updatedCompany: Company = {
        ...existingCompany,
        ...companyUpdate,
        updatedAt: new Date().toISOString(),
      };

      await docClient.send(new PutCommand({
        TableName: TABLES.COMPANIES,
        Item: updatedCompany,
      }));

      return updatedCompany;
    } catch (error) {
      console.error(`Error updating company ${id}:`, error);
      return undefined;
    }
  }

  async deleteCompany(id: string): Promise<boolean> {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.COMPANIES,
        Key: { id },
      }));

      return true;
    } catch (error) {
      console.error(`Error deleting company ${id}:`, error);
      return false;
    }
  }

  // Departments
  async getDepartments(companyId?: string): Promise<Department[]> {
    try {
      if (companyId) {
        const command = new QueryCommand({
          TableName: TABLES.DEPARTMENTS,
          IndexName: 'CompanyIdIndex',
          KeyConditionExpression: 'companyId = :companyId',
          ExpressionAttributeValues: {
            ':companyId': companyId,
          },
        });

        const response = await docClient.send(command);
        return response.Items as Department[] || [];
      } else {
        const command = new ScanCommand({
          TableName: TABLES.DEPARTMENTS,
        });

        const response = await docClient.send(command);
        return response.Items as Department[] || [];
      }
    } catch (error) {
      console.error('Error getting departments:', error);
      return [];
    }
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    try {
      const command = new GetCommand({
        TableName: TABLES.DEPARTMENTS,
        Key: { id },
      });

      const response = await docClient.send(command);
      return response.Item as Department;
    } catch (error) {
      console.error(`Error getting department ${id}:`, error);
      return undefined;
    }
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const newDepartment: Department = {
      ...department,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await docClient.send(new PutCommand({
        TableName: TABLES.DEPARTMENTS,
        Item: newDepartment,
      }));

      return newDepartment;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  }

  async updateDepartment(id: string, departmentUpdate: Partial<InsertDepartment>): Promise<Department | undefined> {
    try {
      const existingDepartment = await this.getDepartment(id);
      if (!existingDepartment) return undefined;

      const updatedDepartment: Department = {
        ...existingDepartment,
        ...departmentUpdate,
        updatedAt: new Date().toISOString(),
      };

      await docClient.send(new PutCommand({
        TableName: TABLES.DEPARTMENTS,
        Item: updatedDepartment,
      }));

      return updatedDepartment;
    } catch (error) {
      console.error(`Error updating department ${id}:`, error);
      return undefined;
    }
  }

  async deleteDepartment(id: string): Promise<boolean> {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.DEPARTMENTS,
        Key: { id },
      }));

      return true;
    } catch (error) {
      console.error(`Error deleting department ${id}:`, error);
      return false;
    }
  }

  // Implement Group functions (shortened for brevity)
  async getGroups(companyId?: string): Promise<Group[]> {
    return [];
  }
  async getGroup(id: string): Promise<Group | undefined> {
    return undefined;
  }
  async createGroup(group: InsertGroup): Promise<Group> {
    return { ...group, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
  async updateGroup(id: string, groupUpdate: Partial<InsertGroup>): Promise<Group | undefined> {
    return undefined;
  }
  async deleteGroup(id: string): Promise<boolean> {
    return false;
  }

  // Users
  async getUsers(companyId?: string, departmentId?: string): Promise<User[]> {
    try {
      if (companyId) {
        const command = new QueryCommand({
          TableName: TABLES.USERS,
          IndexName: 'CompanyIdIndex',
          KeyConditionExpression: 'companyId = :companyId',
          ExpressionAttributeValues: {
            ':companyId': companyId,
          },
        });

        const response = await docClient.send(command);
        return response.Items as User[] || [];
      } else if (departmentId) {
        const command = new QueryCommand({
          TableName: TABLES.USERS,
          IndexName: 'DepartmentIdIndex',
          KeyConditionExpression: 'departmentId = :departmentId',
          ExpressionAttributeValues: {
            ':departmentId': departmentId,
          },
        });

        const response = await docClient.send(command);
        return response.Items as User[] || [];
      } else {
        const command = new ScanCommand({
          TableName: TABLES.USERS,
        });

        const response = await docClient.send(command);
        return response.Items as User[] || [];
      }
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      const command = new GetCommand({
        TableName: TABLES.USERS,
        Key: { id },
      });

      const response = await docClient.send(command);
      return response.Item as User;
    } catch (error) {
      console.error(`Error getting user ${id}:`, error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const command = new QueryCommand({
        TableName: TABLES.USERS,
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email,
        },
      });

      const response = await docClient.send(command);
      return (response.Items && response.Items.length > 0) ? 
        response.Items[0] as User : undefined;
    } catch (error) {
      console.error(`Error getting user by email ${email}:`, error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await docClient.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: newUser,
      }));

      // Omit password when returning
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const existingUser = await this.getUser(id);
      if (!existingUser) return undefined;

      // If password is being updated, hash it
      if (userUpdate.password) {
        userUpdate.password = await hashPassword(userUpdate.password);
      }

      const updatedUser: User = {
        ...existingUser,
        ...userUpdate,
        updatedAt: new Date().toISOString(),
      };

      await docClient.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: updatedUser,
      }));

      // Omit password when returning
      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword as User;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      return undefined;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.USERS,
        Key: { id },
      }));

      return true;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      return false;
    }
  }

  // Teams
  async getTeams(companyId?: string): Promise<Team[]> {
    try {
      if (companyId) {
        const command = new QueryCommand({
          TableName: TABLES.TEAMS,
          IndexName: 'CompanyIdIndex',
          KeyConditionExpression: 'companyId = :companyId',
          ExpressionAttributeValues: {
            ':companyId': companyId,
          },
        });

        const response = await docClient.send(command);
        return response.Items as Team[] || [];
      } else {
        const command = new ScanCommand({
          TableName: TABLES.TEAMS,
        });

        const response = await docClient.send(command);
        return response.Items as Team[] || [];
      }
    } catch (error) {
      console.error('Error getting teams:', error);
      return [];
    }
  }

  async getTeam(id: string): Promise<Team | undefined> {
    try {
      const command = new GetCommand({
        TableName: TABLES.TEAMS,
        Key: { id },
      });

      const response = await docClient.send(command);
      return response.Item as Team;
    } catch (error) {
      console.error(`Error getting team ${id}:`, error);
      return undefined;
    }
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const newTeam: Team = {
      ...team,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await docClient.send(new PutCommand({
        TableName: TABLES.TEAMS,
        Item: newTeam,
      }));

      return newTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  async updateTeam(id: string, teamUpdate: Partial<InsertTeam>): Promise<Team | undefined> {
    try {
      const existingTeam = await this.getTeam(id);
      if (!existingTeam) return undefined;

      const updatedTeam: Team = {
        ...existingTeam,
        ...teamUpdate,
        updatedAt: new Date().toISOString(),
      };

      await docClient.send(new PutCommand({
        TableName: TABLES.TEAMS,
        Item: updatedTeam,
      }));

      return updatedTeam;
    } catch (error) {
      console.error(`Error updating team ${id}:`, error);
      return undefined;
    }
  }

  async deleteTeam(id: string): Promise<boolean> {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.TEAMS,
        Key: { id },
      }));

      return true;
    } catch (error) {
      console.error(`Error deleting team ${id}:`, error);
      return false;
    }
  }

  async addUserToTeam(teamId: string, userId: string): Promise<boolean> {
    try {
      // Add entry to team members table
      await docClient.send(new PutCommand({
        TableName: TABLES.TEAM_MEMBERS,
        Item: {
          teamId,
          userId,
          createdAt: new Date().toISOString(),
        },
      }));

      return true;
    } catch (error) {
      console.error(`Error adding user ${userId} to team ${teamId}:`, error);
      return false;
    }
  }

  async removeUserFromTeam(teamId: string, userId: string): Promise<boolean> {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.TEAM_MEMBERS,
        Key: {
          teamId,
          userId,
        },
      }));

      return true;
    } catch (error) {
      console.error(`Error removing user ${userId} from team ${teamId}:`, error);
      return false;
    }
  }

  async getTeamMembers(teamId: string): Promise<User[]> {
    try {
      // First get team member entries
      const command = new QueryCommand({
        TableName: TABLES.TEAM_MEMBERS,
        KeyConditionExpression: 'teamId = :teamId',
        ExpressionAttributeValues: {
          ':teamId': teamId,
        },
      });

      const response = await docClient.send(command);
      
      if (!response.Items || response.Items.length === 0) {
        return [];
      }

      // Get user IDs
      const userIds = response.Items.map(item => item.userId);
      
      // Batch get users
      const batchCommand = new BatchGetCommand({
        RequestItems: {
          [TABLES.USERS]: {
            Keys: userIds.map(id => ({ id })),
          },
        },
      });

      const batchResponse = await docClient.send(batchCommand);
      
      return (batchResponse.Responses?.[TABLES.USERS] as User[]) || [];
    } catch (error) {
      console.error(`Error getting team members for team ${teamId}:`, error);
      return [];
    }
  }
  
  // Implement remaining methods (Projects, Epics, Stories, Tasks, etc.)
  
  // Example methods for Projects
  async getProjects(companyId?: string, teamId?: string): Promise<Project[]> {
    try {
      if (companyId) {
        const command = new QueryCommand({
          TableName: TABLES.PROJECTS,
          IndexName: 'CompanyIdIndex',
          KeyConditionExpression: 'companyId = :companyId',
          ExpressionAttributeValues: {
            ':companyId': companyId,
          },
        });

        const response = await docClient.send(command);
        return response.Items as Project[] || [];
      } else if (teamId) {
        const command = new QueryCommand({
          TableName: TABLES.PROJECTS,
          IndexName: 'TeamIdIndex',
          KeyConditionExpression: 'teamId = :teamId',
          ExpressionAttributeValues: {
            ':teamId': teamId,
          },
        });

        const response = await docClient.send(command);
        return response.Items as Project[] || [];
      } else {
        const command = new ScanCommand({
          TableName: TABLES.PROJECTS,
        });

        const response = await docClient.send(command);
        return response.Items as Project[] || [];
      }
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  }

  // Similar implementations for remaining methods...
  
  // For brevity, some methods are omitted or simplified
  // In a full implementation, all methods would be properly implemented
  
  async getProject(id: string): Promise<Project | undefined> {
    // Implementation similar to other getItem methods
    return undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    // Implementation similar to other create methods
    return { ...project, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }

  async updateProject(id: string, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    // Implementation similar to other update methods
    return undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    // Implementation similar to other delete methods
    return false;
  }

  async updateProjectProgress(id: string, progress: number): Promise<boolean> {
    // Implementation similar to other update methods but focused on progress
    return false;
  }

  // Placeholder methods for remaining functionality
  // These would be fully implemented in a complete solution
  
  async getEpics(projectId?: string): Promise<Epic[]> { return []; }
  async getEpic(id: string): Promise<Epic | undefined> { return undefined; }
  async createEpic(epic: InsertEpic): Promise<Epic> {
    return { ...epic, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
  async updateEpic(id: string, epicUpdate: Partial<InsertEpic>): Promise<Epic | undefined> { return undefined; }
  async deleteEpic(id: string): Promise<boolean> { return false; }
  async updateEpicProgress(id: string, progress: number): Promise<boolean> { return false; }
  
  async getStories(epicId?: string): Promise<Story[]> { return []; }
  async getStory(id: string): Promise<Story | undefined> { return undefined; }
  async createStory(story: InsertStory): Promise<Story> {
    return { ...story, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
  async updateStory(id: string, storyUpdate: Partial<InsertStory>): Promise<Story | undefined> { return undefined; }
  async deleteStory(id: string): Promise<boolean> { return false; }
  
  async getTasks(storyId?: string, assigneeId?: string): Promise<Task[]> { return []; }
  async getTask(id: string): Promise<Task | undefined> { return undefined; }
  async createTask(task: InsertTask): Promise<Task> {
    return { ...task, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
  async updateTask(id: string, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> { return undefined; }
  async deleteTask(id: string): Promise<boolean> { return false; }
  
  async getTimeEntries(taskId?: string, userId?: string): Promise<TimeEntry[]> { return []; }
  async getTimeEntry(id: string): Promise<TimeEntry | undefined> { return undefined; }
  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> {
    return { ...timeEntry, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
  async updateTimeEntry(id: string, timeEntryUpdate: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> { return undefined; }
  async deleteTimeEntry(id: string): Promise<boolean> { return false; }
  
  async getComments(entityType: string, entityId: string): Promise<Comment[]> { return []; }
  async getComment(id: string): Promise<Comment | undefined> { return undefined; }
  async createComment(comment: InsertComment): Promise<Comment> {
    return { ...comment, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
  async updateComment(id: string, commentUpdate: Partial<InsertComment>): Promise<Comment | undefined> { return undefined; }
  async deleteComment(id: string): Promise<boolean> { return false; }
  
  async getAttachments(entityType: string, entityId: string): Promise<Attachment[]> { return []; }
  async getAttachment(id: string): Promise<Attachment | undefined> { return undefined; }
  async createAttachment(attachment: InsertAttachment): Promise<Attachment> {
    return { ...attachment, id: uuid(), createdAt: new Date().toISOString() };
  }
  async deleteAttachment(id: string): Promise<boolean> { return false; }
  
  async getNotifications(userId: string): Promise<Notification[]> { return []; }
  async getNotification(id: string): Promise<Notification | undefined> { return undefined; }
  async createNotification(notification: InsertNotification): Promise<Notification> {
    return { ...notification, id: uuid(), createdAt: new Date().toISOString(), isRead: false };
  }
  async markNotificationAsRead(id: string): Promise<boolean> { return false; }
  async deleteNotification(id: string): Promise<boolean> { return false; }
  
  async getLocations(companyId?: string): Promise<Location[]> { return []; }
  async getLocation(id: string): Promise<Location | undefined> { return undefined; }
  async createLocation(location: InsertLocation): Promise<Location> {
    return { ...location, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
  async updateLocation(id: string, locationUpdate: Partial<InsertLocation>): Promise<Location | undefined> { return undefined; }
  async deleteLocation(id: string): Promise<boolean> { return false; }
  
  async getDevices(companyId?: string, departmentId?: string, locationId?: string, assignedToId?: string, status?: string): Promise<Device[]> { return []; }
  async getDevice(id: string): Promise<Device | undefined> { return undefined; }
  async getDeviceBySerialNumber(serialNumber: string): Promise<Device | undefined> { return undefined; }
  async createDevice(device: InsertDevice): Promise<Device> {
    return { ...device, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
  async updateDevice(id: string, deviceUpdate: Partial<InsertDevice>): Promise<Device | undefined> { return undefined; }
  async deleteDevice(id: string): Promise<boolean> { return false; }
  async assignDevice(id: string, userId: string): Promise<Device | undefined> { return undefined; }
  async unassignDevice(id: string): Promise<Device | undefined> { return undefined; }
}