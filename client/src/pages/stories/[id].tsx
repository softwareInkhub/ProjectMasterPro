import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  BookOpenIcon,
  CheckSquareIcon,
  ClockIcon,
  MessageSquareIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  ClipboardListIcon,
  BriefcaseIcon,
  AlignLeftIcon,
  Hash
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StoryDetailPage() {
  const [, params] = useRoute("/stories/:id");
  const [, setLocation] = useLocation();
  const storyId = params?.id;
  
  // State for dialog modals
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  // Story data - this would come from an API call in the real application
  const [story, setStory] = useState({
    id: 101,
    name: "User Registration",
    description: "Implement user registration with email confirmation. The registration form should include fields for username, email, password, and password confirmation. After registration, an email with a verification link should be sent to the user.",
    status: "DONE",
    priority: "HIGH",
    epicId: 1,
    epicName: "User Authentication System",
    projectId: 1,
    projectName: "Website Redesign",
    storyPoints: "8",
    assignee: { id: 5, name: "Alice Chen", avatar: "AC" },
    reporter: { id: 8, name: "Bob Jackson", avatar: "BJ" },
    startDate: "2023-09-18",
    dueDate: "2023-09-30",
    createdAt: "2023-09-15",
    updatedAt: "2023-09-30",
    taskCount: 5,
    completedTasks: 5,
    comments: [
      { 
        id: 1, 
        content: "Added validation requirements for the password field.", 
        createdAt: "2023-09-20",
        user: { id: 5, name: "Alice Chen", avatar: "AC" }
      },
      { 
        id: 2, 
        content: "Email confirmation template is ready for review.", 
        createdAt: "2023-09-25",
        user: { id: 8, name: "Bob Jackson", avatar: "BJ" }
      }
    ]
  });
  
  // Sample tasks data - this would come from an API in the real application
  const [tasks, setTasks] = useState([
    {
      id: 1001,
      name: "Create registration form UI",
      description: "Design and implement the registration form with all required fields",
      status: "DONE",
      priority: "HIGH",
      assignee: { id: 5, name: "Alice Chen", avatar: "AC" },
      estimatedHours: "4",
      actualHours: "5",
      startDate: "2023-09-18",
      dueDate: "2023-09-20",
      createdAt: "2023-09-15",
      updatedAt: "2023-09-20"
    },
    {
      id: 1002,
      name: "Implement client-side validation",
      description: "Add validation for all form fields with appropriate error messages",
      status: "DONE",
      priority: "MEDIUM",
      assignee: { id: 5, name: "Alice Chen", avatar: "AC" },
      estimatedHours: "3",
      actualHours: "3",
      startDate: "2023-09-20",
      dueDate: "2023-09-22",
      createdAt: "2023-09-15",
      updatedAt: "2023-09-22"
    },
    {
      id: 1003,
      name: "Implement server-side validation",
      description: "Create server-side validation for user registration data",
      status: "DONE",
      priority: "HIGH",
      assignee: { id: 8, name: "Bob Jackson", avatar: "BJ" },
      estimatedHours: "4",
      actualHours: "5",
      startDate: "2023-09-22",
      dueDate: "2023-09-24",
      createdAt: "2023-09-15",
      updatedAt: "2023-09-24"
    },
    {
      id: 1004,
      name: "Create email verification template",
      description: "Design HTML email template for verification emails",
      status: "DONE",
      priority: "LOW",
      assignee: { id: 5, name: "Alice Chen", avatar: "AC" },
      estimatedHours: "2",
      actualHours: "2",
      startDate: "2023-09-24",
      dueDate: "2023-09-26",
      createdAt: "2023-09-15",
      updatedAt: "2023-09-26"
    },
    {
      id: 1005,
      name: "Implement email sending functionality",
      description: "Add email service integration to send verification emails",
      status: "DONE",
      priority: "MEDIUM",
      assignee: { id: 8, name: "Bob Jackson", avatar: "BJ" },
      estimatedHours: "4",
      actualHours: "5",
      startDate: "2023-09-26",
      dueDate: "2023-09-30",
      createdAt: "2023-09-15",
      updatedAt: "2023-09-30"
    }
  ]);
  
  // Edit story form state
  const [editStory, setEditStory] = useState({
    name: "",
    description: "",
    status: "",
    priority: "",
    epicId: "",
    storyPoints: "",
    assigneeId: "",
    reporterId: "",
    startDate: "",
    dueDate: ""
  });
  
  // New task form state
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: "",
    estimatedHours: "",
    startDate: "",
    dueDate: ""
  });
  
  // Edit task form state
  const [editTask, setEditTask] = useState({
    id: 0,
    name: "",
    description: "",
    status: "",
    priority: "",
    assigneeId: "",
    estimatedHours: "",
    actualHours: "",
    startDate: "",
    dueDate: ""
  });
  
  // Load story data when component mounts or storyId changes
  useEffect(() => {
    // In a real application, this would be an API call
    // For now, we're using the static data above
    if (storyId) {
      // Setup edit form with current story data
      setEditStory({
        name: story.name,
        description: story.description,
        status: story.status,
        priority: story.priority,
        epicId: story.epicId.toString(),
        storyPoints: story.storyPoints,
        assigneeId: story.assignee ? story.assignee.id.toString() : "",
        reporterId: story.reporter ? story.reporter.id.toString() : "",
        startDate: story.startDate,
        dueDate: story.dueDate
      });
    }
  }, [storyId, story]);
  
  // Format date string to more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Helper to get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case "TODO": return "bg-gray-100 text-gray-800";
      case "BACKLOG": return "bg-gray-100 text-gray-800";
      case "READY": return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "IN_REVIEW": return "bg-purple-100 text-purple-800";
      case "DONE": return "bg-green-100 text-green-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "BLOCKED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Helper to get priority badge color
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "LOW": return "bg-green-100 text-green-800";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "HIGH": return "bg-orange-100 text-orange-800";
      case "CRITICAL": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get random color for avatar background
  const getAvatarColor = (name: string) => {
    if (!name) return "bg-gray-400";
    
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-red-500", "bg-purple-500", "bg-pink-500", 
      "bg-indigo-500", "bg-teal-500"
    ];
    
    // Simple hash function to get consistent color for a name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  // Handle editing the story
  const handleEditStory = () => {
    // API call would go here
    console.log("Updating story:", editStory);
    
    // Update local state for demo purposes
    setStory({
      ...story,
      name: editStory.name,
      description: editStory.description,
      status: editStory.status,
      priority: editStory.priority,
      epicId: parseInt(editStory.epicId),
      storyPoints: editStory.storyPoints,
      assignee: editStory.assigneeId ? { id: parseInt(editStory.assigneeId), name: "Updated Assignee", avatar: "UA" } : null,
      reporter: editStory.reporterId ? { id: parseInt(editStory.reporterId), name: "Updated Reporter", avatar: "UR" } : null,
      startDate: editStory.startDate,
      dueDate: editStory.dueDate,
      updatedAt: new Date().toISOString().substring(0, 10)
    });
    
    setIsEditDialogOpen(false);
  };
  
  // Handle deleting the story
  const handleDeleteStory = () => {
    // API call would go here
    console.log("Deleting story:", storyId);
    setIsConfirmDeleteOpen(false);
    // Navigate back to stories list
    setLocation("/stories");
  };
  
  // Handle creating a new task
  const handleAddTask = () => {
    // API call would go here
    console.log("Creating new task:", newTask);
    
    // Update local state for demo purposes
    const newTaskObject = {
      id: Math.max(...tasks.map(t => t.id)) + 1,
      name: newTask.name,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      assignee: newTask.assigneeId && newTask.assigneeId !== "unassigned" ? { id: parseInt(newTask.assigneeId), name: "New Assignee", avatar: "NA" } : null,
      estimatedHours: newTask.estimatedHours,
      actualHours: "0",
      startDate: newTask.startDate,
      dueDate: newTask.dueDate,
      createdAt: new Date().toISOString().substring(0, 10),
      updatedAt: new Date().toISOString().substring(0, 10)
    };
    
    setTasks([...tasks, newTaskObject]);
    
    // Update story stats
    setStory({
      ...story,
      taskCount: story.taskCount + 1,
      updatedAt: new Date().toISOString().substring(0, 10)
    });
    
    setIsAddTaskDialogOpen(false);
    
    // Reset form
    setNewTask({
      name: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: "",
      estimatedHours: "",
      startDate: "",
      dueDate: ""
    });
  };
  
  // Initialize edit form when a task is selected for editing
  const openEditTaskDialog = (task: any) => {
    setSelectedTask(task);
    setEditTask({
      id: task.id,
      name: task.name,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assignee ? task.assignee.id.toString() : "",
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      startDate: task.startDate,
      dueDate: task.dueDate
    });
    setIsEditTaskDialogOpen(true);
  };
  
  // Handle editing a task
  const handleEditTask = () => {
    // API call would go here
    console.log("Updating task:", editTask);
    
    // Track if status changed to/from DONE
    const wasCompleted = selectedTask.status === "DONE";
    const isNowCompleted = editTask.status === "DONE";
    let completedDelta = 0;
    
    // Update the completed count based on status changes
    if (!wasCompleted && isNowCompleted) {
      completedDelta = 1;
    } else if (wasCompleted && !isNowCompleted) {
      completedDelta = -1;
    }
    
    // Update local state for demo purposes
    const updatedTasks = tasks.map(task => 
      task.id === editTask.id 
        ? {
            ...task,
            name: editTask.name,
            description: editTask.description,
            status: editTask.status,
            priority: editTask.priority,
            assignee: editTask.assigneeId && editTask.assigneeId !== "unassigned" ? 
              { id: parseInt(editTask.assigneeId), name: "Updated Assignee", avatar: "UA" } : 
              null,
            estimatedHours: editTask.estimatedHours,
            actualHours: editTask.actualHours,
            startDate: editTask.startDate,
            dueDate: editTask.dueDate,
            updatedAt: new Date().toISOString().substring(0, 10)
          }
        : task
    );
    
    setTasks(updatedTasks);
    
    // Update story stats
    setStory({
      ...story,
      completedTasks: story.completedTasks + completedDelta,
      updatedAt: new Date().toISOString().substring(0, 10)
    });
    
    setIsEditTaskDialogOpen(false);
  };
  
  // Handle toggling task status directly from checkbox
  const handleToggleTaskStatus = (taskId: number, currentStatus: string) => {
    // API call would go here
    
    // Toggle between DONE and TODO
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    
    // Update local state for demo purposes
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString().substring(0, 10) }
        : task
    );
    
    setTasks(updatedTasks);
    
    // Update story stats
    setStory({
      ...story,
      completedTasks: newStatus === "DONE" 
        ? story.completedTasks + 1 
        : story.completedTasks - 1,
      updatedAt: new Date().toISOString().substring(0, 10)
    });
  };

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/stories")}
            className="mr-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Stories
          </Button>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{story.name}</h1>
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-1 ${getStatusColor(story.status)}`}
              >
                {story.status}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-1 ${getPriorityColor(story.priority)}`}
              >
                {story.priority}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-sm">
              <p 
                className="text-gray-600 cursor-pointer hover:text-primary-600"
                onClick={() => setLocation(`/projects/${story.projectId}`)}
              >
                <BriefcaseIcon className="h-4 w-4 inline mr-1" />
                {story.projectName}
              </p>
              <p 
                className="text-gray-600 cursor-pointer hover:text-primary-600"
                onClick={() => setLocation(`/epics/${story.epicId}`)}
              >
                <BookOpenIcon className="h-4 w-4 inline mr-1" />
                {story.epicName}
              </p>
              {story.storyPoints && (
                <p className="text-gray-600">
                  <Hash className="h-4 w-4 inline mr-1" />
                  {story.storyPoints} points
                </p>
              )}
            </div>
            <p className="text-gray-600 mt-3">{story.description}</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
              <EditIcon className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:bg-red-50 hover:text-red-600"
              onClick={() => setIsConfirmDeleteOpen(true)}
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </header>
      
      {/* Story details */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Status card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-4xl font-bold">{story.taskCount}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-4xl font-bold">{story.completedTasks}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-4xl font-bold">{story.taskCount - story.completedTasks}</div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Details card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Start Date</div>
                  <div className="font-medium">{formatDate(story.startDate)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Due Date</div>
                  <div className="font-medium">{formatDate(story.dueDate)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Assignee</div>
                  {story.assignee ? (
                    <div className="flex mt-1 gap-2 items-center">
                      <div
                        title={story.assignee.name}
                        className={`flex-shrink-0 h-8 w-8 rounded-full ${getAvatarColor(story.assignee.name)} flex items-center justify-center text-white font-medium text-sm`}
                      >
                        {story.assignee.avatar}
                      </div>
                      <span className="font-medium">{story.assignee.name}</span>
                    </div>
                  ) : (
                    <div className="text-gray-500">Unassigned</div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Reporter</div>
                  {story.reporter ? (
                    <div className="flex mt-1 gap-2 items-center">
                      <div
                        title={story.reporter.name}
                        className={`flex-shrink-0 h-8 w-8 rounded-full ${getAvatarColor(story.reporter.name)} flex items-center justify-center text-white font-medium text-sm`}
                      >
                        {story.reporter.avatar}
                      </div>
                      <span className="font-medium">{story.reporter.name}</span>
                    </div>
                  ) : (
                    <div className="text-gray-500">None</div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Created</div>
                  <div className="font-medium">{formatDate(story.createdAt)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Updated</div>
                  <div className="font-medium">{formatDate(story.updatedAt)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for Tasks and Comments */}
      <Tabs defaultValue="tasks" className="mt-6">
        <TabsList>
          <TabsTrigger value="tasks" className="flex items-center">
            <ClipboardListIcon className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center">
            <MessageSquareIcon className="h-4 w-4 mr-2" />
            Comments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Tasks</h2>
            <Button onClick={() => setIsAddTaskDialogOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
          
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No tasks found for this story.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card 
                  key={task.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Checkbox 
                        checked={task.status === "DONE"}
                        onClick={() => handleToggleTaskStatus(task.id, task.status)}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className={`text-lg font-bold ${task.status === "DONE" ? "line-through text-gray-500" : "text-gray-900"}`}>
                            {task.name}
                          </h3>
                          <div className="flex gap-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-2 py-1 ${getStatusColor(task.status)}`}
                            >
                              {task.status}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-2 py-1 ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{formatDate(task.dueDate)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">Est: {task.estimatedHours}h</span>
                            {task.actualHours && (
                              <span className="text-gray-600">/ Actual: {task.actualHours}h</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 items-end">
                        {task.assignee ? (
                          <div
                            title={task.assignee.name}
                            className={`flex-shrink-0 h-8 w-8 rounded-full ${getAvatarColor(task.assignee.name)} flex items-center justify-center text-white font-medium text-sm`}
                          >
                            {task.assignee.avatar}
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                          >
                            Assign
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openEditTaskDialog(task)}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="comments" className="mt-4">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Comments</h2>
            
            {story.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-4 border rounded-lg">
                <div 
                  className={`flex-shrink-0 h-8 w-8 rounded-full ${getAvatarColor(comment.user.name)} flex items-center justify-center text-white font-medium text-sm`}
                >
                  {comment.user.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="font-medium">{comment.user.name}</div>
                    <div className="text-sm text-gray-500">{formatDate(comment.createdAt)}</div>
                  </div>
                  <div className="mt-1">{comment.content}</div>
                </div>
              </div>
            ))}
            
            <Textarea 
              placeholder="Add a comment..." 
              className="mt-4"
            />
            <Button className="mt-2">Add Comment</Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Edit Story Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Story</DialogTitle>
            <DialogDescription>
              Update story details and track progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Story Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter story name"
                value={editStory.name}
                onChange={(e) => setEditStory({...editStory, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter story description"
                rows={4}
                value={editStory.description}
                onChange={(e) => setEditStory({...editStory, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-epic">Epic</Label>
                <Select 
                  value={editStory.epicId}
                  onValueChange={(value) => setEditStory({...editStory, epicId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select epic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">User Authentication System</SelectItem>
                    <SelectItem value="2">Dashboard Analytics</SelectItem>
                    <SelectItem value="3">Mobile Responsiveness</SelectItem>
                    <SelectItem value="4">Customer Management Interface</SelectItem>
                    <SelectItem value="5">Social Media Integration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editStory.status}
                  onValueChange={(value) => setEditStory({...editStory, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKLOG">Backlog</SelectItem>
                    <SelectItem value="READY">Ready</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select 
                  value={editStory.priority}
                  onValueChange={(value) => setEditStory({...editStory, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-storyPoints">Story Points</Label>
                <Select 
                  value={editStory.storyPoints}
                  onValueChange={(value) => setEditStory({...editStory, storyPoints: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estimate effort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Small</SelectItem>
                    <SelectItem value="2">2 - Small</SelectItem>
                    <SelectItem value="3">3 - Small+</SelectItem>
                    <SelectItem value="5">5 - Medium</SelectItem>
                    <SelectItem value="8">8 - Large</SelectItem>
                    <SelectItem value="13">13 - Very Large</SelectItem>
                    <SelectItem value="21">21 - Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-assignee">Assignee</Label>
                <Select 
                  value={editStory.assigneeId}
                  onValueChange={(value) => setEditStory({...editStory, assigneeId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="5">Alice Chen</SelectItem>
                    <SelectItem value="8">Bob Jackson</SelectItem>
                    <SelectItem value="12">Charlie Martinez</SelectItem>
                    <SelectItem value="21">Eric Thompson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-reporter">Reporter</Label>
                <Select 
                  value={editStory.reporterId}
                  onValueChange={(value) => setEditStory({...editStory, reporterId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reporter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Alice Chen</SelectItem>
                    <SelectItem value="8">Bob Jackson</SelectItem>
                    <SelectItem value="12">Charlie Martinez</SelectItem>
                    <SelectItem value="21">Eric Thompson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={editStory.startDate}
                  onChange={(e) => setEditStory({...editStory, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={editStory.dueDate}
                  onChange={(e) => setEditStory({...editStory, dueDate: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStory}>Update Story</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this story? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-red-600">
              Warning: Deleting this story will also delete all associated tasks.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteStory}
            >
              Delete Story
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Task Dialog */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task for this story.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-name">Task Name</Label>
              <Input
                id="task-name"
                placeholder="Enter task name"
                value={newTask.name}
                onChange={(e) => setNewTask({...newTask, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Enter task description"
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="task-status">Status</Label>
                <Select 
                  value={newTask.status}
                  onValueChange={(value) => setNewTask({...newTask, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select 
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({...newTask, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="task-assignee">Assignee</Label>
                <Select 
                  value={newTask.assigneeId}
                  onValueChange={(value) => setNewTask({...newTask, assigneeId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="5">Alice Chen</SelectItem>
                    <SelectItem value="8">Bob Jackson</SelectItem>
                    <SelectItem value="12">Charlie Martinez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-estimatedHours">Estimated Hours</Label>
                <Input
                  id="task-estimatedHours"
                  type="number"
                  placeholder="Estimated hours"
                  value={newTask.estimatedHours}
                  onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="task-startDate">Start Date</Label>
                <Input
                  id="task-startDate"
                  type="date"
                  value={newTask.startDate}
                  onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-dueDate">Due Date</Label>
                <Input
                  id="task-dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details and track progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-task-name">Task Name</Label>
              <Input
                id="edit-task-name"
                placeholder="Enter task name"
                value={editTask.name}
                onChange={(e) => setEditTask({...editTask, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-task-description">Description</Label>
              <Textarea
                id="edit-task-description"
                placeholder="Enter task description"
                rows={3}
                value={editTask.description}
                onChange={(e) => setEditTask({...editTask, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-task-status">Status</Label>
                <Select 
                  value={editTask.status}
                  onValueChange={(value) => setEditTask({...editTask, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-task-priority">Priority</Label>
                <Select 
                  value={editTask.priority}
                  onValueChange={(value) => setEditTask({...editTask, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-task-assignee">Assignee</Label>
                <Select 
                  value={editTask.assigneeId}
                  onValueChange={(value) => setEditTask({...editTask, assigneeId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="5">Alice Chen</SelectItem>
                    <SelectItem value="8">Bob Jackson</SelectItem>
                    <SelectItem value="12">Charlie Martinez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-task-estimatedHours">Estimated Hours</Label>
                <Input
                  id="edit-task-estimatedHours"
                  type="number"
                  placeholder="Estimated hours"
                  value={editTask.estimatedHours}
                  onChange={(e) => setEditTask({...editTask, estimatedHours: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-task-actualHours">Actual Hours</Label>
                <Input
                  id="edit-task-actualHours"
                  type="number"
                  placeholder="Actual hours"
                  value={editTask.actualHours}
                  onChange={(e) => setEditTask({...editTask, actualHours: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-task-startDate">Start Date</Label>
                <Input
                  id="edit-task-startDate"
                  type="date"
                  value={editTask.startDate}
                  onChange={(e) => setEditTask({...editTask, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-task-dueDate">Due Date</Label>
                <Input
                  id="edit-task-dueDate"
                  type="date"
                  value={editTask.dueDate}
                  onChange={(e) => setEditTask({...editTask, dueDate: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTask}>Update Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}