import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Hash,
  Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Placeholder, Status, Priority } from "@/lib/constants";
import { Story, Task, Epic, Project, User, Comment, InsertTask } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  const { toast } = useToast();
  
  // State for dialog modals
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // State for forms
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
  const [newTask, setNewTask] = useState<Partial<InsertTask>>({
    name: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    storyId: storyId || "",
    assigneeId: "",
    estimatedHours: "",
    startDate: "",
    dueDate: ""
  });
  
  // Edit task form state
  const [editTask, setEditTask] = useState<{
    id: string;
    name: string;
    description: string | null;
    status: string;
    priority: string;
    assigneeId: string | null;
    estimatedHours: string | null;
    actualHours: string | null;
    startDate: string | null;
    dueDate: string | null;
  }>({
    id: "",
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
  
  // Fetch story data
  const { 
    data: story,
    isLoading: isLoadingStory,
    error: storyError,
    isError: isStoryError
  } = useQuery<Story>({
    queryKey: ['/api/stories', storyId],
    enabled: !!storyId,
  });
  
  // Fetch epic data
  const {
    data: epic
  } = useQuery<Epic>({
    queryKey: ['/api/epics', story?.epicId],
    enabled: !!story?.epicId,
  });
  
  // Fetch project data
  const {
    data: project
  } = useQuery<Project>({
    queryKey: ['/api/projects', epic?.projectId],
    enabled: !!epic?.projectId,
  });
  
  // Fetch tasks related to this story
  const {
    data: tasks = [],
    isLoading: isLoadingTasks
  } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    select: (data) => data.filter(task => task.storyId === storyId),
    enabled: !!storyId,
  });
  
  // Fetch users for assignments
  const {
    data: users = []
  } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Fetch epics for dropdown
  const {
    data: epics = []
  } = useQuery<Epic[]>({
    queryKey: ['/api/epics'],
  });
  
  // Update story mutation
  const updateStoryMutation = useMutation({
    mutationFn: async (updatedStory: any) => {
      const response = await apiRequest('PUT', `/api/stories/${storyId}`, updatedStory);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories', storyId] });
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      toast({
        title: "Story updated",
        description: "The story has been updated successfully."
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating story",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Delete story mutation
  const deleteStoryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/stories/${storyId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      toast({
        title: "Story deleted",
        description: "The story has been deleted successfully."
      });
      setIsConfirmDeleteOpen(false);
      setLocation('/stories');
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting story",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (task: InsertTask) => {
      const response = await apiRequest('POST', '/api/tasks', task);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task created",
        description: "New task has been successfully created."
      });
      setIsAddTaskDialogOpen(false);
      setNewTask({
        name: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        storyId: storyId || "",
        assigneeId: "",
        estimatedHours: "",
        startDate: "",
        dueDate: ""
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: any) => {
      const response = await apiRequest('PUT', `/api/tasks/${updatedTask.id}`, updatedTask);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task updated",
        description: "The task has been updated successfully."
      });
      setIsEditTaskDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Toggle task status mutation
  const toggleTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string, newStatus: string }) => {
      const response = await apiRequest('PUT', `/api/tasks/${taskId}`, { status: newStatus });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating task status",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Update state for edit form when story data is loaded
  useEffect(() => {
    if (story) {
      setEditStory({
        name: story.name || "",
        description: story.description || "",
        status: story.status || "",
        priority: story.priority || "",
        epicId: story.epicId || "",
        storyPoints: story.storyPoints?.toString() || "",
        assigneeId: story.assigneeId || "",
        reporterId: story.reporterId || "",
        startDate: story.startDate ? new Date(story.startDate).toISOString().split('T')[0] : "",
        dueDate: story.dueDate ? new Date(story.dueDate).toISOString().split('T')[0] : ""
      });
      
      // Update new task with story ID
      setNewTask(task => ({
        ...task,
        storyId: story.id
      }));
    }
  }, [story]);
  
  // Format date string to more readable format
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'Not set';
    
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
  
  // Get initials for user avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };
  
  // Handle editing the story
  const handleEditStory = () => {
    const formattedStory = {
      ...editStory,
      startDate: editStory.startDate ? new Date(editStory.startDate).toISOString() : null,
      dueDate: editStory.dueDate ? new Date(editStory.dueDate).toISOString() : null,
      assigneeId: editStory.assigneeId === Placeholder.UNASSIGNED ? null : editStory.assigneeId,
      reporterId: editStory.reporterId === Placeholder.UNASSIGNED ? null : editStory.reporterId,
      storyPoints: editStory.storyPoints === Placeholder.NOT_ESTIMATED ? null : editStory.storyPoints
    };
    
    updateStoryMutation.mutate(formattedStory);
  };
  
  // Handle deleting the story
  const handleDeleteStory = () => {
    deleteStoryMutation.mutate();
  };
  
  // Handle creating a new task
  const handleAddTask = () => {
    const formattedTask = {
      ...newTask,
      storyId: storyId || '',
      startDate: newTask.startDate ? new Date(newTask.startDate).toISOString() : null,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
      assigneeId: newTask.assigneeId === Placeholder.UNASSIGNED ? null : newTask.assigneeId,
      estimatedHours: newTask.estimatedHours || null
    } as InsertTask;
    
    createTaskMutation.mutate(formattedTask);
  };
  
  // Initialize edit form when a task is selected for editing
  const openEditTaskDialog = (task: Task) => {
    setSelectedTask(task);
    setEditTask({
      id: task.id,
      name: task.name,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : null,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null
    });
    setIsEditTaskDialogOpen(true);
  };
  
  // Handle editing a task
  const handleEditTask = () => {
    const formattedTask = {
      ...editTask,
      startDate: editTask.startDate ? new Date(editTask.startDate).toISOString() : null,
      dueDate: editTask.dueDate ? new Date(editTask.dueDate).toISOString() : null,
      assigneeId: editTask.assigneeId === Placeholder.UNASSIGNED ? null : editTask.assigneeId,
      estimatedHours: editTask.estimatedHours || null,
      actualHours: editTask.actualHours || null
    };
    
    updateTaskMutation.mutate(formattedTask);
  };
  
  // Handle toggling task status directly from checkbox
  const handleToggleTaskStatus = (taskId: string, currentStatus: string) => {
    // Toggle between DONE and TODO
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    
    toggleTaskStatusMutation.mutate({ taskId, newStatus });
  };
  
  // Calculate completion percentage
  const calculateCompletion = () => {
    if (!tasks || tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === "DONE").length;
    return Math.round((completedTasks / tasks.length) * 100);
  };
  
  // Loading state
  if (isLoadingStory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading story details...</span>
      </div>
    );
  }
  
  // Error state
  if (isStoryError || !story) {
    return (
      <div className="container mx-auto p-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => setLocation("/stories")}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Stories
        </Button>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Story</h2>
              <p className="mb-4">{(storyError as Error)?.message || "Story not found or could not be loaded."}</p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/stories', storyId] })}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get the assignee and reporter details
  const assignee = users.find(user => user.id === story.assigneeId);
  const reporter = users.find(user => user.id === story.reporterId);
  
  // Calculate task stats
  const completedTasks = tasks.filter(task => task.status === "DONE").length;
  const totalTasks = tasks.length;
  const completionPercentage = calculateCompletion();

  return (
    <div className="container mx-auto p-6">
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
              {project && (
                <p 
                  className="text-gray-600 cursor-pointer hover:text-primary-600"
                  onClick={() => setLocation(`/projects/${epic?.projectId}`)}
                >
                  <BriefcaseIcon className="h-4 w-4 inline mr-1" />
                  {project.name}
                </p>
              )}
              {epic && (
                <p 
                  className="text-gray-600 cursor-pointer hover:text-primary-600"
                  onClick={() => setLocation(`/epics/${story.epicId}`)}
                >
                  <BookOpenIcon className="h-4 w-4 inline mr-1" />
                  {epic.name}
                </p>
              )}
              {story.storyPoints && (
                <p className="text-gray-600">
                  <Hash className="h-4 w-4 inline mr-1" />
                  {story.storyPoints} points
                </p>
              )}
            </div>
            <p className="text-gray-600 mt-1">{story.description}</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Task stats card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm pt-2">
                <span>{completedTasks}/{totalTasks} tasks completed</span>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary" 
                  onClick={() => setIsAddTaskDialogOpen(true)}
                >
                  + Add task
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Timeline card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
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
            <div className="h-4"></div>
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
          </CardContent>
        </Card>
        
        {/* People card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">People</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-2">Assignee</div>
                {assignee ? (
                  <div className="flex items-center gap-2">
                    <div 
                      className={`flex-shrink-0 h-8 w-8 rounded-full ${getAvatarColor(`${assignee.firstName} ${assignee.lastName}`)} flex items-center justify-center text-white font-medium text-sm`}
                    >
                      {getInitials(assignee.firstName, assignee.lastName)}
                    </div>
                    <div className="font-medium">
                      {assignee.firstName} {assignee.lastName}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Unassigned</div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-2">Reporter</div>
                {reporter ? (
                  <div className="flex items-center gap-2">
                    <div 
                      className={`flex-shrink-0 h-8 w-8 rounded-full ${getAvatarColor(`${reporter.firstName} ${reporter.lastName}`)} flex items-center justify-center text-white font-medium text-sm`}
                    >
                      {getInitials(reporter.firstName, reporter.lastName)}
                    </div>
                    <div className="font-medium">
                      {reporter.firstName} {reporter.lastName}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Not specified</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for Tasks and Comments */}
      <Tabs defaultValue="tasks" className="mt-6">
        <TabsList>
          <TabsTrigger value="tasks" className="flex items-center">
            <CheckSquareIcon className="h-4 w-4 mr-2" />
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
          
          {isLoadingTasks ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2">Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No tasks found for this story.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddTaskDialogOpen(true)}
                  className="mt-4"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Create First Task
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <Card 
                  key={task.id} 
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={task.status === "DONE"} 
                        onCheckedChange={() => handleToggleTaskStatus(task.id, task.status)}
                        className="mt-1"
                        disabled={toggleTaskStatusMutation.isPending}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 
                              className={`text-lg font-medium ${task.status === "DONE" ? "line-through text-gray-500" : "text-gray-900"}`}
                              onClick={() => openEditTaskDialog(task)}
                            >
                              {task.name}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            )}
                          </div>
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
                        
                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                          {(task.estimatedHours || task.actualHours) && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <ClockIcon className="h-4 w-4" />
                              {task.actualHours ? `${task.actualHours}h spent` : `${task.estimatedHours}h estimated`}
                            </div>
                          )}
                          
                          {task.startDate && task.dueDate && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <CalendarIcon className="h-4 w-4" />
                              {formatDate(task.startDate)} - {formatDate(task.dueDate)}
                            </div>
                          )}
                          
                          {task.assigneeId && users.find(u => u.id === task.assigneeId) && (
                            <div className="flex items-center gap-2 ml-auto">
                              <div 
                                className={`flex-shrink-0 h-6 w-6 rounded-full ${getAvatarColor(`${users.find(u => u.id === task.assigneeId)?.firstName} ${users.find(u => u.id === task.assigneeId)?.lastName}`)} flex items-center justify-center text-white font-medium text-xs`}
                              >
                                {getInitials(
                                  users.find(u => u.id === task.assigneeId)?.firstName || '', 
                                  users.find(u => u.id === task.assigneeId)?.lastName || ''
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500" 
                        onClick={() => openEditTaskDialog(task)}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
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
            
            {/* For now, show placeholder for comments */}
            <div className="bg-gray-50 p-6 text-center rounded-lg">
              <p className="text-gray-500">Comment functionality coming soon.</p>
            </div>
            
            <Textarea 
              placeholder="Add a comment..." 
              className="mt-4"
              disabled
            />
            <Button className="mt-2" disabled>Add Comment</Button>
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
              <Label htmlFor="edit-name">Story Name <span className="text-red-500">*</span></Label>
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
                value={editStory.description || ''}
                onChange={(e) => setEditStory({...editStory, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-epic">Epic <span className="text-red-500">*</span></Label>
                <Select 
                  value={editStory.epicId}
                  onValueChange={(value) => setEditStory({...editStory, epicId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select epic" />
                  </SelectTrigger>
                  <SelectContent>
                    {epics.map((epic) => (
                      <SelectItem key={epic.id} value={epic.id}>
                        {epic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="edit-priority">Priority <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="edit-points">Story Points</Label>
                <Select 
                  value={editStory.storyPoints || Placeholder.NOT_ESTIMATED}
                  onValueChange={(value) => setEditStory({...editStory, storyPoints: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select points" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Placeholder.NOT_ESTIMATED}>Not Estimated</SelectItem>
                    <SelectItem value="1">1 point</SelectItem>
                    <SelectItem value="2">2 points</SelectItem>
                    <SelectItem value="3">3 points</SelectItem>
                    <SelectItem value="5">5 points</SelectItem>
                    <SelectItem value="8">8 points</SelectItem>
                    <SelectItem value="13">13 points</SelectItem>
                    <SelectItem value="21">21 points</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-assignee">Assignee</Label>
                <Select 
                  value={editStory.assigneeId || Placeholder.UNASSIGNED}
                  onValueChange={(value) => setEditStory({...editStory, assigneeId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Placeholder.UNASSIGNED}>Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-reporter">Reporter</Label>
                <Select 
                  value={editStory.reporterId || Placeholder.UNASSIGNED}
                  onValueChange={(value) => setEditStory({...editStory, reporterId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reporter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Placeholder.UNASSIGNED}>Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
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
            <Button 
              onClick={handleEditStory}
              disabled={updateStoryMutation.isPending || !editStory.name}
            >
              {updateStoryMutation.isPending ? "Updating..." : "Update Story"}
            </Button>
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
              disabled={deleteStoryMutation.isPending}
            >
              {deleteStoryMutation.isPending ? "Deleting..." : "Delete Story"}
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
              <Label htmlFor="task-name">Task Name <span className="text-red-500">*</span></Label>
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
                value={newTask.description || ''}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="task-status">Status <span className="text-red-500">*</span></Label>
                <Select 
                  value={newTask.status || "TODO"}
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
                <Label htmlFor="task-priority">Priority <span className="text-red-500">*</span></Label>
                <Select 
                  value={newTask.priority || "MEDIUM"}
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
                  value={newTask.assigneeId || Placeholder.UNASSIGNED}
                  onValueChange={(value) => setNewTask({...newTask, assigneeId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Placeholder.UNASSIGNED}>Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-estimate">Estimated Hours</Label>
                <Input
                  id="task-estimate"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.5"
                  value={newTask.estimatedHours || ''}
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
                  value={newTask.startDate || ''}
                  onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-dueDate">Due Date</Label>
                <Input
                  id="task-dueDate"
                  type="date"
                  value={newTask.dueDate || ''}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddTask}
              disabled={createTaskMutation.isPending || !newTask.name}
            >
              {createTaskMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details and progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-task-name">Task Name <span className="text-red-500">*</span></Label>
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
                value={editTask.description || ''}
                onChange={(e) => setEditTask({...editTask, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-task-status">Status <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="edit-task-priority">Priority <span className="text-red-500">*</span></Label>
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
                  value={editTask.assigneeId || Placeholder.UNASSIGNED}
                  onValueChange={(value) => setEditTask({...editTask, assigneeId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Placeholder.UNASSIGNED}>Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-task-estimated">Estimated Hours</Label>
                <Input
                  id="edit-task-estimated"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.5"
                  value={editTask.estimatedHours || ''}
                  onChange={(e) => setEditTask({...editTask, estimatedHours: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-task-actual">Actual Hours</Label>
                <Input
                  id="edit-task-actual"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.5"
                  value={editTask.actualHours || ''}
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
                  value={editTask.startDate || ''}
                  onChange={(e) => setEditTask({...editTask, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-task-dueDate">Due Date</Label>
                <Input
                  id="edit-task-dueDate"
                  type="date"
                  value={editTask.dueDate || ''}
                  onChange={(e) => setEditTask({...editTask, dueDate: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditTask}
              disabled={updateTaskMutation.isPending || !editTask.name}
            >
              {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}