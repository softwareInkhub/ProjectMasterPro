import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, queryClient, apiRequest } from "@/lib/queryClient";
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  SortAscIcon, 
  CalendarIcon,
  UsersIcon,
  BriefcaseIcon,
  TagIcon,
  MoreHorizontalIcon,
  FolderIcon,
  ClockIcon,
  CheckCircleIcon,
  PauseCircleIcon,
  Trash2Icon,
  ArchiveIcon,
  CopyIcon,
  EditIcon,
  ChevronDownIcon,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { Project } from "@shared/schema";

export default function ProjectsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  
  // Fetch projects from API
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['/api/projects']
  });

  // Fetch departments and teams for display
  const { data: departments = [] } = useQuery({
    queryKey: ['/api/departments']
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['/api/teams']
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const res = await apiRequest('DELETE', `/api/projects/${projectId}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully."
      });
      setSelectedProjects([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete project",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Function to get department name by ID
  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown Department';
  };

  // Function to get team name by ID
  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  // Filter projects based on search query and status filter
  const filteredProjects = projects.filter(project => 
    (searchQuery === "" || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) && 
    (statusFilter === "all" || project.status === statusFilter)
  );
  
  // Format date to more readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date";
    
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
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "ON_HOLD": return "bg-yellow-100 text-yellow-800";
      case "PLANNING": return "bg-purple-100 text-purple-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Helper to get priority badge color
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "HIGH": return "bg-red-100 text-red-800";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "LOW": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Display friendly status
  const getStatusDisplay = (status: string) => {
    switch(status) {
      case "IN_PROGRESS": return "In Progress";
      case "COMPLETED": return "Completed";
      case "ON_HOLD": return "On Hold";
      case "PLANNING": return "Planning";
      case "CANCELLED": return "Cancelled";
      default: return status;
    }
  };

  // Display friendly priority
  const getPriorityDisplay = (priority: string) => {
    switch(priority) {
      case "HIGH": return "High";
      case "MEDIUM": return "Medium";
      case "LOW": return "Low";
      case "CRITICAL": return "Critical";
      default: return priority;
    }
  };

  // Selection handlers
  const handleToggleSelect = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects.map(p => p.id));
    }
  };

  // Batch operations
  const handleDeleteSelected = () => {
    if (selectedProjects.length === 0) return;
    
    // For now, just delete one by one
    selectedProjects.forEach(projectId => {
      deleteProjectMutation.mutate(projectId);
    });
  };

  const handleArchiveSelected = () => {
    toast({
      title: "Archiving projects",
      description: `${selectedProjects.length} projects would be archived.`,
    });
    // In a real application, this would call API to archive projects
    setSelectedProjects([]);
  };

  const handleDuplicateSelected = () => {
    toast({
      title: "Duplicating projects",
      description: `${selectedProjects.length} projects would be duplicated.`,
    });
    // In a real application, this would call API to duplicate projects
    setSelectedProjects([]);
  };

  const handleChangeStatusSelected = (status: string) => {
    toast({
      title: "Updating status",
      description: `${selectedProjects.length} projects would be updated to "${status}".`,
    });
    // In a real application, this would call API to update project status
    setSelectedProjects([]);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading projects...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Projects</h2>
        <p className="text-gray-600 mb-6">
          {error instanceof Error ? error.message : "An unknown error occurred."}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }
  
  // Render project grid view
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredProjects.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <FolderIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-6">Try a different search or create a new project.</p>
          <Button onClick={() => setLocation('/projects/new')}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New Project
          </Button>
        </div>
      ) : (
        filteredProjects.map((project) => (
          <Card 
            key={project.id} 
            className={`hover:shadow-sm transition-shadow overflow-hidden cursor-pointer ${
              selectedProjects.includes(project.id) ? "border-primary ring-1 ring-primary" : ""
            }`}
            onClick={() => setLocation(`/projects/${project.id}`)}
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProjects(prev => [...prev, project.id]);
                        } else {
                          setSelectedProjects(prev => prev.filter(id => id !== project.id));
                        }
                      }}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  <h3 className="font-medium text-sm truncate hover:text-primary">
                    {project.name}
                  </h3>
                </div>
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${getStatusColor(project.status)}`}>
                  {getStatusDisplay(project.status)}
                </span>
              </div>
              
              <p className="text-xs text-gray-500 line-clamp-2 h-8 mb-2 pl-6">{project.description}</p>
              
              <div className="grid grid-cols-2 gap-2 mb-2 text-xs text-gray-500 pl-6">
                <div className="flex items-center">
                  <div className="w-5 flex-shrink-0">
                    <CalendarIcon className="h-3 w-3" />
                  </div>
                  <span>{formatDate(project.endDate).split(',')[0]}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 flex-shrink-0">
                    <UsersIcon className="h-3 w-3" />
                  </div>
                  <span>{project.teamId ? getTeamName(project.teamId) : 'No Team'}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2 text-xs text-gray-500 pl-6">
                <div className="flex items-center">
                  <div className="w-5 flex-shrink-0">
                    <BriefcaseIcon className="h-3 w-3" />
                  </div>
                  <span className="truncate">{project.companyId ? getDepartmentName(project.companyId) : 'No Company'}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 flex-shrink-0">
                    <TagIcon className="h-3 w-3" />
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getPriorityColor(project.priority)}`}>
                    {getPriorityDisplay(project.priority)}
                  </span>
                </div>
              </div>
              
              <div className="pt-1 pl-6">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{project.progress && project.progress.percentage ? project.progress.percentage : 0}%</span>
                </div>
                <Progress value={project.progress && project.progress.percentage ? project.progress.percentage : 0} className="h-1.5" />
              </div>

              {selectedProjects.includes(project.id) && (
                <div className="mt-3 flex justify-between items-center border-t pt-2 pl-6">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/projects/${project.id}/edit`);
                      }}
                    >
                      <EditIcon className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast({
                          title: "Duplicating project",
                          description: `${project.name} would be duplicated.`,
                        });
                      }}
                    >
                      <CopyIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast({
                          title: "Archiving project",
                          description: `${project.name} would be archived.`,
                        });
                      }}
                    >
                      <ArchiveIcon className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProjectMutation.mutate(project.id);
                      }}
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
  
  // Render project list view
  const renderListView = () => (
    <div className="space-y-2">
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <FolderIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-6">Try a different search or create a new project.</p>
          <Button onClick={() => setLocation('/projects/new')}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New Project
          </Button>
        </div>
      ) : (
        filteredProjects.map((project) => (
          <Card 
            key={project.id} 
            className={`hover:shadow-sm transition-shadow overflow-hidden cursor-pointer ${
              selectedProjects.includes(project.id) ? "border-primary ring-1 ring-primary" : ""
            }`}
            onClick={() => setLocation(`/projects/${project.id}`)}
          >
            <div className="p-3">
              <div className="flex items-center gap-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedProjects(prev => [...prev, project.id]);
                      } else {
                        setSelectedProjects(prev => prev.filter(id => id !== project.id));
                      }
                    }}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm truncate hover:text-primary">{project.name}</h3>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(project.status)}`}>
                      {getStatusDisplay(project.status)}
                    </span>
                    <span className={`hidden sm:inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getPriorityColor(project.priority)}`}>
                      {getPriorityDisplay(project.priority)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {formatDate(project.endDate).split(',')[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <BriefcaseIcon className="h-3 w-3" />
                      {project.teamId ? getTeamName(project.teamId) : 'No Team'}
                    </span>
                    <span className="hidden sm:flex items-center gap-1">
                      <UsersIcon className="h-3 w-3" />
                      {project.companyId ? getDepartmentName(project.companyId) : 'No Company'}
                    </span>
                  </div>
                </div>
                <div className="w-24 hidden md:block">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{project.progress && project.progress.percentage ? project.progress.percentage : 0}%</span>
                  </div>
                  <Progress value={project.progress && project.progress.percentage ? project.progress.percentage : 0} className="h-1.5" />
                </div>
                <div className="flex gap-1">
                  {selectedProjects.includes(project.id) && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hidden sm:flex"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/projects/${project.id}/edit`);
                        }}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProjectMutation.mutate(project.id);
                        }}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/projects/${project.id}`);
                      }}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/projects/${project.id}/edit`);
                      }}>
                        Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        toast({
                          title: "Duplicating project",
                          description: `${project.name} would be duplicated.`,
                        });
                      }}>
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        toast({
                          title: "Archiving project",
                          description: `${project.name} would be archived.`,
                        });
                      }}>
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProjectMutation.mutate(project.id);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-gray-500">Manage and track all your projects</p>
        </div>
        <Button onClick={() => setLocation("/projects/new")}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>
      
      {/* Toolbar */}
      <div className="bg-card rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search projects..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <FilterIcon className="h-4 w-4" />
                  Status
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter("IN_PROGRESS")}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor("IN_PROGRESS")}`}></span>
                    In Progress
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("PLANNING")}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor("PLANNING")}`}></span>
                    Planning
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("ON_HOLD")}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor("ON_HOLD")}`}></span>
                    On Hold
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("COMPLETED")}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor("COMPLETED")}`}></span>
                    Completed
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("CANCELLED")}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor("CANCELLED")}`}></span>
                    Cancelled
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* View toggle */}
            <div className="flex rounded-md border overflow-hidden">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                className={`rounded-none border-0 px-3 ${viewMode === 'grid' ? '' : 'bg-transparent'}`}
                onClick={() => setViewMode('grid')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                className={`rounded-none border-0 px-3 ${viewMode === 'list' ? '' : 'bg-transparent'}`}
                onClick={() => setViewMode('list')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Batch actions - only visible when items are selected */}
        {selectedProjects.length > 0 && (
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
            <div className="flex-1 text-sm">
              <span>
                <strong>{selectedProjects.length}</strong> project{selectedProjects.length !== 1 ? 's' : ''} selected
              </span>
              <Button variant="link" className="h-auto p-0 ml-2" onClick={handleSelectAll}>
                {selectedProjects.length === filteredProjects.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDuplicateSelected}
              >
                <CopyIcon className="h-4 w-4 mr-1" />
                Duplicate
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleArchiveSelected}
              >
                <ArchiveIcon className="h-4 w-4 mr-1" />
                Archive
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    Change Status
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleChangeStatusSelected("IN_PROGRESS")}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor("IN_PROGRESS")}`}></span>
                      In Progress
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleChangeStatusSelected("PLANNING")}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor("PLANNING")}`}></span>
                      Planning
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleChangeStatusSelected("ON_HOLD")}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor("ON_HOLD")}`}></span>
                      On Hold
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleChangeStatusSelected("COMPLETED")}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor("COMPLETED")}`}></span>
                      Completed
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleChangeStatusSelected("CANCELLED")}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor("CANCELLED")}`}></span>
                      Cancelled
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDeleteSelected}
              >
                <Trash2Icon className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Project list */}
      <div className="mb-6">
        {viewMode === 'grid' ? renderGridView() : renderListView()}
      </div>
    </div>
  );
}