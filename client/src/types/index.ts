// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyId: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Entity interfaces that match the schema
export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  parentDepartmentId?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  members?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'TEAM_LEAD' | 'DEVELOPER' | 'VIEWER';
  departmentId?: string;
  companyId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  parentTeamId?: string;
  companyId: string;
  members?: User[];
  subTeams?: Team[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  companyId: string;
  teamId: string;
  departmentId?: string;
  projectManagerId?: string;
  progress: { percentage: number };
  createdAt: string;
  updatedAt: string;
}

export interface Epic {
  id: string;
  name: string;
  description?: string;
  status: 'BACKLOG' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  projectId: string;
  startDate?: string;
  endDate?: string;
  progress: { percentage: number };
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: string;
  name: string;
  description?: string;
  epicId: string;
  status: 'BACKLOG' | 'READY' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  storyPoints?: string;
  assigneeId?: string;
  reporterId?: string;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  storyId: string;
  parentTaskId?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assigneeId?: string;
  estimatedHours?: string;
  actualHours?: string;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  entityType: 'EPIC' | 'STORY' | 'TASK';
  entityId: string;
  parentCommentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string;
  size: string;
  entityType: 'EPIC' | 'STORY' | 'TASK';
  entityId: string;
  uploadedById: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'TASK_ASSIGNED' | 'COMMENT_ADDED' | 'MENTION' | 'DUE_DATE' | 'STATUS_CHANGE';
  message: string;
  entityType: 'PROJECT' | 'EPIC' | 'STORY' | 'TASK' | 'COMMENT';
  entityId: string;
  isRead: string;
  createdAt: string;
}
