# Project Management System

A comprehensive enterprise management platform that streamlines team workflows through robust authentication, dynamic project management, and secure communication tools.

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Data Model](#data-model)
5. [API Reference](#api-reference)
6. [UI Components](#ui-components)
   - [Dashboard](#dashboard)
   - [Navigation](#navigation-sidebar)
   - [Pages Overview](#pages-overview)
7. [Authentication & Authorization](#authentication--authorization)
8. [Development Guide](#development-guide)
   - [Setup Instructions](#setup-instructions)
   - [Folder Structure](#folder-structure)
   - [Adding New Features](#adding-new-features)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## Introduction

This Project Management System is designed for enterprise-level team management, providing a scalable solution for tracking tasks, organizing workflows, and facilitating team collaboration. The system enables businesses to manage their entire project lifecycle from conceptualization to completion with tools for tracking epics, stories, tasks, teams, and resources.

The application features a responsive React frontend, a robust Express backend, and comprehensive PostgreSQL database integration.

## Features

- **Authentication System**: Secure JWT-based authentication with role-based access control
- **Dashboard**: Real-time data visualization for project status and progress metrics
- **Project Management**: Full CRUD operations for projects, epics, stories, and tasks
- **Team Management**: Tools for organizing teams, roles, and responsibilities
- **Resource Allocation**: Tracking and management of company resources including devices
- **Organizational Structure**: Support for companies, departments, and locations
- **Reporting Tools**: Generate insights and analytics on project progress and performance
- **Responsive Design**: Optimized for both desktop and mobile interfaces

## Architecture

The application employs a modern, scalable architecture:

- **Frontend**: React with TypeScript using the Vite build tool
- **UI Components**: ShadCN component library with TailwindCSS
- **State Management**: TanStack Query for server state, React context for local state
- **Routing**: Wouter for lightweight client-side routing
- **Backend**: Express server with RESTful API endpoints
- **Database**: DynamoDB for NoSQL data persistence (migrated from PostgreSQL)
- **Authentication**: JWT tokens for stateless authentication
- **Data Validation**: Zod schemas for end-to-end type safety
- **Real-time Updates**: WebSocket server for instant notifications and updates

### Real-Time WebSocket System

The application features a comprehensive real-time update system using WebSockets:

#### Server-Side Implementation
- WebSocket server operates on `/ws` path, separate from the HTTP server
- Centralized event broadcasting system with standardized message format
- Event types defined as enums to ensure consistency between client and server
- Efficient client tracking with connection management

#### Client-Side Implementation
- `WebSocketContext` provides application-wide access to real-time updates
- Automatic reconnection if connection is lost
- Intelligent cache invalidation based on event types
- Toast notifications for important events
- Support for entity-specific event handling

#### Event Types
The system supports a wide range of event types for different entities:
- Entity creation events (TASK_CREATED, SPRINT_CREATED, etc.)
- Entity update events (TASK_UPDATED, SPRINT_UPDATED, etc.)
- Entity deletion events (TASK_DELETED, SPRINT_DELETED, etc.)
- Special events (TASK_ASSIGNED, COMMENT_ADDED, etc.)

#### WebSocket Message Format
```typescript
interface WebSocketMessage {
  type: EventType;
  payload: any;
}
```

This real-time system eliminates the need for page refreshes when data is updated, creating a seamless user experience across the application.

## Data Model

The system uses a relational database model with the following core entities and relationships:

### Entity Relationship Diagram

```
+----------------+       +----------------+       +----------------+
|    Company     |       |   Department   |       |     User       |
+----------------+       +----------------+       +----------------+
| id             |<----->| id             |<----->| id             |
| name           |       | name           |       | email          |
| description    |       | description    |       | username       |
| industry       |       | companyId      |       | password       |
| logo           |       | managerId      |       | firstName      |
| website        |       | budget         |       | lastName       |
| address        |       | createdAt      |       | role           |
| contactEmail   |       | updatedAt      |       | departmentId   |
| contactPhone   |       +----------------+       | createdAt      |
| createdAt      |                                | updatedAt      |
| updatedAt      |                                +----------------+
+----------------+                                       ^
       ^                                                 |
       |                                                 |
       |            +----------------+                   |
       |            |      Team      |                   |
       |            +----------------+                   |
       +----------->| id             |<------------------+
                    | name           |
                    | description    |
                    | departmentId   |
                    | leadId         |
                    | companyId      |
                    | createdAt      |
                    | updatedAt      |
                    +----------------+
                           ^
                           |
                           |
+----------------+       +----------------+       +----------------+
|    Project     |       |      Epic      |       |     Story      |
+----------------+       +----------------+       +----------------+
| id             |       | id             |       | id             |
| name           |       | name           |       | name           |
| description    |       | description    |       | description    |
| status         |       | status         |       | status         |
| priority       |       | priority       |       | priority       |
| companyId      |<----->| projectId      |<----->| epicId         |
| teamId         |       | startDate      |       | assigneeId     |
| startDate      |       | endDate        |       | reporterId     |
| endDate        |       | progress       |       | storyPoints    |
| budget         |       | createdAt      |       | startDate      |
| managerId      |       | updatedAt      |       | dueDate        |
| progress       |       +----------------+       | createdAt      |
| createdAt      |                                | updatedAt      |
| updatedAt      |                                +----------------+
+----------------+                                       ^
                                                         |
                                                         |
                                                +----------------+
                                                |      Task      |
                                                +----------------+
                                                | id             |
                                                | name           |
                                                | description    |
                                                | status         |
                                                | priority       |
                                                | storyId        |
                                                | assigneeId     |
                                                | estimatedHours |
                                                | actualHours    |
                                                | startDate      |
                                                | dueDate        |
                                                | createdAt      |
                                                | updatedAt      |
                                                +----------------+
```

The system uses a relational database model with the following core entities:

### Core Entities

#### User
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  password: string; // Hashed securely
  firstName: string;
  lastName: string;
  role: "ADMIN" | "MANAGER" | "TEAM_LEAD" | "DEVELOPER" | "TESTER" | "VIEWER";
  departmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Company
```typescript
interface Company {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  logo: string | null;
  website: string | null;
  address: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Department
```typescript
interface Department {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
  managerId: string | null; // Reference to User
  budget: number | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Team
```typescript
interface Team {
  id: string;
  name: string;
  description: string | null;
  departmentId: string | null;
  leadId: string | null; // Reference to User
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Project
```typescript
interface Project {
  id: string;
  name: string;
  description: string | null;
  status: "DRAFT" | "PLANNING" | "ACTIVE" | "COMPLETED" | "ARCHIVED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  companyId: string;
  teamId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  budget: number | null;
  managerId: string | null; // Reference to User
  progress: { percentage: number; lastUpdated: Date } | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Epic
```typescript
interface Epic {
  id: string;
  name: string;
  description: string | null;
  status: "BACKLOG" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  projectId: string;
  startDate: Date | null;
  endDate: Date | null;
  progress: { percentage: number; lastUpdated: Date } | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Story
```typescript
interface Story {
  id: string;
  name: string;
  description: string | null;
  status: "BACKLOG" | "READY" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  epicId: string;
  assigneeId: string | null; // Reference to User
  reporterId: string | null; // Reference to User
  storyPoints: string | null;
  startDate: Date | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Task
```typescript
interface Task {
  id: string;
  taskId: string; // Human-readable ID like "TASK-123"
  title: string;
  description: string | null;
  storyId: string | null;
  projectId: string;
  parentTaskId: string | null; // Support for recursive parent-child relationship
  
  // Status tracking
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BLOCKED" | "CANCELLED" | "DEFERRED" | "REOPENED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "URGENT" | "BLOCKER";
  
  // Assignment and ownership
  assignedToId: string | null;
  previousAssignees: Array<{ id: string, assignedAt: Date, unassignedAt: Date }> | null;
  createdById: string;
  
  // Time tracking
  plannedStartDate: Date | null;
  plannedDueDate: Date | null;
  actualStartDate: Date | null;
  actualDueDate: Date | null;
  plannedEffortHours: string | null;
  estimatedEffortHours: string | null;
  actualEffortHours: string | null;
  slippageHours: string | null; // Calculated field for time overruns
  
  // Sprint association
  sprintId: string | null;
  
  // Steps/checklist
  steps: Array<{
    id: string;
    description: string;
    isCompleted: boolean;
    completedAt: Date | null;
    completedById: string | null;
    order: number;
  }>;
  
  // Auditing
  lastUpdatedById: string;
  isSystemGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Sprint
```typescript
interface Sprint {
  id: string;
  name: string;
  goal: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: "PLANNING" | "ACTIVE" | "REVIEW" | "COMPLETED" | "CANCELLED";
  projectId: string;
  teamId: string;
  capacity: string | null; // In story points
  completed: string | null; // Story points completed
  scrumMasterId: string | null;
  notes: string | null;
  retrospective: {
    whatWentWell?: string[];
    whatCouldBeImproved?: string[];
    actionItems?: string[];
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### BacklogItem
```typescript
interface BacklogItem {
  id: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "UNASSIGNED";
  estimate: string | null; // Story points or time estimate
  type: "USER_STORY" | "BUG" | "TASK" | "EPIC" | "FEATURE";
  status: "NEW" | "REFINED" | "READY" | "IN_PROGRESS" | "DONE";
  projectId: string;
  epicId: string | null;
  sprintId: string | null;
  assigneeId: string | null;
  reporterId: string | null;
  labels: string[];
  acceptanceCriteria: string[];
  rank: string; // For ordering in the backlog
  createdAt: Date;
  updatedAt: Date;
}
```

#### Comment
```typescript
interface Comment {
  id: string;
  userId: string; // Reference to User
  content: string;
  createdAt: Date;
  updatedAt: Date;
  entityType: "EPIC" | "STORY" | "TASK";
  entityId: string; // Reference to an Epic, Story, or Task
  parentCommentId: string | null; // For nested comments
}
```

#### Location
```typescript
interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  postalCode: string | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Device
```typescript
interface Device {
  id: string;
  name: string;
  description: string | null;
  type: string;
  serialNumber: string;
  purchaseDate: Date | null;
  warranty: string | null;
  status: "AVAILABLE" | "ASSIGNED" | "MAINTENANCE" | "RETIRED";
  locationId: string | null;
  assignedUserId: string | null; // Reference to User
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Entity Relationships & Data Flow

#### Core Project Management Hierarchy
The system follows a hierarchical structure for project management:

**Projects → Epics → Stories → Tasks**

1. **Project** is the highest level container
   - Contains multiple **Epics**
   - Tracked at the company level
   - Assigned to a **Team** for execution
   - Managed by a specific **User** (usually with MANAGER role)
   - Has its own progress tracking, budget, and timeline

2. **Epic** represents a significant body of work
   - Always belongs to exactly one **Project**
   - Contains multiple **Stories**
   - Has its own progress tracking (calculated from child Stories)
   - Has its own timeline, which should fall within the parent Project timeline
   - Progress is automatically updated based on completion of child Stories

3. **Story** represents a discrete feature or requirement
   - Always belongs to exactly one **Epic**
   - Contains multiple **Tasks** for implementation
   - Assigned to a specific **User** for ownership
   - Reported by a **User** who requested the feature
   - Has story points for effort estimation
   - Progress is calculated from completion of child Tasks

4. **Task** represents a specific action item
   - Always belongs to exactly one **Story**
   - Assigned to a specific **User** for execution
   - Has estimated and actual hours tracking
   - Has a specific status (TODO, IN_PROGRESS, DONE, BLOCKED)
   - When all Tasks for a Story are marked DONE, the Story can be completed

#### Database Relationship Details

- **User** belongs to one **Department** (optional)
- **Department** belongs to one **Company**
- **Department** has one **User** as manager (optional)
- **Team** belongs to one **Department** (optional)
- **Team** belongs to one **Company**
- **Team** has one **User** as lead (optional)
- **Team** has many **Users** as members through **TeamMembers** junction
- **Project** belongs to one **Company**
- **Project** belongs to one **Team** (optional)
- **Project** has one **User** as manager (optional)
- **Project** has many **Epics**
- **Epic** belongs to one **Project**
- **Epic** has many **Stories**
- **Story** belongs to one **Epic**
- **Story** has one **User** as assignee (optional)
- **Story** has one **User** as reporter (optional)
- **Story** has many **Tasks**
- **Task** belongs to one **Story**
- **Task** has one **User** as assignee (optional)
- **Comment** belongs to one **User**
- **Comment** belongs to one entity (**Epic**, **Story**, or **Task**)
- **Location** belongs to one **Company**
- **Device** belongs to one **Company**
- **Device** belongs to one **Location** (optional)
- **Device** is assigned to one **User** (optional)

#### Data Propagation & Cascading Effects

When changes occur in the hierarchy, they propagate as follows:

1. **Task Status Changes**:
   - When all Tasks in a Story change to DONE, the Story's status can be updated to DONE
   - Task completion affects the Story's progress percentage

2. **Story Updates**:
   - When Stories are completed, the parent Epic's progress percentage is updated
   - Story status changes may trigger notifications to assignees and watchers

3. **Epic Updates**:
   - When Epics are completed, the parent Project's progress percentage is updated
   - Epic completions may trigger milestone notifications and reporting

4. **Project Completion**:
   - When all Epics in a Project are completed, the Project can be marked as COMPLETED
   - Project status changes affect company-level reporting and metrics

5. **User Reassignments**:
   - When a User is reassigned or removed, all their Tasks, Stories, and managed Projects must be reassigned or flagged

6. **Deletion Cascades**:
   - Deleting a Project cascades to delete all child Epics, Stories, and Tasks
   - Deleting an Epic cascades to delete all child Stories and Tasks
   - Deleting a Story cascades to delete all child Tasks
   - Comments remain in the system with references to deleted entities marked as unavailable

## API Reference

The API follows RESTful principles with JSON responses. All endpoints are prefixed with `/api`.

### Authentication Endpoints

| Endpoint          | Method | Description                | Request Body                  | Response                    |
|-------------------|--------|----------------------------|-------------------------------|----------------------------|
| `/api/auth/login` | POST   | User login                | `{ username, password }`      | `{ user, token }`          |
| `/api/auth/register` | POST | User registration        | `{ username, email, password, firstName, lastName, role }` | `{ user, token }` |
| `/api/auth/user`  | GET    | Get current user          | -                             | `{ user }`                 |
| `/api/auth/logout` | POST  | User logout               | -                             | `{ success: true }`        |

### User Management Endpoints

| Endpoint         | Method | Description              | Request Body                  | Response                    |
|------------------|--------|--------------------------|-------------------------------|----------------------------|
| `/api/users`     | GET    | List all users           | -                             | `[ users ]`                |
| `/api/users/:id` | GET    | Get user by ID           | -                             | `{ user }`                 |
| `/api/users`     | POST   | Create new user          | `{ userData }`                | `{ user }`                 |
| `/api/users/:id` | PUT    | Update user              | `{ userData }`                | `{ user }`                 |
| `/api/users/:id` | DELETE | Delete user              | -                             | `{ success: true }`        |

### Company Management Endpoints

| Endpoint            | Method | Description              | Request Body                  | Response                    |
|---------------------|--------|--------------------------|-------------------------------|----------------------------|
| `/api/companies`    | GET    | List all companies       | -                             | `[ companies ]`            |
| `/api/companies/:id`| GET    | Get company by ID        | -                             | `{ company }`              |
| `/api/companies`    | POST   | Create new company       | `{ companyData }`             | `{ company }`              |
| `/api/companies/:id`| PUT    | Update company           | `{ companyData }`             | `{ company }`              |
| `/api/companies/:id`| DELETE | Delete company           | -                             | `{ success: true }`        |

### Department Management Endpoints

| Endpoint               | Method | Description                | Request Body                  | Response                    |
|------------------------|--------|----------------------------|-------------------------------|----------------------------|
| `/api/departments`     | GET    | List all departments       | -                             | `[ departments ]`          |
| `/api/departments/:id` | GET    | Get department by ID       | -                             | `{ department }`           |
| `/api/departments`     | POST   | Create new department      | `{ departmentData }`          | `{ department }`           |
| `/api/departments/:id` | PUT    | Update department          | `{ departmentData }`          | `{ department }`           |
| `/api/departments/:id` | DELETE | Delete department          | -                             | `{ success: true }`        |

### Team Management Endpoints

| Endpoint                         | Method | Description                 | Request Body                  | Response                    |
|----------------------------------|--------|-----------------------------|-------------------------------|----------------------------|
| `/api/teams`                     | GET    | List all teams              | -                             | `[ teams ]`                |
| `/api/teams/:id`                 | GET    | Get team by ID              | -                             | `{ team }`                 |
| `/api/teams/:id/members`         | GET    | Get team members            | -                             | `[ users ]`                |
| `/api/teams`                     | POST   | Create new team             | `{ teamData }`                | `{ team }`                 |
| `/api/teams/:id`                 | PUT    | Update team                 | `{ teamData }`                | `{ team }`                 |
| `/api/teams/:id`                 | DELETE | Delete team                 | -                             | `{ success: true }`        |
| `/api/teams/:id/members/:userId` | POST   | Add user to team            | -                             | `{ success: true }`        |
| `/api/teams/:id/members/:userId` | DELETE | Remove user from team       | -                             | `{ success: true }`        |

### Project Management Endpoints

| Endpoint             | Method | Description              | Request Body                  | Response                    |
|----------------------|--------|--------------------------|-------------------------------|----------------------------|
| `/api/projects`      | GET    | List all projects        | -                             | `[ projects ]`             |
| `/api/projects/:id`  | GET    | Get project by ID        | -                             | `{ project }`              |
| `/api/projects`      | POST   | Create new project       | `{ projectData }`             | `{ project }`              |
| `/api/projects/:id`  | PUT    | Update project           | `{ projectData }`             | `{ project }`              |
| `/api/projects/:id`  | DELETE | Delete project           | -                             | `{ success: true }`        |

### Epic Management Endpoints

| Endpoint           | Method | Description              | Request Body                  | Response                    |
|--------------------|--------|--------------------------|-------------------------------|----------------------------|
| `/api/epics`       | GET    | List all epics           | -                             | `[ epics ]`                |
| `/api/epics/:id`   | GET    | Get epic by ID           | -                             | `{ epic }`                 |
| `/api/epics`       | POST   | Create new epic          | `{ epicData }`                | `{ epic }`                 |
| `/api/epics/:id`   | PUT    | Update epic              | `{ epicData }`                | `{ epic }`                 |
| `/api/epics/:id`   | DELETE | Delete epic              | -                             | `{ success: true }`        |

### Story Management Endpoints

| Endpoint            | Method | Description              | Request Body                  | Response                    |
|---------------------|--------|--------------------------|-------------------------------|----------------------------|
| `/api/stories`      | GET    | List all stories         | -                             | `[ stories ]`              |
| `/api/stories/:id`  | GET    | Get story by ID          | -                             | `{ story }`                |
| `/api/stories`      | POST   | Create new story         | `{ storyData }`               | `{ story }`                |
| `/api/stories/:id`  | PUT    | Update story             | `{ storyData }`               | `{ story }`                |
| `/api/stories/:id`  | DELETE | Delete story             | -                             | `{ success: true }`        |

### Task Management Endpoints

| Endpoint                    | Method | Description              | Request Body                  | Response                    |
|-----------------------------|--------|--------------------------|-------------------------------|----------------------------|
| `/api/tasks`                | GET    | List all tasks           | -                             | `[ tasks ]`                |
| `/api/tasks/:id`            | GET    | Get task by ID           | -                             | `{ task }`                 |
| `/api/tasks`                | POST   | Create new task          | `{ taskData }`                | `{ task }`                 |
| `/api/tasks/:id`            | PUT    | Update task              | `{ taskData }`                | `{ task }`                 |
| `/api/tasks/:id`            | DELETE | Delete task              | -                             | `{ success: true }`        |
| `/api/tasks/:id/comments`   | POST   | Add comment to task      | `{ text, parentCommentId? }` | `{ comment }`              |
| `/api/tasks/:id/attachments`| POST   | Add attachment to task   | `{ attachmentData }`         | `{ attachment }`           |
| `/api/tasks/:id/time-entries`| POST   | Add time entry to task   | `{ timeEntryData }`          | `{ timeEntry }`            |
| `/api/tasks/:id/status`     | PUT    | Update task status       | `{ status, comment? }`       | `{ task }`                 |
| `/api/tasks/:id/priority`   | PUT    | Update task priority     | `{ priority, comment? }`     | `{ task }`                 |
| `/api/tasks/:id/steps`      | PUT    | Update task checklist    | `{ steps }`                  | `{ task }`                 |
| `/api/tasks/:id/assign`     | POST   | Assign task to user      | `{ assignedToId, comment? }` | `{ task }`                 |
| `/api/tasks/:id/subtasks`   | POST   | Create a subtask         | `{ taskData }`                | `{ task }`                 |

### Comment Endpoints

| Endpoint             | Method | Description              | Request Body                  | Response                    |
|----------------------|--------|--------------------------|-------------------------------|----------------------------|
| `/api/comments`      | GET    | List all comments        | -                             | `[ comments ]`             |
| `/api/comments`      | POST   | Create new comment       | `{ commentData }`             | `{ comment }`              |
| `/api/comments/:id`  | PUT    | Update comment           | `{ commentData }`             | `{ comment }`              |
| `/api/comments/:id`  | DELETE | Delete comment           | -                             | `{ success: true }`        |

### Location Management Endpoints

| Endpoint              | Method | Description              | Request Body                  | Response                    |
|-----------------------|--------|--------------------------|-------------------------------|----------------------------|
| `/api/locations`      | GET    | List all locations       | -                             | `[ locations ]`            |
| `/api/locations/:id`  | GET    | Get location by ID       | -                             | `{ location }`             |
| `/api/locations`      | POST   | Create new location      | `{ locationData }`            | `{ location }`             |
| `/api/locations/:id`  | PUT    | Update location          | `{ locationData }`            | `{ location }`             |
| `/api/locations/:id`  | DELETE | Delete location          | -                             | `{ success: true }`        |

### Device Management Endpoints

| Endpoint                         | Method | Description                 | Request Body                  | Response                    |
|----------------------------------|--------|-----------------------------|-------------------------------|----------------------------|
| `/api/devices`                   | GET    | List all devices            | -                             | `[ devices ]`              |
| `/api/devices/:id`               | GET    | Get device by ID            | -                             | `{ device }`               |
| `/api/devices/serial/:serialNumber` | GET | Get device by serial number | -                             | `{ device }`               |
| `/api/devices`                   | POST   | Create new device           | `{ deviceData }`              | `{ device }`               |
| `/api/devices/:id`               | PUT    | Update device               | `{ deviceData }`              | `{ device }`               |
| `/api/devices/:id`               | DELETE | Delete device               | -                             | `{ success: true }`        |
| `/api/devices/:id/assign/:userId` | POST  | Assign device to user       | -                             | `{ success: true }`        |
| `/api/devices/:id/unassign`      | POST   | Unassign device from user   | -                             | `{ success: true }`        |

### Sprint Management Endpoints

| Endpoint                     | Method | Description                 | Request Body                  | Response                    |
|------------------------------|--------|-----------------------------|-------------------------------|----------------------------|
| `/api/sprints`               | GET    | List all sprints            | -                             | `[ sprints ]`              |
| `/api/sprints/:id`           | GET    | Get sprint by ID            | -                             | `{ sprint }`               |
| `/api/sprints`               | POST   | Create new sprint           | `{ sprintData }`              | `{ sprint }`               |
| `/api/sprints/:id`           | PUT    | Update sprint               | `{ sprintData }`              | `{ sprint }`               |
| `/api/sprints/:id`           | DELETE | Delete sprint               | -                             | `{ success: true }`        |
| `/api/sprints/:id/status`    | PUT    | Update sprint status        | `{ status }`                  | `{ sprint }`               |
| `/api/sprints/:id/retrospective` | PUT | Add sprint retrospective   | `{ retrospectiveData }`       | `{ sprint }`               |
| `/api/sprints/:id/backlog-items` | GET | Get sprint backlog items   | -                             | `[ backlogItems ]`         |
| `/api/sprints/:id/add-item/:itemId` | POST | Add item to sprint     | -                             | `{ success: true }`        |
| `/api/sprints/:id/remove-item/:itemId` | POST | Remove item from sprint | -                         | `{ success: true }`        |

### Backlog Management Endpoints

| Endpoint                          | Method | Description                 | Request Body                  | Response                    |
|-----------------------------------|--------|-----------------------------|-------------------------------|----------------------------|
| `/api/backlog-items`              | GET    | List all backlog items      | -                             | `[ backlogItems ]`         |
| `/api/backlog-items/:id`          | GET    | Get backlog item by ID      | -                             | `{ backlogItem }`          |
| `/api/backlog-items`              | POST   | Create new backlog item     | `{ backlogItemData }`         | `{ backlogItem }`          |
| `/api/backlog-items/:id`          | PUT    | Update backlog item         | `{ backlogItemData }`         | `{ backlogItem }`          |
| `/api/backlog-items/:id`          | DELETE | Delete backlog item         | -                             | `{ success: true }`        |
| `/api/backlog-items/:id/status`   | PUT    | Update item status          | `{ status }`                  | `{ backlogItem }`          |
| `/api/backlog-items/:id/priority` | PUT    | Update item priority        | `{ priority }`                | `{ backlogItem }`          |
| `/api/backlog-items/:id/assign`   | POST   | Assign item to user         | `{ assigneeId }`              | `{ backlogItem }`          |
| `/api/backlog-items/reorder`      | POST   | Reorder backlog items       | `{ itemIds, ranks }`          | `{ success: true }`        |
| `/api/projects/:id/backlog`       | GET    | Get project backlog items   | -                             | `[ backlogItems ]`         |

## UI Components

### Component Interaction and Data Flow

The UI components interact with the data model through a consistent pattern:

#### Data Loading Flow
1. **API Request** → User visits a page, triggering API requests via React Query
2. **Server Processing** → Express backend processes the request, accessing the database via Drizzle ORM
3. **Data Validation** → Both request and response data are validated using Zod schemas
4. **Component Rendering** → React components receive and display the validated data
5. **State Updates** → UI state is managed through React Query cache and local state hooks

#### Form Submission Flow
1. **Form Validation** → Client-side validation using Zod schemas
2. **API Mutation** → Data submitted via React Query mutations
3. **Server Validation** → Additional validation on the server side
4. **Database Operation** → Data stored in PostgreSQL via Drizzle ORM
5. **UI Feedback** → Success/error messages displayed to user
6. **Cache Invalidation** → Related data queries invalidated to refresh views

#### Cross-Component Communication
- **Project → Epic**: When viewing a project, Epics are loaded and displayed as child elements
- **Epic → Story**: When viewing an Epic, Stories are loaded and displayed as child elements
- **Story → Task**: When viewing a Story, Tasks are loaded and displayed as child elements
- **Sidebar Navigation**: Provides quick access to all levels of the hierarchy
- **Breadcrumb Navigation**: Shows the current position in the hierarchy and allows navigation upward

### Dashboard

The dashboard serves as the central hub for users to access key information about their projects. It features:

#### Project Overview Section
- Displays all active projects with progress indicators
- Key metrics for each project (completion percentage, days remaining, team utilization)
- Quick links to recent or favorite projects

#### Task Summary Area
- Shows tasks assigned to the current user
- Categorized by status (To Do, In Progress, Blocked, Done)
- Task priority indicators with clear visual hierarchy

#### Timeline Visualization
- Gantt chart showing project timelines and dependencies
- Highlighting upcoming deadlines and milestones
- Color-coded by project or priority

#### Activity Feed
- Recent activities across all projects
- Comment notifications and task updates
- @mentions and direct requests

#### Quick Access Tools
- Create new item buttons (project, epic, story, task)
- Search functionality with filters
- Shortcut links to frequently accessed pages

#### Performance Metrics
- Burndown/burnup charts
- Velocity tracking
- Sprint completion rates
- Resource allocation visualization

### Navigation Sidebar

The sidebar provides access to all main sections of the application:

#### Main Navigation
- **Dashboard**: Link to main dashboard
- **Projects**: List and manage all projects
- **Teams**: Team management and organization
- **Tasks**: Personal task management
- **Reports**: Analytics and reporting

#### Project Hierarchy Navigation
- **Projects**: Top-level project list
  - **Epics**: Subnavigation within projects
    - **Stories**: Subnavigation within epics
      - **Tasks**: Lowest level of work items

#### Administrative Tools (For Admin Users)
- **Company Settings**: Organization configuration
- **User Management**: User permissions and accounts
- **Department Management**: Organizational structure
- **Device Management**: Hardware and resource tracking

#### User Profile Section
- Profile picture and name
- Role indicator
- Quick access to profile settings
- Logout option

### Pages Overview

#### Project Pages
1. **Project Listing Page**
   - Sortable and filterable table of all projects
   - Status indicators and progress bars
   - Quick action buttons (edit, delete, view details)

2. **Project Detail Page**
   - Project header with title, description, and metadata
   - Progress indicators and timeline
   - Team member assignments
   - Epic listing with progress tracking
   - Activity feed specific to the project

3. **Project Creation/Edit Form**
   - Form fields for all project attributes
   - Team assignment dropdown
   - Date range selection for timeline
   - Budget allocation tools

#### Epic Management Pages
1. **Epic Listing Page**
   - Filterable list of epics within a project
   - Status and priority indicators
   - Progress tracking with visual indicators

2. **Epic Detail Page**
   - Epic information and description
   - Story breakdown and progress
   - Timeline visualization
   - Comments and activity feed

3. **Epic Creation/Edit Form**
   - Basic information fields
   - Relationship to parent project
   - Timeline planning tools

#### Story Management Pages
1. **Story Listing Page**
   - Sortable and filterable list of stories 
   - Assignee information and status tracking
   - Points/effort estimation display

2. **Story Detail Page**
   - Story information with acceptance criteria
   - Task breakdown checklist
   - Comments and activity tracking
   - Related stories and dependencies

3. **Story Creation/Edit Form**
   - Story attributes and description
   - Assignee selection
   - Epic relationship
   - Estimation tools

#### Task Management Pages
1. **Task Listing Page**
   - Personal task list or filtered by project/story
   - Due dates and priority indicators
   - Quick status change options

2. **Task Detail Page**
   - Task description and acceptance criteria
   - Time tracking tools
   - Documentation and attachments
   - Comments thread

3. **Task Creation/Edit Form**
   - Task details and description
   - Assignment options
   - Time estimation tools
   - Dependency selection

#### Team Management Pages
1. **Team Listing Page**
   - Organization-wide team structure
   - Team size and lead information
   - Department affiliations

2. **Team Detail Page**
   - Team member listing with roles
   - Projects assigned to team
   - Performance metrics
   - Resource allocation

3. **Team Management Forms**
   - Create/edit team information
   - Add/remove team members
   - Assign team leader

#### User Management Pages
1. **User Listing Page (Admin)**
   - Organization-wide user directory
   - Role and department information
   - Status indicators (active/inactive)

2. **User Profile Page**
   - Personal information and contact details
   - Role and permissions
   - Assigned tasks and projects
   - Activity history

3. **User Edit Form (Admin)**
   - Account information management
   - Role and permission assignment
   - Department and team affiliation

#### Device Management Pages
1. **Device Inventory Page**
   - List of all company devices
   - Status indicators (available, assigned, maintenance)
   - Quick filters by type, status, location

2. **Device Detail Page**
   - Technical specifications
   - Assignment history
   - Maintenance records
   - Warranty information

3. **Device Assignment Form**
   - User selection for device assignment
   - Purpose documentation
   - Duration setting

## Authentication & Authorization

### Authentication System
The application uses JWT (JSON Web Token) for authentication with the following features:

1. **Token-based Authentication**
   - JWT tokens issued at login
   - Tokens stored in localStorage
   - Automatic token refresh mechanism
   - Secure HTTP-only cookies for sensitive operations

2. **Login Process**
   - Username/password validation
   - Password hashing with bcrypt
   - Rate limiting for security
   - CAPTCHA for brute force protection

3. **Registration Process**
   - User information collection
   - Email verification workflow
   - Password strength requirements
   - Duplicate username/email prevention

### Authorization System
Role-based access control with the following roles:

1. **Admin**
   - Full access to all system features
   - User management capabilities
   - System configuration access
   - Can create/delete any content

2. **Manager**
   - Department and team management
   - Project creation and management
   - Budget allocation
   - Report generation

3. **Team Lead**
   - Epic and story management
   - Task assignment capabilities
   - Team performance tracking
   - Limited user management within team

4. **Developer**
   - View assigned projects and tasks
   - Create and update stories/tasks
   - Comment and collaborate
   - Track time and progress

5. **Tester**
   - View assigned test tasks
   - Create and update test results
   - Report bugs and issues
   - Track verification status

6. **Viewer**
   - Read-only access to projects and tasks
   - View reports and dashboards
   - No edit capabilities

Permission checks are implemented at both the API and UI levels to ensure consistent security:

1. **API-level Authorization**
   - JWT token validation middleware
   - Role verification for protected endpoints
   - Resource ownership validation
   - Detailed error responses for unauthorized access

2. **UI-level Authorization**
   - Conditional rendering of action buttons
   - Protected routes with role requirements
   - Context-aware navigation showing only accessible options
   - Helpful messaging for unavailable features

## Development Guide

### Setup Instructions

1. **Prerequisites**
   - Node.js 18+ and npm
   - AWS account with DynamoDB access (or local DynamoDB for development)
   - Git

2. **Installation Steps**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd project-management-system

   # Install dependencies
   npm install

   # Configure environment variables
   cp .env.example .env
   # Edit .env with your AWS credentials and application settings
   
   # Required environment variables:
   # AWS_REGION=us-east-1
   # AWS_ACCESS_KEY_ID=your-access-key
   # AWS_SECRET_ACCESS_KEY=your-secret-key
   # SESSION_SECRET=your-session-secret
   # JWT_SECRET=your-jwt-secret
   # JWT_EXPIRATION=24h

   # Start the development server
   npm run dev
   ```
   
3. **For detailed deployment instructions, refer to the [Deployment Guide](README_DEPLOYMENT.md)**

### Folder Structure

```
project-management-system/
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # Page layouts
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Page components
│   │   ├── routes/          # Route definitions
│   │   ├── types/           # TypeScript type definitions
│   │   ├── App.tsx          # Main application component
│   │   ├── index.css        # Global styles
│   │   └── main.tsx         # Application entry point
│   └── index.html           # HTML template
├── server/                  # Backend Express application
│   ├── auth.ts              # Authentication logic
│   ├── db.ts                # Database connection
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API route definitions
│   ├── storage.ts           # Data access layer
│   └── vite.ts              # Vite server setup
├── shared/                  # Shared between client and server
│   └── schema.ts            # Drizzle schema definitions
├── drizzle.config.ts        # Drizzle ORM configuration
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite build configuration
```

### Adding New Features

#### Adding a New Entity

1. **Define the schema**
   - Add the entity definition to `shared/schema.ts`
   - Define the table structure with proper relations
   - Create insert/select types

2. **Update the storage layer**
   - Add CRUD methods in `server/storage.ts`
   - Implement any necessary validation

3. **Create API endpoints**
   - Add corresponding routes in `server/routes.ts`
   - Implement authorization checks

4. **Build UI components**
   - Create list, detail, and form pages in `client/src/pages`
   - Add to the navigation sidebar
   - Implement React Query hooks for data fetching

#### Adding a New Role

1. **Update the schema**
   - Add the new role to the User schema in `shared/schema.ts`

2. **Configure authorization**
   - Update authorization middleware to recognize the new role
   - Define permissions for the role in `server/auth.ts`

3. **Update UI for role-specific content**
   - Modify navigation to show/hide elements based on role
   - Add conditional rendering for protected actions

## Best Practices

### Code Style and Conventions

1. **TypeScript**
   - Use explicit typing over `any`
   - Leverage interfaces for object shapes
   - Use type guards for runtime safety

2. **React Components**
   - Use functional components with hooks
   - Split large components into smaller, focused ones
   - Use props destructuring for clarity

3. **API Interactions**
   - Use React Query for data fetching
   - Implement proper error handling
   - Add loading states for all async operations

4. **Database Operations**
   - Use Drizzle query builder for type safety
   - Implement transactions for related operations
   - Add proper indexing for frequently queried columns

### Performance Considerations

1. **Frontend Optimization**
   - Implement code splitting for large pages
   - Lazy load components where appropriate
   - Use memoization for expensive calculations

2. **Backend Efficiency**
   - Optimize database queries with proper JOIN operations
   - Implement pagination for large data sets
   - Use caching where appropriate

3. **Security Best Practices**
   - Validate all inputs on both client and server
   - Implement proper CORS protection
   - Use parameterized queries to prevent SQL injection
   - Regularly update dependencies to prevent vulnerabilities

## Troubleshooting

### Common Issues

1. **Authentication Problems**
   - Check token expiration times
   - Verify JWT_SECRET in environment variables
   - Ensure cookies are properly configured for secure operations

2. **Database Connectivity**
   - Verify AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)
   - Check AWS permissions for DynamoDB access
   - Ensure proper network connectivity to AWS services

3. **API Errors**
   - Check server logs for detailed error messages
   - Verify endpoint URLs and request methods
   - Ensure request payloads match expected schemas

4. **Build and Deployment Issues**
   - Clear node_modules and reinstall dependencies
   - Verify TypeScript compilation settings
   - Check for environment-specific configuration problems

### Debugging Tools

1. **Frontend Debugging**
   - React Developer Tools browser extension
   - Network tab in browser DevTools
   - Console logging with structured data

2. **Backend Debugging**
   - Winston logger for structured server logs
   - Postman for API endpoint testing
   - AWS DynamoDB console for database inspection and queries
   - AWS CloudWatch for monitoring DynamoDB operations

3. **Performance Monitoring**
   - Lighthouse for frontend performance
   - Node.js profiling for backend bottlenecks
   - Database query analysis tools

## API Usage Examples

### Creating a New Project

#### Request
```http
POST /api/projects HTTP/1.1
Host: example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "E-Commerce Platform Redesign",
  "description": "Complete overhaul of the company's e-commerce platform with improved UX and mobile responsiveness",
  "status": "PLANNING",
  "priority": "HIGH",
  "companyId": "1ef6b6f1-34b3-4ab5-ba94-8804f90903bf",
  "teamId": "a2b4c6d8-e0f2-11eb-8529-0242ac130003",
  "startDate": "2025-05-01T00:00:00.000Z",
  "endDate": "2025-10-31T00:00:00.000Z",
  "budget": 150000,
  "managerId": "fd69920b-a214-477b-b7ec-80a97053c20e"
}
```

#### Response
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "7ec54e1a-2bd3-41a1-a495-b59d7b15444f",
  "name": "E-Commerce Platform Redesign",
  "description": "Complete overhaul of the company's e-commerce platform with improved UX and mobile responsiveness",
  "status": "PLANNING",
  "priority": "HIGH",
  "companyId": "1ef6b6f1-34b3-4ab5-ba94-8804f90903bf",
  "teamId": "a2b4c6d8-e0f2-11eb-8529-0242ac130003",
  "startDate": "2025-05-01T00:00:00.000Z",
  "endDate": "2025-10-31T00:00:00.000Z",
  "budget": 150000,
  "managerId": "fd69920b-a214-477b-b7ec-80a97053c20e",
  "progress": {
    "percentage": 0,
    "lastUpdated": "2025-04-17T09:30:42.123Z"
  },
  "createdAt": "2025-04-17T09:30:42.123Z",
  "updatedAt": "2025-04-17T09:30:42.123Z"
}
```

### Creating an Epic within a Project

#### Request
```http
POST /api/epics HTTP/1.1
Host: example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "User Authentication System",
  "description": "Implement secure user authentication with social login options",
  "status": "BACKLOG",
  "priority": "HIGH",
  "projectId": "7ec54e1a-2bd3-41a1-a495-b59d7b15444f",
  "startDate": "2025-05-15T00:00:00.000Z",
  "endDate": "2025-06-30T00:00:00.000Z"
}
```

#### Response
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "ce919fdd-26a6-4c1d-b28c-1233e5a5a530",
  "name": "User Authentication System",
  "description": "Implement secure user authentication with social login options",
  "status": "BACKLOG",
  "priority": "HIGH",
  "projectId": "7ec54e1a-2bd3-41a1-a495-b59d7b15444f",
  "startDate": "2025-05-15T00:00:00.000Z",
  "endDate": "2025-06-30T00:00:00.000Z",
  "progress": {
    "percentage": 0,
    "lastUpdated": "2025-04-17T09:45:23.456Z"
  },
  "createdAt": "2025-04-17T09:45:23.456Z",
  "updatedAt": "2025-04-17T09:45:23.456Z"
}
```

### Creating a Story within an Epic

#### Request
```http
POST /api/stories HTTP/1.1
Host: example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Implement OAuth 2.0 with Google",
  "description": "Add Google login option using OAuth 2.0 protocol",
  "status": "BACKLOG",
  "priority": "MEDIUM",
  "epicId": "ce919fdd-26a6-4c1d-b28c-1233e5a5a530",
  "assigneeId": "3f7e9d1c-b2a5-4e6f-8g3h-1i2j3k4l5m6n",
  "reporterId": "fd69920b-a214-477b-b7ec-80a97053c20e",
  "storyPoints": "5",
  "startDate": "2025-05-20T00:00:00.000Z",
  "dueDate": "2025-06-10T00:00:00.000Z"
}
```

#### Response
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "9b8a7c6d-5e4f-3g2h-1i0j-9k8l7m6n5o4p",
  "name": "Implement OAuth 2.0 with Google",
  "description": "Add Google login option using OAuth 2.0 protocol",
  "status": "BACKLOG",
  "priority": "MEDIUM",
  "epicId": "ce919fdd-26a6-4c1d-b28c-1233e5a5a530",
  "assigneeId": "3f7e9d1c-b2a5-4e6f-8g3h-1i2j3k4l5m6n",
  "reporterId": "fd69920b-a214-477b-b7ec-80a97053c20e",
  "storyPoints": "5",
  "startDate": "2025-05-20T00:00:00.000Z",
  "dueDate": "2025-06-10T00:00:00.000Z",
  "createdAt": "2025-04-17T10:15:42.789Z",
  "updatedAt": "2025-04-17T10:15:42.789Z"
}
```

### Creating a Task within a Story

#### Request
```http
POST /api/tasks HTTP/1.1
Host: example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Configure Google API credentials",
  "description": "Create and configure Google API project and obtain OAuth credentials",
  "status": "TODO",
  "priority": "HIGH",
  "storyId": "9b8a7c6d-5e4f-3g2h-1i0j-9k8l7m6n5o4p",
  "assigneeId": "3f7e9d1c-b2a5-4e6f-8g3h-1i2j3k4l5m6n",
  "estimatedHours": "3",
  "startDate": "2025-05-20T00:00:00.000Z",
  "dueDate": "2025-05-21T00:00:00.000Z"
}
```

#### Response
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "name": "Configure Google API credentials",
  "description": "Create and configure Google API project and obtain OAuth credentials",
  "status": "TODO",
  "priority": "HIGH",
  "storyId": "9b8a7c6d-5e4f-3g2h-1i0j-9k8l7m6n5o4p",
  "assigneeId": "3f7e9d1c-b2a5-4e6f-8g3h-1i2j3k4l5m6n",
  "estimatedHours": "3",
  "actualHours": null,
  "startDate": "2025-05-20T00:00:00.000Z",
  "dueDate": "2025-05-21T00:00:00.000Z",
  "createdAt": "2025-04-17T10:30:15.987Z",
  "updatedAt": "2025-04-17T10:30:15.987Z"
}
```