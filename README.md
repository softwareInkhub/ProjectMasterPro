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
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: JWT tokens for stateless authentication
- **Data Validation**: Zod schemas for end-to-end type safety

## Data Model

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
  name: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  storyId: string;
  assigneeId: string | null; // Reference to User
  estimatedHours: string | null;
  actualHours: string | null;
  startDate: Date | null;
  dueDate: Date | null;
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

### Entity Relationships

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

| Endpoint          | Method | Description              | Request Body                  | Response                    |
|-------------------|--------|--------------------------|-------------------------------|----------------------------|
| `/api/tasks`      | GET    | List all tasks           | -                             | `[ tasks ]`                |
| `/api/tasks/:id`  | GET    | Get task by ID           | -                             | `{ task }`                 |
| `/api/tasks`      | POST   | Create new task          | `{ taskData }`                | `{ task }`                 |
| `/api/tasks/:id`  | PUT    | Update task              | `{ taskData }`                | `{ task }`                 |
| `/api/tasks/:id`  | DELETE | Delete task              | -                             | `{ success: true }`        |

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

## UI Components

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
   - PostgreSQL 14+
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
   # Edit .env with your database credentials and settings

   # Initialize the database
   npm run db:push

   # Start the development server
   npm run dev
   ```

3. **Environment Variables**
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/project_db
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRY=24h
   ```

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
   - Verify DATABASE_URL in environment variables
   - Check PostgreSQL service is running
   - Ensure database user has proper permissions

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
   - Database inspection with pgAdmin

3. **Performance Monitoring**
   - Lighthouse for frontend performance
   - Node.js profiling for backend bottlenecks
   - Database query analysis tools