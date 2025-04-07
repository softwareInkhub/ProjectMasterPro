import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, FilterIcon, SortAscIcon } from "lucide-react";
import { useLocation } from "wouter";

export default function ProjectsPage() {
  const [, setLocation] = useLocation();

  // Sample projects data - this would come from an API in the real application
  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      description: "Redesign the company website with modern UI/UX principles",
      status: "In Progress",
      completion: 75,
      startDate: "2025-01-15",
      endDate: "2025-05-01",
      teamLeader: "Sarah Johnson",
      priority: "High"
    },
    {
      id: 2,
      name: "Mobile App Development",
      description: "Create a native mobile app for both iOS and Android platforms",
      status: "Planning",
      completion: 20,
      startDate: "2025-02-01",
      endDate: "2025-08-15",
      teamLeader: "David Chen",
      priority: "Medium"
    },
    {
      id: 3,
      name: "Database Migration",
      description: "Migrate legacy database system to a modern cloud solution",
      status: "On Hold",
      completion: 45,
      startDate: "2025-01-10",
      endDate: "2025-03-30",
      teamLeader: "Michael Rodriguez",
      priority: "High"
    },
    {
      id: 4,
      name: "API Integration",
      description: "Integrate third-party payment processing APIs into the platform",
      status: "Completed",
      completion: 100,
      startDate: "2025-01-05",
      endDate: "2025-02-15",
      teamLeader: "Emma Wilson",
      priority: "Critical"
    },
    {
      id: 5,
      name: "Security Audit",
      description: "Conduct comprehensive security audit and implement recommendations",
      status: "Not Started",
      completion: 0,
      startDate: "2025-04-01",
      endDate: "2025-04-30",
      teamLeader: "James Taylor",
      priority: "Critical"
    }
  ];

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">Manage and track all your company projects</p>
          </div>
          <Button onClick={() => setLocation('/projects/new')}>
            <PlusIcon className="mr-2 h-4 w-4" /> Create Project
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
      
      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation(`/projects/${project.id}`)}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </div>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  project.status === "Completed" ? "bg-green-100 text-green-800" :
                  project.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                  project.status === "On Hold" ? "bg-yellow-100 text-yellow-800" :
                  project.status === "Not Started" ? "bg-gray-100 text-gray-800" :
                  "bg-purple-100 text-purple-800"
                }`}>
                  {project.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-500">Start Date</p>
                    <p>{project.startDate}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">End Date</p>
                    <p>{project.endDate}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Team Lead</p>
                    <p>{project.teamLeader}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Priority</p>
                    <p className={`inline-block px-2 py-0.5 rounded-full ${
                      project.priority === "Critical" ? "bg-red-100 text-red-800" :
                      project.priority === "High" ? "bg-orange-100 text-orange-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {project.priority}
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs font-medium">{project.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        project.status === "Completed" ? "bg-green-600" :
                        project.status === "In Progress" ? "bg-blue-600" :
                        project.status === "On Hold" ? "bg-yellow-600" :
                        "bg-gray-600"
                      }`}
                      style={{ width: `${project.completion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <Button variant="ghost" size="sm" onClick={(e) => {
                e.stopPropagation();
                // This would show tasks related to this project
                setLocation(`/tasks?projectId=${project.id}`);
              }}>
                View Tasks
              </Button>
              <Button variant="outline" size="sm" onClick={(e) => {
                e.stopPropagation();
                // This would navigate to edit project page
                setLocation(`/projects/${project.id}/edit`);
              }}>
                Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}