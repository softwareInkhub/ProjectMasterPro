import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, FilterIcon, SortAscIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon } from "lucide-react";
import { useLocation } from "wouter";

// Helper function to get search params from URL
function useQueryParams() {
  // Extract the search part of the URL
  const searchParams = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams('');
  
  return {
    get: (param: string) => searchParams.get(param)
  };
}

export default function TasksPage() {
  const [, setLocation] = useLocation();
  const params = useQueryParams();
  const projectId = params.get("projectId");

  // Sample tasks data - this would come from an API in the real application
  const tasks = [
    {
      id: 1,
      name: "Design Review",
      description: "Review the latest design mockups for the new landing page",
      projectId: 1,
      projectName: "Website Redesign",
      status: "In Progress",
      dueDate: "2025-04-15",
      assignee: "Sarah Johnson",
      priority: "High"
    },
    {
      id: 2,
      name: "Stakeholder Meeting",
      description: "Present project progress to stakeholders and collect feedback",
      projectId: 2,
      projectName: "Mobile App",
      status: "Pending",
      dueDate: "2025-04-16",
      assignee: "David Chen",
      priority: "Medium"
    },
    {
      id: 3,
      name: "Deploy API Updates",
      description: "Deploy the latest API changes to the staging environment",
      projectId: 4,
      projectName: "API Integration",
      status: "Blocked",
      dueDate: "2025-04-17",
      assignee: "Emma Wilson",
      priority: "Critical"
    },
    {
      id: 4,
      name: "QA Testing",
      description: "Perform quality assurance testing on database migration scripts",
      projectId: 3,
      projectName: "Database Migration",
      status: "To Do",
      dueDate: "2025-04-19",
      assignee: "Michael Rodriguez",
      priority: "Low"
    },
    {
      id: 5,
      name: "Security Vulnerability Scan",
      description: "Run automated security vulnerability scans on all systems",
      projectId: 5,
      projectName: "Security Audit",
      status: "Completed",
      dueDate: "2025-04-05",
      assignee: "James Taylor",
      priority: "Critical"
    }
  ];

  // Filter tasks by project if projectId is provided
  const filteredTasks = projectId
    ? tasks.filter(task => task.projectId === parseInt(projectId))
    : tasks;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case "In Progress":
        return <ClockIcon className="h-5 w-5 text-blue-600" />;
      case "Blocked":
        return <AlertCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Blocked":
        return "bg-red-100 text-red-800";
      case "To Do":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-blue-100 text-blue-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {projectId ? `Project Tasks` : 'All Tasks'}
            </h1>
            <p className="text-gray-600 mt-1">
              {projectId 
                ? `Tasks for ${filteredTasks[0]?.projectName || 'this project'}` 
                : 'Manage and track tasks across all projects'}
            </p>
          </div>
          <Button onClick={() => setLocation('/tasks/new')}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </header>
      
      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm">
            <FilterIcon className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" size="sm">
            <SortAscIcon className="mr-2 h-4 w-4" /> Sort
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Status:</span>
          <Button variant="outline" size="sm" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            In Progress
          </Button>
          <Button variant="outline" size="sm">
            Completed
          </Button>
          <Button variant="outline" size="sm">
            All
          </Button>
        </div>
      </div>
      
      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No tasks found for this project.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation(`/tasks/${task.id}`)}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <CardTitle className="text-lg">{task.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusClass(task.status)}`}>
                      {task.status}
                    </span>
                    <span className="text-sm text-gray-500 mt-1">Due: {task.dueDate}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-500">Project</p>
                    <p className="cursor-pointer hover:text-primary-600" onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/projects/${task.projectId}`);
                    }}>{task.projectName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Assigned To</p>
                    <p>{task.assignee}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Priority</p>
                    <p className={`inline-block px-2 py-0.5 rounded-full ${getPriorityClass(task.priority)}`}>
                      {task.priority}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}