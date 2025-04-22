# Task Hierarchy Implementation

## Overview

The project management system implements a recursive parent-child relationship for tasks, allowing for infinite nesting of subtasks. This document describes the implementation details, data structure, and API endpoints available for working with hierarchical tasks.

## Data Structure

Tasks are stored with a parent-child relationship using a `parentTaskId` field:

```typescript
// Task Schema (simplified)
{
  id: string;               // Unique identifier for the task
  name: string;             // Task name/title
  description: string;      // Task description
  status: TaskStatus;       // Current status (TODO, IN_PROGRESS, etc.)
  priority: TaskPriority;   // Priority level
  storyId: string;          // Associated story ID
  assigneeId: string;       // User ID of assignee
  parentTaskId: string;     // ID of parent task (null for top-level tasks)
  estimatedHours: string;   // Estimated hours to complete
  actualHours: string;      // Actual hours spent on the task
  // ... other fields omitted for brevity
}
```

## Task Hierarchy Model

In this model:

1. A task can have 0 or 1 parent tasks (via `parentTaskId`)
2. A task can have 0 to many child tasks
3. There is no hard limit on nesting depth
4. Tasks can be filtered by their parent task ID to retrieve direct children

## API Endpoints

### Get Tasks

**Endpoint**: `GET /api/tasks`

**Query Parameters**:
- `storyId` (optional): Filter tasks by associated story
- `assigneeId` (optional): Filter tasks by assignee 
- `parentTaskId` (optional): Filter tasks by parent task

**Response Example**:
```json
[
  {
    "id": "task-123",
    "name": "Implement login form",
    "description": "Create the login form component with validation",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "storyId": "story-456",
    "assigneeId": "user-789",
    "parentTaskId": null,
    "createdAt": "2023-04-15T09:00:00Z",
    "updatedAt": "2023-04-15T10:30:00Z"
  },
  {
    "id": "task-124",
    "name": "Style login form",
    "description": "Apply CSS styles to the login form",
    "status": "TODO",
    "priority": "MEDIUM",
    "storyId": "story-456",
    "assigneeId": "user-790",
    "parentTaskId": "task-123",
    "createdAt": "2023-04-15T09:05:00Z",
    "updatedAt": "2023-04-15T09:05:00Z"
  }
]
```

### Get Task

**Endpoint**: `GET /api/tasks/:id`

**Response Example**:
```json
{
  "id": "task-123",
  "name": "Implement login form",
  "description": "Create the login form component with validation",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "storyId": "story-456",
  "assigneeId": "user-789",
  "parentTaskId": null,
  "createdAt": "2023-04-15T09:00:00Z",
  "updatedAt": "2023-04-15T10:30:00Z"
}
```

### Get Task Hierarchy

**Endpoint**: `GET /api/tasks/:id/hierarchy`

Retrieves a task with all its subtasks recursively nested, along with calculated metrics.

**Response Example**:
```json
{
  "id": "task-123",
  "name": "Implement login form",
  "description": "Create the login form component with validation",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "storyId": "story-456",
  "assigneeId": "user-789",
  "parentTaskId": null,
  "createdAt": "2023-04-15T09:00:00Z",
  "updatedAt": "2023-04-15T10:30:00Z",
  "subtasks": [
    {
      "id": "task-124",
      "name": "Style login form",
      "description": "Apply CSS styles to the login form",
      "status": "TODO",
      "priority": "MEDIUM",
      "storyId": "story-456",
      "assigneeId": "user-790",
      "parentTaskId": "task-123",
      "createdAt": "2023-04-15T09:05:00Z",
      "updatedAt": "2023-04-15T09:05:00Z",
      "subtasks": [],
      "level": 1,
      "path": ["task-123", "task-124"]
    },
    {
      "id": "task-125",
      "name": "Add validation",
      "description": "Implement form validation logic",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "storyId": "story-456",
      "assigneeId": "user-789",
      "parentTaskId": "task-123",
      "createdAt": "2023-04-15T09:10:00Z",
      "updatedAt": "2023-04-15T11:15:00Z",
      "subtasks": [
        {
          "id": "task-126",
          "name": "Email validation",
          "description": "Implement email format validation",
          "status": "DONE",
          "priority": "MEDIUM",
          "storyId": "story-456",
          "assigneeId": "user-789",
          "parentTaskId": "task-125",
          "createdAt": "2023-04-15T09:15:00Z",
          "updatedAt": "2023-04-15T13:20:00Z",
          "subtasks": [],
          "level": 2,
          "path": ["task-123", "task-125", "task-126"]
        }
      ],
      "level": 1,
      "path": ["task-123", "task-125"]
    }
  ],
  "level": 0,
  "path": ["task-123"],
  "progress": 50,
  "effectiveStatus": "IN_PROGRESS",
  "totalSubtasks": 3,
  "maxDepth": 2
}
```

### Create Task

**Endpoint**: `POST /api/tasks`

**Request Body Example**:
```json
{
  "name": "Implement validation logic",
  "description": "Write the form validation logic using Zod",
  "status": "TODO",
  "priority": "HIGH",
  "storyId": "story-456",
  "assigneeId": "user-789",
  "parentTaskId": "task-123",
  "estimatedHours": "3",
  "dueDate": "2023-04-20T23:59:59Z"
}
```

### Update Task

**Endpoint**: `PUT /api/tasks/:id`

**Request Body Example**:
```json
{
  "status": "IN_PROGRESS",
  "actualHours": "1.5",
  "description": "Updated description with more details"
}
```

### Delete Task

**Endpoint**: `DELETE /api/tasks/:id`

Deletes a task and recursively deletes all its subtasks.

## Implementation Details

### Task Utility Functions

The system includes utility functions to work with the task hierarchy:

#### `getTaskWithSubtasks`

Recursively fetches a task with all its subtasks.

```typescript
async function getTaskWithSubtasks(
  taskId: string,
  parentPath: string[] = [],
  level: number = 0
): Promise<TaskWithSubtasks | undefined>
```

#### `deleteTaskRecursive`

Recursively deletes a task and all its subtasks.

```typescript
async function deleteTaskRecursive(taskId: string): Promise<boolean>
```

#### `calculateTaskProgress`

Calculates the progress of a task based on its subtasks.

```typescript
function calculateTaskProgress(task: TaskWithSubtasks): number
```

#### `calculateTaskStatus`

Determines the effective status of a task based on its subtasks.

```typescript
function calculateTaskStatus(task: TaskWithSubtasks): string
```

## Status Aggregation Logic

The system uses the following rules to aggregate the status of parent tasks:

1. If any subtask is `BLOCKED`, the parent task is `BLOCKED`
2. If all subtasks are `DONE`, the parent task is `DONE`
3. If any subtask is `IN_REVIEW` and the rest are `DONE`, the parent task is `IN_REVIEW`
4. If any subtask is `IN_PROGRESS`, the parent task is `IN_PROGRESS`
5. Otherwise, the parent task retains its own status

## Progress Calculation

Task progress is calculated as follows:

1. For tasks with no subtasks:
   - `DONE`: 100%
   - `IN_REVIEW`: 75%
   - `IN_PROGRESS`: 50%
   - `TODO`: 0%
   - `BLOCKED`: 25%

2. For tasks with subtasks:
   - Average of all subtask progress percentages

## Best Practices

1. **Task Creation**: When creating subtasks, always set the `parentTaskId` to the parent task's ID
2. **Task Deletion**: Always use the recursive deletion endpoint to ensure all subtasks are deleted
3. **Task Hierarchy**: For performance reasons, limit task nesting to 3-5 levels deep
4. **Task Updates**: Consider using WebSockets to keep the UI in sync with task hierarchy changes
5. **Progress Tracking**: Use the calculated `progress` field from the hierarchy endpoint for accurate progress reporting

## Implementation Scenarios

### Task Management Dashboard

The task hierarchy can be effectively visualized in a dashboard using a tree-like structure or nested cards:

```jsx
function TaskHierarchyView({ taskId }) {
  const { data: taskHierarchy, isLoading } = useQuery(
    ['tasks', taskId, 'hierarchy'],
    () => fetch(`/api/tasks/${taskId}/hierarchy`).then(res => res.json())
  );

  if (isLoading) return <Spinner />;
  
  return (
    <div className="task-hierarchy">
      <TaskCard 
        task={taskHierarchy} 
        progress={taskHierarchy.progress} 
        status={taskHierarchy.effectiveStatus} 
      />
      
      {taskHierarchy.subtasks.length > 0 && (
        <div className="subtasks" style={{ marginLeft: '2rem' }}>
          {taskHierarchy.subtasks.map(subtask => (
            <TaskHierarchyView key={subtask.id} taskId={subtask.id} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Task Creation with Parent Reference

When creating child tasks, reference the parent task:

```jsx
function CreateSubtaskForm({ parentTaskId, storyId }) {
  const { register, handleSubmit } = useForm();
  const queryClient = useQueryClient();

  const createTask = async (data) => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        parentTaskId,
        storyId
      })
    });
    
    if (response.ok) {
      // Invalidate the parent task hierarchy to reflect the new subtask
      queryClient.invalidateQueries(['tasks', parentTaskId, 'hierarchy']);
      // Also invalidate the tasks list for the story
      queryClient.invalidateQueries(['tasks', { storyId }]);
    }
  };

  return (
    <form onSubmit={handleSubmit(createTask)}>
      <h3>Add Subtask</h3>
      <input {...register('name')} placeholder="Task name" />
      <textarea {...register('description')} placeholder="Description" />
      <select {...register('status')}>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
      </select>
      <button type="submit">Create Subtask</button>
    </form>
  );
}
```

### Recursive Task Deletion

Implement safe deletion that handles the task hierarchy:

```jsx
function DeleteTaskButton({ taskId }) {
  const queryClient = useQueryClient();
  const task = queryClient.getQueryData(['tasks', taskId]);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const deleteTask = async () => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      // After successful deletion, invalidate the parent task's hierarchy view
      if (task?.parentTaskId) {
        queryClient.invalidateQueries(['tasks', task.parentTaskId, 'hierarchy']);
      }
      
      // Also invalidate the tasks list for this story
      queryClient.invalidateQueries(['tasks', { storyId: task?.storyId }]);
      
      setIsConfirmOpen(false);
    }
  };
  
  return (
    <>
      <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
        Delete Task
      </Button>
      
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={deleteTask}
        title="Delete Task and Subtasks"
        description="This will permanently delete this task and all its subtasks. This action cannot be undone."
      />
    </>
  );
}