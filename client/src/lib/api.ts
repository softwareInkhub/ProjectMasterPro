import { apiRequest } from './queryClient';
import { 
  LoginRequest, RegisterRequest, Company, Department, 
  Team, User, Project, Epic, Story, Task, 
  Comment, Attachment, Notification 
} from '../types';

// Auth API
export const authApi = {
  login: (data: LoginRequest) => apiRequest('POST', '/api/auth/login', data),
  register: (data: RegisterRequest) => apiRequest('POST', '/api/auth/register', data),
};

// Company API
export const companyApi = {
  getAll: () => apiRequest('GET', '/api/companies'),
  getById: (id: string) => apiRequest('GET', `/api/companies/${id}`),
  create: (data: Partial<Company>) => apiRequest('POST', '/api/companies', data),
  update: (id: string, data: Partial<Company>) => apiRequest('PUT', `/api/companies/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/api/companies/${id}`),
};

// Department API
export const departmentApi = {
  getAll: (companyId?: string) => {
    let url = '/api/departments';
    if (companyId) {
      url += `?companyId=${companyId}`;
    }
    return apiRequest('GET', url);
  },
  getById: (id: string) => apiRequest('GET', `/api/departments/${id}`),
  create: (data: Partial<Department>) => apiRequest('POST', '/api/departments', data),
  update: (id: string, data: Partial<Department>) => apiRequest('PUT', `/api/departments/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/api/departments/${id}`),
};

// Team API
export const teamApi = {
  getAll: (companyId?: string) => {
    let url = '/api/teams';
    if (companyId) {
      url += `?companyId=${companyId}`;
    }
    return apiRequest('GET', url);
  },
  getById: (id: string) => apiRequest('GET', `/api/teams/${id}`),
  getMembers: (id: string) => apiRequest('GET', `/api/teams/${id}/members`),
  create: (data: Partial<Team>) => apiRequest('POST', '/api/teams', data),
  update: (id: string, data: Partial<Team>) => apiRequest('PUT', `/api/teams/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/api/teams/${id}`),
  addMember: (teamId: string, userId: string) => apiRequest('POST', `/api/teams/${teamId}/members/${userId}`),
  removeMember: (teamId: string, userId: string) => apiRequest('DELETE', `/api/teams/${teamId}/members/${userId}`),
};

// User API
export const userApi = {
  getAll: (companyId?: string, departmentId?: string) => {
    let url = '/api/users';
    const params = [];
    if (companyId) params.push(`companyId=${companyId}`);
    if (departmentId) params.push(`departmentId=${departmentId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return apiRequest('GET', url);
  },
  getById: (id: string) => apiRequest('GET', `/api/users/${id}`),
  create: (data: Partial<User>) => apiRequest('POST', '/api/users', data),
  update: (id: string, data: Partial<User>) => apiRequest('PUT', `/api/users/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/api/users/${id}`),
};

// Project API
export const projectApi = {
  getAll: (companyId?: string, teamId?: string) => {
    let url = '/api/projects';
    const params = [];
    if (companyId) params.push(`companyId=${companyId}`);
    if (teamId) params.push(`teamId=${teamId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return apiRequest('GET', url);
  },
  getById: (id: string) => apiRequest('GET', `/api/projects/${id}`),
  create: (data: Partial<Project>) => apiRequest('POST', '/api/projects', data),
  update: (id: string, data: Partial<Project>) => apiRequest('PUT', `/api/projects/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/api/projects/${id}`),
};

// Epic API
export const epicApi = {
  getAll: (projectId?: string) => {
    let url = '/api/epics';
    if (projectId) {
      url += `?projectId=${projectId}`;
    }
    return apiRequest('GET', url);
  },
  getById: (id: string) => apiRequest('GET', `/api/epics/${id}`),
  create: (data: Partial<Epic>) => apiRequest('POST', '/api/epics', data),
  update: (id: string, data: Partial<Epic>) => apiRequest('PUT', `/api/epics/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/api/epics/${id}`),
};

// Story API
export const storyApi = {
  getAll: (epicId?: string) => {
    let url = '/api/stories';
    if (epicId) {
      url += `?epicId=${epicId}`;
    }
    return apiRequest('GET', url);
  },
  getById: (id: string) => apiRequest('GET', `/api/stories/${id}`),
  create: (data: Partial<Story>) => apiRequest('POST', '/api/stories', data),
  update: (id: string, data: Partial<Story>) => apiRequest('PUT', `/api/stories/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/api/stories/${id}`),
};

// Task API
export const taskApi = {
  getAll: (storyId?: string, assigneeId?: string) => {
    let url = '/api/tasks';
    const params = [];
    if (storyId) params.push(`storyId=${storyId}`);
    if (assigneeId) params.push(`assigneeId=${assigneeId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return apiRequest('GET', url);
  },
  getById: (id: string) => apiRequest('GET', `/api/tasks/${id}`),
  create: (data: Partial<Task>) => apiRequest('POST', '/api/tasks', data),
  update: (id: string, data: Partial<Task>) => apiRequest('PUT', `/api/tasks/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/api/tasks/${id}`),
};

// Comment API
export const commentApi = {
  getAll: (entityType: string, entityId: string) => {
    return apiRequest('GET', `/api/comments?entityType=${entityType}&entityId=${entityId}`);
  },
  create: (data: Partial<Comment>) => apiRequest('POST', '/api/comments', data),
  update: (id: string, data: Partial<Comment>) => apiRequest('PUT', `/api/comments/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/api/comments/${id}`),
};

// Attachment API
export const attachmentApi = {
  getAll: (entityType: string, entityId: string) => {
    return apiRequest('GET', `/api/attachments?entityType=${entityType}&entityId=${entityId}`);
  },
  create: (data: Partial<Attachment>) => apiRequest('POST', '/api/attachments', data),
  delete: (id: string) => apiRequest('DELETE', `/api/attachments/${id}`),
};

// Notification API
export const notificationApi = {
  getAll: () => apiRequest('GET', '/api/notifications'),
  markAsRead: (id: string) => apiRequest('POST', `/api/notifications/${id}/read`),
  delete: (id: string) => apiRequest('DELETE', `/api/notifications/${id}`),
};
