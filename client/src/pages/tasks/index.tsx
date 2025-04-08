import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PlusIcon, 
  FilterIcon, 
  SearchIcon, 
  ClipboardListIcon,
  LayoutIcon,
  BriefcaseIcon,
  UsersIcon,
  TagIcon,
  ClockIcon,
  CalendarIcon,
  MoreVerticalIcon,
  Loader2,
  BookOpenIcon,
  MessageSquareIcon,
  ListChecksIcon,
  Trash2Icon,
  EditIcon,
  ChevronDownIcon
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, queryClient, apiRequest } from "@/lib/queryClient";
import { Task, Story, Epic, Project, User, InsertTask } from "@shared/schema";

export default function TasksPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  
  // Fetch tasks from API
  const { data: tasks = [], isLoading: isLoadingTasks, error: tasksError } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: getQueryFn()
  });
  
  // Fetch stories for mapping storyId to storyName
  const { data: stories = [] } = useQuery({
    queryKey: ['/api/stories'],
    queryFn: getQueryFn()
  });
  
  // Fetch epics to get project info through stories
  const { data: epics = [] } = useQuery({
    queryKey: ['/api/epics'],
    queryFn: getQueryFn()
  });
  
  // Fetch projects for mapping epicId to projectName
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: getQueryFn()
  });
  
  // Fetch users for mapping assignee IDs to names
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: getQueryFn()
  });

  // Create maps for easy lookups
  const storyMap = new Map<string, Story>();
  stories.forEach((story: Story) => {
    storyMap.set(story.id, story);
  });

  const epicMap = new Map<string, Epic>();
  epics.forEach((epic: Epic) => {
    epicMap.set(epic.id, epic);
  });

  const projectMap = new Map<string, Project>();
  projects.forEach((project: Project) => {
    projectMap.set(project.id, project);
  });
  
  const userMap = new Map<string, User>();
  users.forEach((user: User) => {
    userMap.set(user.id, user);
  });

  // New task form state
  const [newTask, setNewTask] = useState<Partial<InsertTask>>({
    name: "",
    description: "",
    storyId: "",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: "",
    estimatedHours: "",
    startDate: "",
    dueDate: ""
  });

  // Edit task form state
  const [editTask, setEditTask] = useState<Partial<InsertTask> & { id?: string }>({
    id: "",
    name: "",
    description: "",
    storyId: "",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: "",
    estimatedHours: "",
    startDate: "",
    dueDate: ""
  });

  // Create mutation for adding new tasks
  const createTaskMutation = useMutation({
    mutationFn: async (task: InsertTask) => {
      const response = await apiRequest('POST', '/api/tasks', task);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task created",
        description: "New task has been successfully created.",
      });
      setIsCreateDialogOpen(false);
      // Reset form
      setNewTask({
        name: "",
        description: "",
        storyId: "",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: "",
        estimatedHours: "",
        startDate: "",
        dueDate: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update mutation for editing tasks
  const updateTaskMutation = useMutation({
    mutationFn: async (task: Partial<InsertTask> & { id: string }) => {
      const { id, ...updateData } = task;
      const response = await apiRequest('PUT', `/api/tasks/${id}`, updateData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task updated",
        description: "Task has been successfully updated.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation for removing tasks
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task deleted",
        description: "Task has been successfully deleted.",
      });
      setSelectedTasks([]);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter tasks based on search query and status filter
  const filteredTasks = tasks.filter((task: Task) => {
    const matchesSearch = searchQuery === "" || 
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (storyMap.get(task.storyId)?.name.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesStatus = statusFilter === "all";
    if (statusFilter === "TODO") matchesStatus = task.status === "TODO";
    else if (statusFilter === "IN_PROGRESS") matchesStatus = task.status === "IN_PROGRESS";
    else if (statusFilter === "IN_REVIEW") matchesStatus = task.status === "IN_REVIEW";
    else if (statusFilter === "DONE") matchesStatus = task.status === "DONE";
    else if (statusFilter === "BLOCKED") matchesStatus = task.status === "BLOCKED";

    return matchesSearch && matchesStatus;
  });

  // Format date string to more readable format
  const formatDate = (dateString: string | null | undefined) => {
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
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "IN_REVIEW": return "bg-purple-100 text-purple-800";
      case "DONE": return "bg-green-100 text-green-800";
      case "BLOCKED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Helper to get user initials
  const getUserInitials = (user: User | undefined) => {
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
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
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-red-500", "bg-purple-500", "bg-pink-500", 
      "bg-indigo-500", "bg-teal-500"
    ];
    
    // Simple hash function to get consistent color for a name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Get task details including story, epic, project
  const getTaskDetails = (task: Task) => {
    const story = storyMap.get(task.storyId);
    const epic = story ? epicMap.get(story.epicId) : undefined;
    const project = epic ? projectMap.get(epic.projectId) : undefined;
    const assignee = task.assigneeId ? userMap.get(task.assigneeId) : undefined;
    
    return {
      storyName: story?.name || "Unknown story",
      epicName: epic?.name || "Unknown epic",
      projectName: project?.name || "Unknown project",
      assignee
    };
  };

  // Handle creating a new task
  const handleCreateTask = () => {
    if (!newTask.storyId) {
      toast({
        title: "Missing story",
        description: "Please select a story for this task.",
        variant: "destructive",
      });
      return;
    }

    if (!newTask.name) {
      toast({
        title: "Missing name",
        description: "Please provide a name for this task.",
        variant: "destructive",
      });
      return;
    }

    // Convert dates if provided
    const taskToCreate: any = { ...newTask };
    if (taskToCreate.startDate) {
      taskToCreate.startDate = new Date(taskToCreate.startDate).toISOString();
    }
    if (taskToCreate.dueDate) {
      taskToCreate.dueDate = new Date(taskToCreate.dueDate).toISOString();
    }

    createTaskMutation.mutate(taskToCreate as InsertTask);
  };

  // Handle editing a task
  const handleEditTask = () => {
    if (!editTask.id) {
      toast({
        title: "Error",
        description: "Missing task ID for update",
        variant: "destructive",
      });
      return;
    }

    if (!editTask.name) {
      toast({
        title: "Missing name",
        description: "Please provide a name for this task.",
        variant: "destructive",
      });
      return;
    }

    if (!editTask.storyId) {
      toast({
        title: "Missing story",
        description: "Please select a story for this task.",
        variant: "destructive",
      });
      return;
    }

    // Convert dates if provided
    const taskToUpdate: any = { ...editTask };
    if (taskToUpdate.startDate) {
      taskToUpdate.startDate = new Date(taskToUpdate.startDate).toISOString();
    }
    if (taskToUpdate.dueDate) {
      taskToUpdate.dueDate = new Date(taskToUpdate.dueDate).toISOString();
    }

    updateTaskMutation.mutate(taskToUpdate as InsertTask & { id: string });
  };

  // Initialize edit form when a task is selected for editing
  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    
    // Format dates for input fields
    let startDateForInput = '';
    let dueDateForInput = '';
    
    if (task.startDate) {
      const date = new Date(task.startDate);
      startDateForInput = date.toISOString().split('T')[0];
    }
    
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      dueDateForInput = date.toISOString().split('T')[0];
    }
    
    setEditTask({
      id: task.id,
      name: task.name,
      description: task.description || '',
      storyId: task.storyId,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId || '',
      estimatedHours: task.estimatedHours || '',
      startDate: startDateForInput,
      dueDate: dueDateForInput
    });
    
    setIsEditDialogOpen(true);
  };
  
  // Selection handlers
  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map((t: Task) => t.id));
    }
  };

  // Batch operations
  const handleDeleteSelected = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} task(s)?`)) {
      // Create a promise for each deletion
      const deletePromises = selectedTasks.map(id => deleteTaskMutation.mutateAsync(id));
      
      // Execute all deletions in parallel
      Promise.all(deletePromises)
        .then(() => {
          toast({
            title: "Tasks deleted",
            description: `${selectedTasks.length} task(s) have been successfully deleted.`,
          });
          setSelectedTasks([]);
        })
        .catch((error) => {
          toast({
            title: "Failed to delete tasks",
            description: error.message,
            variant: "destructive",
          });
        });
    }
  };

  const handleChangeStatusSelected = (status: string) => {
    toast({
      title: "Feature not implemented",
      description: `Changing status of ${selectedTasks.length} task(s) to "${status}" is not implemented yet.`,
    });
    setSelectedTasks([]);
  };

  // Loading state
  if (isLoadingTasks) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading tasks...</span>
      </div>
    );
  }

  // Error state
  if (tasksError) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
        <h2 className="text-lg font-semibold mb-2">Error loading tasks</h2>
        <p>{(tasksError as Error).message || "Unknown error occurred"}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/tasks'] })}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Group tasks by status for board view
  const tasksByStatus: Record<string, Task[]> = {
    "TODO": [],
    "IN_PROGRESS": [],
    "IN_REVIEW": [],
    "DONE": [],
    "BLOCKED": []
  };

  filteredTasks.forEach((task: Task) => {
    if (tasksByStatus[task.status]) {
      tasksByStatus[task.status].push(task);
    } else {
      tasksByStatus["TODO"].push(task);
    }
  });

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">Manage and track your work items</p>
          </div>
          <div className="flex gap-2">
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                className={`rounded-none ${viewMode === 'list' ? '' : 'bg-transparent hover:bg-gray-100 text-gray-700'}`}
                onClick={() => setViewMode('list')}
                size="sm"
              >
                <ClipboardListIcon className="h-4 w-4 mr-1" /> List
              </Button>
              <Button
                variant={viewMode === 'board' ? 'default' : 'outline'}
                className={`rounded-none ${viewMode === 'board' ? '' : 'bg-transparent hover:bg-gray-100 text-gray-700'}`}
                onClick={() => setViewMode('board')}
                size="sm"
              >
                <LayoutIcon className="h-4 w-4 mr-1" /> Board
              </Button>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" /> Create Task
            </Button>
          </div>
        </div>
      </header>
      
      {/* Batch Actions */}
      {selectedTasks.length > 0 && (
        <div className="bg-gray-50 border rounded-md p-2 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={selectedTasks.length === filteredTasks.length}
              onCheckedChange={handleSelectAll}
              className="data-[state=checked]:bg-primary"
            />
            <span className="text-sm font-medium">Selected {selectedTasks.length} of {filteredTasks.length}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Change Status <span className="ml-1">▼</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleChangeStatusSelected("TODO")}>
                  <div className="h-2 w-2 rounded-full bg-gray-500 mr-2"></div>
                  To Do
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleChangeStatusSelected("IN_PROGRESS")}>
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleChangeStatusSelected("IN_REVIEW")}>
                  <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                  In Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleChangeStatusSelected("DONE")}>
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Done
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleChangeStatusSelected("BLOCKED")}>
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                  Blocked
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="sm" onClick={handleDeleteSelected} className="text-red-600 hover:bg-red-50 hover:text-red-700">
              <Trash2Icon className="mr-1 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      )}
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm text-gray-500 whitespace-nowrap">Status:</span>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "all" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : ""}
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "TODO" ? "bg-gray-100 text-gray-800 hover:bg-gray-200" : ""}
            onClick={() => setStatusFilter("TODO")}
          >
            To Do
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "IN_PROGRESS" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : ""}
            onClick={() => setStatusFilter("IN_PROGRESS")}
          >
            In Progress
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "IN_REVIEW" ? "bg-purple-100 text-purple-800 hover:bg-purple-200" : ""}
            onClick={() => setStatusFilter("IN_REVIEW")}
          >
            In Review
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "DONE" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
            onClick={() => setStatusFilter("DONE")}
          >
            Done
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "BLOCKED" ? "bg-red-100 text-red-800 hover:bg-red-200" : ""}
            onClick={() => setStatusFilter("BLOCKED")}
          >
            Blocked
          </Button>
        </div>
      </div>
      
      {/* Tasks Display */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No tasks found matching your filters.</p>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        // List View
        <div className="space-y-4">
          {filteredTasks.map((task: Task) => {
            const { storyName, epicName, projectName, assignee } = getTaskDetails(task);
            
            return (
              <Card 
                key={task.id} 
                className="hover:shadow-md transition-shadow relative cursor-pointer"
                onClick={() => setLocation(`/tasks/${task.id}`)}
              >
                {/* Checkbox for selection */}
                <div 
                  className="absolute top-4 left-4 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    className="data-[state=checked]:bg-primary border-gray-300"
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTasks(prev => [...prev, task.id]);
                      } else {
                        setSelectedTasks(prev => prev.filter(id => id !== task.id));
                      }
                    }}
                  />
                </div>
                
                <CardContent className="p-4 pl-12">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{task.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description || "No description provided"}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className={getStatusColor(task.status)}>
                          {task.status === "TODO" ? "To Do" : 
                           task.status === "IN_PROGRESS" ? "In Progress" : 
                           task.status === "IN_REVIEW" ? "In Review" : 
                           task.status === "DONE" ? "Done" : "Blocked"}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        {task.estimatedHours && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-800">
                            {task.estimatedHours} hours
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ClipboardListIcon className="h-4 w-4 mr-1" />
                          <span>{storyName}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <BookOpenIcon className="h-4 w-4 mr-1" />
                          <span>{epicName}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <BriefcaseIcon className="h-4 w-4 mr-1" />
                          <span>{projectName}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>
                            {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 ml-4">
                      {/* Action menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => openEditDialog(task)}>
                            <EditIcon className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this task?")) {
                                deleteTaskMutation.mutate(task.id);
                              }
                            }}
                          >
                            <Trash2Icon className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      {/* Assignee info */}
                      {assignee && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Assignee:</span>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${getAvatarColor(assignee.firstName + assignee.lastName)}`}>
                            {getUserInitials(assignee)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // Board View
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-700 flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${
                    status === "TODO" ? "bg-gray-500" :
                    status === "IN_PROGRESS" ? "bg-blue-500" :
                    status === "IN_REVIEW" ? "bg-purple-500" :
                    status === "DONE" ? "bg-green-500" :
                    "bg-red-500"
                  }`}></div>
                  {status === "TODO" ? "To Do" : 
                   status === "IN_PROGRESS" ? "In Progress" : 
                   status === "IN_REVIEW" ? "In Review" : 
                   status === "DONE" ? "Done" : "Blocked"}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-1">
                  {statusTasks.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {statusTasks.map((task: Task) => {
                  const { storyName, assignee } = getTaskDetails(task);
                  
                  return (
                    <Card 
                      key={task.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setLocation(`/tasks/${task.id}`)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium mb-2 line-clamp-1">{task.name}</h4>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVerticalIcon className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => openEditDialog(task)}>
                                <EditIcon className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to delete this task?")) {
                                    deleteTaskMutation.mutate(task.id);
                                  }
                                }}
                              >
                                <Trash2Icon className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="mb-2 text-xs text-gray-500 line-clamp-1">
                          {task.description || "No description"}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                          
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <ClipboardListIcon className="h-3 w-3" />
                            <span className="truncate max-w-[80px]">{storyName}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-3">
                          {task.dueDate && (
                            <div className="flex items-center text-xs text-gray-500">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              <span>{formatDate(task.dueDate)}</span>
                            </div>
                          )}
                          
                          {assignee && (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${getAvatarColor(assignee.firstName + assignee.lastName)}`}>
                              {getUserInitials(assignee)}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {statusTasks.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-400">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to track specific work to be done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Task name"
                className="col-span-3"
                value={newTask.name}
                onChange={(e) => setNewTask({...newTask, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the task"
                className="col-span-3"
                rows={4}
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="story" className="text-right">
                Story
              </Label>
              <Select 
                value={newTask.storyId} 
                onValueChange={(value) => setNewTask({...newTask, storyId: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select story" />
                </SelectTrigger>
                <SelectContent>
                  {stories.map((story: Story) => (
                    <SelectItem key={story.id} value={story.id}>
                      {story.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={newTask.status} 
                onValueChange={(value) => setNewTask({...newTask, status: value})}
              >
                <SelectTrigger className="col-span-3">
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select 
                value={newTask.priority} 
                onValueChange={(value) => setNewTask({...newTask, priority: value})}
              >
                <SelectTrigger className="col-span-3">
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignee" className="text-right">
                Assignee
              </Label>
              <Select 
                value={newTask.assigneeId || ''} 
                onValueChange={(value) => setNewTask({...newTask, assigneeId: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {users.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estimatedHours" className="text-right">
                Estimated Hours
              </Label>
              <Input
                id="estimatedHours"
                placeholder="e.g., 4"
                className="col-span-3"
                value={newTask.estimatedHours}
                onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                className="col-span-3"
                value={newTask.startDate}
                onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                className="col-span-3"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleCreateTask}
              disabled={createTaskMutation.isPending}
            >
              {createTaskMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to the selected task's details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                placeholder="Task name"
                className="col-span-3"
                value={editTask.name}
                onChange={(e) => setEditTask({...editTask, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Detailed description of the task"
                className="col-span-3"
                rows={4}
                value={editTask.description}
                onChange={(e) => setEditTask({...editTask, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-story" className="text-right">
                Story
              </Label>
              <Select 
                value={editTask.storyId} 
                onValueChange={(value) => setEditTask({...editTask, storyId: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select story" />
                </SelectTrigger>
                <SelectContent>
                  {stories.map((story: Story) => (
                    <SelectItem key={story.id} value={story.id}>
                      {story.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <Select 
                value={editTask.status} 
                onValueChange={(value) => setEditTask({...editTask, status: value})}
              >
                <SelectTrigger className="col-span-3">
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-priority" className="text-right">
                Priority
              </Label>
              <Select 
                value={editTask.priority} 
                onValueChange={(value) => setEditTask({...editTask, priority: value})}
              >
                <SelectTrigger className="col-span-3">
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-assignee" className="text-right">
                Assignee
              </Label>
              <Select 
                value={editTask.assigneeId || ''} 
                onValueChange={(value) => setEditTask({...editTask, assigneeId: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {users.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-estimatedHours" className="text-right">
                Estimated Hours
              </Label>
              <Input
                id="edit-estimatedHours"
                placeholder="e.g., 4"
                className="col-span-3"
                value={editTask.estimatedHours}
                onChange={(e) => setEditTask({...editTask, estimatedHours: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="edit-startDate"
                type="date"
                className="col-span-3"
                value={editTask.startDate}
                onChange={(e) => setEditTask({...editTask, startDate: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                id="edit-dueDate"
                type="date"
                className="col-span-3"
                value={editTask.dueDate}
                onChange={(e) => setEditTask({...editTask, dueDate: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleEditTask}
              disabled={updateTaskMutation.isPending}
            >
              {updateTaskMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}