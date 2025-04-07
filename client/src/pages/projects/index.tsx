import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
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
  ChevronDownIcon
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

export default function ProjectsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  
  // Sample projects data - this would come from an API in the real application
  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      description: "Modernizing the corporate website with new design and features",
      status: "In Progress",
      progress: 65,
      startDate: "2023-09-01",
      endDate: "2023-12-31",
      department: "Engineering",
      departmentId: 1,
      team: "Frontend Development",
      teamId: 1,
      teamLead: "Alice Chen",
      members: 6,
      tasks: {
        total: 34,
        completed: 22,
        inProgress: 8,
        backlog: 4
      },
      priority: "High",
      client: "Acme Corporation",
      tags: ["web", "ui/ux", "responsive"]
    },
    {
      id: 2,
      name: "CRM Integration",
      description: "Integrating the new customer relationship management system",
      status: "In Progress",
      progress: 40,
      startDate: "2023-10-15",
      endDate: "2024-01-15",
      department: "Engineering",
      departmentId: 1,
      team: "Backend Development",
      teamId: 2,
      teamLead: "Bob Jackson",
      members: 5,
      tasks: {
        total: 28,
        completed: 11,
        inProgress: 10,
        backlog: 7
      },
      priority: "High",
      client: "Acme Corporation",
      tags: ["api", "integration", "database"]
    },
    {
      id: 3,
      name: "Q4 Marketing Campaign",
      description: "End of year promotional campaign for key products",
      status: "In Progress",
      progress: 80,
      startDate: "2023-11-01",
      endDate: "2023-12-20",
      department: "Marketing",
      departmentId: 2,
      team: "Digital Marketing",
      teamId: 5,
      teamLead: "Eric Thompson",
      members: 4,
      tasks: {
        total: 22,
        completed: 18,
        inProgress: 4,
        backlog: 0
      },
      priority: "Medium",
      client: "Acme Corporation",
      tags: ["marketing", "digital", "social-media"]
    },
    {
      id: 4,
      name: "Infrastructure Migration",
      description: "Moving server infrastructure to cloud platform",
      status: "On Hold",
      progress: 25,
      startDate: "2023-08-15",
      endDate: "2024-02-28",
      department: "Engineering",
      departmentId: 1,
      team: "DevOps",
      teamId: 3,
      teamLead: "Charlie Martinez",
      members: 3,
      tasks: {
        total: 42,
        completed: 10,
        inProgress: 5,
        backlog: 27
      },
      priority: "Medium",
      client: "Acme Corporation",
      tags: ["cloud", "infrastructure", "migration"]
    },
    {
      id: 5,
      name: "Mobile App Development",
      description: "Creating a new mobile application for customers",
      status: "Planning",
      progress: 15,
      startDate: "2023-12-01",
      endDate: "2024-05-31",
      department: "Engineering",
      departmentId: 1,
      team: "Mobile Development",
      teamId: 4,
      teamLead: "Grace Wang",
      members: 4,
      tasks: {
        total: 56,
        completed: 8,
        inProgress: 12,
        backlog: 36
      },
      priority: "High",
      client: "Acme Corporation",
      tags: ["mobile", "ios", "android"]
    },
    {
      id: 6,
      name: "Brand Refresh",
      description: "Updating brand guidelines and assets",
      status: "Completed",
      progress: 100,
      startDate: "2023-07-01",
      endDate: "2023-10-15",
      department: "Marketing",
      departmentId: 2,
      team: "Brand Management",
      teamId: 6,
      teamLead: "Fiona Rodriguez",
      members: 3,
      tasks: {
        total: 30,
        completed: 30,
        inProgress: 0,
        backlog: 0
      },
      priority: "Medium",
      client: "Acme Corporation",
      tags: ["branding", "design", "marketing"]
    }
  ];

  // Filter projects based on search query and status filter
  const filteredProjects = projects.filter(project => 
    (searchQuery === "" || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.teamLead.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ) && 
    (statusFilter === "all" || project.status === statusFilter)
  );
  
  // Format date to more readable format
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
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "On Hold": return "bg-yellow-100 text-yellow-800";
      case "Planning": return "bg-purple-100 text-purple-800";
      case "Cancelled": return "bg-red-100 text-red-800";
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

  // Selection handlers
  const handleToggleSelect = (e: React.MouseEvent, projectId: number) => {
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
    toast({
      title: "Deleting projects",
      description: `${selectedProjects.length} projects would be deleted.`,
    });
    // In a real application, this would call API to delete projects
    setSelectedProjects([]);
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
  
  // Render project grid view
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredProjects.map((project) => (
        <Card 
          key={project.id} 
          className={`hover:shadow-sm transition-shadow overflow-hidden ${
            selectedProjects.includes(project.id) ? "border-primary ring-1 ring-primary" : ""
          }`}
        >
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 overflow-hidden">
                <Checkbox 
                  checked={selectedProjects.includes(project.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedProjects(prev => [...prev, project.id]);
                    } else {
                      setSelectedProjects(prev => prev.filter(id => id !== project.id));
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="data-[state=checked]:bg-primary"
                />
                <h3 
                  className="font-medium text-sm truncate cursor-pointer hover:text-primary"
                  onClick={() => setLocation(`/projects/${project.id}`)}
                >
                  {project.name}
                </h3>
              </div>
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${getStatusColor(project.status)}`}>
                {project.status}
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
                <span>{project.members}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2 text-xs text-gray-500 pl-6">
              <div className="flex items-center">
                <div className="w-5 flex-shrink-0">
                  <BriefcaseIcon className="h-3 w-3" />
                </div>
                <span className="truncate">{project.team}</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 flex-shrink-0">
                  <TagIcon className="h-3 w-3" />
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>
            </div>
            
            <div className="pt-1 pl-6">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-1.5" />
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
                      toast({
                        title: "Deleting project",
                        description: `${project.name} would be deleted.`,
                        variant: "destructive",
                      });
                    }}
                  >
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
  
  // Render project list view
  const renderListView = () => (
    <div className="space-y-2">
      {filteredProjects.map((project) => (
        <Card 
          key={project.id} 
          className={`hover:shadow-sm transition-shadow overflow-hidden ${
            selectedProjects.includes(project.id) ? "border-primary ring-1 ring-primary" : ""
          }`}
        >
          <div className="p-3">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={selectedProjects.includes(project.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedProjects(prev => [...prev, project.id]);
                  } else {
                    setSelectedProjects(prev => prev.filter(id => id !== project.id));
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="data-[state=checked]:bg-primary"
              />
              <div 
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => setLocation(`/projects/${project.id}`)}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm truncate hover:text-primary">{project.name}</h3>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`hidden sm:inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {formatDate(project.endDate).split(',')[0]}
                  </span>
                  <span className="flex items-center gap-1">
                    <UsersIcon className="h-3 w-3" />
                    {project.members}
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <BriefcaseIcon className="h-3 w-3" />
                    {project.team}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Progress value={project.progress} className="h-1.5 w-16" />
                  <span className="text-xs text-gray-500 whitespace-nowrap">{project.progress}%</span>
                </div>
                
                {selectedProjects.includes(project.id) ? (
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
                        toast({
                          title: "Deleting project",
                          description: `${project.name} would be deleted.`,
                          variant: "destructive",
                        });
                      }}
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 h-6 w-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontalIcon className="h-4 w-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/projects/${project.id}/edit`);
                        }}
                      >
                        <EditIcon className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <CopyIcon className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <ArchiveIcon className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2Icon className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">Manage and track your organization's projects</p>
          </div>
          <Button onClick={() => setLocation('/projects/new')}>
            <PlusIcon className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
      </header>
      
      {/* Batch Actions */}
      {selectedProjects.length > 0 && (
        <div className="bg-gray-50 border rounded-md p-2 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={selectedProjects.length === filteredProjects.length}
              onCheckedChange={handleSelectAll}
              className="data-[state=checked]:bg-primary"
            />
            <span className="text-sm font-medium">Selected {selectedProjects.length} of {filteredProjects.length}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Change Status <span className="ml-1">▼</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleChangeStatusSelected("In Progress")}>
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleChangeStatusSelected("Completed")}>
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleChangeStatusSelected("On Hold")}>
                  <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                  On Hold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleChangeStatusSelected("Planning")}>
                  <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                  Planning
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleChangeStatusSelected("Cancelled")}>
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                  Cancelled
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
        <div className="flex gap-4 flex-1">
          <div className="relative w-full md:w-80">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-2 min-w-[36px]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-2 min-w-[36px]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </Button>
          </div>
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
            className={statusFilter === "In Progress" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : ""}
            onClick={() => setStatusFilter("In Progress")}
          >
            In Progress
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "Completed" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
            onClick={() => setStatusFilter("Completed")}
          >
            Completed
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "On Hold" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" : ""}
            onClick={() => setStatusFilter("On Hold")}
          >
            On Hold
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "Planning" ? "bg-purple-100 text-purple-800 hover:bg-purple-200" : ""}
            onClick={() => setStatusFilter("Planning")}
          >
            Planning
          </Button>
        </div>
      </div>
      
      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No projects found matching your filters.</p>
          </CardContent>
        </Card>
      ) : (
        viewMode === 'grid' ? renderGridView() : renderListView()
      )}
    </div>
  );
}