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
  ClipboardListIcon,
  Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Epic, Story, Project, User, Comment, InsertStory } from "@shared/schema";
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
import { Placeholder } from "@/lib/constants";

export default function EpicDetailPage() {
  const [, params] = useRoute("/epics/:id");
  const [, setLocation] = useLocation();
  const epicId = params?.id;
  const { toast } = useToast();
  
  // State for dialog modals
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isAddStoryDialogOpen, setIsAddStoryDialogOpen] = useState(false);
  
  // State for editing epic
  const [editEpic, setEditEpic] = useState({
    name: "",
    description: "",
    status: "",
    priority: "",
    projectId: "",
    startDate: "",
    endDate: ""
  });
  
  // State for adding a new story
  const [newStory, setNewStory] = useState<Partial<InsertStory>>({
    name: "",
    description: "",
    status: "BACKLOG",
    priority: "MEDIUM",
    epicId: epicId || "",
    assigneeId: "",
    reporterId: "",
    storyPoints: "",
    startDate: "",
    dueDate: ""
  });
  
  // Fetch epic data
  const { 
    data: epic,
    isLoading: isLoadingEpic,
    error: epicError,
    isError: isEpicError
  } = useQuery<Epic>({
    queryKey: ['/api/epics', epicId],
    enabled: !!epicId,
  });
  
  // Fetch project data
  const {
    data: project
  } = useQuery<Project>({
    queryKey: ['/api/projects', epic?.projectId],
    enabled: !!epic?.projectId,
  });
  
  // Fetch stories related to this epic
  const {
    data: stories = [],
    isLoading: isLoadingStories
  } = useQuery<Story[]>({
    queryKey: ['/api/stories'],
    select: (data) => data.filter(story => story.epicId === epicId),
    enabled: !!epicId,
  });
  
  // Fetch users for assignments
  const {
    data: users = []
  } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Fetch projects for dropdown
  const {
    data: projects = []
  } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  // Update epic mutation
  const updateEpicMutation = useMutation({
    mutationFn: async (updatedEpic: any) => {
      const response = await apiRequest('PUT', `/api/epics/${epicId}`, updatedEpic);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/epics', epicId] });
      queryClient.invalidateQueries({ queryKey: ['/api/epics'] });
      toast({
        title: "Epic updated",
        description: "The epic has been updated successfully."
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating epic",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Delete epic mutation
  const deleteEpicMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/epics/${epicId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/epics'] });
      toast({
        title: "Epic deleted",
        description: "The epic has been deleted successfully."
      });
      setIsConfirmDeleteOpen(false);
      setLocation('/epics');
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting epic",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: async (story: InsertStory) => {
      const response = await apiRequest('POST', '/api/stories', story);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      toast({
        title: "Story created",
        description: "New story has been successfully created."
      });
      setIsAddStoryDialogOpen(false);
      setNewStory({
        name: "",
        description: "",
        status: "BACKLOG",
        priority: "MEDIUM",
        epicId: epicId || "",
        assigneeId: "",
        reporterId: "",
        storyPoints: "",
        startDate: "",
        dueDate: ""
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating story",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Update state for edit form when epic data is loaded
  useEffect(() => {
    if (epic) {
      setEditEpic({
        name: epic.name || "",
        description: epic.description || "",
        status: epic.status || "",
        priority: epic.priority || "",
        projectId: epic.projectId || "",
        startDate: epic.startDate ? new Date(epic.startDate).toISOString().split('T')[0] : "",
        endDate: epic.endDate ? new Date(epic.endDate).toISOString().split('T')[0] : ""
      });
    }
  }, [epic]);
  
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
    const formattedEpic = {
      ...editEpic,
      startDate: editEpic.startDate ? new Date(editEpic.startDate).toISOString() : null,
      endDate: editEpic.endDate ? new Date(editEpic.endDate).toISOString() : null
    };
    
    updateEpicMutation.mutate(formattedEpic);
  };
  
  // Handle deleting the epic
  const handleDeleteEpic = () => {
    deleteEpicMutation.mutate();
  };
  
  // Handle creating a new story
  const handleAddStory = () => {
    // Prepare story data, handling nullable fields
    const formattedStory = {
      ...newStory,
      epicId: epicId,
      assigneeId: newStory.assigneeId === Placeholder.UNASSIGNED ? null : newStory.assigneeId,
      reporterId: newStory.reporterId === Placeholder.UNASSIGNED ? null : newStory.reporterId,
      storyPoints: newStory.storyPoints === Placeholder.NOT_ESTIMATED ? null : newStory.storyPoints,
    } as InsertStory;
    
    createStoryMutation.mutate(formattedStory);
  };
  
  // Loading state
  if (isLoadingEpic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading epic details...</span>
      </div>
    );
  }
  
  // Error state
  if (isEpicError || !epic) {
    return (
      <div className="container mx-auto p-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => setLocation("/epics")}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Epics
        </Button>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Epic</h2>
              <p className="mb-4">{(epicError as Error)?.message || "Epic not found or could not be loaded."}</p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/epics', epicId] })}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Calculate metrics
  const completedStories = stories.filter(story => story.status === "DONE").length;
  const totalStories = stories.length;
  const progressPercentage = totalStories > 0 
    ? Math.round((completedStories / totalStories) * 100) 
    : 0;
  
  // Get initials for user avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container mx-auto p-6">
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
            {project && (
              <p className="text-gray-600 mt-1">
                <span 
                  className="font-medium cursor-pointer hover:text-primary-600"
                  onClick={() => setLocation(`/projects/${epic.projectId}`)}
                >
                  {project.name}
                </span>
              </p>
            )}
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
                <span>
                  {typeof epic.progress === 'object' 
                    ? epic.progress.percentage 
                    : (typeof epic.progress === 'string' 
                      ? JSON.parse(epic.progress).percentage 
                      : progressPercentage)}%
                </span>
              </div>
              <Progress 
                value={typeof epic.progress === 'object' 
                  ? epic.progress.percentage 
                  : (typeof epic.progress === 'string' 
                    ? JSON.parse(epic.progress).percentage 
                    : progressPercentage)} 
                className="h-2 mb-4" 
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-4xl font-bold">{totalStories}</div>
                <div className="text-sm text-gray-600">Stories</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-4xl font-bold">{completedStories}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-4xl font-bold">{totalStories - completedStories}</div>
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
                <div className="text-sm text-gray-500">Created</div>
                <div className="font-medium">{formatDate(epic.createdAt)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Updated</div>
                <div className="font-medium">{formatDate(epic.updatedAt)}</div>
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
          
          {isLoadingStories ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2">Loading stories...</span>
            </div>
          ) : stories.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No stories found for this epic.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddStoryDialogOpen(true)}
                  className="mt-4"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Create First Story
                </Button>
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
                            <span className="text-gray-600">
                              {formatDate(story.startDate)} - {formatDate(story.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end">
                        {story.assigneeId && users.find(u => u.id === story.assigneeId) ? (
                          <div className="flex items-center gap-2">
                            <div 
                              className={`flex-shrink-0 h-8 w-8 rounded-full ${getAvatarColor(users.find(u => u.id === story.assigneeId)?.firstName || '')} flex items-center justify-center text-white font-medium text-sm`}
                            >
                              {getInitials(`${users.find(u => u.id === story.assigneeId)?.firstName || ''} ${users.find(u => u.id === story.assigneeId)?.lastName || ''}`)}
                            </div>
                            <div className="text-sm">
                              {users.find(u => u.id === story.assigneeId)?.firstName} {users.find(u => u.id === story.assigneeId)?.lastName}
                            </div>
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
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
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
            <Button onClick={handleEditEpic} disabled={updateEpicMutation.isPending}>
              {updateEpicMutation.isPending ? "Updating..." : "Update Epic"}
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
              disabled={deleteEpicMutation.isPending}
            >
              {deleteEpicMutation.isPending ? "Deleting..." : "Delete Epic"}
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
              <Label htmlFor="story-name">Story Name <span className="text-red-500">*</span></Label>
              <Input
                id="story-name"
                placeholder="Enter story name"
                value={newStory.name}
                onChange={(e) => setNewStory({...newStory, name: e.target.value})}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="story-description">Description</Label>
              <Textarea
                id="story-description"
                placeholder="Enter story description"
                rows={3}
                value={newStory.description}
                onChange={(e) => setNewStory({...newStory, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="story-status">Status <span className="text-red-500">*</span></Label>
                <Select 
                  value={newStory.status || "BACKLOG"}
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
                <Label htmlFor="story-priority">Priority <span className="text-red-500">*</span></Label>
                <Select 
                  value={newStory.priority || "MEDIUM"}
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
                  value={newStory.storyPoints?.toString() || Placeholder.NOT_ESTIMATED}
                  onValueChange={(value) => setNewStory({...newStory, storyPoints: value})}
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
              <div className="grid gap-2">
                <Label htmlFor="story-assignee">Assignee</Label>
                <Select 
                  value={newStory.assigneeId || Placeholder.UNASSIGNED}
                  onValueChange={(value) => setNewStory({...newStory, assigneeId: value})}
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
            <Button 
              onClick={handleAddStory}
              disabled={createStoryMutation.isPending || !newStory.name}
            >
              {createStoryMutation.isPending ? "Creating..." : "Create Story"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}