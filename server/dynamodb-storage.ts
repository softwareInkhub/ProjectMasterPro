import { 
  DynamoDBClient, 
  PutItemCommand, 
  GetItemCommand, 
  DeleteItemCommand,
  UpdateItemCommand,
  ScanCommand,
  QueryCommand
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import * as crypto from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";
import {
  Company, InsertCompany, Department, InsertDepartment,
  Group, InsertGroup, User, InsertUser, Team, InsertTeam,
  Project, InsertProject, Epic, InsertEpic, Story, InsertStory,
  Task, InsertTask, Comment, InsertComment, Attachment, InsertAttachment,
  Notification, InsertNotification, Location, InsertLocation, Device, InsertDevice,
  TimeEntry, InsertTimeEntry, Sprint, InsertSprint, BacklogItem, InsertBacklogItem
} from "@shared/schema";
import { IStorage } from "./storage";

// DynamoDB Tables configuration
const TABLES = {
  COMPANIES: "Companies",
  USERS: "Users",
  DEPARTMENTS: "Departments",
  TEAMS: "Teams",
  PROJECTS: "Projects",
  EPICS: "Epics",
  STORIES: "Stories",
  TASKS: "Tasks",
  COMMENTS: "Comments",
  ATTACHMENTS: "Attachments",
  SPRINTS: "Sprints",
  BACKLOG_ITEMS: "BacklogItems",
  TIMEENTRIES: "TimeEntries",
  LOCATIONS: "Locations",
  DEVICES: "Devices",
  NOTIFICATIONS: "Notifications",
  GROUPS: "Groups"
};

export class DynamoDBStorage implements IStorage {
  private client: DynamoDBClient;
  public sessionStore: session.Store;

  constructor() {
    try {
      // Initialize DynamoDB client - but only if we have real credentials
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        console.log("Using real AWS credentials for DynamoDB");
        this.client = new DynamoDBClient({
          region: process.env.AWS_REGION || 'us-east-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          }
        });
      } else {
        console.log("No valid AWS credentials provided, DynamoDB operations will fail");
        // Create a dummy client that will throw errors - for type safety only
        this.client = new DynamoDBClient({
          region: 'us-east-1',
          credentials: {
            accessKeyId: 'dummy',
            secretAccessKey: 'dummy'
          }
        });
      }

      // Initialize session store for compatibility
      const MemoryStore = createMemoryStore(session);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      });

      // Skipping auto-creation of admin user for now
      // this.createDefaultAdmin();
    } catch (error) {
      console.error("Error in DynamoDB constructor:", error);
      // Initialize session store even if DynamoDB fails
      const MemoryStore = createMemoryStore(session);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      });
    }
  }

  private async createDefaultAdmin() {
    try {
      const existingUser = await this.getUserByEmail("admin@example.com");
      if (!existingUser) {
        const adminUser: User = {
          id: "1",
          email: "admin@example.com",
          password: "$2b$10$8r5YLdRJxQi7R.2CrQHgDuux1S9LCDQo3QhNBNctKpQqvmvMQkGJq", // "password"
          firstName: "Admin",
          lastName: "User",
          role: "ADMIN",
          status: "ACTIVE",
          companyId: null,
          departmentId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await this.putItem(TABLES.USERS, adminUser);
        console.log("Default admin user created");
      } else {
        console.log("Admin user already exists");
      }
    } catch (error) {
      console.error("Error creating default admin user:", error);
    }
  }

  // Helper methods
  private async putItem(tableName: string, item: any): Promise<void> {
    try {
      // Convert Date objects to ISO strings before marshalling for DynamoDB
      const itemWithStringDates = this.convertDatesToISOStrings(item);
      
      const params = {
        TableName: tableName,
        Item: marshall(itemWithStringDates, { 
          removeUndefinedValues: true,
          convertClassInstanceToMap: true 
        })
      };
      await this.client.send(new PutItemCommand(params));
    } catch (error) {
      console.error(`Error putting item in ${tableName}:`, error);
      throw error;
    }
  }
  
  // Helper to convert Date objects to ISO strings
  private convertDatesToISOStrings(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    
    if (typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertDatesToISOStrings(item));
    }
    
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = this.convertDatesToISOStrings(obj[key]);
      }
    }
    return result;
  }

  private async getItem(tableName: string, key: Record<string, any>): Promise<any | undefined> {
    try {
      const params = {
        TableName: tableName,
        Key: marshall(key)
      };
      const { Item } = await this.client.send(new GetItemCommand(params));
      return Item ? unmarshall(Item) : undefined;
    } catch (error) {
      console.error(`Error getting item from ${tableName}:`, error);
      throw error;
    }
  }

  private async deleteItem(tableName: string, key: Record<string, any>): Promise<boolean> {
    try {
      const params = {
        TableName: tableName,
        Key: marshall(key)
      };
      await this.client.send(new DeleteItemCommand(params));
      return true;
    } catch (error) {
      console.error(`Error deleting item from ${tableName}:`, error);
      return false;
    }
  }

  private async scanTable(tableName: string, filterExpression?: string, expressionAttrValues?: Record<string, any>): Promise<any[]> {
    try {
      const params: any = {
        TableName: tableName
      };

      if (filterExpression) {
        params.FilterExpression = filterExpression;
        params.ExpressionAttributeValues = marshall(expressionAttrValues || {});
      }

      const { Items } = await this.client.send(new ScanCommand(params));
      return Items ? Items.map(item => unmarshall(item)) : [];
    } catch (error) {
      console.error(`Error scanning table ${tableName}:`, error);
      return [];
    }
  }

  private async queryTable(tableName: string, keyConditionExpression: string, expressionAttrValues: Record<string, any>, indexName?: string): Promise<any[]> {
    try {
      const params: any = {
        TableName: tableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: marshall(expressionAttrValues)
      };

      if (indexName) {
        params.IndexName = indexName;
      }

      const { Items } = await this.client.send(new QueryCommand(params));
      return Items ? Items.map(item => unmarshall(item)) : [];
    } catch (error) {
      console.error(`Error querying table ${tableName}:`, error);
      return [];
    }
  }

  private async updateItem(tableName: string, key: Record<string, any>, updateExpression: string, expressionAttrValues: Record<string, any>): Promise<boolean> {
    try {
      const params = {
        TableName: tableName,
        Key: marshall(key),
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: marshall(expressionAttrValues),
        ReturnValues: "UPDATED_NEW"
      };
      await this.client.send(new UpdateItemCommand(params));
      return true;
    } catch (error) {
      console.error(`Error updating item in ${tableName}:`, error);
      return false;
    }
  }

  // Company operations
  async getCompanies(): Promise<Company[]> {
    return this.scanTable(TABLES.COMPANIES);
  }

  async getCompany(id: string): Promise<Company | undefined> {
    return this.getItem(TABLES.COMPANIES, { id });
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newCompany: Company = {
      id,
      ...company,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await this.putItem(TABLES.COMPANIES, newCompany);
    return newCompany;
  }

  async updateCompany(id: string, companyUpdate: Partial<InsertCompany>): Promise<Company | undefined> {
    const existingCompany = await this.getCompany(id);
    if (!existingCompany) return undefined;

    const updatedCompany: Company = {
      ...existingCompany,
      ...companyUpdate,
      updatedAt: new Date()
    };
    await this.putItem(TABLES.COMPANIES, updatedCompany);
    return updatedCompany;
  }

  async deleteCompany(id: string): Promise<boolean> {
    return this.deleteItem(TABLES.COMPANIES, { id });
  }

  // Department operations
  async getDepartments(companyId?: string): Promise<Department[]> {
    if (companyId) {
      return this.scanTable(TABLES.DEPARTMENTS, "companyId = :companyId", { ":companyId": companyId });
    }
    return this.scanTable(TABLES.DEPARTMENTS);
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    return this.getItem(TABLES.DEPARTMENTS, { id });
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newDepartment: Department = {
      id,
      ...department,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await this.putItem(TABLES.DEPARTMENTS, newDepartment);
    return newDepartment;
  }

  async updateDepartment(id: string, departmentUpdate: Partial<InsertDepartment>): Promise<Department | undefined> {
    const existingDepartment = await this.getDepartment(id);
    if (!existingDepartment) return undefined;

    const updatedDepartment: Department = {
      ...existingDepartment,
      ...departmentUpdate,
      updatedAt: new Date()
    };
    await this.putItem(TABLES.DEPARTMENTS, updatedDepartment);
    return updatedDepartment;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    return this.deleteItem(TABLES.DEPARTMENTS, { id });
  }

  // Group operations
  async getGroups(companyId?: string): Promise<Group[]> {
    if (companyId) {
      return this.scanTable(TABLES.GROUPS, "companyId = :companyId", { ":companyId": companyId });
    }
    return this.scanTable(TABLES.GROUPS);
  }

  async getGroup(id: string): Promise<Group | undefined> {
    return this.getItem(TABLES.GROUPS, { id });
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newGroup: Group = {
      id,
      ...group,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await this.putItem(TABLES.GROUPS, newGroup);
    return newGroup;
  }

  async updateGroup(id: string, groupUpdate: Partial<InsertGroup>): Promise<Group | undefined> {
    const existingGroup = await this.getGroup(id);
    if (!existingGroup) return undefined;

    const updatedGroup: Group = {
      ...existingGroup,
      ...groupUpdate,
      updatedAt: new Date()
    };
    await this.putItem(TABLES.GROUPS, updatedGroup);
    return updatedGroup;
  }

  async deleteGroup(id: string): Promise<boolean> {
    return this.deleteItem(TABLES.GROUPS, { id });
  }

  // User operations
  async getUsers(companyId?: string, departmentId?: string): Promise<User[]> {
    let filterExpression = "";
    const expressionAttrValues: Record<string, any> = {};

    if (companyId) {
      filterExpression += "companyId = :companyId";
      expressionAttrValues[":companyId"] = companyId;
    }

    if (departmentId) {
      if (filterExpression) filterExpression += " AND ";
      filterExpression += "departmentId = :departmentId";
      expressionAttrValues[":departmentId"] = departmentId;
    }

    if (filterExpression) {
      return this.scanTable(TABLES.USERS, filterExpression, expressionAttrValues);
    }
    return this.scanTable(TABLES.USERS);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.getItem(TABLES.USERS, { id });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await this.scanTable(TABLES.USERS, "email = :email", { ":email": email });
    return users.length > 0 ? users[0] : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newUser: User = {
      id,
      ...user,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await this.putItem(TABLES.USERS, newUser);
    return newUser;
  }

  async updateUser(id: string, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;

    const updatedUser: User = {
      ...existingUser,
      ...userUpdate,
      updatedAt: new Date()
    };
    await this.putItem(TABLES.USERS, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.deleteItem(TABLES.USERS, { id });
  }

  // Implement remaining interface methods...
  // Team operations
  async getTeams(companyId?: string): Promise<Team[]> {
    if (companyId) {
      return this.scanTable(TABLES.TEAMS, "companyId = :companyId", { ":companyId": companyId });
    }
    return this.scanTable(TABLES.TEAMS);
  }

  async getTeam(id: string): Promise<Team | undefined> {
    return this.getItem(TABLES.TEAMS, { id });
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newTeam: Team = {
      id,
      ...team,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await this.putItem(TABLES.TEAMS, newTeam);
    return newTeam;
  }

  async updateTeam(id: string, teamUpdate: Partial<InsertTeam>): Promise<Team | undefined> {
    const existingTeam = await this.getTeam(id);
    if (!existingTeam) return undefined;

    const updatedTeam: Team = {
      ...existingTeam,
      ...teamUpdate,
      updatedAt: new Date()
    };
    await this.putItem(TABLES.TEAMS, updatedTeam);
    return updatedTeam;
  }

  async deleteTeam(id: string): Promise<boolean> {
    return this.deleteItem(TABLES.TEAMS, { id });
  }

  // Team membership - these would be better implemented with a separate TeamMembers table in DynamoDB
  async addUserToTeam(teamId: string, userId: string, role: string): Promise<boolean> {
    // For simplicity, this implementation is limited compared to a full DynamoDB solution
    // A proper implementation would use a separate table for team membership
    return true;
  }

  async removeUserFromTeam(teamId: string, userId: string): Promise<boolean> {
    return true;
  }

  async getTeamMembers(teamId: string): Promise<User[]> {
    // Would need a separate TeamMembers table and query
    return [];
  }

  // Project operations - stub implementations
  async getProjects(companyId?: string, teamId?: string): Promise<Project[]> {
    return [];
  }

  async getProject(id: string): Promise<Project | undefined> {
    return undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newProject: Project = {
      id,
      ...project,
      progress: { percentage: 0 },
      createdAt: timestamp,
      updatedAt: timestamp
    };
    return newProject;
  }

  async updateProject(id: string, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    return undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    return false;
  }

  async updateProjectProgress(id: string, progress: number): Promise<boolean> {
    return false;
  }

  // Epic operations - stub implementations
  async getEpics(projectId?: string): Promise<Epic[]> {
    return [];
  }

  async getEpic(id: string): Promise<Epic | undefined> {
    return undefined;
  }

  async createEpic(epic: InsertEpic): Promise<Epic> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newEpic: Epic = {
      id,
      ...epic,
      progress: { percentage: 0 },
      createdAt: timestamp,
      updatedAt: timestamp
    };
    return newEpic;
  }

  async updateEpic(id: string, epicUpdate: Partial<InsertEpic>): Promise<Epic | undefined> {
    return undefined;
  }

  async deleteEpic(id: string): Promise<boolean> {
    return false;
  }

  async updateEpicProgress(id: string, progress: number): Promise<boolean> {
    return false;
  }

  // Story operations - stub implementations
  async getStories(epicId?: string): Promise<Story[]> {
    return [];
  }

  async getStory(id: string): Promise<Story | undefined> {
    return undefined;
  }

  async createStory(story: InsertStory): Promise<Story> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newStory: Story = {
      id,
      ...story,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    return newStory;
  }

  async updateStory(id: string, storyUpdate: Partial<InsertStory>): Promise<Story | undefined> {
    return undefined;
  }

  async deleteStory(id: string): Promise<boolean> {
    return false;
  }

  // Task operations - stub implementations
  async getTasks(options?: { storyId?: string, assigneeId?: string, parentTaskId?: string }): Promise<Task[]> {
    return [];
  }

  async getTask(id: string): Promise<Task | undefined> {
    return undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newTask: Task = {
      id,
      ...task,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    return newTask;
  }

  async updateTask(id: string, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    return undefined;
  }

  async deleteTask(id: string): Promise<boolean> {
    return false;
  }

  // Comment operations - stub implementations
  async getComments(entityType: string, entityId: string): Promise<Comment[]> {
    return [];
  }

  async getComment(id: string): Promise<Comment | undefined> {
    return undefined;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newComment: Comment = {
      id,
      ...comment,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    return newComment;
  }

  async updateComment(id: string, commentUpdate: Partial<InsertComment>): Promise<Comment | undefined> {
    return undefined;
  }

  async deleteComment(id: string): Promise<boolean> {
    return false;
  }

  // Attachment operations - stub implementations
  async getAttachments(entityType: string, entityId: string): Promise<Attachment[]> {
    return [];
  }

  async getAttachment(id: string): Promise<Attachment | undefined> {
    return undefined;
  }

  async createAttachment(attachment: InsertAttachment): Promise<Attachment> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newAttachment: Attachment = {
      id,
      ...attachment,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    return newAttachment;
  }

  async deleteAttachment(id: string): Promise<boolean> {
    return false;
  }

  // Notification operations - stub implementations
  async getNotifications(userId: string): Promise<Notification[]> {
    return [];
  }

  async getNotification(id: string): Promise<Notification | undefined> {
    return undefined;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newNotification: Notification = {
      id,
      ...notification,
      createdAt: timestamp,
      updatedAt: timestamp,
      read: false
    };
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    return false;
  }

  async deleteNotification(id: string): Promise<boolean> {
    return false;
  }

  // Location operations - stub implementations
  async getLocations(companyId?: string): Promise<Location[]> {
    return [];
  }

  async getLocation(id: string): Promise<Location | undefined> {
    return undefined;
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newLocation: Location = {
      id,
      ...location,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    return newLocation;
  }

  async updateLocation(id: string, locationUpdate: Partial<InsertLocation>): Promise<Location | undefined> {
    return undefined;
  }

  async deleteLocation(id: string): Promise<boolean> {
    return false;
  }

  // TimeEntry operations - stub implementations
  async getTimeEntries(taskId?: string, userId?: string): Promise<TimeEntry[]> {
    return [];
  }

  async getTimeEntry(id: string): Promise<TimeEntry | undefined> {
    return undefined;
  }

  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newTimeEntry: TimeEntry = {
      id,
      ...timeEntry,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    return newTimeEntry;
  }

  async updateTimeEntry(id: string, timeEntryUpdate: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> {
    return undefined;
  }

  async deleteTimeEntry(id: string): Promise<boolean> {
    return false;
  }

  // Device operations - stub implementations
  async getDevices(companyId?: string, departmentId?: string, locationId?: string, assignedToId?: string, status?: string): Promise<Device[]> {
    return [];
  }

  async getDevice(id: string): Promise<Device | undefined> {
    return undefined;
  }

  async getDeviceBySerialNumber(serialNumber: string): Promise<Device | undefined> {
    return undefined;
  }

  async createDevice(device: InsertDevice): Promise<Device> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newDevice: Device = {
      id,
      ...device,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    return newDevice;
  }

  async updateDevice(id: string, deviceUpdate: Partial<InsertDevice>): Promise<Device | undefined> {
    return undefined;
  }

  async deleteDevice(id: string): Promise<boolean> {
    return false;
  }

  async assignDevice(id: string, userId: string): Promise<Device | undefined> {
    return undefined;
  }

  async unassignDevice(id: string): Promise<Device | undefined> {
    return undefined;
  }

  // Sprint operations - stub implementations
  async getSprints(projectId?: string, teamId?: string, status?: string): Promise<Sprint[]> {
    return [];
  }

  async getSprint(id: string): Promise<Sprint | undefined> {
    return undefined;
  }

  async createSprint(sprint: InsertSprint): Promise<Sprint> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newSprint: Sprint = {
      id,
      ...sprint,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    return newSprint;
  }

  async updateSprint(id: string, sprintUpdate: Partial<InsertSprint>): Promise<Sprint | undefined> {
    return undefined;
  }

  async deleteSprint(id: string): Promise<boolean> {
    return false;
  }

  async updateSprintCompletion(id: string, completed: string): Promise<boolean> {
    return false;
  }

  // Backlog operations - stub implementations
  async getBacklogItems(projectId?: string, epicId?: string, sprintId?: string, status?: string): Promise<BacklogItem[]> {
    return [];
  }

  async getBacklogItem(id: string): Promise<BacklogItem | undefined> {
    return undefined;
  }

  async createBacklogItem(backlogItem: InsertBacklogItem): Promise<BacklogItem> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newBacklogItem: BacklogItem = {
      id,
      ...backlogItem,
      createdAt: timestamp,
      updatedAt: timestamp,
      rank: "0"
    };
    return newBacklogItem;
  }

  async updateBacklogItem(id: string, backlogItemUpdate: Partial<InsertBacklogItem>): Promise<BacklogItem | undefined> {
    return undefined;
  }

  async deleteBacklogItem(id: string): Promise<boolean> {
    return false;
  }

  async moveBacklogItemToSprint(id: string, sprintId: string): Promise<BacklogItem | undefined> {
    return undefined;
  }

  async removeBacklogItemFromSprint(id: string): Promise<BacklogItem | undefined> {
    return undefined;
  }

  async updateBacklogItemRank(id: string, rank: string): Promise<boolean> {
    return false;
  }
}