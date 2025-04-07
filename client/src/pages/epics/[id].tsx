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
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeftIcon,
  CalendarIcon,
  UsersIcon,
  BookOpenIcon,
  CheckSquareIcon,
  ClockIcon,
  MessageSquareIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  ClipboardListIcon
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function EpicDetailPage() {
  const [, params] = useRoute("/epics/:id");
  const [, setLocation] = useLocation();
  const epicId = params?.id;
  
  // State for dialog modals
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isAddStoryDialogOpen, setIsAddStoryDialogOpen] = useState(false);
  
  // Epic data - this would come from an API call in the real application
  const [epic, setEpic] = useState({
    id: 1,
    name: "User Authentication System",
    description: "Implement secure user authentication and authorization functionality including login, registration, password reset, and role-based access control. This will provide a foundation for all user-related features in the application.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    projectId: 1,
    projectName: "Website Redesign",
    startDate: "2023-09-15",
    endDate: "2023-12-01",
    progress: 40,
    createdAt: "2023-09-01",
    updatedAt: "2023-10-25",
    storyCount: 12,
    completedStories: 5,
    assignees: [
      { id: 5, name: "Alice Chen", avatar: "AC" },
      { id: 8, name: "Bob Jackson", avatar: "BJ" }
    ],
    comments: [
      { 
        id: 1, 
        content: "We should focus on security best practices for this epic.", 
        createdAt: "2023-09-20",
        user: { id: 5, name: "Alice Chen", avatar: "AC" }
      },
      { 
        id: 2, 
        content: "I've added the OAuth integration requirements to the stories.", 
        createdAt: "2023-10-05",
        user: { id: 8, name: "Bob Jackson", avatar: "BJ" }
      }
    ]
  });
  
  // Sample stories data - this would come from an API in the real application
  const [stories, setStories] = useState([
    {
      id: 101,
      name: "User Registration",
      description: "Implement user registration with email confirmation",
      status: "DONE",
      priority: "HIGH",
      storyPoints: "8",
      assignee: { id: 5, name: "Alice Chen", avatar: "AC" },
      startDate: "2023-09-18",
      dueDate: "2023-09-30",
      createdAt: "2023-09-15",
      updatedAt: "2023-09-30",
      taskCount: 5,
      completedTasks: 5
    },
    {
      id: 102,
      name: "User Login",
      description: "Implement secure login with JWT authentication",
      status: "DONE",
      priority: "HIGH",
      storyPoints: "5",
      assignee: { id: 5, name: "Alice Chen", avatar: "AC" },
      startDate: "2023-10-01",
      dueDate: "2023-10-10",
      createdAt: "2023-09-15",
      updatedAt: "2023-10-10",
      taskCount: 4,
      completedTasks: 4
    },
    {
      id: 103,
      name: "Password Reset",
      description: "Implement password reset functionality with email notifications",
      status: "DONE",
      priority: "MEDIUM",
      storyPoints: "5",
      assignee: { id: 8, name: "Bob Jackson", avatar: "BJ" },
      startDate: "2023-10-11",
      dueDate: "2023-10-20",
      createdAt: "2023-09-15",
      updatedAt: "2023-10-20",
      taskCount: 3,
      completedTasks: 3
    },
    {
      id: 104,
      name: "User Profile Management",
      description: "Allow users to view and edit their profile information",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      storyPoints: "5",
      assignee: { id: 5, name: "Alice Chen", avatar: "AC" },
      startDate: "2023-10-21",
      dueDate: "2023-10-30",
      createdAt: "2023-09-15",
      updatedAt: "2023-10-25",
      taskCount: 4,
      completedTasks: 2
    },
    {
      id: 105,
      name: "Role-Based Authorization",
      description: "Implement role-based access control for different user types",
      status: "IN_PROGRESS",
      priority: "HIGH",
      storyPoints: "13",
      assignee: { id: 8, name: "Bob Jackson", avatar: "BJ" },
      startDate: "2023-10-21",
      dueDate: "2023-11-10",
      createdAt: "2023-09-15",
      updatedAt: "2023-10-25",
      taskCount: 7,
      completedTasks: 3
    },
    {
      id: 106,
      name: "OAuth Integration",
      description: "Add support for Google and GitHub authentication",
      status: "BACKLOG",
      priority: "MEDIUM",
      storyPoints: "8",
      assignee: null,
      startDate: "2023-11-11",
      dueDate: "2023-11-25",
      createdAt: "2023-09-15",
      updatedAt: "2023-10-05",
      taskCount: 5,
      completedTasks: 0
    }
  ]);
  
  // Edit form state
  const [editEpic, setEditEpic] = useState({
    name: "",
    description: "",
    status: "",
    priority: "",
    projectId: "",
    startDate: "",
    endDate: ""
  });
  
  // New story form state
  const [newStory, setNewStory] = useState({
    name: "",
    description: "",
    status: "BACKLOG",
    priority: "MEDIUM",
    storyPoints: "",
    assigneeId: "",
    startDate: "",
    dueDate: ""
  });
  
  // Load epic data when component mounts or epicId changes
  useEffect(() => {
    // In a real application, this would be an API call
    // For now, we're using the static data above
    if (epicId) {
      // Setup edit form with current epic data
      setEditEpic({
        name: epic.name,
        description: epic.description,
        status: epic.status,
        priority: epic.priority,
        projectId: epic.projectId.toString(),
        startDate: epic.startDate,
        endDate: epic.endDate
      });
    }
  }, [epicId, epic]);
  
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
      case "BACKLOG": return "bg-gray-100 text-gray-800";
      case "READY": return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "IN_REVIEW": return "bg-purple-100 text-purple-800";
      case "DONE": return "bg-green-100 text-green-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
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
  
  // Handle editing the epic
  const handleEditEpic = () => {
    // API call would go here
    console.log("Updating epic:", editEpic);
    
    // Update local state for demo purposes
    setEpic({
      ...epic,
      name: editEpic.name,
      description: editEpic.description,
      status: editEpic.status,
      priority: editEpic.priority,
      projectId: parseInt(editEpic.projectId),
      startDate: editEpic.startDate,
      endDate: editEpic.endDate,
      updatedAt: new Date().toISOString().substring(0, 10)
    });
    
    setIsEditDialogOpen(false);
  };
  
  // Handle deleting the epic
  const handleDeleteEpic = () => {
    // API call would go here
    console.log("Deleting epic:", epicId);
    setIsConfirmDeleteOpen(false);
    // Navigate back to epics list
    setLocation("/epics");
  };
  
  // Handle creating a new story
  const handleAddStory = () => {
    // API call would go here
    console.log("Creating new story:", newStory);
    
    // Update local state for demo purposes
    const newStoryObject = {
      id: Math.max(...stories.map(s => s.id)) + 1,
      name: newStory.name,
      description: newStory.description,
      status: newStory.status,
      priority: newStory.priority,
      storyPoints: newStory.storyPoints,
      assignee: newStory.assigneeId ? { id: parseInt(newStory.assigneeId), name: "New Assignee", avatar: "NA" } : null,
      startDate: newStory.startDate,
      dueDate: newStory.dueDate,
      createdAt: new Date().toISOString().substring(0, 10),
      updatedAt: new Date().toISOString().substring(0, 10),
      taskCount: 0,
      completedTasks: 0
    };
    
    setStories([...stories, newStoryObject]);
    setIsAddStoryDialogOpen(false);
    
    // Reset form
    setNewStory({
      name: "",
      description: "",
      status: "BACKLOG",
      priority: "MEDIUM",
      storyPoints: "",
      assigneeId: "",
      startDate: "",
      dueDate: ""
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
            onClick={() => setLocation("/epics")}
            className="mr-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Epics
          </Button>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{epic.name}</h1>
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-1 ${getStatusColor(epic.status)}`}
              >
                {epic.status === "IN_PROGRESS" ? "In Progress" : epic.status === "BACKLOG" ? "Backlog" : "Completed"}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-1 ${getPriorityColor(epic.priority)}`}
              >
                {epic.priority}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">
              <span 
                className="font-medium cursor-pointer hover:text-primary-600"
                onClick={() => setLocation(`/projects/${epic.projectId}`)}
              >
                {epic.projectName}
              </span>
            </p>
            <p className="text-gray-600 mt-1">{epic.description}</p>
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
      
      {/* Epic details */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Progress card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Epic completion</span>
                <span>{epic.progress}%</span>
              </div>
              <Progress value={epic.progress} className="h-2 mb-4" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-4xl font-bold">{epic.storyCount}</div>
                <div className="text-sm text-gray-600">Stories</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-4xl font-bold">{epic.completedStories}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-4xl font-bold">{epic.storyCount - epic.completedStories}</div>
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
                  <div className="font-medium">{formatDate(epic.startDate)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">End Date</div>
                  <div className="font-medium">{formatDate(epic.endDate)}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Assignees</div>
                <div className="flex mt-1 gap-1">
                  {epic.assignees.map(assignee => (
                    <div
                      key={assignee.id}
                      title={assignee.name}
                      className={`flex-shrink-0 h-8 w-8 rounded-full ${getAvatarColor(assignee.name)} flex items-center justify-center text-white font-medium text-sm`}
                    >
                      {assignee.avatar}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Created</div>
                  <div className="font-medium">{formatDate(epic.createdAt)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Updated</div>
                  <div className="font-medium">{formatDate(epic.updatedAt)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for Stories and Comments */}
      <Tabs defaultValue="stories" className="mt-6">
        <TabsList>
          <TabsTrigger value="stories" className="flex items-center">
            <BookOpenIcon className="h-4 w-4 mr-2" />
            Stories
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center">
            <MessageSquareIcon className="h-4 w-4 mr-2" />
            Comments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stories" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">User Stories</h2>
            <Button onClick={() => setIsAddStoryDialogOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Story
            </Button>
          </div>
          
          {stories.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No stories found for this epic.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {stories.map((story) => (
                <Card 
                  key={story.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setLocation(`/stories/${story.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className={`text-lg font-bold text-gray-900 ${story.status === "DONE" ? "line-through" : ""}`}>
                              {story.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{story.description}</p>
                          </div>
                          <div className="flex gap-2">
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
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                          {story.storyPoints && (
                            <div className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                              {story.storyPoints} points
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{formatDate(story.startDate)} - {formatDate(story.dueDate)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <ClipboardListIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{story.completedTasks}/{story.taskCount} tasks</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end">
                        {story.assignee ? (
                          <div className="flex items-center gap-2">
                            <div 
                              title={story.assignee.name}
                              className={`flex-shrink-0 h-8 w-8 rounded-full ${getAvatarColor(story.assignee.name)} flex items-center justify-center text-white font-medium text-sm`}
                            >
                              {story.assignee.avatar}
                            </div>
                            <div className="text-sm">{story.assignee.name}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Unassigned</div>
                        )}
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
            
            {epic.comments.map((comment) => (
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
      
      {/* Edit Epic Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Epic</DialogTitle>
            <DialogDescription>
              Update epic details and track progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Epic Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter epic name"
                value={editEpic.name}
                onChange={(e) => setEditEpic({...editEpic, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter epic description"
                rows={4}
                value={editEpic.description}
                onChange={(e) => setEditEpic({...editEpic, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-project">Project</Label>
                <Select 
                  value={editEpic.projectId}
                  onValueChange={(value) => setEditEpic({...editEpic, projectId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Website Redesign</SelectItem>
                    <SelectItem value="2">CRM Integration</SelectItem>
                    <SelectItem value="3">Q4 Marketing Campaign</SelectItem>
                    <SelectItem value="4">Infrastructure Migration</SelectItem>
                    <SelectItem value="5">Mobile App Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editEpic.status}
                  onValueChange={(value) => setEditEpic({...editEpic, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKLOG">Backlog</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select 
                  value={editEpic.priority}
                  onValueChange={(value) => setEditEpic({...editEpic, priority: value})}
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
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={editEpic.startDate}
                  onChange={(e) => setEditEpic({...editEpic, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={editEpic.endDate}
                  onChange={(e) => setEditEpic({...editEpic, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEpic}>Update Epic</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this epic? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-red-600">
              Warning: Deleting this epic will also delete all associated stories and tasks.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteEpic}
            >
              Delete Epic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Story Dialog */}
      <Dialog open={isAddStoryDialogOpen} onOpenChange={setIsAddStoryDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Add New Story</DialogTitle>
            <DialogDescription>
              Create a new user story for this epic.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="story-name">Story Name</Label>
              <Input
                id="story-name"
                placeholder="Enter story name"
                value={newStory.name}
                onChange={(e) => setNewStory({...newStory, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="story-description">Description</Label>
              <Textarea
                id="story-description"
                placeholder="Enter story description"
                rows={4}
                value={newStory.description}
                onChange={(e) => setNewStory({...newStory, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="story-status">Status</Label>
                <Select 
                  value={newStory.status}
                  onValueChange={(value) => setNewStory({...newStory, status: value})}
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
              <div className="grid gap-2">
                <Label htmlFor="story-priority">Priority</Label>
                <Select 
                  value={newStory.priority}
                  onValueChange={(value) => setNewStory({...newStory, priority: value})}
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
                <Label htmlFor="story-points">Story Points</Label>
                <Select 
                  value={newStory.storyPoints}
                  onValueChange={(value) => setNewStory({...newStory, storyPoints: value})}
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
              <div className="grid gap-2">
                <Label htmlFor="story-assignee">Assignee</Label>
                <Select 
                  value={newStory.assigneeId}
                  onValueChange={(value) => setNewStory({...newStory, assigneeId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    <SelectItem value="5">Alice Chen</SelectItem>
                    <SelectItem value="8">Bob Jackson</SelectItem>
                    <SelectItem value="12">Charlie Martinez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="story-startDate">Start Date</Label>
                <Input
                  id="story-startDate"
                  type="date"
                  value={newStory.startDate}
                  onChange={(e) => setNewStory({...newStory, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="story-dueDate">Due Date</Label>
                <Input
                  id="story-dueDate"
                  type="date"
                  value={newStory.dueDate}
                  onChange={(e) => setNewStory({...newStory, dueDate: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStory}>Create Story</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}