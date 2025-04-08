import {
  Company, InsertCompany, Department, InsertDepartment,
  Group, InsertGroup, User, InsertUser, Team, InsertTeam,
  Project, InsertProject, Epic, InsertEpic, Story, InsertStory,
  Task, InsertTask, Comment, InsertComment, Attachment, InsertAttachment,
  Notification, InsertNotification,
  // String date interfaces for in-memory storage
  TaskWithStringDates, CommentWithStringDates, UserWithStringDates, ProjectWithStringDates
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
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
  addUserToTeam(teamId: string, userId: string): Promise<boolean>;
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
  getTasks(storyId?: string, assigneeId?: string): Promise<Task[]>;
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
}

export class MemStorage implements IStorage {
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
  private comments: Map<string, Comment>;
  private attachments: Map<string, Attachment>;
  private notifications: Map<string, Notification>;

  constructor() {
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
    this.comments = new Map();
    this.attachments = new Map();
    this.notifications = new Map();
    
    // Create a default admin user for initial login
    this.createDefaultAdmin();
  }
  
  private createDefaultAdmin() {
    // Create admin user
    const adminUser: UserWithStringDates = {
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
    const id = crypto.randomUUID();
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
    const id = crypto.randomUUID();
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
    const id = crypto.randomUUID();
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
    const id = crypto.randomUUID();
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
    const id = crypto.randomUUID();
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

  async addUserToTeam(teamId: string, userId: string): Promise<boolean> {
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
    const id = crypto.randomUUID();
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
    const id = crypto.randomUUID();
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
    const id = crypto.randomUUID();
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
  async getTasks(storyId?: string, assigneeId?: string): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values());
    
    if (storyId) {
      tasks = tasks.filter(task => task.storyId === storyId);
    }
    
    if (assigneeId) {
      tasks = tasks.filter(task => task.assigneeId === assigneeId);
    }
    
    return tasks;
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = crypto.randomUUID();
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
    const id = crypto.randomUUID();
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
    const id = crypto.randomUUID();
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
    const id = crypto.randomUUID();
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
}

export const storage = new MemStorage();
