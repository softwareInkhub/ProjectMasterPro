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
  User,
  MessageSquare,
  CheckSquare,
  Tag,
  Briefcase,
  Clipboard,
  Trash2,
  Copy,
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
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

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
  const [selectedAssignee, setSelectedAssignee] = useState<{id: string, name: string, avatar: string} | null>(null);
  const [taskData, setTaskData] = useState<any | null>(null);

  // Sample users for assignee dropdown
  const users = [
    { id: "5", name: "Alice Chen", avatar: "AC" },
    { id: "8", name: "Bob Jackson", avatar: "BJ" },
    { id: "12", name: "Charlie Martinez", avatar: "CM" },
    { id: "21", name: "Eric Thompson", avatar: "ET" },
    { id: "24", name: "Fiona Rodriguez", avatar: "FR" }
  ];

  // Find task based on ID
  // In a real application, this would be fetched from an API
  const tasks = [
    {
      id: "1",
      title: "Design new homepage layout",
      description: "Create a modern and responsive design for the company homepage",
      status: "In Progress",
      priority: "High",
      projectId: "1",
      projectName: "Website Redesign",
      assigneeId: "5",
      assigneeName: "Alice Chen",
      assigneeAvatar: "AC",
      dueDate: "2023-12-10",
      progress: 60,
      tags: ["design", "frontend"],
      createdAt: "2023-09-05",
      comments: [
        {
          id: "1",
          author: "Bob Jackson",
          authorAvatar: "BJ",
          date: "2023-09-06",
          text: "I've added some wireframe mockups to the shared drive. Let me know what you think."
        },
        {
          id: "2",
          author: "Alice Chen",
          authorAvatar: "AC",
          date: "2023-09-07",
          text: "Thanks Bob, I'll review them today and provide feedback."
        }
      ],
      checklist: {
        total: 6,
        completed: 4,
        items: [
          { id: "1", text: "Research competitor websites", completed: true },
          { id: "2", text: "Create wireframes", completed: true },
          { id: "3", text: "Get initial feedback", completed: true },
          { id: "4", text: "Design high-fidelity mockups", completed: true },
          { id: "5", text: "Implement responsive design", completed: false },
          { id: "6", text: "Final review and approval", completed: false }
        ]
      }
    },
    {
      id: "2",
      title: "Implement user authentication",
      description: "Add login, registration, and password reset functionality",
      status: "To Do",
      priority: "High",
      projectId: "1",
      projectName: "Website Redesign",
      assigneeId: "8",
      assigneeName: "Bob Jackson",
      assigneeAvatar: "BJ",
      dueDate: "2023-12-15",
      progress: 0,
      tags: ["backend", "security"],
      createdAt: "2023-09-06",
      comments: [
        {
          id: "1",
          author: "Charlie Martinez",
          authorAvatar: "CM",
          date: "2023-09-08",
          text: "Should we use JWT or session-based authentication?"
        }
      ],
      checklist: {
        total: 5,
        completed: 0,
        items: [
          { id: "1", text: "Design authentication flow", completed: false },
          { id: "2", text: "Implement login functionality", completed: false },
          { id: "3", text: "Implement registration", completed: false },
          { id: "4", text: "Add password reset", completed: false },
          { id: "5", text: "Security testing", completed: false }
        ]
      }
    },
    {
      id: "3",
      title: "Optimize database queries",
      description: "Improve performance of slow database operations",
      status: "In Progress",
      priority: "Medium",
      projectId: "2",
      projectName: "CRM Integration",
      assigneeId: "8",
      assigneeName: "Bob Jackson",
      assigneeAvatar: "BJ",
      dueDate: "2023-11-30",
      progress: 40,
      tags: ["backend", "database", "performance"],
      createdAt: "2023-10-18",
      comments: [],
      checklist: {
        total: 4,
        completed: 2,
        items: [
          { id: "1", text: "Identify slow queries", completed: true },
          { id: "2", text: "Profile database performance", completed: true },
          { id: "3", text: "Optimize identified queries", completed: false },
          { id: "4", text: "Test optimized performance", completed: false }
        ]
      }
    },
    {
      id: "4",
      title: "Create API documentation",
      description: "Generate comprehensive API docs using Swagger/OpenAPI",
      status: "Completed",
      priority: "Medium",
      projectId: "2",
      projectName: "CRM Integration",
      assigneeId: "12",
      assigneeName: "Charlie Martinez",
      assigneeAvatar: "CM",
      dueDate: "2023-11-20",
      progress: 100,
      tags: ["documentation", "api"],
      createdAt: "2023-10-25",
      comments: [],
      checklist: {
        total: 3,
        completed: 3,
        items: [
          { id: "1", text: "Document all endpoints", completed: true },
          { id: "2", text: "Add request/response examples", completed: true },
          { id: "3", text: "Publish documentation", completed: true }
        ]
      }
    },
    {
      id: "5",
      title: "Design social media assets",
      description: "Create graphics for the Q4 marketing campaign",
      status: "Review",
      priority: "High",
      projectId: "3",
      projectName: "Q4 Marketing Campaign",
      assigneeId: "21",
      assigneeName: "Eric Thompson",
      assigneeAvatar: "ET",
      dueDate: "2023-11-28",
      progress: 90,
      tags: ["design", "marketing"],
      createdAt: "2023-11-10",
      comments: [],
      checklist: {
        total: 8,
        completed: 7,
        items: [
          { id: "1", text: "Design Facebook banner", completed: true },
          { id: "2", text: "Design Twitter header", completed: true },
          { id: "3", text: "Create Instagram posts", completed: true },
          { id: "4", text: "Design LinkedIn graphics", completed: true },
          { id: "5", text: "Create email newsletter template", completed: true },
          { id: "6", text: "Design promotional banners", completed: true },
          { id: "7", text: "Create animated social media ads", completed: true },
          { id: "8", text: "Final review and approval", completed: false }
        ]
      }
    },
    {
      id: "6",
      title: "Setup CI/CD pipeline",
      description: "Configure automated testing and deployment pipeline",
      status: "On Hold",
      priority: "Medium",
      projectId: "4",
      projectName: "Infrastructure Migration",
      assigneeId: "12",
      assigneeName: "Charlie Martinez",
      assigneeAvatar: "CM",
      dueDate: "2023-10-30",
      progress: 30,
      tags: ["devops", "automation"],
      createdAt: "2023-09-20",
      comments: [],
      checklist: {
        total: 7,
        completed: 2,
        items: [
          { id: "1", text: "Choose CI/CD platform", completed: true },
          { id: "2", text: "Set up basic pipeline", completed: true },
          { id: "3", text: "Configure automated tests", completed: false },
          { id: "4", text: "Set up staging environment", completed: false },
          { id: "5", text: "Configure deployment to staging", completed: false },
          { id: "6", text: "Set up production deployment", completed: false },
          { id: "7", text: "Document the pipeline", completed: false }
        ]
      }
    },
    {
      id: "7",
      title: "Research mobile frameworks",
      description: "Evaluate React Native, Flutter and native options",
      status: "Completed",
      priority: "Low",
      projectId: "5",
      projectName: "Mobile App Development",
      assigneeId: "5",
      assigneeName: "Alice Chen",
      assigneeAvatar: "AC",
      dueDate: "2023-12-05",
      progress: 100,
      tags: ["research", "mobile"],
      createdAt: "2023-11-15",
      comments: [],
      checklist: {
        total: 4,
        completed: 4,
        items: [
          { id: "1", text: "Research React Native", completed: true },
          { id: "2", text: "Research Flutter", completed: true },
          { id: "3", text: "Research native options", completed: true },
          { id: "4", text: "Prepare comparison report", completed: true }
        ]
      }
    },
    {
      id: "8",
      title: "Update logo on all platforms",
      description: "Implement new logo across website, social media, and documents",
      status: "Completed",
      priority: "High",
      projectId: "6",
      projectName: "Brand Refresh",
      assigneeId: "24",
      assigneeName: "Fiona Rodriguez",
      assigneeAvatar: "FR",
      dueDate: "2023-10-10",
      progress: 100,
      tags: ["branding", "design"],
      createdAt: "2023-09-25",
      comments: [],
      checklist: {
        total: 10,
        completed: 10,
        items: [
          { id: "1", text: "Update website logo", completed: true },
          { id: "2", text: "Update Facebook page", completed: true },
          { id: "3", text: "Update Twitter profile", completed: true },
          { id: "4", text: "Update LinkedIn page", completed: true },
          { id: "5", text: "Update email templates", completed: true },
          { id: "6", text: "Update business cards", completed: true },
          { id: "7", text: "Update letterhead", completed: true },
          { id: "8", text: "Update presentation templates", completed: true },
          { id: "9", text: "Update product packaging", completed: true },
          { id: "10", text: "Update documentation", completed: true }
        ]
      }
    }
  ];
  
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
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
  
  // Calculate days remaining
  const getDaysRemaining = () => {
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { days: Math.abs(diffDays), text: "overdue", color: "text-red-600" };
    } else if (diffDays === 0) {
      return { days: 0, text: "due today", color: "text-yellow-600" };
    } else {
      return { days: diffDays, text: "remaining", color: "text-gray-600" };
    }
  };
  
  const daysInfo = getDaysRemaining();
  
  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };
  
  // Helper to get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case "To Do": return "bg-gray-100 text-gray-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Review": return "bg-purple-100 text-purple-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "On Hold": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Helper to get priority badge color
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get avatar color based on name
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
  
  // Handle checklist item toggle
  const toggleChecklistItem = (itemId: string) => {
    // In a real app, this would call an API to update the task
    const updatedTask = { ...task };
    const item = updatedTask.checklist.items.find(item => item.id === itemId);
    
    if (item) {
      item.completed = !item.completed;
      
      // Update completed count
      updatedTask.checklist.completed = updatedTask.checklist.items.filter(item => item.completed).length;
      
      // Update progress percentage
      updatedTask.progress = Math.round((updatedTask.checklist.completed / updatedTask.checklist.total) * 100);
    }
    
    console.log(`Toggle checklist item ${itemId}`);
    toast({
      title: "Checklist updated",
      description: "Changes would be saved to the server in a real app.",
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
    
    // In a real app, this would call an API to add the subtask
    console.log(`Add subtask: ${newSubtaskText}`);
    toast({
      title: "Subtask added",
      description: "Your subtask would be saved in a real app.",
    });
    
    setNewSubtaskText("");
    setIsAddSubtaskDialogOpen(false);
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
    
    // In a real app, this would call an API to update the assignee
    console.log(`Change assignee to: ${selectedAssignee.name}`);
    toast({
      title: "Assignee updated",
      description: `Task assigned to ${selectedAssignee.name}.`,
    });
    
    setIsChangeAssigneeDialogOpen(false);
  };
  
  // Handle deleting task
  const handleDeleteTask = () => {
    // In a real app, this would call an API to delete the task
    console.log(`Delete task: ${task.id}`);
    toast({
      title: "Task deleted",
      description: "The task has been deleted.",
    });
    
    setIsDeleteConfirmOpen(false);
    setLocation("/tasks");
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
    
    // In a real app, this would call an API to add the comment
    console.log(`Add comment: ${commentText}`);
    toast({
      title: "Comment added",
      description: "Your comment would be saved in a real app.",
    });
    
    setCommentText("");
    setIsAddCommentDialogOpen(false);
  };
  
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main info panel */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-gray-700">{task.description}</p>
                </div>
                
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
                
                <div>
                  <h2 className="text-lg font-semibold mb-2">Progress</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{task.checklist.completed} of {task.checklist.total} subtasks completed</span>
                      <span>{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="checklist" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="checklist">
                <CheckSquare className="h-4 w-4 mr-2" />
                Checklist
              </TabsTrigger>
              <TabsTrigger value="comments">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments ({task.comments.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="checklist" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Subtasks</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsAddSubtaskDialogOpen(true)}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
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
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="comments" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Discussion</CardTitle>
                    <Button onClick={() => setIsAddCommentDialogOpen(true)}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Comment
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {task.comments.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No comments yet. Start the discussion!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {task.comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <Avatar className={getAvatarColor(comment.author)}>
                            <AvatarFallback className="text-white">{comment.authorAvatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium">{comment.author}</span>
                              <span className="text-gray-500 text-xs ml-2">
                                {formatDate(comment.date)}
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
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(task.status)}`}
                  >
                    {task.status}
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
                  <div className="flex items-center space-x-2">
                    <Avatar className={getAvatarColor(task.assigneeName)}>
                      <AvatarFallback className="text-white">{task.assigneeAvatar}</AvatarFallback>
                    </Avatar>
                    <span>{task.assigneeName}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Project</h3>
                  <div 
                    className="flex items-center space-x-2 text-primary cursor-pointer"
                    onClick={() => setLocation(`/projects/${task.projectId}`)}
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>{task.projectName}</span>
                  </div>
                </div>
                
                <Separator />
                
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
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
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
                  <User className="h-4 w-4 mr-2" />
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
                defaultValue={task.title}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                defaultValue={task.description}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  defaultValue={task.status}
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Review</option>
                  <option>On Hold</option>
                  <option>Completed</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  defaultValue={task.priority}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  defaultValue={task.dueDate}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignee">Assignee</Label>
                <select
                  id="assignee"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  defaultValue={task.assigneeId}
                >
                  <option value="5">Alice Chen</option>
                  <option value="8">Bob Jackson</option>
                  <option value="12">Charlie Martinez</option>
                  <option value="21">Eric Thompson</option>
                  <option value="24">Fiona Rodriguez</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                defaultValue={task.tags.join(", ")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Task updated",
                description: "Changes would be saved to the server in a real app.",
              });
              setIsEditDialogOpen(false);
            }}>
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
            <Button onClick={handleAddComment}>
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
            <Button onClick={handleAddSubtask}>
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
                defaultValue={task.assigneeId}
                onChange={(e) => {
                  const user = users.find(u => u.id === e.target.value);
                  setSelectedAssignee(user || null);
                }}
              >
                <option value="" disabled>Select an assignee</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeAssigneeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeAssignee}>
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
            <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}