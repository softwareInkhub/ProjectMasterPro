import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  CalendarIcon,
  Clock,
  Edit2 as EditIcon,
  Link2,
  MoreHorizontal,
  PlusIcon,
  User as UserIcon,
  MessageSquare,
  CheckSquare,
  Tag,
  Briefcase,
  Clipboard,
  Trash2,
  Copy,
  Loader2,
  Timer
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TimeEntryForm } from "@/components/time-entry/time-entry-form";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Task, Comment, User, Project, 
  TaskWithStringDates, 
  CommentWithStringDates, 
  UserWithStringDates as UserString, 
  ProjectWithStringDates as ProjectString 
} from "@shared/schema";

export default function TaskDetailPage() {
  const [, params] = useRoute("/tasks/:id");
  const [, setLocation] = useLocation();
  const taskId = params?.id;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddCommentDialogOpen, setIsAddCommentDialogOpen] = useState(false);
  const [isAddSubtaskDialogOpen, setIsAddSubtaskDialogOpen] = useState(false);
  const [isChangeAssigneeDialogOpen, setIsChangeAssigneeDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState<User | null>(null);
  const [editTask, setEditTask] = useState<Partial<Task>>({});

  // Fetch task data
  const { data: task, isLoading: isLoadingTask, error: taskError } = useQuery({
    queryKey: [`/api/tasks/${taskId}`],
    queryFn: getQueryFn(),
    enabled: !!taskId
  });

  // Fetch project data for the task
  const { data: project } = useQuery({
    queryKey: [`/api/projects/${task?.projectId}`],
    queryFn: getQueryFn(),
    enabled: !!task?.projectId
  });

  // Fetch assignee data
  const { data: assignee } = useQuery({
    queryKey: [`/api/users/${task?.assigneeId}`],
    queryFn: getQueryFn(),
    enabled: !!task?.assigneeId
  });

  // Fetch all users for assignee selection
  const { data: allUsers = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: getQueryFn()
  });

  // Fetch comments for this task
  const { data: comments = [] } = useQuery({
    queryKey: [`/api/comments?entityType=task&entityId=${taskId}`],
    queryFn: getQueryFn(),
    enabled: !!taskId
  });

  // Effect to set up initial form data when task is loaded
  useEffect(() => {
    if (task) {
      setEditTask({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId,
        dueDate: task.dueDate,
      });
    }
  }, [task]);

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Partial<Task>) => {
      const res = await apiRequest('PUT', `/api/tasks/${taskId}`, updatedTask);
      return await res.json();
    },
    onSuccess: (updatedTask) => {
      // Update this task
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      
      // If we're changing status (especially to DONE), also invalidate parent objects
      if (updatedTask.status && task?.storyId) {
        // Invalidate parent story
        queryClient.invalidateQueries({ queryKey: [`/api/stories/${task.storyId}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
        
        // If we know the epic and project, invalidate those too
        if (task.epicId) {
          queryClient.invalidateQueries({ queryKey: [`/api/epics/${task.epicId}`] });
          queryClient.invalidateQueries({ queryKey: ['/api/epics'] });
        }
        
        if (task.projectId) {
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${task.projectId}`] });
          queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        }
      }
      
      setIsEditDialogOpen(false);
      
      // Enhanced toast notification for status changes
      if (updatedTask.status && updatedTask.status !== task?.status) {
        toast({
          title: `Task status changed to ${updatedTask.status}`,
          description: "Status updated and parent items recalculated.",
          variant: updatedTask.status === 'DONE' ? "destructive" : "default"
        });
      } else {
        toast({
          title: "Task updated",
          description: "Task has been updated successfully."
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Add new subtask mutation
  const addSubtaskMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!task) return null;
      
      // Assuming we have a subtasks field in the Task type
      const updatedChecklist = {
        ...task.checklist,
        items: [
          ...task.checklist.items,
          { id: crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, text, completed: false }
        ],
        total: task.checklist.total + 1
      };
      
      const res = await apiRequest('PUT', `/api/tasks/${taskId}`, {
        checklist: updatedChecklist
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      setNewSubtaskText("");
      setIsAddSubtaskDialogOpen(false);
      toast({
        title: "Subtask added",
        description: "New subtask has been added successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add subtask",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Change assignee mutation
  const changeAssigneeMutation = useMutation({
    mutationFn: async (newAssigneeId: string) => {
      const res = await apiRequest('PUT', `/api/tasks/${taskId}`, {
        assigneeId: newAssigneeId
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      setIsChangeAssigneeDialogOpen(false);
      toast({
        title: "Assignee changed",
        description: "Task assignee has been updated successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to change assignee",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/tasks/${taskId}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsDeleteConfirmOpen(false);
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully."
      });
      setLocation("/tasks");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      // Assuming the user is authenticated and we have a userId
      const userId = "1"; // This should be the current user's ID
      
      const newComment = {
        text,
        entityType: "task",
        entityId: taskId,
        userId
      };
      
      const res = await apiRequest('POST', '/api/comments', newComment);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/comments?entityType=task&entityId=${taskId}`] });
      setCommentText("");
      setIsAddCommentDialogOpen(false);
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Toggle checklist item
  const toggleChecklistItem = (itemId: string) => {
    if (!task) return;
    
    const updatedItems = task.checklist.items.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    const completedCount = updatedItems.filter(item => item.completed).length;
    const updatedChecklist = {
      ...task.checklist,
      items: updatedItems,
      completed: completedCount
    };
    
    const progress = Math.round((completedCount / task.checklist.total) * 100);
    
    updateTaskMutation.mutate({
      checklist: updatedChecklist,
      progress
    });
  };

  // Handle adding a subtask
  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) {
      toast({
        title: "Subtask text cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    addSubtaskMutation.mutate(newSubtaskText);
  };

  // Handle changing assignee
  const handleChangeAssignee = () => {
    if (!selectedAssignee) {
      toast({
        title: "No assignee selected",
        variant: "destructive",
      });
      return;
    }
    
    changeAssigneeMutation.mutate(selectedAssignee.id);
  };

  // Handle deleting task
  const handleDeleteTask = () => {
    deleteTaskMutation.mutate();
  };

  // Handle adding a comment
  const handleAddComment = () => {
    if (!commentText.trim()) {
      toast({
        title: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    addCommentMutation.mutate(commentText);
  };

  // Handle editing task
  const handleEditTask = () => {
    updateTaskMutation.mutate(editTask);
  };

  // Helper to get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case "TODO": return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "IN_REVIEW": return "bg-purple-100 text-purple-800";
      case "DONE": return "bg-green-100 text-green-800";
      case "BLOCKED": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Helper to get priority badge color
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "LOW": return "bg-green-100 text-green-800";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "HIGH": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { days: Math.abs(diffDays), text: "overdue", color: "text-red-600" };
    } else if (diffDays === 0) {
      return { days: 0, text: "due today", color: "text-yellow-600" };
    } else {
      return { days: diffDays, text: "remaining", color: "text-gray-600" };
    }
  };

  // Format date string
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };
  
  // Get avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", 
      "bg-pink-500", "bg-yellow-500", "bg-indigo-500"
    ];
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Loading state
  if (isLoadingTask) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading task details...</p>
      </div>
    );
  }

  // Error state
  if (taskError || !task) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Task Not Found</h2>
        <p className="text-gray-600 mb-6">
          We couldn't find the task you're looking for.
        </p>
        <Button onClick={() => setLocation("/tasks")}>Back to Tasks</Button>
      </div>
    );
  }

  const daysInfo = task.dueDate ? getDaysRemaining(task.dueDate) : { days: 0, text: "", color: "" };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Back button and title */}
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => setLocation("/tasks")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
        
        <h1 className="text-2xl font-bold flex-1">{task.title}</h1>
        
        <Button 
          variant="secondary"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <EditIcon className="h-4 w-4 mr-2" />
          Edit Task
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main info panel */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <Card className="shadow-sm border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h2 className="text-md sm:text-lg font-semibold mb-2">Description</h2>
                  <p className="text-gray-700 text-sm sm:text-base">{task.description}</p>
                </div>
                
                {task.tags && task.tags.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          <Tag className="h-3.5 w-3.5 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h2 className="text-lg font-semibold mb-2">Progress</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{task.checklist?.completed || 0} of {task.checklist?.total || 0} subtasks completed</span>
                      <span>{task.progress || 0}%</span>
                    </div>
                    <Progress value={task.progress || 0} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="checklist" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="checklist" className="text-xs sm:text-sm">
                <CheckSquare className="h-3.5 w-3.5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Checklist</span>
                <span className="xs:hidden">Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="comments" className="text-xs sm:text-sm">
                <MessageSquare className="h-3.5 w-3.5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Comments</span>
                <span className="xs:hidden">Chat</span> 
                <span className="text-xs">({comments.length})</span>
              </TabsTrigger>
              <TabsTrigger value="timetracking" className="text-xs sm:text-sm">
                <Timer className="h-3.5 w-3.5 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Time Tracking</span>
                <span className="xs:hidden">Time</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="checklist" className="mt-3 sm:mt-4">
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm sm:text-base">Subtasks</CardTitle>
                    <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3" onClick={() => setIsAddSubtaskDialogOpen(true)}>
                      <PlusIcon className="h-3.5 w-3.5 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">Add</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-4 sm:px-6">
                  {task.checklist && task.checklist.items.length > 0 ? (
                    <div className="space-y-4">
                      {task.checklist.items.map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox 
                            id={`checklist-${item.id}`} 
                            checked={item.completed}
                            onCheckedChange={() => toggleChecklistItem(item.id)}
                          />
                          <label 
                            htmlFor={`checklist-${item.id}`}
                            className={`text-sm leading-tight ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}
                          >
                            {item.text}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No subtasks yet. Add a subtask to get started!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="comments" className="mt-3 sm:mt-4">
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm sm:text-base">Discussion</CardTitle>
                    <Button 
                      size="sm" 
                      className="h-8 px-2 sm:px-3"
                      onClick={() => setIsAddCommentDialogOpen(true)}
                    >
                      <PlusIcon className="h-3.5 w-3.5 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">Comment</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-4 sm:px-6">
                  {comments.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No comments yet. Start the discussion!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <Avatar className={getAvatarColor(comment.userId)}>
                            <AvatarFallback className="text-white">
                              {comment.userId.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium">User {comment.userId}</span>
                              <span className="text-gray-500 text-xs ml-2">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 mt-1 text-sm">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="timetracking" className="mt-3 sm:mt-4">
              {taskId && (
                <>
                  <TimeEntryForm taskId={taskId} />
                  <Card className="shadow-sm border-0 mt-4">
                    <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
                      <CardTitle className="text-sm sm:text-base">Time Entries</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                      {taskId && <TimeEntryList taskId={taskId} limit={5} />}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-4 lg:space-y-6">
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm sm:text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(task.status)}`}
                  >
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Priority</h3>
                  <Badge 
                    variant="outline" 
                    className={`${getPriorityColor(task.priority)}`}
                  >
                    {task.priority}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Assignee</h3>
                  {assignee ? (
                    <div className="flex items-center space-x-2">
                      <Avatar className={getAvatarColor(`${assignee.firstName} ${assignee.lastName}`)}>
                        <AvatarFallback className="text-white">
                          {getInitials(`${assignee.firstName} ${assignee.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{assignee.firstName} {assignee.lastName}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Unassigned</span>
                  )}
                </div>
                
                {project && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Project</h3>
                    <div 
                      className="flex items-center space-x-2 text-primary cursor-pointer"
                      onClick={() => setLocation(`/projects/${project.id}`)}
                    >
                      <Briefcase className="h-4 w-4" />
                      <span>{project.name}</span>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                {task.dueDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                    <p className={`text-sm mt-1 ${daysInfo.color}`}>
                      {daysInfo.days} days {daysInfo.text}
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{formatDate(task.createdAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm sm:text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:grid-cols-1">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link copied",
                      description: "Task link copied to clipboard.",
                    });
                  }}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Copy Task Link
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => setIsChangeAssigneeDialogOpen(true)}
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Change Assignee
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to the task. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editTask.title || ""}
                onChange={(e) => setEditTask({...editTask, title: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editTask.description || ""}
                onChange={(e) => setEditTask({...editTask, description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={editTask.status || ""}
                  onChange={(e) => setEditTask({...editTask, status: e.target.value})}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">Review</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={editTask.priority || ""}
                  onChange={(e) => setEditTask({...editTask, priority: e.target.value})}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={editTask.dueDate?.split('T')[0] || ""}
                  onChange={(e) => setEditTask({...editTask, dueDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignee">Assignee</Label>
                <select
                  id="assignee"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={editTask.assigneeId || ""}
                  onChange={(e) => setEditTask({...editTask, assigneeId: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {allUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {task.tags && (
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={Array.isArray(task.tags) ? task.tags.join(", ") : ""}
                  onChange={(e) => {
                    const tagArray = e.target.value
                      .split(",")
                      .map(tag => tag.trim())
                      .filter(tag => tag.length > 0);
                    setEditTask({...editTask, tags: tagArray});
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
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
      
      {/* Add Comment Dialog */}
      <Dialog open={isAddCommentDialogOpen} onOpenChange={setIsAddCommentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>
              Add your comment to this task.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                placeholder="Write your comment here..."
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCommentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddComment}
              disabled={addCommentMutation.isPending}
            >
              {addCommentMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Subtask Dialog */}
      <Dialog open={isAddSubtaskDialogOpen} onOpenChange={setIsAddSubtaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Subtask</DialogTitle>
            <DialogDescription>
              Add a new subtask to this task.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subtaskText">Subtask Description</Label>
              <Input
                id="subtaskText"
                placeholder="What needs to be done?"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSubtaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddSubtask}
              disabled={addSubtaskMutation.isPending}
            >
              {addSubtaskMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Subtask
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Change Assignee Dialog */}
      <Dialog open={isChangeAssigneeDialogOpen} onOpenChange={setIsChangeAssigneeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Change Assignee</DialogTitle>
            <DialogDescription>
              Select a new assignee for this task.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="assigneeSelect">Assignee</Label>
              <select
                id="assigneeSelect"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue={task.assigneeId || ""}
                onChange={(e) => {
                  const user = allUsers.find(u => u.id === e.target.value);
                  setSelectedAssignee(user || null);
                }}
              >
                <option value="">Unassigned</option>
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeAssigneeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleChangeAssignee}
              disabled={changeAssigneeMutation.isPending}
            >
              {changeAssigneeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Task Confirmation */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTask} 
              className="bg-destructive text-destructive-foreground"
              disabled={deleteTaskMutation.isPending}
            >
              {deleteTaskMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}