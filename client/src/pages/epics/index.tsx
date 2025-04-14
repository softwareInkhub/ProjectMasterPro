import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  BookOpenIcon,
  ClockIcon,
  CalendarIcon,
  CheckSquareIcon,
  BriefcaseIcon,
  Tag,
  MoreHorizontalIcon,
  Trash2Icon,
  ArchiveIcon,
  CopyIcon,
  EditIcon,
  ChevronDownIcon,
  Loader2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Epic, Project, InsertEpic } from "@shared/schema";

export default function EpicsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [selectedEpics, setSelectedEpics] = useState<string[]>([]);
  
  // Fetch epics from API
  const { data: epics = [], isLoading: isLoadingEpics, error: epicsError } = useQuery({
    queryKey: ['/api/epics'],
    queryFn: getQueryFn()
  });
  
  // Fetch projects for mapping projectId to projectName
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: getQueryFn()
  });
  
  // Create a map of projectId to projectName for easy lookup
  const projectMap = new Map<string, string>();
  projects.forEach((project: Project) => {
    projectMap.set(project.id, project.name);
  });

  // New epic form state
  const [newEpic, setNewEpic] = useState<Partial<InsertEpic>>({
    name: "",
    description: "",
    status: "BACKLOG",
    priority: "MEDIUM",
    projectId: "",
    startDate: "",
    endDate: ""
  });

  // Edit epic form state
  const [editEpic, setEditEpic] = useState<Partial<InsertEpic> & { id?: string }>({
    id: "",
    name: "",
    description: "",
    status: "BACKLOG",
    priority: "MEDIUM",
    projectId: "",
    startDate: "",
    endDate: ""
  });

  // Create mutation for adding new epics
  const createEpicMutation = useMutation({
    mutationFn: async (epic: InsertEpic) => {
      const response = await apiRequest('POST', '/api/epics', epic);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/epics'] });
      toast({
        title: "Epic created",
        description: "New epic has been successfully created.",
      });
      setIsCreateDialogOpen(false);
      // Reset form
      setNewEpic({
        name: "",
        description: "",
        status: "BACKLOG",
        priority: "MEDIUM",
        projectId: "",
        startDate: "",
        endDate: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create epic",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update mutation for editing epics
  const updateEpicMutation = useMutation({
    mutationFn: async (epic: Partial<InsertEpic> & { id: string }) => {
      const { id, ...updateData } = epic;
      const response = await apiRequest('PUT', `/api/epics/${id}`, updateData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/epics'] });
      toast({
        title: "Epic updated",
        description: "Epic has been successfully updated.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update epic",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation for removing epics
  const deleteEpicMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/epics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/epics'] });
      toast({
        title: "Epic deleted",
        description: "Epic has been successfully deleted.",
      });
      setSelectedEpics([]);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete epic",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter epics based on search query and status filter
  const filteredEpics = epics.filter((epic: Epic) => 
    (searchQuery === "" || 
      epic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (epic.description && epic.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (projectMap.get(epic.projectId)?.toLowerCase().includes(searchQuery.toLowerCase()))
    ) && 
    (statusFilter === "all" || epic.status === statusFilter)
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
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
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

  // Handle creating a new epic
  const handleCreateEpic = () => {
    if (!newEpic.projectId) {
      toast({
        title: "Missing project",
        description: "Please select a project for this epic.",
        variant: "destructive",
      });
      return;
    }

    if (!newEpic.name) {
      toast({
        title: "Missing name",
        description: "Please provide a name for this epic.",
        variant: "destructive",
      });
      return;
    }

    // Convert dates if provided
    const epicToCreate: any = { ...newEpic };
    if (epicToCreate.startDate) {
      epicToCreate.startDate = new Date(epicToCreate.startDate).toISOString();
    }
    if (epicToCreate.endDate) {
      epicToCreate.endDate = new Date(epicToCreate.endDate).toISOString();
    }

    createEpicMutation.mutate(epicToCreate as InsertEpic);
  };

  // Handle editing an epic
  const handleEditEpic = () => {
    if (!editEpic.id) {
      toast({
        title: "Error",
        description: "Missing epic ID for update",
        variant: "destructive",
      });
      return;
    }

    if (!editEpic.name) {
      toast({
        title: "Missing name",
        description: "Please provide a name for this epic.",
        variant: "destructive",
      });
      return;
    }

    if (!editEpic.projectId) {
      toast({
        title: "Missing project",
        description: "Please select a project for this epic.",
        variant: "destructive",
      });
      return;
    }

    // Convert dates if provided
    const epicToUpdate: any = { ...editEpic };
    if (epicToUpdate.startDate) {
      epicToUpdate.startDate = new Date(epicToUpdate.startDate).toISOString();
    }
    if (epicToUpdate.endDate) {
      epicToUpdate.endDate = new Date(epicToUpdate.endDate).toISOString();
    }

    updateEpicMutation.mutate(epicToUpdate as InsertEpic & { id: string });
  };

  // Initialize edit form when an epic is selected for editing
  const openEditDialog = (epic: Epic) => {
    setSelectedEpic(epic);
    
    // Format dates for input fields
    let startDateForInput = '';
    let endDateForInput = '';
    
    if (epic.startDate) {
      const date = new Date(epic.startDate);
      startDateForInput = date.toISOString().split('T')[0];
    }
    
    if (epic.endDate) {
      const date = new Date(epic.endDate);
      endDateForInput = date.toISOString().split('T')[0];
    }
    
    setEditEpic({
      id: epic.id,
      name: epic.name,
      description: epic.description || '',
      status: epic.status,
      priority: epic.priority,
      projectId: epic.projectId,
      startDate: startDateForInput,
      endDate: endDateForInput
    });
    
    setIsEditDialogOpen(true);
  };
  
  // Selection handlers
  const handleSelectAll = () => {
    if (selectedEpics.length === filteredEpics.length) {
      setSelectedEpics([]);
    } else {
      setSelectedEpics(filteredEpics.map((e: Epic) => e.id));
    }
  };

  // Batch operations
  const handleDeleteSelected = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedEpics.length} epic(s)?`)) {
      // Create a promise for each deletion
      const deletePromises = selectedEpics.map(id => deleteEpicMutation.mutateAsync(id));
      
      // Execute all deletions in parallel
      Promise.all(deletePromises)
        .then(() => {
          toast({
            title: "Epics deleted",
            description: `${selectedEpics.length} epic(s) have been successfully deleted.`,
          });
          setSelectedEpics([]);
        })
        .catch((error) => {
          toast({
            title: "Failed to delete epics",
            description: error.message,
            variant: "destructive",
          });
        });
    }
  };

  const handleArchiveSelected = () => {
    toast({
      title: "Feature not implemented",
      description: `Archiving ${selectedEpics.length} epics is not implemented yet.`,
    });
    setSelectedEpics([]);
  };

  const handleDuplicateSelected = () => {
    toast({
      title: "Feature not implemented",
      description: `Duplicating ${selectedEpics.length} epics is not implemented yet.`,
    });
    setSelectedEpics([]);
  };

  const handleChangeStatusSelected = (status: string) => {
    toast({
      title: "Feature not implemented",
      description: `Changing status of ${selectedEpics.length} epics to "${status}" is not implemented yet.`,
    });
    setSelectedEpics([]);
  };

  // Loading state
  if (isLoadingEpics) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading epics...</span>
      </div>
    );
  }

  // Error state
  if (epicsError) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
        <h2 className="text-lg font-semibold mb-2">Error loading epics</h2>
        <p>{(epicsError as Error).message || "Unknown error occurred"}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/epics'] })}
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
            <h1 className="text-3xl font-bold text-gray-900">Epics</h1>
            <p className="text-gray-600 mt-1">Manage large bodies of work across your projects</p>
          </div>
          <Button onClick={() => setLocation("/epics/new")}>
            <PlusIcon className="mr-2 h-4 w-4" /> Create Epic
          </Button>
        </div>
      </header>
      
      {/* Batch Actions */}
      {selectedEpics.length > 0 && (
        <div className="bg-gray-50 border rounded-md p-2 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={selectedEpics.length === filteredEpics.length}
              onCheckedChange={handleSelectAll}
              className="data-[state=checked]:bg-primary"
            />
            <span className="text-sm font-medium">Selected {selectedEpics.length} of {filteredEpics.length}</span>
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
                <DropdownMenuItem onClick={() => handleChangeStatusSelected("IN_PROGRESS")}>
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleChangeStatusSelected("COMPLETED")}>
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="sm" onClick={handleDuplicateSelected}>
              <CopyIcon className="mr-1 h-4 w-4" /> Duplicate
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleArchiveSelected}>
              <ArchiveIcon className="mr-1 h-4 w-4" /> Archive
            </Button>
            
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
            placeholder="Search epics..."
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
            className={statusFilter === "IN_PROGRESS" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : ""}
            onClick={() => setStatusFilter("IN_PROGRESS")}
          >
            In Progress
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "COMPLETED" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
            onClick={() => setStatusFilter("COMPLETED")}
          >
            Completed
          </Button>
        </div>
      </div>
      
      {/* Epics List */}
      {filteredEpics.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No epics found matching your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEpics.map((epic: Epic) => {
            // Calculate progress percentage from progress.percentage property
            const progressPercentage = epic.progress ? 
              typeof epic.progress === 'string' 
                ? JSON.parse(epic.progress).percentage 
                : epic.progress.percentage || 0
              : 0;
            
            return (
              <Card 
                key={epic.id} 
                className="hover:shadow-md transition-shadow relative"
              >
                {/* Checkbox for selection */}
                <div 
                  className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedEpics.includes(epic.id)}
                    className="data-[state=checked]:bg-primary border-gray-300"
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedEpics(prev => [...prev, epic.id]);
                      } else {
                        setSelectedEpics(prev => prev.filter(id => id !== epic.id));
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                <CardContent 
                  className="p-4 pl-9 cursor-pointer"
                  onClick={() => setLocation(`/epics/${epic.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-semibold text-gray-900 truncate">{epic.name}</h3>
                    <div className="flex gap-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-1.5 py-0.5 ${getStatusColor(epic.status)}`}
                      >
                        {epic.status === "IN_PROGRESS" ? "In Progress" : epic.status === "BACKLOG" ? "Backlog" : "Completed"}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-1.5 py-0.5 ${getPriorityColor(epic.priority)}`}
                      >
                        {epic.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 my-2 line-clamp-2">
                    {epic.description || "No description provided"}
                  </p>
                  
                  <div className="mt-3 mb-1">
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-1.5" />
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpenIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{projectMap.get(epic.projectId) || "Unknown project"}</span>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(epic);
                        }}>
                          <EditIcon className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          // Logic to duplicate epic
                          toast({
                            title: "Feature not implemented",
                            description: "Duplicating epic is not implemented yet.",
                          });
                        }}>
                          <CopyIcon className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Are you sure you want to delete this epic?")) {
                              deleteEpicMutation.mutate(epic.id);
                            }
                          }}
                        >
                          <Trash2Icon className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="mt-3 flex justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>{epic.startDate ? formatDate(epic.startDate) : "No start date"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-3.5 w-3.5" />
                      <span>{epic.endDate ? formatDate(epic.endDate) : "No end date"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Create Epic Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Epic</DialogTitle>
            <DialogDescription>
              Add a new epic to track large pieces of work that can be broken down into multiple stories.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Epic name"
                className="col-span-3"
                value={newEpic.name}
                onChange={(e) => setNewEpic({...newEpic, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the epic"
                className="col-span-3"
                rows={4}
                value={newEpic.description}
                onChange={(e) => setNewEpic({...newEpic, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project" className="text-right">
                Project
              </Label>
              <Select 
                value={newEpic.projectId} 
                onValueChange={(value) => setNewEpic({...newEpic, projectId: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project: Project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
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
                value={newEpic.status} 
                onValueChange={(value) => setNewEpic({...newEpic, status: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BACKLOG">Backlog</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select 
                value={newEpic.priority} 
                onValueChange={(value) => setNewEpic({...newEpic, priority: value})}
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
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                className="col-span-3"
                value={newEpic.startDate}
                onChange={(e) => setNewEpic({...newEpic, startDate: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                className="col-span-3"
                value={newEpic.endDate}
                onChange={(e) => setNewEpic({...newEpic, endDate: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleCreateEpic}
              disabled={createEpicMutation.isPending}
            >
              {createEpicMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Epic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Epic Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Epic</DialogTitle>
            <DialogDescription>
              Make changes to the selected epic's details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                placeholder="Epic name"
                className="col-span-3"
                value={editEpic.name}
                onChange={(e) => setEditEpic({...editEpic, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Detailed description of the epic"
                className="col-span-3"
                rows={4}
                value={editEpic.description}
                onChange={(e) => setEditEpic({...editEpic, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-project" className="text-right">
                Project
              </Label>
              <Select 
                value={editEpic.projectId} 
                onValueChange={(value) => setEditEpic({...editEpic, projectId: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project: Project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
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
                value={editEpic.status} 
                onValueChange={(value) => setEditEpic({...editEpic, status: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BACKLOG">Backlog</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-priority" className="text-right">
                Priority
              </Label>
              <Select 
                value={editEpic.priority} 
                onValueChange={(value) => setEditEpic({...editEpic, priority: value})}
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
              <Label htmlFor="edit-startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="edit-startDate"
                type="date"
                className="col-span-3"
                value={editEpic.startDate}
                onChange={(e) => setEditEpic({...editEpic, startDate: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-endDate" className="text-right">
                End Date
              </Label>
              <Input
                id="edit-endDate"
                type="date"
                className="col-span-3"
                value={editEpic.endDate}
                onChange={(e) => setEditEpic({...editEpic, endDate: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleEditEpic}
              disabled={updateEpicMutation.isPending}
            >
              {updateEpicMutation.isPending && (
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