import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { BriefcaseIcon, CheckCircleIcon, ClipboardListIcon, UsersIcon, FolderIcon, ArrowLeftIcon } from "lucide-react";

// Simple temporary dashboard that doesn't rely on Auth context or API calls
export default function Dashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Management Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, Admin!</p>
          </div>
          <Button variant="outline" onClick={() => setLocation('/login')}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BriefcaseIcon className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500">3 projects added this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <ClipboardListIcon className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">64</div>
            <p className="text-xs text-gray-500">16 tasks completed this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <UsersIcon className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-gray-500">2 new members joined</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <FolderIcon className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-gray-500">Engineering, Marketing, etc.</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your most recently updated projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Website Redesign", status: "In Progress", completion: 75 },
                { name: "Mobile App Development", status: "Planning", completion: 20 },
                { name: "Database Migration", status: "On Hold", completion: 45 },
                { name: "API Integration", status: "Completed", completion: 100 }
              ].map((project, index) => (
                <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium">{project.name}</h3>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      project.status === "Completed" ? "bg-green-100 text-green-800" :
                      project.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                      project.status === "On Hold" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        project.status === "Completed" ? "bg-green-600" :
                        project.status === "In Progress" ? "bg-blue-600" :
                        project.status === "On Hold" ? "bg-yellow-600" :
                        "bg-gray-600"
                      }`}
                      style={{ width: `${project.completion}%` }}
                    ></div>
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-xs text-gray-500">{project.completion}% Complete</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setLocation('/projects')}>
              View All Projects
            </Button>
          </CardFooter>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Design Review", project: "Website Redesign", dueDate: "Tomorrow", priority: "High" },
                { name: "Stakeholder Meeting", project: "Mobile App", dueDate: "In 2 days", priority: "Medium" },
                { name: "Deploy API Updates", project: "API Integration", dueDate: "In 3 days", priority: "Critical" },
                { name: "QA Testing", project: "Database Migration", dueDate: "In 5 days", priority: "Low" }
              ].map((task, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start flex-col">
                    <h3 className="font-medium">{task.name}</h3>
                    <span className="text-sm text-gray-500">{task.project}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-500">{task.dueDate}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                      task.priority === "Critical" ? "bg-red-100 text-red-800" :
                      task.priority === "High" ? "bg-orange-100 text-orange-800" :
                      task.priority === "Medium" ? "bg-blue-100 text-blue-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setLocation('/tasks')}>
              View All Tasks
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Project Management System Message */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Welcome to the Project Management System</CardTitle>
          <CardDescription>
            This is a temporary dashboard view to help with development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            In the final version, this dashboard will display real-time data from your projects, 
            tasks, and team activities. You'll be able to view project progress, task assignments, 
            upcoming deadlines, and performance metrics - all in one place.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setLocation('/login')}>
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
