import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  SortAscIcon, 
  BookOpenIcon,
  BriefcaseIcon,
  CalendarIcon,
  TagIcon,
  ClipboardListIcon,
  MoreHorizontalIcon,
  Trash2Icon,
  ArchiveIcon,
  CopyIcon,
  EditIcon,
  ChevronDownIcon,
  Loader2
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
import { Epic, Project, Story, User, InsertStory } from "@shared/schema";
import { PLACEHOLDER_VALUES } from "@/lib/constants";

export default function StoriesPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);

  // Fetch stories from API
  const { data: stories = [], isLoading: isLoadingStories, error: storiesError } = useQuery({
    queryKey: ['/api/stories'],
    queryFn: getQueryFn()
  });
  
  // Fetch epics for mapping epicId to epicName
  const { data: epics = [] } = useQuery({
    queryKey: ['/api/epics'],
    queryFn: getQueryFn()
  });
  
  // Fetch projects for mapping projectId to projectName
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: getQueryFn()
  });
  
  // Fetch users for mapping assignee/reporter IDs to names
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: getQueryFn()
  });
  
  // Create maps for easy lookups
  const epicMap = new Map<string, Epic>();
  epics.forEach((epic: Epic) => {
    epicMap.set(epic.id, epic);
  });

  const projectMap = new Map<string, string>();
  projects.forEach((project: Project) => {
    projectMap.set(project.id, project.name);
  });
  
  const userMap = new Map<string, User>();
  users.forEach((user: User) => {
    userMap.set(user.id, user);
  });

  // New story form state
  const [newStory, setNewStory] = useState<Partial<InsertStory>>({
    name: "",
    description: "",
    epicId: "",
    status: "BACKLOG",
    priority: "MEDIUM",
    storyPoints: "",
    assigneeId: "",
    reporterId: "",
    startDate: "",
    dueDate: ""
  });

  // Edit story form state
  const [editStory, setEditStory] = useState<Partial<InsertStory> & { id?: string }>({
    id: "",
    name: "",
    description: "",
    epicId: "",
    status: "BACKLOG",
    priority: "MEDIUM",
    storyPoints: "",
    assigneeId: "",
    reporterId: "",
    startDate: "",
    dueDate: ""
  });

  // Create mutation for adding new stories
  const createStoryMutation = useMutation({
    mutationFn: async (story: InsertStory) => {
      const response = await apiRequest('POST', '/api/stories', story);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      toast({
        title: "Story created",
        description: "New story has been successfully created.",
      });
      setIsCreateDialogOpen(false);
      // Reset form
      setNewStory({
        name: "",
        description: "",
        epicId: "",
        status: "BACKLOG",
        priority: "MEDIUM",
        storyPoints: "",
        assigneeId: "",
        reporterId: "",
        startDate: "",
        dueDate: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create story",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update mutation for editing stories
  const updateStoryMutation = useMutation({
    mutationFn: async (story: Partial<InsertStory> & { id: string }) => {
      const { id, ...updateData } = story;
      const response = await apiRequest('PUT', `/api/stories/${id}`, updateData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      toast({
        title: "Story updated",
        description: "Story has been successfully updated.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update story",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation for removing stories
  const deleteStoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/stories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      toast({
        title: "Story deleted",
        description: "Story has been successfully deleted.",
      });
      setSelectedStories([]);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete story",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter stories based on search query and status filter
  const filteredStories = stories.filter((story: Story) => 
    (searchQuery === "" || 
      story.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (story.description && story.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (epicMap.get(story.epicId)?.name.toLowerCase().includes(searchQuery.toLowerCase()))
    ) && 
    (statusFilter === "all" || story.status === statusFilter)
  );

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
      case "BACKLOG": return "bg-gray-100 text-gray-800";
      case "READY": return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "IN_REVIEW": return "bg-purple-100 text-purple-800";
      case "DONE": return "bg-green-100 text-green-800";
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

  // Handle creating a new story
  const handleCreateStory = () => {
    if (!newStory.epicId) {
      toast({
        title: "Missing epic",
        description: "Please select an epic for this story.",
        variant: "destructive",
      });
      return;
    }

    if (!newStory.name) {
      toast({
        title: "Missing name",
        description: "Please provide a name for this story.",
        variant: "destructive",
      });
      return;
    }

    // Convert dates if provided
    const storyToCreate: any = { ...newStory };
    if (storyToCreate.startDate) {
      storyToCreate.startDate = new Date(storyToCreate.startDate).toISOString();
    }
    if (storyToCreate.dueDate) {
      storyToCreate.dueDate = new Date(storyToCreate.dueDate).toISOString();
    }

    createStoryMutation.mutate(storyToCreate as InsertStory);
  };

  // Handle editing a story
  const handleEditStory = () => {
    if (!editStory.id) {
      toast({
        title: "Error",
        description: "Missing story ID for update",
        variant: "destructive",
      });
      return;
    }

    if (!editStory.name) {
      toast({
        title: "Missing name",
        description: "Please provide a name for this story.",
        variant: "destructive",
      });
      return;
    }

    if (!editStory.epicId) {
      toast({
        title: "Missing epic",
        description: "Please select an epic for this story.",
        variant: "destructive",
      });
      return;
    }

    // Convert dates if provided
    const storyToUpdate: any = { ...editStory };
    if (storyToUpdate.startDate) {
      storyToUpdate.startDate = new Date(storyToUpdate.startDate).toISOString();
    }
    if (storyToUpdate.dueDate) {
      storyToUpdate.dueDate = new Date(storyToUpdate.dueDate).toISOString();
    }

    updateStoryMutation.mutate(storyToUpdate as InsertStory & { id: string });
  };

  // Initialize edit form when a story is selected for editing
  const openEditDialog = (story: Story) => {
    setSelectedStory(story);
    
    // Format dates for input fields
    let startDateForInput = '';
    let dueDateForInput = '';
    
    if (story.startDate) {
      const date = new Date(story.startDate);
      startDateForInput = date.toISOString().split('T')[0];
    }
    
    if (story.dueDate) {
      const date = new Date(story.dueDate);
      dueDateForInput = date.toISOString().split('T')[0];
    }
    
    setEditStory({
      id: story.id,
      name: story.name,
      description: story.description || '',
      epicId: story.epicId,
      status: story.status,
      priority: story.priority,
      storyPoints: story.storyPoints || '',
      assigneeId: story.assigneeId || '',
      reporterId: story.reporterId || '',
      startDate: startDateForInput,
      dueDate: dueDateForInput
    });
    
    setIsEditDialogOpen(true);
  };
  
  // Selection handlers
  const handleSelectAll = () => {
    if (selectedStories.length === filteredStories.length) {
      setSelectedStories([]);
    } else {
      setSelectedStories(filteredStories.map((s: Story) => s.id));
    }
  };

  // Batch operations
  const handleDeleteSelected = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedStories.length} story/stories?`)) {
      // Create a promise for each deletion
      const deletePromises = selectedStories.map(id => deleteStoryMutation.mutateAsync(id));
      
      // Execute all deletions in parallel
      Promise.all(deletePromises)
        .then(() => {
          toast({
            title: "Stories deleted",
            description: `${selectedStories.length} story/stories have been successfully deleted.`,
          });
          setSelectedStories([]);
        })
        .catch((error) => {
          toast({
            title: "Failed to delete stories",
            description: error.message,
            variant: "destructive",
          });
        });
    }
  };

  const handleChangeStatusSelected = (status: string) => {
    toast({
      title: "Feature not implemented",
      description: `Changing status of ${selectedStories.length} story/stories to "${status}" is not implemented yet.`,
    });
    setSelectedStories([]);
  };

  // Loading state
  if (isLoadingStories) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading stories...</span>
      </div>
    );
  }

  // Error state
  if (storiesError) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
        <h2 className="text-lg font-semibold mb-2">Error loading stories</h2>
        <p>{(storiesError as Error).message || "Unknown error occurred"}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/stories'] })}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stories</h1>
            <p className="text-gray-600 mt-1">Manage user stories across your projects</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" /> Create Story
          </Button>
        </div>
      </header>
      
      {/* Batch Actions */}
      {selectedStories.length > 0 && (
        <div className="bg-gray-50 border rounded-md p-2 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={selectedStories.length === filteredStories.length}
              onCheckedChange={handleSelectAll}
              className="data-[state=checked]:bg-primary"
            />
            <span className="text-sm font-medium">Selected {selectedStories.length} of {filteredStories.length}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Change Status <span className="ml-1">▼</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleChangeStatusSelected("BACKLOG")}>
                  <div className="h-2 w-2 rounded-full bg-gray-500 mr-2"></div>
                  Backlog
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleChangeStatusSelected("READY")}>
                  <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                  Ready
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
            placeholder="Search stories..."
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
            className={statusFilter === "BACKLOG" ? "bg-gray-100 text-gray-800 hover:bg-gray-200" : ""}
            onClick={() => setStatusFilter("BACKLOG")}
          >
            Backlog
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "READY" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" : ""}
            onClick={() => setStatusFilter("READY")}
          >
            Ready
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
        </div>
      </div>
      
      {/* Stories List */}
      {filteredStories.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No stories found matching your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredStories.map((story: Story) => {
            const epic = epicMap.get(story.epicId);
            const epicProject = epic ? projectMap.get(epic.projectId) : null;
            const assignee = story.assigneeId ? userMap.get(story.assigneeId) : undefined;
            const reporter = story.reporterId ? userMap.get(story.reporterId) : undefined;
            
            return (
              <Card 
                key={story.id} 
                className="hover:shadow-md transition-shadow relative"
                onClick={() => setLocation(`/stories/${story.id}`)}
              >
                {/* Checkbox for selection */}
                <div 
                  className="absolute top-4 left-4 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedStories.includes(story.id)}
                    className="data-[state=checked]:bg-primary border-gray-300"
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStories(prev => [...prev, story.id]);
                      } else {
                        setSelectedStories(prev => prev.filter(id => id !== story.id));
                      }
                    }}
                  />
                </div>
                
                <CardContent className="p-4 pl-12">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{story.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{story.description || "No description provided"}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className={getStatusColor(story.status)}>
                          {story.status === "IN_PROGRESS" ? "In Progress" : 
                           story.status === "IN_REVIEW" ? "In Review" : story.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(story.priority)}>
                          {story.priority}
                        </Badge>
                        {story.storyPoints && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-800">
                            {story.storyPoints} {parseInt(story.storyPoints) === 1 ? "point" : "points"}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <BookOpenIcon className="h-4 w-4 mr-1" />
                          <span>{epic?.name || "Unknown epic"}</span>
                        </div>
                        
                        {epicProject && (
                          <div className="flex items-center">
                            <BriefcaseIcon className="h-4 w-4 mr-1" />
                            <span>{epicProject}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>{story.startDate ? formatDate(story.startDate) : "No start date"} - {story.dueDate ? formatDate(story.dueDate) : "No due date"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 ml-4">
                      {/* Action menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => openEditDialog(story)}>
                            <EditIcon className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this story?")) {
                                deleteStoryMutation.mutate(story.id);
                              }
                            }}
                          >
                            <Trash2Icon className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      {/* Assignee & Reporter */}
                      <div className="flex flex-col gap-2 items-end">
                        {assignee && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Assignee:</span>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${getAvatarColor(assignee.firstName + assignee.lastName)}`}>
                              {getUserInitials(assignee)}
                            </div>
                          </div>
                        )}
                        
                        {reporter && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Reporter:</span>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${getAvatarColor(reporter.firstName + reporter.lastName)}`}>
                              {getUserInitials(reporter)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Create Story Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Story</DialogTitle>
            <DialogDescription>
              Add a new user story to track work items that deliver specific value to users.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Story name"
                className="col-span-3"
                value={newStory.name}
                onChange={(e) => setNewStory({...newStory, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the story"
                className="col-span-3"
                rows={4}
                value={newStory.description}
                onChange={(e) => setNewStory({...newStory, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="epic" className="text-right">
                Epic
              </Label>
              <Select 
                value={newStory.epicId} 
                onValueChange={(value) => setNewStory({...newStory, epicId: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select epic" />
                </SelectTrigger>
                <SelectContent>
                  {epics.map((epic: Epic) => (
                    <SelectItem key={epic.id} value={epic.id}>
                      {epic.name}
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
                value={newStory.status} 
                onValueChange={(value) => setNewStory({...newStory, status: value})}
              >
                <SelectTrigger className="col-span-3">
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select 
                value={newStory.priority} 
                onValueChange={(value) => setNewStory({...newStory, priority: value})}
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
              <Label htmlFor="storyPoints" className="text-right">
                Story Points
              </Label>
              <Input
                id="storyPoints"
                placeholder="e.g., 3, 5, 8"
                className="col-span-3"
                value={newStory.storyPoints}
                onChange={(e) => setNewStory({...newStory, storyPoints: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignee" className="text-right">
                Assignee
              </Label>
              <Select 
                value={newStory.assigneeId || ''} 
                onValueChange={(value) => setNewStory({...newStory, assigneeId: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PLACEHOLDER_VALUES.UNASSIGNED}>None</SelectItem>
                  {users.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reporter" className="text-right">
                Reporter
              </Label>
              <Select 
                value={newStory.reporterId || ''} 
                onValueChange={(value) => setNewStory({...newStory, reporterId: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select reporter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PLACEHOLDER_VALUES.UNASSIGNED}>None</SelectItem>
                  {users.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                className="col-span-3"
                value={newStory.startDate}
                onChange={(e) => setNewStory({...newStory, startDate: e.target.value})}
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
                value={newStory.dueDate}
                onChange={(e) => setNewStory({...newStory, dueDate: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleCreateStory}
              disabled={createStoryMutation.isPending}
            >
              {createStoryMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Story
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Story Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Story</DialogTitle>
            <DialogDescription>
              Make changes to the selected story's details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                placeholder="Story name"
                className="col-span-3"
                value={editStory.name}
                onChange={(e) => setEditStory({...editStory, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Detailed description of the story"
                className="col-span-3"
                rows={4}
                value={editStory.description}
                onChange={(e) => setEditStory({...editStory, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-epic" className="text-right">
                Epic
              </Label>
              <Select 
                value={editStory.epicId} 
                onValueChange={(value) => setEditStory({...editStory, epicId: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select epic" />
                </SelectTrigger>
                <SelectContent>
                  {epics.map((epic: Epic) => (
                    <SelectItem key={epic.id} value={epic.id}>
                      {epic.name}
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
                value={editStory.status} 
                onValueChange={(value) => setEditStory({...editStory, status: value})}
              >
                <SelectTrigger className="col-span-3">
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-priority" className="text-right">
                Priority
              </Label>
              <Select 
                value={editStory.priority} 
                onValueChange={(value) => setEditStory({...editStory, priority: value})}
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
              <Label htmlFor="edit-storyPoints" className="text-right">
                Story Points
              </Label>
              <Input
                id="edit-storyPoints"
                placeholder="e.g., 3, 5, 8"
                className="col-span-3"
                value={editStory.storyPoints}
                onChange={(e) => setEditStory({...editStory, storyPoints: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-assignee" className="text-right">
                Assignee
              </Label>
              <Select 
                value={editStory.assigneeId || ''} 
                onValueChange={(value) => setEditStory({...editStory, assigneeId: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PLACEHOLDER_VALUES.UNASSIGNED}>None</SelectItem>
                  {users.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-reporter" className="text-right">
                Reporter
              </Label>
              <Select 
                value={editStory.reporterId || ''} 
                onValueChange={(value) => setEditStory({...editStory, reporterId: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select reporter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PLACEHOLDER_VALUES.UNASSIGNED}>None</SelectItem>
                  {users.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="edit-startDate"
                type="date"
                className="col-span-3"
                value={editStory.startDate}
                onChange={(e) => setEditStory({...editStory, startDate: e.target.value})}
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
                value={editStory.dueDate}
                onChange={(e) => setEditStory({...editStory, dueDate: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleEditStory}
              disabled={updateStoryMutation.isPending}
            >
              {updateStoryMutation.isPending && (
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