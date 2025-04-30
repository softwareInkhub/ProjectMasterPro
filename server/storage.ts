import {
  Company, InsertCompany, Department, InsertDepartment,
  Group, InsertGroup, User, InsertUser, Team, InsertTeam,
  Project, InsertProject, Epic, InsertEpic, Story, InsertStory,
  Task, InsertTask, Comment, InsertComment, Attachment, InsertAttachment,
  Notification, InsertNotification, Location, InsertLocation, Device, InsertDevice,
  TimeEntry, InsertTimeEntry, Sprint, InsertSprint, BacklogItem, InsertBacklogItem
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomUUID } from "crypto";

// Interface for storage operations
export interface IStorage {
  sessionStore: session.Store;
  // Company operations
  getCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<boolean>;

  // Department operations
  getDepartments(companyId?: string): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department | undefined>;
  deleteDepartment(id: string): Promise<boolean>;

  // Group operations
  getGroups(companyId?: string): Promise<Group[]>;
  getGroup(id: string): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: string, group: Partial<InsertGroup>): Promise<Group | undefined>;
  deleteGroup(id: string): Promise<boolean>;

  // User operations
  getUsers(companyId?: string, departmentId?: string): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Team operations
  getTeams(companyId?: string): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;
  addUserToTeam(teamId: string, userId: string, role: string): Promise<boolean>;
  removeUserFromTeam(teamId: string, userId: string): Promise<boolean>;
  getTeamMembers(teamId: string): Promise<User[]>;

  // Project operations
  getProjects(companyId?: string, teamId?: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  updateProjectProgress(id: string, progress: number): Promise<boolean>;

  // Epic operations
  getEpics(projectId?: string): Promise<Epic[]>;
  getEpic(id: string): Promise<Epic | undefined>;
  createEpic(epic: InsertEpic): Promise<Epic>;
  updateEpic(id: string, epic: Partial<InsertEpic>): Promise<Epic | undefined>;
  deleteEpic(id: string): Promise<boolean>;
  updateEpicProgress(id: string, progress: number): Promise<boolean>;

  // Story operations
  getStories(epicId?: string): Promise<Story[]>;
  getStory(id: string): Promise<Story | undefined>;
  createStory(story: InsertStory): Promise<Story>;
  updateStory(id: string, story: Partial<InsertStory>): Promise<Story | undefined>;
  deleteStory(id: string): Promise<boolean>;

  // Task operations
  getTasks(options?: { storyId?: string, assigneeId?: string, parentTaskId?: string }): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Comment operations
  getComments(entityType: string, entityId: string): Promise<Comment[]>;
  getComment(id: string): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, comment: Partial<InsertComment>): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<boolean>;

  // Attachment operations
  getAttachments(entityType: string, entityId: string): Promise<Attachment[]>;
  getAttachment(id: string): Promise<Attachment | undefined>;
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  deleteAttachment(id: string): Promise<boolean>;

  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  getNotification(id: string): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;
  deleteNotification(id: string): Promise<boolean>;
  
  // Location operations
  getLocations(companyId?: string): Promise<Location[]>;
  getLocation(id: string): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: string, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: string): Promise<boolean>;
  
  // TimeEntry operations
  getTimeEntries(taskId?: string, userId?: string): Promise<TimeEntry[]>;
  getTimeEntry(id: string): Promise<TimeEntry | undefined>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: string, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined>;
  deleteTimeEntry(id: string): Promise<boolean>;
  
  // Device operations
  getDevices(companyId?: string, departmentId?: string, locationId?: string, assignedToId?: string, status?: string): Promise<Device[]>;
  getDevice(id: string): Promise<Device | undefined>;
  getDeviceBySerialNumber(serialNumber: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: string, device: Partial<InsertDevice>): Promise<Device | undefined>;
  deleteDevice(id: string): Promise<boolean>;
  assignDevice(id: string, userId: string): Promise<Device | undefined>;
  unassignDevice(id: string): Promise<Device | undefined>;
  
  // TimeEntry operations
  getTimeEntries(taskId?: string, userId?: string): Promise<TimeEntry[]>;
  getTimeEntry(id: string): Promise<TimeEntry | undefined>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: string, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined>;
  deleteTimeEntry(id: string): Promise<boolean>;
  
  // Sprint operations
  getSprints(projectId?: string, teamId?: string, status?: string): Promise<Sprint[]>;
  getSprint(id: string): Promise<Sprint | undefined>;
  createSprint(sprint: InsertSprint): Promise<Sprint>;
  updateSprint(id: string, sprint: Partial<InsertSprint>): Promise<Sprint | undefined>;
  deleteSprint(id: string): Promise<boolean>;
  updateSprintCompletion(id: string, completed: string): Promise<boolean>;
  
  // Backlog operations
  getBacklogItems(projectId?: string, epicId?: string, sprintId?: string, status?: string): Promise<BacklogItem[]>;
  getBacklogItem(id: string): Promise<BacklogItem | undefined>;
  createBacklogItem(backlogItem: InsertBacklogItem): Promise<BacklogItem>;
  updateBacklogItem(id: string, backlogItem: Partial<InsertBacklogItem>): Promise<BacklogItem | undefined>;
  deleteBacklogItem(id: string): Promise<boolean>;
  moveBacklogItemToSprint(id: string, sprintId: string): Promise<BacklogItem | undefined>;
  removeBacklogItemFromSprint(id: string): Promise<BacklogItem | undefined>;
  updateBacklogItemRank(id: string, rank: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private companies: Map<string, Company>;
  private departments: Map<string, Department>;
  private groups: Map<string, Group>;
  private users: Map<string, User>;
  private teams: Map<string, Team>;
  private teamMembers: Map<string, Set<string>>; // teamId -> Set<userId>
  private projects: Map<string, Project>;
  private epics: Map<string, Epic>;
  private stories: Map<string, Story>;
  private tasks: Map<string, Task>;
  private timeEntries: Map<string, TimeEntry>;
  private comments: Map<string, Comment>;
  private attachments: Map<string, Attachment>;
  private notifications: Map<string, Notification>;
  private locations: Map<string, Location>;
  private devices: Map<string, Device>;
  private sprints: Map<string, Sprint>;
  private backlogItems: Map<string, BacklogItem>;

  constructor() {
    // Initialize session store with memorystore
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    this.companies = new Map();
    this.departments = new Map();
    this.groups = new Map();
    this.users = new Map();
    this.teams = new Map();
    this.teamMembers = new Map();
    this.projects = new Map();
    this.epics = new Map();
    this.stories = new Map();
    this.tasks = new Map();
    this.timeEntries = new Map();
    this.comments = new Map();
    this.attachments = new Map();
    this.notifications = new Map();
    this.locations = new Map();
    this.devices = new Map();
    this.sprints = new Map();
    this.backlogItems = new Map();
    
    // Create a default admin user for initial login
    this.createDefaultAdmin();
  }
  
  private createDefaultAdmin() {
    // Create admin user with string dates for compatibility
    const adminUser: any = {
      id: "1",
      email: "admin@example.com",
      password: "$2b$10$8r5YLdRJxQi7R.2CrQHgDuux1S9LCDQo3QhNBNctKpQqvmvMQkGJq", // "password"
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      status: "ACTIVE",
      companyId: null,
      departmentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.users.set(adminUser.id, adminUser as unknown as User);
  }

  // Company operations
  async getCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const newCompany: Company = {
      id,
      ...company,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.companies.set(id, newCompany);
    return newCompany;
  }

  async updateCompany(id: string, companyUpdate: Partial<InsertCompany>): Promise<Company | undefined> {
    const existingCompany = this.companies.get(id);
    if (!existingCompany) return undefined;

    const updatedCompany: Company = {
      ...existingCompany,
      ...companyUpdate,
      updatedAt: new Date().toISOString()
    };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }

  async deleteCompany(id: string): Promise<boolean> {
    return this.companies.delete(id);
  }

  // Department operations
  async getDepartments(companyId?: string): Promise<Department[]> {
    const departments = Array.from(this.departments.values());
    if (companyId) {
      return departments.filter(dept => dept.companyId === companyId);
    }
    return departments;
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const newDepartment: Department = {
      id,
      ...department,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.departments.set(id, newDepartment);
    return newDepartment;
  }

  async updateDepartment(id: string, departmentUpdate: Partial<InsertDepartment>): Promise<Department | undefined> {
    const existingDepartment = this.departments.get(id);
    if (!existingDepartment) return undefined;

    const updatedDepartment: Department = {
      ...existingDepartment,
      ...departmentUpdate,
      updatedAt: new Date().toISOString()
    };
    this.departments.set(id, updatedDepartment);
    return updatedDepartment;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    return this.departments.delete(id);
  }

  // Group operations
  async getGroups(companyId?: string): Promise<Group[]> {
    const groups = Array.from(this.groups.values());
    if (companyId) {
      return groups.filter(group => group.companyId === companyId);
    }
    return groups;
  }

  async getGroup(id: string): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const newGroup: Group = {
      id,
      ...group,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.groups.set(id, newGroup);
    return newGroup;
  }

  async updateGroup(id: string, groupUpdate: Partial<InsertGroup>): Promise<Group | undefined> {
    const existingGroup = this.groups.get(id);
    if (!existingGroup) return undefined;

    const updatedGroup: Group = {
      ...existingGroup,
      ...groupUpdate,
      updatedAt: new Date().toISOString()
    };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteGroup(id: string): Promise<boolean> {
    return this.groups.delete(id);
  }

  // User operations
  async getUsers(companyId?: string, departmentId?: string): Promise<User[]> {
    let users = Array.from(this.users.values());
    
    if (companyId) {
      users = users.filter(user => user.companyId === companyId);
    }
    
    if (departmentId) {
      users = users.filter(user => user.departmentId === departmentId);
    }
    
    return users;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.email === email
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const newUser: User = {
      id,
      ...user,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: string, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser: User = {
      ...existingUser,
      ...userUpdate,
      updatedAt: new Date().toISOString()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // Team operations
  async getTeams(companyId?: string): Promise<Team[]> {
    const teams = Array.from(this.teams.values());
    if (companyId) {
      return teams.filter(team => team.companyId === companyId);
    }
    return teams;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const newTeam: Team = {
      id,
      ...team,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.teams.set(id, newTeam);
    this.teamMembers.set(id, new Set());
    return newTeam;
  }

  async updateTeam(id: string, teamUpdate: Partial<InsertTeam>): Promise<Team | undefined> {
    const existingTeam = this.teams.get(id);
    if (!existingTeam) return undefined;

    const updatedTeam: Team = {
      ...existingTeam,
      ...teamUpdate,
      updatedAt: new Date().toISOString()
    };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  async deleteTeam(id: string): Promise<boolean> {
    this.teamMembers.delete(id);
    return this.teams.delete(id);
  }

  async addUserToTeam(teamId: string, userId: string, role: string): Promise<boolean> {
    if (!this.teams.has(teamId) || !this.users.has(userId)) {
      return false;
    }
    
    if (!this.teamMembers.has(teamId)) {
      this.teamMembers.set(teamId, new Set());
    }
    
    this.teamMembers.get(teamId)!.add(userId);
    return true;
  }

  async removeUserFromTeam(teamId: string, userId: string): Promise<boolean> {
    if (!this.teamMembers.has(teamId)) {
      return false;
    }
    
    return this.teamMembers.get(teamId)!.delete(userId);
  }

  async getTeamMembers(teamId: string): Promise<User[]> {
    if (!this.teamMembers.has(teamId)) {
      return [];
    }
    
    const memberIds = Array.from(this.teamMembers.get(teamId)!);
    return memberIds.map(id => this.users.get(id)!).filter(Boolean);
  }

  // Project operations
  async getProjects(companyId?: string, teamId?: string): Promise<Project[]> {
    let projects = Array.from(this.projects.values());
    
    if (companyId) {
      projects = projects.filter(project => project.companyId === companyId);
    }
    
    if (teamId) {
      projects = projects.filter(project => project.teamId === teamId);
    }
    
    return projects;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const newProject: Project = {
      id,
      ...project,
      progress: { percentage: 0 },
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: string, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;

    const updatedProject: Project = {
      ...existingProject,
      ...projectUpdate,
      updatedAt: new Date().toISOString()
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  async updateProjectProgress(id: string, progress: number): Promise<boolean> {
    const project = this.projects.get(id);
    if (!project) return false;
    
    project.progress = { percentage: progress };
    project.updatedAt = new Date().toISOString();
    this.projects.set(id, project);
    return true;
  }

  // Epic operations
  async getEpics(projectId?: string): Promise<Epic[]> {
    const epics = Array.from(this.epics.values());
    if (projectId) {
      return epics.filter(epic => epic.projectId === projectId);
    }
    return epics;
  }

  async getEpic(id: string): Promise<Epic | undefined> {
    return this.epics.get(id);
  }

  async createEpic(epic: InsertEpic): Promise<Epic> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const newEpic: Epic = {
      id,
      ...epic,
      progress: { percentage: 0 },
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.epics.set(id, newEpic);
    return newEpic;
  }

  async updateEpic(id: string, epicUpdate: Partial<InsertEpic>): Promise<Epic | undefined> {
    const existingEpic = this.epics.get(id);
    if (!existingEpic) return undefined;

    const updatedEpic: Epic = {
      ...existingEpic,
      ...epicUpdate,
      updatedAt: new Date().toISOString()
    };
    this.epics.set(id, updatedEpic);
    return updatedEpic;
  }

  async deleteEpic(id: string): Promise<boolean> {
    return this.epics.delete(id);
  }

  async updateEpicProgress(id: string, progress: number): Promise<boolean> {
    const epic = this.epics.get(id);
    if (!epic) return false;
    
    epic.progress = { percentage: progress };
    epic.updatedAt = new Date().toISOString();
    this.epics.set(id, epic);
    return true;
  }

  // Story operations
  async getStories(epicId?: string): Promise<Story[]> {
    const stories = Array.from(this.stories.values());
    if (epicId) {
      return stories.filter(story => story.epicId === epicId);
    }
    return stories;
  }

  async getStory(id: string): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async createStory(story: InsertStory): Promise<Story> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const newStory: Story = {
      id,
      ...story,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.stories.set(id, newStory);
    return newStory;
  }

  async updateStory(id: string, storyUpdate: Partial<InsertStory>): Promise<Story | undefined> {
    const existingStory = this.stories.get(id);
    if (!existingStory) return undefined;

    const updatedStory: Story = {
      ...existingStory,
      ...storyUpdate,
      updatedAt: new Date().toISOString()
    };
    this.stories.set(id, updatedStory);
    return updatedStory;
  }

  async deleteStory(id: string): Promise<boolean> {
    return this.stories.delete(id);
  }

  // Task operations
  async getTasks(options?: { storyId?: string, assigneeId?: string, parentTaskId?: string }): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values());
    
    if (options) {
      if (options.storyId) {
        tasks = tasks.filter(task => task.storyId === options.storyId);
      }
      
      if (options.assigneeId) {
        tasks = tasks.filter(task => task.assigneeId === options.assigneeId);
      }
      
      if (options.parentTaskId !== undefined) {
        tasks = tasks.filter(task => task.parentTaskId === options.parentTaskId);
      }
    }
    
    return tasks;
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const newTask: Task = {
      id,
      ...task,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: string, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;

    const updatedTask: Task = {
      ...existingTask,
      ...taskUpdate,
      updatedAt: new Date().toISOString()
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // TimeEntry operations
  async getTimeEntries(taskId?: string, userId?: string): Promise<TimeEntry[]> {
    let timeEntries = Array.from(this.timeEntries.values());
    
    if (taskId) {
      timeEntries = timeEntries.filter(entry => entry.taskId === taskId);
    }
    
    if (userId) {
      timeEntries = timeEntries.filter(entry => entry.userId === userId);
    }
    
    return timeEntries;
  }

  async getTimeEntry(id: string): Promise<TimeEntry | undefined> {
    return this.timeEntries.get(id);
  }

  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const newTimeEntry: TimeEntry = {
      id,
      ...timeEntry,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.timeEntries.set(id, newTimeEntry);
    return newTimeEntry;
  }

  async updateTimeEntry(id: string, timeEntryUpdate: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> {
    const existingTimeEntry = this.timeEntries.get(id);
    if (!existingTimeEntry) return undefined;

    const updatedTimeEntry: TimeEntry = {
      ...existingTimeEntry,
      ...timeEntryUpdate,
      updatedAt: new Date().toISOString()
    };
    this.timeEntries.set(id, updatedTimeEntry);
    return updatedTimeEntry;
  }

  async deleteTimeEntry(id: string): Promise<boolean> {
    return this.timeEntries.delete(id);
  }

  // Comment operations
  async getComments(entityType: string, entityId: string): Promise<Comment[]> {
    const comments = Array.from(this.comments.values());
    return comments.filter(
      comment => comment.entityType === entityType && comment.entityId === entityId
    );
  }

  async getComment(id: string): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const newComment: Comment = {
      id,
      ...comment,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.comments.set(id, newComment);
    return newComment;
  }

  async updateComment(id: string, commentUpdate: Partial<InsertComment>): Promise<Comment | undefined> {
    const existingComment = this.comments.get(id);
    if (!existingComment) return undefined;

    const updatedComment: Comment = {
      ...existingComment,
      ...commentUpdate,
      updatedAt: new Date().toISOString()
    };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Attachment operations
  async getAttachments(entityType: string, entityId: string): Promise<Attachment[]> {
    const attachments = Array.from(this.attachments.values());
    return attachments.filter(
      attachment => attachment.entityType === entityType && attachment.entityId === entityId
    );
  }

  async getAttachment(id: string): Promise<Attachment | undefined> {
    return this.attachments.get(id);
  }

  async createAttachment(attachment: InsertAttachment): Promise<Attachment> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const newAttachment: Attachment = {
      id,
      ...attachment,
      createdAt: timestamp
    };
    this.attachments.set(id, newAttachment);
    return newAttachment;
  }

  async deleteAttachment(id: string): Promise<boolean> {
    return this.attachments.delete(id);
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    const notifications = Array.from(this.notifications.values());
    return notifications.filter(notification => notification.userId === userId);
  }

  async getNotification(id: string): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const newNotification: Notification = {
      id,
      ...notification,
      createdAt: timestamp
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.isRead = "true";
    this.notifications.set(id, notification);
    return true;
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }

  // Location operations
  async getLocations(companyId?: string): Promise<Location[]> {
    const locations = Array.from(this.locations.values());
    if (companyId) {
      return locations.filter(location => location.companyId === companyId);
    }
    return locations;
  }

  async getLocation(id: string): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const newLocation: Location = {
      id,
      ...location,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.locations.set(id, newLocation);
    return newLocation;
  }

  async updateLocation(id: string, locationUpdate: Partial<InsertLocation>): Promise<Location | undefined> {
    const existingLocation = this.locations.get(id);
    if (!existingLocation) return undefined;

    const updatedLocation: Location = {
      ...existingLocation,
      ...locationUpdate,
      updatedAt: new Date().toISOString()
    };
    this.locations.set(id, updatedLocation);
    return updatedLocation;
  }

  async deleteLocation(id: string): Promise<boolean> {
    return this.locations.delete(id);
  }

  // Device operations
  async getDevices(companyId?: string, departmentId?: string, locationId?: string, assignedToId?: string, status?: string): Promise<Device[]> {
    let devices = Array.from(this.devices.values());
    
    if (companyId) {
      devices = devices.filter(device => device.companyId === companyId);
    }
    
    if (departmentId) {
      devices = devices.filter(device => device.departmentId === departmentId);
    }
    
    if (locationId) {
      devices = devices.filter(device => device.locationId === locationId);
    }
    
    if (assignedToId) {
      devices = devices.filter(device => device.assignedToId === assignedToId);
    }
    
    if (status) {
      devices = devices.filter(device => device.status === status);
    }
    
    return devices;
  }

  async getDevice(id: string): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async getDeviceBySerialNumber(serialNumber: string): Promise<Device | undefined> {
    return Array.from(this.devices.values()).find(
      device => device.serialNumber === serialNumber
    );
  }

  async createDevice(device: InsertDevice): Promise<Device> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const newDevice: Device = {
      id,
      ...device,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.devices.set(id, newDevice);
    return newDevice;
  }

  async updateDevice(id: string, deviceUpdate: Partial<InsertDevice>): Promise<Device | undefined> {
    const existingDevice = this.devices.get(id);
    if (!existingDevice) return undefined;

    const updatedDevice: Device = {
      ...existingDevice,
      ...deviceUpdate,
      updatedAt: new Date().toISOString()
    };
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }

  async deleteDevice(id: string): Promise<boolean> {
    return this.devices.delete(id);
  }

  async assignDevice(id: string, userId: string): Promise<Device | undefined> {
    const device = this.devices.get(id);
    if (!device || !this.users.has(userId)) return undefined;
    
    device.assignedToId = userId;
    device.status = "ASSIGNED";
    device.updatedAt = new Date().toISOString();
    this.devices.set(id, device);
    return device;
  }

  async unassignDevice(id: string): Promise<Device | undefined> {
    const device = this.devices.get(id);
    if (!device) return undefined;
    
    device.assignedToId = null;
    device.status = "AVAILABLE";
    device.updatedAt = new Date().toISOString();
    this.devices.set(id, device);
    return device;
  }
  
  // Sprint operations
  async getSprints(projectId?: string, teamId?: string, status?: string): Promise<Sprint[]> {
    let sprints = Array.from(this.sprints.values());
    
    if (projectId) {
      sprints = sprints.filter(sprint => sprint.projectId === projectId);
    }
    
    if (teamId) {
      sprints = sprints.filter(sprint => sprint.teamId === teamId);
    }
    
    if (status) {
      sprints = sprints.filter(sprint => sprint.status === status);
    }
    
    return sprints;
  }

  async getSprint(id: string): Promise<Sprint | undefined> {
    return this.sprints.get(id);
  }

  async createSprint(sprint: InsertSprint): Promise<Sprint> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const newSprint: Sprint = {
      id,
      ...sprint,
      completed: sprint.completed || "0",
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.sprints.set(id, newSprint);
    return newSprint;
  }

  async updateSprint(id: string, sprintUpdate: Partial<InsertSprint>): Promise<Sprint | undefined> {
    const existingSprint = this.sprints.get(id);
    if (!existingSprint) return undefined;

    const updatedSprint: Sprint = {
      ...existingSprint,
      ...sprintUpdate,
      updatedAt: new Date().toISOString()
    };
    this.sprints.set(id, updatedSprint);
    return updatedSprint;
  }

  async deleteSprint(id: string): Promise<boolean> {
    // Remove sprint from all backlog items
    Array.from(this.backlogItems.values())
      .filter(item => item.sprintId === id)
      .forEach(item => {
        item.sprintId = undefined;
        item.updatedAt = new Date().toISOString();
        this.backlogItems.set(item.id, item);
      });
      
    return this.sprints.delete(id);
  }

  async updateSprintCompletion(id: string, completed: string): Promise<boolean> {
    const sprint = this.sprints.get(id);
    if (!sprint) return false;
    
    sprint.completed = completed;
    sprint.updatedAt = new Date().toISOString();
    this.sprints.set(id, sprint);
    return true;
  }
  
  // Backlog operations
  async getBacklogItems(projectId?: string, epicId?: string, sprintId?: string, status?: string): Promise<BacklogItem[]> {
    let items = Array.from(this.backlogItems.values());
    
    if (projectId) {
      items = items.filter(item => item.projectId === projectId);
    }
    
    if (epicId) {
      items = items.filter(item => item.epicId === epicId);
    }
    
    if (sprintId) {
      items = items.filter(item => item.sprintId === sprintId);
    }
    
    if (status) {
      items = items.filter(item => item.status === status);
    }
    
    // Sort by rank
    return items.sort((a, b) => a.rank.localeCompare(b.rank));
  }

  async getBacklogItem(id: string): Promise<BacklogItem | undefined> {
    return this.backlogItems.get(id);
  }

  async createBacklogItem(backlogItem: InsertBacklogItem): Promise<BacklogItem> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    
    // If no rank is provided, generate one at the end
    if (!backlogItem.rank) {
      const items = Array.from(this.backlogItems.values());
      // Find the highest rank if there are items, otherwise start at a base value
      const highestRank = items.length > 0 
        ? Math.max(...items.map(i => parseFloat(i.rank))) 
        : 0;
      backlogItem.rank = (highestRank + 1000).toString(); // Leave gaps for future items
    }
    
    const newBacklogItem: BacklogItem = {
      id,
      ...backlogItem,
      labels: backlogItem.labels || [],
      acceptanceCriteria: backlogItem.acceptanceCriteria || [],
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.backlogItems.set(id, newBacklogItem);
    return newBacklogItem;
  }

  async updateBacklogItem(id: string, backlogItemUpdate: Partial<InsertBacklogItem>): Promise<BacklogItem | undefined> {
    const existingBacklogItem = this.backlogItems.get(id);
    if (!existingBacklogItem) return undefined;

    const updatedBacklogItem: BacklogItem = {
      ...existingBacklogItem,
      ...backlogItemUpdate,
      updatedAt: new Date().toISOString()
    };
    this.backlogItems.set(id, updatedBacklogItem);
    return updatedBacklogItem;
  }

  async deleteBacklogItem(id: string): Promise<boolean> {
    return this.backlogItems.delete(id);
  }

  async moveBacklogItemToSprint(id: string, sprintId: string): Promise<BacklogItem | undefined> {
    const backlogItem = this.backlogItems.get(id);
    const sprint = this.sprints.get(sprintId);
    
    if (!backlogItem || !sprint) return undefined;
    
    backlogItem.sprintId = sprintId;
    backlogItem.updatedAt = new Date().toISOString();
    this.backlogItems.set(id, backlogItem);
    return backlogItem;
  }

  async removeBacklogItemFromSprint(id: string): Promise<BacklogItem | undefined> {
    const backlogItem = this.backlogItems.get(id);
    if (!backlogItem) return undefined;
    
    backlogItem.sprintId = undefined;
    backlogItem.updatedAt = new Date().toISOString();
    this.backlogItems.set(id, backlogItem);
    return backlogItem;
  }

  async updateBacklogItemRank(id: string, rank: string): Promise<boolean> {
    const backlogItem = this.backlogItems.get(id);
    if (!backlogItem) return false;
    
    backlogItem.rank = rank;
    backlogItem.updatedAt = new Date().toISOString();
    this.backlogItems.set(id, backlogItem);
    return true;
  }
}

// Implementation for DatabaseStorage class will be in database-storage.ts file
// Left here for reference but not being used directly

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Using memory store for sessions instead of PostgreSQL
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Create default admin if no users exist
    this.checkAndCreateDefaultAdmin().catch(console.error);
    
    console.log("Using memory storage for sessions. DynamoDB will be implemented for production.");
  }
  
  private async checkAndCreateDefaultAdmin() {
    try {
      // With mock DB, we'll add a default admin user to our in-memory storage
      console.log("Creating default admin user (in-memory storage)...");
      
      // For DynamoDB implementation:
      // When we implement DynamoDB, we'll use the document client to check if users exist
      // and create a default admin if needed
      
      // For now we'll just log that this would happen
      console.log("Default admin user would be created in DynamoDB");
    } catch (error) {
      console.error("Error creating default admin:", error);
    }
  }

  // Company operations
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(schema.companies).orderBy(desc(schema.companies.createdAt));
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(schema.companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: string, companyUpdate: Partial<InsertCompany>): Promise<Company | undefined> {
    const [updatedCompany] = await db
      .update(schema.companies)
      .set({ ...companyUpdate, updatedAt: new Date() })
      .where(eq(schema.companies.id, id))
      .returning();
    return updatedCompany;
  }

  async deleteCompany(id: string): Promise<boolean> {
    const result = await db.delete(schema.companies).where(eq(schema.companies.id, id));
    return !!result;
  }

  // Department operations
  async getDepartments(companyId?: string): Promise<Department[]> {
    if (companyId) {
      return await db
        .select()
        .from(schema.departments)
        .where(eq(schema.departments.companyId, companyId))
        .orderBy(desc(schema.departments.createdAt));
    }
    return await db.select().from(schema.departments).orderBy(desc(schema.departments.createdAt));
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const [department] = await db.select().from(schema.departments).where(eq(schema.departments.id, id));
    return department;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [newDepartment] = await db.insert(schema.departments).values(department).returning();
    return newDepartment;
  }

  async updateDepartment(id: string, departmentUpdate: Partial<InsertDepartment>): Promise<Department | undefined> {
    const [updatedDepartment] = await db
      .update(schema.departments)
      .set({ ...departmentUpdate, updatedAt: new Date() })
      .where(eq(schema.departments.id, id))
      .returning();
    return updatedDepartment;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const result = await db.delete(schema.departments).where(eq(schema.departments.id, id));
    return !!result;
  }

  // Group operations
  async getGroups(companyId?: string): Promise<Group[]> {
    if (companyId) {
      return await db
        .select()
        .from(schema.groups)
        .where(eq(schema.groups.companyId, companyId))
        .orderBy(desc(schema.groups.createdAt));
    }
    return await db.select().from(schema.groups).orderBy(desc(schema.groups.createdAt));
  }

  async getGroup(id: string): Promise<Group | undefined> {
    const [group] = await db.select().from(schema.groups).where(eq(schema.groups.id, id));
    return group;
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const [newGroup] = await db.insert(schema.groups).values(group).returning();
    return newGroup;
  }

  async updateGroup(id: string, groupUpdate: Partial<InsertGroup>): Promise<Group | undefined> {
    const [updatedGroup] = await db
      .update(schema.groups)
      .set({ ...groupUpdate, updatedAt: new Date() })
      .where(eq(schema.groups.id, id))
      .returning();
    return updatedGroup;
  }

  async deleteGroup(id: string): Promise<boolean> {
    const result = await db.delete(schema.groups).where(eq(schema.groups.id, id));
    return !!result;
  }

  // User operations
  async getUsers(companyId?: string, departmentId?: string): Promise<User[]> {
    let query = db.select().from(schema.users);
    
    if (companyId && departmentId) {
      query = query.where(
        and(
          eq(schema.users.companyId, companyId),
          eq(schema.users.departmentId, departmentId)
        )
      );
    } else if (companyId) {
      query = query.where(eq(schema.users.companyId, companyId));
    } else if (departmentId) {
      query = query.where(eq(schema.users.departmentId, departmentId));
    }
    
    return await query.orderBy(desc(schema.users.createdAt));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(schema.users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(schema.users)
      .set({ ...userUpdate, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(schema.users).where(eq(schema.users.id, id));
    return !!result;
  }

  // Team operations
  async getTeams(companyId?: string): Promise<Team[]> {
    if (companyId) {
      return await db
        .select()
        .from(schema.teams)
        .where(eq(schema.teams.companyId, companyId))
        .orderBy(desc(schema.teams.createdAt));
    }
    return await db.select().from(schema.teams).orderBy(desc(schema.teams.createdAt));
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(schema.teams).where(eq(schema.teams.id, id));
    return team;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db.insert(schema.teams).values(team).returning();
    return newTeam;
  }

  async updateTeam(id: string, teamUpdate: Partial<InsertTeam>): Promise<Team | undefined> {
    const [updatedTeam] = await db
      .update(schema.teams)
      .set({ ...teamUpdate, updatedAt: new Date() })
      .where(eq(schema.teams.id, id))
      .returning();
    return updatedTeam;
  }

  async deleteTeam(id: string): Promise<boolean> {
    // First delete team members
    await db.delete(schema.teamMembers).where(eq(schema.teamMembers.teamId, id));
    // Then delete team
    const result = await db.delete(schema.teams).where(eq(schema.teams.id, id));
    return !!result;
  }

  async addUserToTeam(teamId: string, userId: string, role: string): Promise<boolean> {
    try {
      // First check if team and user exist
      const teamExists = await db.select({ id: schema.teams.id }).from(schema.teams).where(eq(schema.teams.id, teamId));
      const userExists = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.id, userId));
      
      if (teamExists.length === 0 || userExists.length === 0) {
        console.error(`Team ${teamId} or user ${userId} does not exist`);
        return false;
      }
      
      // Check if the user is already a member of the team
      const existingMember = await db.select()
        .from(schema.teamMembers)
        .where(
          and(
            eq(schema.teamMembers.teamId, teamId),
            eq(schema.teamMembers.userId, userId)
          )
        );
        
      // Store exactly what the UI is sending in the database without trying to normalize it
      // This way, we can display the same role string that was selected in the UI
      console.log(`Role provided: "${role}"`);
      
      // Handle empty role value - default to "Developer"
      if (!role || role.trim() === '') {
        console.log("Empty role provided, defaulting to 'Developer'");
        role = "Developer";
      }
      
      if (existingMember.length > 0) {
        // User is already a member, update their role instead
        console.log(`User ${userId} is already a member of team ${teamId}, updating role to ${role}`);
        await db.update(schema.teamMembers)
          .set({ role })
          .where(
            and(
              eq(schema.teamMembers.teamId, teamId),
              eq(schema.teamMembers.userId, userId)
            )
          );
        return true;
      }
      
      // If we got here, add the user to the team
      console.log(`Adding user ${userId} to team ${teamId} with role ${role}`);
      await db.insert(schema.teamMembers).values({ teamId, userId, role });
      return true;
    } catch (error) {
      console.error("Error adding user to team:", error);
      return false;
    }
  }

  async removeUserFromTeam(teamId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(schema.teamMembers)
      .where(
        and(
          eq(schema.teamMembers.teamId, teamId),
          eq(schema.teamMembers.userId, userId)
        )
      );
    return !!result;
  }

  async getTeamMembers(teamId: string): Promise<any[]> {
    const members = await db
      .select({
        user: schema.users,
        role: schema.teamMembers.role
      })
      .from(schema.teamMembers)
      .innerJoin(
        schema.users,
        eq(schema.teamMembers.userId, schema.users.id)
      )
      .where(eq(schema.teamMembers.teamId, teamId));
    
    // Format the data to include both user data and role
    return members.map(m => ({
      id: m.user.id,
      name: `${m.user.firstName} ${m.user.lastName}`,
      email: m.user.email,
      role: m.role,
      avatar: m.user.firstName[0] + m.user.lastName[0]
    }));
  }

  // Project operations
  async getProjects(companyId?: string, teamId?: string): Promise<Project[]> {
    let query = db.select().from(schema.projects);
    
    if (companyId && teamId) {
      query = query.where(
        and(
          eq(schema.projects.companyId, companyId),
          eq(schema.projects.teamId, teamId)
        )
      );
    } else if (companyId) {
      query = query.where(eq(schema.projects.companyId, companyId));
    } else if (teamId) {
      query = query.where(eq(schema.projects.teamId, teamId));
    }
    
    return await query.orderBy(desc(schema.projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    try {
      console.log("Starting project creation with:", JSON.stringify(project, null, 2));
      
      // Only extract the properties that are valid for the database schema
      // and NOT add progress (it's omitted from the InsertProject type)
      const { 
        name, 
        description, 
        companyId, 
        teamId, 
        startDate, 
        endDate, 
        status, 
        priority, 
        departmentId, 
        projectManagerId 
      } = project;
      
      // Build clean project data with only the valid properties
      const projectData = {
        name,
        companyId,
        teamId,
        description,
        startDate,
        endDate,
        status,
        priority,
        departmentId,
        projectManagerId,
        // Always set the default progress explicitly
        progress: { percentage: 0 }
      };
      
      console.log("Cleaned project data:", JSON.stringify(projectData, null, 2));
      
      const [newProject] = await db
        .insert(schema.projects)
        .values(projectData)
        .returning();
        
      console.log("Project created successfully:", newProject.id);
      return newProject;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }

  async updateProject(id: string, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(schema.projects)
      .set({ ...projectUpdate, updatedAt: new Date() })
      .where(eq(schema.projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      // Begin a transaction to ensure data consistency
      return await db.transaction(async (tx) => {
        console.log(`Starting transaction to delete project ${id} and all related entities`);
        
        // First, get all epics belonging to this project
        const epics = await tx
          .select()
          .from(schema.epics)
          .where(eq(schema.epics.projectId, id));
        
        console.log(`Found ${epics.length} epics associated with project ${id}`);
        
        // For each epic, delete its related stories and tasks
        for (const epic of epics) {
          console.log(`Processing epic ${epic.id}`);
          
          // Get all stories for this epic
          const stories = await tx
            .select()
            .from(schema.stories)
            .where(eq(schema.stories.epicId, epic.id));
          
          console.log(`Found ${stories.length} stories for epic ${epic.id}`);
          
          // For each story, delete all associated tasks
          for (const story of stories) {
            console.log(`Deleting tasks for story ${story.id}`);
            await tx
              .delete(schema.tasks)
              .where(eq(schema.tasks.storyId, story.id));
          }
          
          // Delete all stories for this epic
          if (stories.length > 0) {
            console.log(`Deleting all stories for epic ${epic.id}`);
            await tx
              .delete(schema.stories)
              .where(eq(schema.stories.epicId, epic.id));
          }
        }
        
        // Now delete all epics
        if (epics.length > 0) {
          console.log(`Deleting all epics for project ${id}`);
          await tx
            .delete(schema.epics)
            .where(eq(schema.epics.projectId, id));
        }
        
        // Finally, delete the project
        console.log(`Deleting project ${id}`);
        const result = await tx
          .delete(schema.projects)
          .where(eq(schema.projects.id, id));
        
        console.log(`Project ${id} deleted successfully with all related entities`);
        return !!result;
      });
    } catch (error) {
      console.error(`Error in deleteProject for project ${id}:`, error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  async updateProjectProgress(id: string, progressPercentage: number): Promise<boolean> {
    const [result] = await db
      .update(schema.projects)
      .set({ 
        progress: { percentage: progressPercentage },
        updatedAt: new Date()
      })
      .where(eq(schema.projects.id, id))
      .returning({ id: schema.projects.id });
    
    return !!result;
  }

  // Epic operations
  async getEpics(projectId?: string): Promise<Epic[]> {
    if (projectId) {
      return await db
        .select()
        .from(schema.epics)
        .where(eq(schema.epics.projectId, projectId))
        .orderBy(desc(schema.epics.createdAt));
    }
    return await db.select().from(schema.epics).orderBy(desc(schema.epics.createdAt));
  }

  async getEpic(id: string): Promise<Epic | undefined> {
    const [epic] = await db.select().from(schema.epics).where(eq(schema.epics.id, id));
    return epic;
  }

  async createEpic(epic: InsertEpic): Promise<Epic> {
    const [newEpic] = await db
      .insert(schema.epics)
      .values({
        ...epic,
        progress: { percentage: 0 }
      })
      .returning();
    return newEpic;
  }

  async updateEpic(id: string, epicUpdate: Partial<InsertEpic>): Promise<Epic | undefined> {
    const [updatedEpic] = await db
      .update(schema.epics)
      .set({ ...epicUpdate, updatedAt: new Date() })
      .where(eq(schema.epics.id, id))
      .returning();
    return updatedEpic;
  }

  async deleteEpic(id: string): Promise<boolean> {
    try {
      // Begin a transaction to ensure data consistency
      return await db.transaction(async (tx) => {
        console.log(`Starting transaction to delete epic ${id} and its related stories`);
        
        // First, get all stories belonging to this epic
        const stories = await tx
          .select()
          .from(schema.stories)
          .where(eq(schema.stories.epicId, id));
        
        console.log(`Found ${stories.length} stories associated with epic ${id}`);
        
        // For each story, delete all associated tasks first
        for (const story of stories) {
          console.log(`Deleting tasks for story ${story.id}`);
          await tx
            .delete(schema.tasks)
            .where(eq(schema.tasks.storyId, story.id));
        }
        
        // Then delete all the stories belonging to this epic
        if (stories.length > 0) {
          console.log(`Deleting all stories for epic ${id}`);
          await tx
            .delete(schema.stories)
            .where(eq(schema.stories.epicId, id));
        }
        
        // Now we can safely delete the epic
        console.log(`Deleting epic ${id}`);
        const result = await tx
          .delete(schema.epics)
          .where(eq(schema.epics.id, id));
        
        console.log(`Epic ${id} deleted successfully`);
        return !!result;
      });
    } catch (error) {
      console.error(`Error in deleteEpic for epic ${id}:`, error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  async updateEpicProgress(id: string, progressPercentage: number): Promise<boolean> {
    const [result] = await db
      .update(schema.epics)
      .set({
        progress: { percentage: progressPercentage },
        updatedAt: new Date()
      })
      .where(eq(schema.epics.id, id))
      .returning({ id: schema.epics.id });
    
    return !!result;
  }

  // Story operations
  async getStories(epicId?: string): Promise<Story[]> {
    if (epicId) {
      return await db
        .select()
        .from(schema.stories)
        .where(eq(schema.stories.epicId, epicId))
        .orderBy(desc(schema.stories.createdAt));
    }
    return await db.select().from(schema.stories).orderBy(desc(schema.stories.createdAt));
  }

  async getStory(id: string): Promise<Story | undefined> {
    const [story] = await db.select().from(schema.stories).where(eq(schema.stories.id, id));
    return story;
  }

  async createStory(story: InsertStory): Promise<Story> {
    const [newStory] = await db.insert(schema.stories).values(story).returning();
    return newStory;
  }

  async updateStory(id: string, storyUpdate: Partial<InsertStory>): Promise<Story | undefined> {
    const [updatedStory] = await db
      .update(schema.stories)
      .set({ ...storyUpdate, updatedAt: new Date() })
      .where(eq(schema.stories.id, id))
      .returning();
    return updatedStory;
  }

  async deleteStory(id: string): Promise<boolean> {
    try {
      // Begin a transaction to ensure data consistency
      return await db.transaction(async (tx) => {
        console.log(`Starting transaction to delete story ${id} and its related tasks`);
        
        // First, delete all tasks associated with this story
        console.log(`Deleting tasks for story ${id}`);
        await tx
          .delete(schema.tasks)
          .where(eq(schema.tasks.storyId, id));
        
        // Now we can safely delete the story
        console.log(`Deleting story ${id}`);
        const result = await tx
          .delete(schema.stories)
          .where(eq(schema.stories.id, id));
        
        console.log(`Story ${id} deleted successfully`);
        return !!result;
      });
    } catch (error) {
      console.error(`Error in deleteStory for story ${id}:`, error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  // Task operations
  async getTasks(storyId?: string, assigneeId?: string): Promise<Task[]> {
    let query = db.select().from(schema.tasks);
    
    if (storyId && assigneeId) {
      query = query.where(
        and(
          eq(schema.tasks.storyId, storyId),
          eq(schema.tasks.assigneeId, assigneeId)
        )
      );
    } else if (storyId) {
      query = query.where(eq(schema.tasks.storyId, storyId));
    } else if (assigneeId) {
      query = query.where(eq(schema.tasks.assigneeId, assigneeId));
    }
    
    return await query.orderBy(desc(schema.tasks.createdAt));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(schema.tasks).where(eq(schema.tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(schema.tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: string, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(schema.tasks)
      .set({ ...taskUpdate, updatedAt: new Date() })
      .where(eq(schema.tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
    return !!result;
  }

  // Comment operations
  async getComments(entityType: string, entityId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(schema.comments)
      .where(
        and(
          eq(schema.comments.entityType, entityType),
          eq(schema.comments.entityId, entityId)
        )
      )
      .orderBy(desc(schema.comments.createdAt));
  }

  async getComment(id: string): Promise<Comment | undefined> {
    const [comment] = await db.select().from(schema.comments).where(eq(schema.comments.id, id));
    return comment;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(schema.comments).values(comment).returning();
    return newComment;
  }

  async updateComment(id: string, commentUpdate: Partial<InsertComment>): Promise<Comment | undefined> {
    const [updatedComment] = await db
      .update(schema.comments)
      .set({ ...commentUpdate, updatedAt: new Date() })
      .where(eq(schema.comments.id, id))
      .returning();
    return updatedComment;
  }

  async deleteComment(id: string): Promise<boolean> {
    const result = await db.delete(schema.comments).where(eq(schema.comments.id, id));
    return !!result;
  }

  // Attachment operations
  async getAttachments(entityType: string, entityId: string): Promise<Attachment[]> {
    return await db
      .select()
      .from(schema.attachments)
      .where(
        and(
          eq(schema.attachments.entityType, entityType),
          eq(schema.attachments.entityId, entityId)
        )
      )
      .orderBy(desc(schema.attachments.createdAt));
  }

  async getAttachment(id: string): Promise<Attachment | undefined> {
    const [attachment] = await db.select().from(schema.attachments).where(eq(schema.attachments.id, id));
    return attachment;
  }

  async createAttachment(attachment: InsertAttachment): Promise<Attachment> {
    const [newAttachment] = await db.insert(schema.attachments).values(attachment).returning();
    return newAttachment;
  }

  async deleteAttachment(id: string): Promise<boolean> {
    const result = await db.delete(schema.attachments).where(eq(schema.attachments.id, id));
    return !!result;
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .orderBy(desc(schema.notifications.createdAt));
  }

  async getNotification(id: string): Promise<Notification | undefined> {
    const [notification] = await db.select().from(schema.notifications).where(eq(schema.notifications.id, id));
    return notification;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(schema.notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const [result] = await db
      .update(schema.notifications)
      .set({ isRead: "true" })
      .where(eq(schema.notifications.id, id))
      .returning({ id: schema.notifications.id });
    
    return !!result;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const result = await db.delete(schema.notifications).where(eq(schema.notifications.id, id));
    return !!result;
  }

  // Location operations
  async getLocations(companyId?: string): Promise<Location[]> {
    if (companyId) {
      return await db
        .select()
        .from(schema.locations)
        .where(eq(schema.locations.companyId, companyId))
        .orderBy(desc(schema.locations.createdAt));
    }
    return await db.select().from(schema.locations).orderBy(desc(schema.locations.createdAt));
  }

  async getLocation(id: string): Promise<Location | undefined> {
    const [location] = await db.select().from(schema.locations).where(eq(schema.locations.id, id));
    return location;
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db.insert(schema.locations).values(location).returning();
    return newLocation;
  }

  async updateLocation(id: string, locationUpdate: Partial<InsertLocation>): Promise<Location | undefined> {
    const [updatedLocation] = await db
      .update(schema.locations)
      .set({ ...locationUpdate, updatedAt: new Date() })
      .where(eq(schema.locations.id, id))
      .returning();
    return updatedLocation;
  }

  async deleteLocation(id: string): Promise<boolean> {
    const result = await db.delete(schema.locations).where(eq(schema.locations.id, id));
    return !!result;
  }

  // Device operations
  async getDevices(
    companyId?: string, 
    departmentId?: string, 
    locationId?: string, 
    assignedToId?: string, 
    status?: string
  ): Promise<Device[]> {
    let query = db.select().from(schema.devices);
    
    const conditions = [];
    
    if (companyId) {
      conditions.push(eq(schema.devices.companyId, companyId));
    }
    
    if (departmentId) {
      conditions.push(eq(schema.devices.departmentId, departmentId));
    }
    
    if (locationId) {
      conditions.push(eq(schema.devices.locationId, locationId));
    }
    
    if (assignedToId) {
      conditions.push(eq(schema.devices.assignedToId, assignedToId));
    }
    
    if (status) {
      conditions.push(eq(schema.devices.status, status));
    }
    
    if (conditions.length > 0) {
      let condition = conditions[0];
      for (let i = 1; i < conditions.length; i++) {
        condition = and(condition, conditions[i]);
      }
      query = query.where(condition);
    }
    
    return await query.orderBy(desc(schema.devices.createdAt));
  }

  async getDevice(id: string): Promise<Device | undefined> {
    const [device] = await db.select().from(schema.devices).where(eq(schema.devices.id, id));
    return device;
  }

  async getDeviceBySerialNumber(serialNumber: string): Promise<Device | undefined> {
    const [device] = await db
      .select()
      .from(schema.devices)
      .where(eq(schema.devices.serialNumber, serialNumber));
    return device;
  }

  async createDevice(device: InsertDevice): Promise<Device> {
    const [newDevice] = await db.insert(schema.devices).values(device).returning();
    return newDevice;
  }

  async updateDevice(id: string, deviceUpdate: Partial<InsertDevice>): Promise<Device | undefined> {
    const [updatedDevice] = await db
      .update(schema.devices)
      .set({ ...deviceUpdate, updatedAt: new Date() })
      .where(eq(schema.devices.id, id))
      .returning();
    return updatedDevice;
  }

  async deleteDevice(id: string): Promise<boolean> {
    const result = await db.delete(schema.devices).where(eq(schema.devices.id, id));
    return !!result;
  }

  async assignDevice(id: string, userId: string): Promise<Device | undefined> {
    const [updatedDevice] = await db
      .update(schema.devices)
      .set({ 
        assignedToId: userId, 
        status: "ASSIGNED",
        updatedAt: new Date()
      })
      .where(eq(schema.devices.id, id))
      .returning();
    return updatedDevice;
  }

  async unassignDevice(id: string): Promise<Device | undefined> {
    const [updatedDevice] = await db
      .update(schema.devices)
      .set({ 
        assignedToId: null, 
        status: "AVAILABLE",
        updatedAt: new Date()
      })
      .where(eq(schema.devices.id, id))
      .returning();
    return updatedDevice;
  }

  // Sprint operations
  async getSprints(projectId?: string, teamId?: string, status?: string): Promise<Sprint[]> {
    let query = db.select().from(schema.sprints);
    
    const conditions = [];
    
    if (projectId) {
      conditions.push(eq(schema.sprints.projectId, projectId));
    }
    
    if (teamId) {
      conditions.push(eq(schema.sprints.teamId, teamId));
    }
    
    if (status) {
      conditions.push(eq(schema.sprints.status, status));
    }
    
    if (conditions.length > 0) {
      let condition = conditions[0];
      for (let i = 1; i < conditions.length; i++) {
        condition = and(condition, conditions[i]);
      }
      query = query.where(condition);
    }
    
    return await query.orderBy(desc(schema.sprints.createdAt));
  }

  async getSprint(id: string): Promise<Sprint | undefined> {
    const [sprint] = await db.select().from(schema.sprints).where(eq(schema.sprints.id, id));
    return sprint;
  }

  async createSprint(sprint: InsertSprint): Promise<Sprint> {
    const [newSprint] = await db.insert(schema.sprints).values(sprint).returning();
    return newSprint;
  }

  async updateSprint(id: string, sprintUpdate: Partial<InsertSprint>): Promise<Sprint | undefined> {
    const [updatedSprint] = await db
      .update(schema.sprints)
      .set({ ...sprintUpdate, updatedAt: new Date() })
      .where(eq(schema.sprints.id, id))
      .returning();
    return updatedSprint;
  }

  async deleteSprint(id: string): Promise<boolean> {
    // Update any backlog items to remove the sprint reference
    await db
      .update(schema.backlogItems)
      .set({ 
        sprintId: null,
        updatedAt: new Date()
      })
      .where(eq(schema.backlogItems.sprintId, id));
      
    const result = await db.delete(schema.sprints).where(eq(schema.sprints.id, id));
    return !!result;
  }

  async updateSprintCompletion(id: string, completed: string): Promise<boolean> {
    const result = await db
      .update(schema.sprints)
      .set({ 
        completed,
        updatedAt: new Date()
      })
      .where(eq(schema.sprints.id, id));
    return !!result;
  }
  
  // Backlog operations
  async getBacklogItems(projectId?: string, epicId?: string, sprintId?: string, status?: string): Promise<BacklogItem[]> {
    let query = db.select().from(schema.backlogItems);
    
    const conditions = [];
    
    if (projectId) {
      conditions.push(eq(schema.backlogItems.projectId, projectId));
    }
    
    if (epicId) {
      conditions.push(eq(schema.backlogItems.epicId, epicId));
    }
    
    if (sprintId) {
      conditions.push(eq(schema.backlogItems.sprintId, sprintId));
    }
    
    if (status) {
      conditions.push(eq(schema.backlogItems.status, status));
    }
    
    if (conditions.length > 0) {
      let condition = conditions[0];
      for (let i = 1; i < conditions.length; i++) {
        condition = and(condition, conditions[i]);
      }
      query = query.where(condition);
    }
    
    return await query.orderBy(asc(schema.backlogItems.rank));
  }

  async getBacklogItem(id: string): Promise<BacklogItem | undefined> {
    const [backlogItem] = await db.select().from(schema.backlogItems).where(eq(schema.backlogItems.id, id));
    return backlogItem;
  }

  async createBacklogItem(backlogItem: InsertBacklogItem): Promise<BacklogItem> {
    // If no rank is provided, generate one at the end
    if (!backlogItem.rank) {
      const items = await db.select({ rank: schema.backlogItems.rank })
        .from(schema.backlogItems)
        .where(eq(schema.backlogItems.projectId, backlogItem.projectId))
        .orderBy(desc(schema.backlogItems.rank));
      
      // Find the highest rank or start at base value
      const highestRank = items.length > 0 
        ? Math.max(...items.map(i => parseFloat(i.rank))) 
        : 0;
      backlogItem.rank = (highestRank + 1000).toString(); // Leave gaps for future items
    }
    
    const [newBacklogItem] = await db.insert(schema.backlogItems).values(backlogItem).returning();
    return newBacklogItem;
  }

  async updateBacklogItem(id: string, backlogItemUpdate: Partial<InsertBacklogItem>): Promise<BacklogItem | undefined> {
    const [updatedBacklogItem] = await db
      .update(schema.backlogItems)
      .set({ ...backlogItemUpdate, updatedAt: new Date() })
      .where(eq(schema.backlogItems.id, id))
      .returning();
    return updatedBacklogItem;
  }

  async deleteBacklogItem(id: string): Promise<boolean> {
    const result = await db.delete(schema.backlogItems).where(eq(schema.backlogItems.id, id));
    return !!result;
  }

  async moveBacklogItemToSprint(id: string, sprintId: string): Promise<BacklogItem | undefined> {
    // Check if sprint exists
    const sprint = await this.getSprint(sprintId);
    if (!sprint) return undefined;
    
    const [updatedBacklogItem] = await db
      .update(schema.backlogItems)
      .set({ 
        sprintId,
        updatedAt: new Date()
      })
      .where(eq(schema.backlogItems.id, id))
      .returning();
    return updatedBacklogItem;
  }

  async removeBacklogItemFromSprint(id: string): Promise<BacklogItem | undefined> {
    const [updatedBacklogItem] = await db
      .update(schema.backlogItems)
      .set({ 
        sprintId: null,
        updatedAt: new Date()
      })
      .where(eq(schema.backlogItems.id, id))
      .returning();
    return updatedBacklogItem;
  }

  async updateBacklogItemRank(id: string, rank: string): Promise<boolean> {
    const result = await db
      .update(schema.backlogItems)
      .set({ 
        rank,
        updatedAt: new Date()
      })
      .where(eq(schema.backlogItems.id, id));
    return !!result;
  }
}

import { DynamoDBStorage } from './dynamodb-storage';

// Use DynamoDBStorage with AWS DynamoDB for production
export const storage = new DynamoDBStorage();
