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

// Extended type to include related data for UI display
interface DepartmentWithDetails extends Department {
  companyName: string;
  manager: string;
  headCount: number;
  budget: number;
  teams: number;
  projects: number;
}

export default function DepartmentDetailsPage() {
  const [, params] = useRoute('/departments/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const departmentId = params?.id || '';

  // Fetch department data
  const { 
    data: department, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/departments', departmentId],
    enabled: !!departmentId,
  });

  // Mock enhanced department data
  // In a real application, this would be fetched from the API or composed from multiple API calls
  const [departmentWithDetails, setDepartmentWithDetails] = useState<DepartmentWithDetails | null>(null);

  useEffect(() => {
    if (department) {
      // Enhance with additional data for UI
      setDepartmentWithDetails({
        ...department,
        companyName: "Acme Corporation", // This would come from another API call in real app
        manager: "John Doe", // This would be fetched from users API
        headCount: 42,
        budget: 2500000,
        teams: 5,
        projects: 8
      });
    }
  }, [department]);

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
                  
                  <div>
                    <h3 className="text-sm text-gray-500">Annual Budget</h3>
                    <p className="text-xl font-semibold mt-1">{formatCurrency(departmentWithDetails.budget)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-3">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="flex flex-col items-center">
                        <LayoutGridIcon className="h-5 w-5 text-gray-600 mb-2" />
                        <span className="text-lg font-bold">{departmentWithDetails.teams}</span>
                        <span className="text-xs text-gray-500">Teams</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="flex flex-col items-center">
                        <BriefcaseIcon className="h-5 w-5 text-gray-600 mb-2" />
                        <span className="text-lg font-bold">{departmentWithDetails.projects}</span>
                        <span className="text-xs text-gray-500">Projects</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Activity Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-full mt-0.5">
                        <BriefcaseIcon className="h-3.5 w-3.5 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-sm">New project <span className="font-medium">Mobile App Redesign</span> was added</p>
                        <p className="text-xs text-gray-500">2 days ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-green-100 rounded-full mt-0.5">
                        <UsersIcon className="h-3.5 w-3.5 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm"><span className="font-medium">Team Alpha</span> added 2 new members</p>
                        <p className="text-xs text-gray-500">5 days ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-purple-100 rounded-full mt-0.5">
                        <UserIcon className="h-3.5 w-3.5 text-purple-700" />
                      </div>
                      <div>
                        <p className="text-sm"><span className="font-medium">John Doe</span> was promoted to Department Manager</p>
                        <p className="text-xs text-gray-500">2 weeks ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full" variant="outline" size="sm">
                    View All Activity
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
              <TabsTrigger value="budget">Budget</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teams" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Teams ({departmentWithDetails.teams})</h3>
                    <Button variant="outline" onClick={() => setLocation('/teams/new')}>
                      Create Team
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* This would be a map over actual teams data in a real app */}
                    {Array(departmentWithDetails.teams).fill(0).map((_, i) => (
                      <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setLocation(`/teams/${i+1}`)}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <UsersIcon className="h-4 w-4 text-blue-700" />
                            </div>
                            <div>
                              <h4 className="font-medium">{["UX Team", "DevOps", "Frontend", "Backend", "Data Analytics"][i % 5]}</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {Math.floor(Math.random() * 8) + 3} members
                              </p>
                              <Badge variant="outline" className="mt-2 text-xs">
                                {Math.floor(Math.random() * 3) + 1} projects
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="projects" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Projects ({departmentWithDetails.projects})</h3>
                    <Button variant="outline" onClick={() => setLocation('/projects/new')}>
                      Create Project
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {Array(departmentWithDetails.projects).fill(0).map((_, i) => (
                      <div key={i} className="p-4 border rounded-md hover:shadow-sm cursor-pointer"
                           onClick={() => setLocation(`/projects/${i+1}`)}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">
                              {["Website Redesign", "Mobile App", "API Integration", "Cloud Migration", 
                                "CRM Implementation", "Data Warehouse", "Security Audit", "UI Refresh"][i % 8]}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {["In Progress", "Planning", "Completed", "On Hold"][i % 4]}
                              {" • Due "}
                              {new Date(Date.now() + 1000 * 60 * 60 * 24 * (i * 15 + 10)).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <Badge className={[
                              "bg-blue-100 text-blue-800",
                              "bg-amber-100 text-amber-800",
                              "bg-green-100 text-green-800",
                              "bg-gray-100 text-gray-800",
                            ][i % 4]}>
                              {["In Progress", "Planning", "Completed", "On Hold"][i % 4]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="members" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Department Members ({departmentWithDetails.headCount})</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      This section would show all members across teams in this department.
                    </p>
                    <Button onClick={() => setLocation('/users?departmentId=' + departmentId)}>
                      View All Members
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="budget" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Budget Information</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Annual Budget</span>
                      <span className="font-semibold">{formatCurrency(departmentWithDetails.budget)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Quarterly Allocation</span>
                      <span>{formatCurrency(departmentWithDetails.budget / 4)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Per-Employee Average</span>
                      <span>{formatCurrency(departmentWithDetails.budget / departmentWithDetails.headCount)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Equipment & Resources</span>
                      <span>{formatCurrency(departmentWithDetails.budget * 0.35)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Training & Development</span>
                      <span>{formatCurrency(departmentWithDetails.budget * 0.15)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Operational Expenses</span>
                      <span>{formatCurrency(departmentWithDetails.budget * 0.1)}</span>
                    </div>
                  </div>
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