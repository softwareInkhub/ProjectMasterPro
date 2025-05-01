import { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { 
  ArrowLeftIcon, 
  UserIcon, 
  BuildingIcon, 
  CalendarIcon, 
  PencilIcon,
  FolderIcon,
  BriefcaseIcon,
  LayoutGridIcon,
  UsersIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

// Department type
interface Department {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
  parentDepartmentId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Company type
interface Company {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  createdAt: string;
  updatedAt: string;
}

// User type
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  departmentId: string | null;
  companyId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Team type
interface Team {
  id: string;
  name: string;
  description: string | null;
  parentTeamId: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// Project type
interface Project {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  priority: string;
  companyId: string;
  teamId: string;
  departmentId: string | null;
  projectManagerId: string | null;
  progress: { percentage: number };
  createdAt: string;
  updatedAt: string;
}

// Extended type to include related data for UI display
interface DepartmentWithDetails extends Department {
  companyName: string;
  manager: string | null;
  headCount: number;
  teams: Team[];
  projects: Project[];
  users: User[];
}

export default function DepartmentDetailsPage() {
  const [, params] = useRoute('/departments/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const departmentId = params?.id || '';

  // Fetch department data
  const { 
    data: department, 
    isLoading: isLoadingDepartment, 
    error: departmentError
  } = useQuery({
    queryKey: ['/api/departments', departmentId],
    enabled: !!departmentId,
  });
  
  // Fetch company data if we have the department
  const {
    data: company,
    isLoading: isLoadingCompany
  } = useQuery({
    queryKey: ['/api/companies', department?.companyId],
    enabled: !!department?.companyId,
  });
  
  // Fetch users in this department
  const {
    data: users,
    isLoading: isLoadingUsers
  } = useQuery({
    queryKey: ['/api/users'],
    enabled: !!departmentId,
  });
  
  // Fetch teams
  const {
    data: teams,
    isLoading: isLoadingTeams
  } = useQuery({
    queryKey: ['/api/teams'],
    enabled: !!department?.companyId,
  });
  
  // Fetch projects
  const {
    data: projects,
    isLoading: isLoadingProjects
  } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!departmentId,
  });

  // Process and combine data
  const [departmentWithDetails, setDepartmentWithDetails] = useState<DepartmentWithDetails | null>(null);

  useEffect(() => {
    try {
      if (department && (!isLoadingCompany && !isLoadingUsers && !isLoadingTeams && !isLoadingProjects)) {
        // Filter users belonging to this department
        const departmentUsers = (users || []).filter((user: User) => user.departmentId === departmentId);
        
        // Find manager - assuming the first user with 'MANAGER' role or first user if none
        const manager = departmentUsers.find((user: User) => user.role === 'MANAGER');
        const managerName = manager 
          ? `${manager.firstName} ${manager.lastName}` 
          : (departmentUsers.length > 0 ? `${departmentUsers[0].firstName} ${departmentUsers[0].lastName}` : null);
        
        // Filter teams by company ID (ideally would filter by department)
        const departmentTeams = (teams || []).filter((team: Team) => team.companyId === department.companyId);
        
        // Filter projects for this department
        const departmentProjects = (projects || []).filter((project: Project) => 
          project.departmentId === departmentId
        );
        
        // Enhance with additional data
        setDepartmentWithDetails({
          ...department,
          companyName: company?.name || 'Unknown Company',
          manager: managerName,
          headCount: departmentUsers.length,
          teams: departmentTeams,
          projects: departmentProjects,
          users: departmentUsers
        });
      }
    } catch (error) {
      console.error('Error processing department data:', error);
      toast({
        title: 'Error',
        description: 'There was an error processing department data. Please try again.',
        variant: 'destructive'
      });
    }
  }, [department, company, users, teams, projects, isLoadingCompany, isLoadingUsers, isLoadingTeams, isLoadingProjects, departmentId, toast]);
  
  // Overall loading state
  const isLoading = isLoadingDepartment || isLoadingCompany || isLoadingUsers || isLoadingTeams || isLoadingProjects;
  const error = departmentError;

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Department</h2>
        <p className="text-gray-600 mb-6">
          We couldn't load the department details. Please try again later.
        </p>
        <Button onClick={() => setLocation('/departments')}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Departments
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with navigation */}
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation('/departments')}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="h-6 border-l border-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {isLoading ? (
                <Skeleton className="h-8 w-64" />
              ) : (
                <>
                  <FolderIcon className="h-6 w-6 text-primary-600" />
                  {departmentWithDetails?.name || "Department Details"}
                </>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation(`/departments/${departmentId}/edit`)}
            >
              <PencilIcon className="mr-2 h-4 w-4" /> Edit Department
            </Button>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-96" />
        </div>
      ) : departmentWithDetails ? (
        <div className="space-y-6">
          {/* Overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Department Info Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Department Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-sm">
                      {departmentWithDetails.description || "No description provided"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="text-sm font-medium hover:text-primary-600 cursor-pointer"
                         onClick={() => setLocation(`/companies/${departmentWithDetails.companyId}`)}>
                        {departmentWithDetails.companyName}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Manager</p>
                      <p className="text-sm font-medium">
                        {departmentWithDetails.manager}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-sm">
                        {formatDate(departmentWithDetails.createdAt)}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Updated</p>
                      <p className="text-sm">
                        {formatDate(departmentWithDetails.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Metrics Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Department Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm text-gray-500">Headcount</h3>
                    <div className="flex items-end mt-1">
                      <span className="text-3xl font-bold">{departmentWithDetails.headCount}</span>
                      <span className="text-sm text-gray-500 ml-1 mb-1">people</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-3">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="flex flex-col items-center">
                        <LayoutGridIcon className="h-5 w-5 text-gray-600 mb-2" />
                        <span className="text-lg font-bold">{departmentWithDetails.teams.length}</span>
                        <span className="text-xs text-gray-500">Teams</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="flex flex-col items-center">
                        <BriefcaseIcon className="h-5 w-5 text-gray-600 mb-2" />
                        <span className="text-lg font-bold">{departmentWithDetails.projects.length}</span>
                        <span className="text-xs text-gray-500">Projects</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Department Members Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Department Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentWithDetails.users.length > 0 ? (
                    <div className="space-y-3">
                      {departmentWithDetails.users.slice(0, 3).map((user) => (
                        <div key={user.id} className="flex items-start gap-3">
                          <div className="p-1.5 bg-purple-100 rounded-full mt-0.5">
                            <UserIcon className="h-3.5 w-3.5 text-purple-700" />
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">{user.firstName} {user.lastName}</span>
                            </p>
                            <p className="text-xs text-gray-500">{user.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500">No members assigned to this department yet</p>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation('/users?departmentId=' + departmentId)}
                  >
                    View All Members
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabbed content */}
          <Tabs defaultValue="teams" className="mt-6">
            <TabsList>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teams" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Teams ({departmentWithDetails.teams.length})</h3>
                    <Button variant="outline" onClick={() => setLocation('/teams/new')}>
                      Create Team
                    </Button>
                  </div>
                  
                  {departmentWithDetails.teams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {departmentWithDetails.teams.map((team) => (
                        <Card key={team.id} className="hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => setLocation(`/teams/${team.id}`)}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-100 rounded-full">
                                <UsersIcon className="h-4 w-4 text-blue-700" />
                              </div>
                              <div>
                                <h4 className="font-medium">{team.name}</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  {team.description || 'No description provided'}
                                </p>
                                <Badge variant="outline" className="mt-2 text-xs">
                                  Created {formatDate(team.createdAt)}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 border rounded-md">
                      <p className="text-gray-500 mb-4">No teams found for this department</p>
                      <Button variant="outline" onClick={() => setLocation('/teams/new')}>
                        Create First Team
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="projects" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Projects ({departmentWithDetails.projects.length})</h3>
                    <Button variant="outline" onClick={() => setLocation('/projects/new')}>
                      Create Project
                    </Button>
                  </div>
                  
                  {departmentWithDetails.projects.length > 0 ? (
                    <div className="space-y-4">
                      {departmentWithDetails.projects.map((project) => (
                        <div 
                          key={project.id} 
                          className="p-4 border rounded-md hover:shadow-sm cursor-pointer"
                          onClick={() => setLocation(`/projects/${project.id}`)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{project.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {project.status}
                                {project.endDate && ` • Due ${new Date(project.endDate).toLocaleDateString()}`}
                              </p>
                              {project.description && (
                                <p className="text-sm text-gray-500 mt-2">
                                  {project.description.length > 100 
                                    ? `${project.description.substring(0, 100)}...` 
                                    : project.description}
                                </p>
                              )}
                            </div>
                            <div>
                              <Badge className={
                                project.status === 'IN_PROGRESS' ? "bg-blue-100 text-blue-800" :
                                project.status === 'PLANNING' ? "bg-amber-100 text-amber-800" :
                                project.status === 'COMPLETED' ? "bg-green-100 text-green-800" :
                                "bg-gray-100 text-gray-800"
                              }>
                                {project.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 border rounded-md">
                      <p className="text-gray-500 mb-4">No projects found for this department</p>
                      <Button variant="outline" onClick={() => setLocation('/projects/new')}>
                        Create First Project
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="members" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Department Members ({departmentWithDetails.headCount})</h3>
                    <Button variant="outline" onClick={() => setLocation('/users/new')}>
                      Add Member
                    </Button>
                  </div>
                  
                  {departmentWithDetails.users.length > 0 ? (
                    <div className="space-y-4">
                      {departmentWithDetails.users.map((user) => (
                        <div 
                          key={user.id} 
                          className="p-4 border rounded-md hover:shadow-sm cursor-pointer flex justify-between items-center"
                          onClick={() => setLocation(`/users/${user.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center font-medium">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-medium">{user.firstName} {user.lastName}</h4>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                          <div>
                            <Badge className={
                              user.role === 'ADMIN' ? "bg-purple-100 text-purple-800" :
                              user.role === 'MANAGER' ? "bg-blue-100 text-blue-800" :
                              user.role === 'TEAM_LEAD' ? "bg-green-100 text-green-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 border rounded-md">
                      <p className="text-gray-500 mb-4">No members assigned to this department yet</p>
                      <Button variant="outline" onClick={() => setLocation('/users/new')}>
                        Add First Member
                      </Button>
                    </div>
                  )}
                  
                  {departmentWithDetails.users.length > 0 && (
                    <div className="mt-4 text-center">
                      <Button 
                        variant="link" 
                        onClick={() => setLocation('/users?departmentId=' + departmentId)}
                      >
                        View All Members
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            
          </Tabs>
        </div>
      ) : (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Department Not Found</h2>
          <p className="text-gray-600 mb-6">
            The department you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => setLocation('/departments')}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Departments
          </Button>
        </div>
      )}
    </div>
  );
}