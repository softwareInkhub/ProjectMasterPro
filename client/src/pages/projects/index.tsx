import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  PlusIcon, 
  FilterIcon, 
  SortAscIcon, 
  SearchIcon,
  BriefcaseIcon,
  UsersIcon,
  CalendarIcon,
  FolderIcon,
  ClockIcon,
  TagIcon,
  CheckCircleIcon,
  PauseCircleIcon,
  MoreHorizontalIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";

export default function ProjectsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
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
  
  // Render project grid view
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.map((project) => (
        <Card 
          key={project.id} 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setLocation(`/projects/${project.id}`)}
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="mb-1">{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Due Date</p>
                    <p className="font-medium">{formatDate(project.endDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Team</p>
                    <p className="font-medium">{project.members} members</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <FolderIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Department:</span>
                <span 
                  className="font-medium cursor-pointer hover:text-primary-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation(`/departments/${project.departmentId}`);
                  }}
                >
                  {project.department}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {project.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                setLocation(`/projects/${project.id}/tasks`);
              }}
            >
              View Tasks
            </Button>
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mr-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation(`/projects/${project.id}/edit`);
                }}
              >
                Edit
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
  
  // Render project list view
  const renderListView = () => (
    <div className="space-y-4">
      {filteredProjects.map((project) => (
        <Card 
          key={project.id} 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setLocation(`/projects/${project.id}`)}
        >
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <BriefcaseIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" /> Status
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                
                <div>
                  <p className="text-gray-500 flex items-center gap-1">
                    <UsersIcon className="h-3 w-3" /> Team
                  </p>
                  <p className="font-medium">{project.team}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" /> Due Date
                  </p>
                  <p className="font-medium">{formatDate(project.endDate)}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 flex items-center gap-1">
                    <TagIcon className="h-3 w-3" /> Priority
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
              </div>
              
              <div className="flex md:flex-col items-center justify-between gap-4">
                <div className="w-24 flex flex-col items-center">
                  <div className="flex justify-between w-full text-xs mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2 w-full" />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-full p-0 h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (project.status === "In Progress") {
                        // Logic to pause project
                      } else if (project.status === "On Hold") {
                        // Logic to resume project
                      }
                    }}
                  >
                    {project.status === "In Progress" ? (
                      <PauseCircleIcon className="h-5 w-5 text-yellow-600" />
                    ) : project.status === "On Hold" ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <MoreHorizontalIcon className="h-5 w-5" />
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/projects/${project.id}/edit`);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
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