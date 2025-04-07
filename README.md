# Enterprise Project Management System

A comprehensive enterprise management platform designed to streamline project, task, and organizational workflows with advanced UI interactions and robust error handling.

## Features

- **Organizational Management**: Companies, departments, and teams management
- **User Management**: User creation, role assignment, and permissions
- **Project Management**: Create, track, and manage projects with detailed metrics
- **Agile Framework**: Support for epics, stories, and tasks
- **Task Management**: Kanban board for task tracking with drag-and-drop functionality
- **Batch Operations**: Select multiple items to perform batch actions (delete, archive, status changes)
- **Progress Tracking**: Visual progress bars for projects, epics, and stories
- **Responsive Design**: Optimized for mobile, tablet, and desktop views
- **Real-time Notifications**: WebSocket-based notification system
- **Advanced Filtering**: Filter and search capabilities across all views
- **Role-based Access Control**: Fine-grained permissions based on user roles

## Technology Stack

### Frontend
- React with TypeScript
- TanStack React Query for data fetching
- Wouter for routing
- Tailwind CSS for styling
- Shadcn UI components
- Framer Motion for animations
- Recharts for data visualization

### Backend
- Express.js with TypeScript
- JWT Authentication
- PostgreSQL database
- Drizzle ORM for database interactions
- Zod for validation
- WebSockets for real-time updates

## API Documentation

### Authentication
- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration

### Companies
- `GET /api/companies`: Get all companies
- `GET /api/companies/:id`: Get company by ID
- `POST /api/companies`: Create a new company (ADMIN)
- `PUT /api/companies/:id`: Update a company (ADMIN)
- `DELETE /api/companies/:id`: Delete a company (ADMIN)

### Departments
- `GET /api/departments`: Get all departments
- `GET /api/departments/:id`: Get department by ID
- `POST /api/departments`: Create a new department (ADMIN, MANAGER)
- `PUT /api/departments/:id`: Update a department (ADMIN, MANAGER)
- `DELETE /api/departments/:id`: Delete a department (ADMIN, MANAGER)

### Groups
- `GET /api/groups`: Get all groups
- `GET /api/groups/:id`: Get group by ID
- `POST /api/groups`: Create a new group (ADMIN, MANAGER)
- `PUT /api/groups/:id`: Update a group (ADMIN, MANAGER)
- `DELETE /api/groups/:id`: Delete a group (ADMIN, MANAGER)

### Users
- `GET /api/users`: Get all users
- `GET /api/users/:id`: Get user by ID
- `POST /api/users`: Create a new user (ADMIN)
- `PUT /api/users/:id`: Update a user
- `DELETE /api/users/:id`: Delete a user (ADMIN)
### Teams
- `GET /api/teams`: Get all teams
- `GET /api/teams/:id`: Get team by ID
- `GET /api/teams/:id/members`: Get team members
- `POST /api/teams`: Create a new team (ADMIN, MANAGER)
- `PUT /api/teams/:id`: Update a team (ADMIN, MANAGER, TEAM_LEAD)
- `DELETE /api/teams/:id`: Delete a team (ADMIN, MANAGER)
- `POST /api/teams/:id/members/:userId`: Add user to team (ADMIN, MANAGER, TEAM_LEAD)
- `DELETE /api/teams/:id/members/:userId`: Remove user from team (ADMIN, MANAGER, TEAM_LEAD)

### Projects
- `GET /api/projects`: Get all projects
- `GET /api/projects/:id`: Get project by ID
- `POST /api/projects`: Create a new project (ADMIN, MANAGER)
- `PUT /api/projects/:id`: Update a project (ADMIN, MANAGER, TEAM_LEAD)
- `DELETE /api/projects/:id`: Delete a project (ADMIN, MANAGER)

### Epics
- `GET /api/epics`: Get all epics
- `GET /api/epics/:id`: Get epic by ID
- `POST /api/epics`: Create a new epic (ADMIN, MANAGER, TEAM_LEAD)
- `PUT /api/epics/:id`: Update an epic (ADMIN, MANAGER, TEAM_LEAD)
- `DELETE /api/epics/:id`: Delete an epic (ADMIN, MANAGER, TEAM_LEAD)

### Stories
- `GET /api/stories`: Get all stories
- `GET /api/stories/:id`: Get story by ID
- `POST /api/stories`: Create a new story (ADMIN, MANAGER, TEAM_LEAD, DEVELOPER)
- `PUT /api/stories/:id`: Update a story (ADMIN, MANAGER, TEAM_LEAD, DEVELOPER)
- `DELETE /api/stories/:id`: Delete a story (ADMIN, MANAGER, TEAM_LEAD)

### Tasks
- `GET /api/tasks`: Get all tasks
- `GET /api/tasks/:id`: Get task by ID
- `POST /api/tasks`: Create a new task (ADMIN, MANAGER, TEAM_LEAD, DEVELOPER)
- `PUT /api/tasks/:id`: Update a task
- `DELETE /api/tasks/:id`: Delete a task (ADMIN, MANAGER, TEAM_LEAD)

### Comments
- `GET /api/comments`: Get all comments
- `POST /api/comments`: Create a new comment
- `PUT /api/comments/:id`: Update a comment
- `DELETE /api/comments/:id`: Delete a comment

### Attachments
- `GET /api/attachments`: Get all attachments
- `POST /api/attachments`: Upload a new attachment
- `DELETE /api/attachments/:id`: Delete an attachment

### Notifications
- `GET /api/notifications`: Get all notifications
- `POST /api/notifications/:id/read`: Mark notification as read
- `DELETE /api/notifications/:id`: Delete a notification

## User Roles and Permissions

| Role       | Description                                      | Permissions                                                    |
|------------|--------------------------------------------------|----------------------------------------------------------------|
| ADMIN      | System administrator with full access            | Full access to all resources and operations                    |
| MANAGER    | Project and team manager                         | Manage projects, teams, and departments                        |
| TEAM_LEAD  | Team leader responsible for project execution    | Manage tasks, stories, and epics within assigned projects      |
| DEVELOPER  | Team member working on tasks                     | Create and update tasks and stories, comment on items          |
| VIEWER     | Read-only user                                   | View all resources without modification rights                 |

## Data Models

The system includes the following core data models:

- **Company**: Organization entity
- **Department**: Organizational division
- **Group**: Functional group within company
- **User**: System user with role-based permissions
- **Team**: Working group of users
- **Project**: Main work container with metrics
- **Epic**: Large initiative within a project
- **Story**: Functional requirement or feature
- **Task**: Actionable work item
- **Comment**: Discussion on work items
- **Attachment**: Files attached to work items
- **Notification**: System notifications

## Frontend Components

The application features a responsive UI with:

- Modern card-based design
- Interactive Kanban boards
- Progress tracking visualizations
- Batch selection and operations
- Advanced filtering and search
- Role-specific views and actions

## Screenshots

### Project Dashboard
![Project Dashboard](./attached_assets/image_1744031643438.png)

### Task Management
![Task Management](./attached_assets/image_1744037633593.png)

## Installation and Setup

1. Clone the repository and navigate to the project directory
2. Install dependencies with `npm install`
3. Set up the PostgreSQL database
4. Configure environment variables in a `.env` file
5. Run the development server with `npm run dev`
6. Access the application at `http://localhost:5000`

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
