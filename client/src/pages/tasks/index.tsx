import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  MoreVerticalIcon
} from "lucide-react";

export default function TasksPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  
  // Sample tasks data - this would come from an API in the real application
  const tasks = [
    {
      id: 1,
      title: "Design new homepage layout",
      description: "Create a modern and responsive design for the company homepage",
      status: "In Progress",
      priority: "High",
      projectId: 1,
      projectName: "Website Redesign",
      assigneeId: 5,
      assigneeName: "Alice Chen",
      assigneeAvatar: "AC",
      dueDate: "2023-12-10",
      progress: 60,
      tags: ["design", "frontend"],
      createdAt: "2023-09-05",
      comments: 8,
      checklist: {
        total: 6,
        completed: 4
      }
    },
    {
      id: 2,
      title: "Implement user authentication",
      description: "Add login, registration, and password reset functionality",
      status: "To Do",
      priority: "High",
      projectId: 1,
      projectName: "Website Redesign",
      assigneeId: 8,
      assigneeName: "Bob Jackson",
      assigneeAvatar: "BJ",
      dueDate: "2023-12-15",
      progress: 0,
      tags: ["backend", "security"],
      createdAt: "2023-09-06",
      comments: 3,
      checklist: {
        total: 5,
        completed: 0
      }
    },
    {
      id: 3,
      title: "Optimize database queries",
      description: "Improve performance of slow database operations",
      status: "In Progress",
      priority: "Medium",
      projectId: 2,
      projectName: "CRM Integration",
      assigneeId: 8,
      assigneeName: "Bob Jackson",
      assigneeAvatar: "BJ",
      dueDate: "2023-11-30",
      progress: 40,
      tags: ["backend", "database", "performance"],
      createdAt: "2023-10-18",
      comments: 5,
      checklist: {
        total: 4,
        completed: 2
      }
    },
    {
      id: 4,
      title: "Create API documentation",
      description: "Generate comprehensive API docs using Swagger/OpenAPI",
      status: "Completed",
      priority: "Medium",
      projectId: 2,
      projectName: "CRM Integration",
      assigneeId: 12,
      assigneeName: "Charlie Martinez",
      assigneeAvatar: "CM",
      dueDate: "2023-11-20",
      progress: 100,
      tags: ["documentation", "api"],
      createdAt: "2023-10-25",
      comments: 2,
      checklist: {
        total: 3,
        completed: 3
      }
    },
    {
      id: 5,
      title: "Design social media assets",
      description: "Create graphics for the Q4 marketing campaign",
      status: "Review",
      priority: "High",
      projectId: 3,
      projectName: "Q4 Marketing Campaign",
      assigneeId: 21,
      assigneeName: "Eric Thompson",
      assigneeAvatar: "ET",
      dueDate: "2023-11-28",
      progress: 90,
      tags: ["design", "marketing"],
      createdAt: "2023-11-10",
      comments: 7,
      checklist: {
        total: 8,
        completed: 7
      }
    },
    {
      id: 6,
      title: "Setup CI/CD pipeline",
      description: "Configure automated testing and deployment pipeline",
      status: "On Hold",
      priority: "Medium",
      projectId: 4,
      projectName: "Infrastructure Migration",
      assigneeId: 12,
      assigneeName: "Charlie Martinez",
      assigneeAvatar: "CM",
      dueDate: "2023-10-30",
      progress: 30,
      tags: ["devops", "automation"],
      createdAt: "2023-09-20",
      comments: 4,
      checklist: {
        total: 7,
        completed: 2
      }
    },
    {
      id: 7,
      title: "Research mobile frameworks",
      description: "Evaluate React Native, Flutter and native options",
      status: "Completed",
      priority: "Low",
      projectId: 5,
      projectName: "Mobile App Development",
      assigneeId: 5,
      assigneeName: "Alice Chen",
      assigneeAvatar: "AC",
      dueDate: "2023-12-05",
      progress: 100,
      tags: ["research", "mobile"],
      createdAt: "2023-11-15",
      comments: 9,
      checklist: {
        total: 4,
        completed: 4
      }
    },
    {
      id: 8,
      title: "Update logo on all platforms",
      description: "Implement new logo across website, social media, and documents",
      status: "Completed",
      priority: "High",
      projectId: 6,
      projectName: "Brand Refresh",
      assigneeId: 24,
      assigneeName: "Fiona Rodriguez",
      assigneeAvatar: "FR",
      dueDate: "2023-10-10",
      progress: 100,
      tags: ["branding", "design"],
      createdAt: "2023-09-25",
      comments: 6,
      checklist: {
        total: 10,
        completed: 10
      }
    }
  ];

  // Filter tasks based on search query and status filter
  const filteredTasks = tasks.filter(task => 
    (searchQuery === "" || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ) && 
    (statusFilter === "all" || task.status === statusFilter)
  );
  
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
  
  // Determine if a task is overdue
  const isOverdue = (dueDate: string, status: string) => {
    return status !== "Completed" && new Date(dueDate) < new Date() && dueDate !== "";
  };
  
  // Render task list view
  const renderListView = () => (
    <div className="space-y-4">
      {filteredTasks.map((task) => (
        <Card 
          key={task.id} 
          className={`hover:shadow-md transition-shadow cursor-pointer ${isOverdue(task.dueDate, task.status) ? 'border-red-300' : ''}`}
          onClick={() => setLocation(`/tasks/${task.id}`)}
        >
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Checkbox 
                  id={`task-${task.id}`}
                  checked={task.status === "Completed"}
                  onCheckedChange={(checked) => {
                    // Stop propagation to prevent the card click
                    const e = window.event;
                    if (e) e.stopPropagation();
                    // Logic to toggle task completion would go here
                    console.log(`Task ${task.id} checked: ${checked}`);
                    // In a real implementation, we would call an API to update the task status
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
                <div>
                  <h3 className={`font-bold text-gray-900 ${task.status === "Completed" ? "line-through text-gray-500" : ""}`}>
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-1 ${getStatusColor(task.status)}`}
                    >
                      {task.status}
                    </Badge>
                    
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-1 ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </Badge>
                    
                    {task.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    
                    {isOverdue(task.dueDate, task.status) && (
                      <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 items-start md:items-end lg:items-center">
                <div className="flex items-center gap-2 text-sm">
                  <BriefcaseIcon className="h-4 w-4 text-gray-500" />
                  <span 
                    className="font-medium cursor-pointer hover:text-primary-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/projects/${task.projectId}`);
                    }}
                  >
                    {task.projectName}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full ${getAvatarColor(task.assigneeName)} flex items-center justify-center text-white font-medium text-sm`}>
                    {task.assigneeAvatar}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{task.assigneeName}</span>
                    <span className="text-xs text-gray-500">Assignee</span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 text-gray-500 mr-1" />
                  <span className={`${isOverdue(task.dueDate, task.status) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  // Organize tasks by status for board view
  const getTasksByStatus = () => {
    const columns = {
      "To Do": [] as typeof tasks,
      "In Progress": [] as typeof tasks,
      "Review": [] as typeof tasks,
      "Completed": [] as typeof tasks,
      "On Hold": [] as typeof tasks
    };
    
    filteredTasks.forEach(task => {
      if (columns[task.status as keyof typeof columns]) {
        columns[task.status as keyof typeof columns].push(task);
      }
    });
    
    return columns;
  };
  
  // Render task board view (Kanban style)
  const renderBoardView = () => {
    const tasksByStatus = getTasksByStatus();
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {Object.entries(tasksByStatus).map(([status, tasks]) => (
          <div key={status} className="flex flex-col h-full">
            <div className={`flex items-center justify-between p-3 rounded-t-lg ${getStatusColor(status)}`}>
              <h3 className="font-medium">{status}</h3>
              <span className="text-sm rounded-full bg-white bg-opacity-60 px-2">{tasks.length}</span>
            </div>
            <div className="bg-gray-50 rounded-b-lg p-2 flex-1 min-h-[50vh] max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                {tasks.map(task => (
                  <Card
                    key={task.id}
                    className={`hover:shadow-md transition-shadow cursor-pointer ${isOverdue(task.dueDate, task.status) ? 'border-red-300' : ''}`}
                    onClick={() => setLocation(`/tasks/${task.id}`)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 flex items-start gap-2">
                            <Checkbox 
                              id={`task-board-${task.id}`}
                              checked={task.status === "Completed"}
                              onCheckedChange={(checked) => {
                                // Stop propagation to prevent the card click
                                const e = window.event;
                                if (e) e.stopPropagation();
                                // Logic to toggle task completion would go here
                                console.log(`Task ${task.id} checked: ${checked}`);
                                // In a real implementation, we would call an API to update the task status
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="mt-0.5"
                            />
                            <h4 className={`font-medium ${task.status === "Completed" ? "line-through text-gray-500" : ""}`}>
                              {task.title}
                            </h4>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Task options menu would go here
                            }}
                          >
                            <MoreVerticalIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="text-xs text-gray-600 line-clamp-2">
                          {task.description}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <BriefcaseIcon className="h-3 w-3 text-gray-500" />
                            <span>{task.projectName}</span>
                          </div>
                          
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-1 ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className={`flex-shrink-0 h-6 w-6 rounded-full ${getAvatarColor(task.assigneeName)} flex items-center justify-center text-white font-medium text-xs`}>
                            {task.assigneeAvatar}
                          </div>
                          
                          {isOverdue(task.dueDate, task.status) ? (
                            <span className="text-xs text-red-600 font-medium flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {formatDate(task.dueDate)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 flex items-center">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {tasks.length === 0 && (
                  <div className="py-4 px-2 text-center">
                    <p className="text-sm text-gray-500">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">Manage and track your tasks across projects</p>
          </div>
          <Button onClick={() => setLocation('/tasks/new')}>
            <PlusIcon className="mr-2 h-4 w-4" /> Create Task
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
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-2 min-w-[36px]"
            >
              <ClipboardListIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'board' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('board')}
              className="px-2 min-w-[36px]"
            >
              <LayoutIcon className="h-4 w-4" />
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
            className={statusFilter === "To Do" ? "bg-gray-100 text-gray-800 hover:bg-gray-200" : ""}
            onClick={() => setStatusFilter("To Do")}
          >
            To Do
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
            className={statusFilter === "Review" ? "bg-purple-100 text-purple-800 hover:bg-purple-200" : ""}
            onClick={() => setStatusFilter("Review")}
          >
            Review
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "Completed" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
            onClick={() => setStatusFilter("Completed")}
          >
            Completed
          </Button>
        </div>
      </div>
      
      {/* Tasks List/Board */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No tasks found matching your filters.</p>
          </CardContent>
        </Card>
      ) : (
        viewMode === 'list' ? renderListView() : renderBoardView()
      )}
    </div>
  );
}