import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { 
  BriefcaseIcon, 
  ClipboardListIcon, 
  UsersIcon, 
  FolderIcon, 
  BuildingIcon, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  // Fetch data from API
  const { data: projects = [], isLoading: isLoadingProjects, error: projectsError } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: getQueryFn()
  });

  const { data: tasks = [], isLoading: isLoadingTasks, error: tasksError } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: getQueryFn()
  });

  const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['/api/users'],
    queryFn: getQueryFn()
  });

  const { data: departments = [], isLoading: isLoadingDepartments, error: departmentsError } = useQuery({
    queryKey: ['/api/departments'],
    queryFn: getQueryFn()
  });

  const { data: companies = [], isLoading: isLoadingCompanies, error: companiesError } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: getQueryFn()
  });

  const { data: stories = [], isLoading: isLoadingStories, error: storiesError } = useQuery({
    queryKey: ['/api/stories'],
    queryFn: getQueryFn()
  });

  const { data: epics = [], isLoading: isLoadingEpics, error: epicsError } = useQuery({
    queryKey: ['/api/epics'],
    queryFn: getQueryFn()
  });
  
  // Count active tasks (tasks not in DONE or COMPLETED status)
  const activeTasks = tasks.filter((task: any) => 
    task.status !== "DONE" && task.status !== "COMPLETED"
  ).length;

  // Count completed tasks
  const completedTasks = tasks.filter((task: any) => 
    task.status === "DONE" || task.status === "COMPLETED"
  ).length;

  // Get recent projects (sorted by updatedAt)
  const recentProjects = [...projects].sort((a: any, b: any) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 4);

  // Calculate project completion based on story completion
  const getProjectCompletion = (projectId: string) => {
    const projectStories = stories.filter((story: any) => story.projectId === projectId);
    
    if (projectStories.length === 0) return 0;
    
    const completedStories = projectStories.filter(
      (story: any) => story.status === "DONE" || story.status === "COMPLETED"
    ).length;
    
    return Math.round((completedStories / projectStories.length) * 100);
  };

  // Get upcoming tasks (with due dates in next 7 days)
  const today = new Date();
  const next7Days = new Date();
  next7Days.setDate(today.getDate() + 7);
  
  const upcomingTasks = tasks
    .filter((task: any) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= next7Days;
    })
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  // Format due date for display
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Get project name by ID
  const getProjectName = (projectId: string) => {
    const project = projects.find((p: any) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  // Loading state
  const isLoading = isLoadingProjects || isLoadingTasks || isLoadingUsers || 
                   isLoadingDepartments || isLoadingCompanies || 
                   isLoadingStories || isLoadingEpics;

  // Error state
  const hasError = projectsError || tasksError || usersError || 
                  departmentsError || companiesError || 
                  storiesError || epicsError;

  // Get user fullname
  const getUserFullName = (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    if (!user) return "Unknown User";
    
    return user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.email.split('@')[0];
  };

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your project dashboard</p>
        </div>
      </header>

      {/* Loading or Error State */}
      {isLoading && (
        <div className="flex justify-center items-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Loading dashboard data...</p>
        </div>
      )}

      {hasError && (
        <Card className="mb-8 bg-red-50">
          <CardHeader>
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <CardTitle>Error Loading Data</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              There was a problem loading some of your data. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !hasError && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <BriefcaseIcon className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-gray-500">
                  {epics.length} epics across all projects
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                <ClipboardListIcon className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeTasks}</div>
                <p className="text-xs text-gray-500">
                  {completedTasks} tasks completed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <UsersIcon className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-gray-500">
                  Across {departments.length} departments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Companies</CardTitle>
                <BuildingIcon className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{companies.length}</div>
                <p className="text-xs text-gray-500">
                  With {departments.length} departments
                </p>
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
                {recentProjects.length > 0 ? (
                  <div className="space-y-4">
                    {recentProjects.map((project: any) => {
                      const completion = getProjectCompletion(project.id);
                      return (
                        <div key={project.id} className="border-b pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="font-medium">{project.name}</h3>
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              project.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                              project.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                              project.status === "ON_HOLD" ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {project.status}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                project.status === "COMPLETED" ? "bg-green-600" :
                                project.status === "IN_PROGRESS" ? "bg-blue-600" :
                                project.status === "ON_HOLD" ? "bg-yellow-600" :
                                "bg-gray-600"
                              }`}
                              style={{ width: `${completion}%` }}
                            ></div>
                          </div>
                          <div className="text-right mt-1">
                            <span className="text-xs text-gray-500">{completion}% Complete</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No projects found</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setLocation('/projects/new')}
                    >
                      Create First Project
                    </Button>
                  </div>
                )}
              </CardContent>
              {recentProjects.length > 0 && (
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setLocation('/projects')}>
                    View All Projects
                  </Button>
                </CardFooter>
              )}
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Tasks due in the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingTasks.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingTasks.map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex items-start flex-col">
                          <h3 className="font-medium">{task.name}</h3>
                          <span className="text-sm text-gray-500">{getProjectName(task.projectId)}</span>
                          <span className="text-xs text-gray-400">Assigned to: {getUserFullName(task.assigneeId)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm text-gray-500">{formatDueDate(task.dueDate)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                            task.priority === "CRITICAL" ? "bg-red-100 text-red-800" :
                            task.priority === "HIGH" ? "bg-orange-100 text-orange-800" :
                            task.priority === "MEDIUM" ? "bg-blue-100 text-blue-800" :
                            "bg-green-100 text-green-800"
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No upcoming tasks</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setLocation('/tasks/new')}
                    >
                      Create New Task
                    </Button>
                  </div>
                )}
              </CardContent>
              {upcomingTasks.length > 0 && (
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setLocation('/tasks')}>
                    View All Tasks
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>

          {/* Project Management System Message */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Project Management System</CardTitle>
              <CardDescription>
                Manage your projects, tasks, and teams efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                This dashboard provides an overview of your project management system. You can view project progress, 
                task assignments, upcoming deadlines, and performance metrics all in one place.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/companies')}
              >
                <BuildingIcon className="h-4 w-4 mr-2" />
                Companies
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/projects')}
              >
                <BriefcaseIcon className="h-4 w-4 mr-2" />
                Projects
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/tasks')}
              >
                <ClipboardListIcon className="h-4 w-4 mr-2" />
                Tasks
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
