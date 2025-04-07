import { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { 
  ArrowLeftIcon, 
  UserIcon, 
  BuildingIcon, 
  CalendarIcon, 
  PencilIcon,
  UsersIcon,
  BriefcaseIcon,
  PlusIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

// Team type
interface Team {
  id: string;
  name: string;
  description: string | null;
  departmentId: string;
  leadId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Extended type to include related data for UI display
interface TeamWithDetails extends Team {
  departmentName: string;
  leadName: string | null;
  memberCount: number;
  projects: number;
  members: TeamMember[];
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export default function TeamDetailsPage() {
  const [, params] = useRoute('/teams/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const teamId = params?.id || '';

  // Fetch team data
  const { 
    data: team, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/teams', teamId],
    enabled: !!teamId,
  });

  // Mock enhanced team data
  // In a real application, this would be fetched from the API or composed from multiple API calls
  const [teamWithDetails, setTeamWithDetails] = useState<TeamWithDetails | null>(null);

  useEffect(() => {
    if (team) {
      // Enhance with additional data for UI
      setTeamWithDetails({
        ...team,
        departmentName: "Engineering", // This would come from another API call in real app
        leadName: "Sarah Johnson", // This would be fetched from users API
        memberCount: 8,
        projects: 4,
        members: [
          { id: "1", name: "Sarah Johnson", email: "sarah@example.com", role: "Team Lead", avatar: "" },
          { id: "2", name: "Michael Chen", email: "michael@example.com", role: "Senior Developer", avatar: "" },
          { id: "3", name: "Alex Rodriguez", email: "alex@example.com", role: "DevOps Engineer", avatar: "" },
          { id: "4", name: "Emma Wilson", email: "emma@example.com", role: "UX Designer", avatar: "" },
          { id: "5", name: "James Brown", email: "james@example.com", role: "Developer", avatar: "" },
          { id: "6", name: "Olivia Martinez", email: "olivia@example.com", role: "QA Engineer", avatar: "" },
          { id: "7", name: "William Taylor", email: "william@example.com", role: "Developer", avatar: "" },
          { id: "8", name: "Sophia Davis", email: "sophia@example.com", role: "Product Manager", avatar: "" }
        ]
      });
    }
  }, [team]);

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Handle error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Team</h2>
        <p className="text-gray-600 mb-6">
          We couldn't load the team details. Please try again later.
        </p>
        <Button onClick={() => setLocation('/teams')}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Teams
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
              onClick={() => setLocation('/teams')}
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
                  <UsersIcon className="h-6 w-6 text-primary-600" />
                  {teamWithDetails?.name || "Team Details"}
                </>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation(`/teams/edit/${teamId}`)}
            >
              <PencilIcon className="mr-2 h-4 w-4" /> Edit Team
            </Button>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-96" />
        </div>
      ) : teamWithDetails ? (
        <div className="space-y-6">
          {/* Overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Info Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Team Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-sm">
                      {teamWithDetails.description || "No description provided"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Department</p>
                      <Badge className="font-medium hover:bg-primary-100 cursor-pointer"
                         onClick={() => setLocation(`/departments/${teamWithDetails.departmentId}`)}>
                        {teamWithDetails.departmentName}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Team Lead</p>
                      <p className="text-sm font-medium">
                        {teamWithDetails.leadName || "No lead assigned"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-sm flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5 text-gray-500" />
                        {formatDate(teamWithDetails.createdAt)}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Members</p>
                      <p className="text-sm flex items-center gap-1">
                        <UsersIcon className="h-3.5 w-3.5 text-gray-500" />
                        {teamWithDetails.memberCount} people
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Projects & Activity Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Projects & Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Active Projects</h3>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">View All</Button>
                    </div>
                    <div className="mt-2 space-y-2">
                      {Array(Math.min(3, teamWithDetails.projects)).fill(0).map((_, i) => (
                        <div key={i} className="p-2 border rounded-md hover:bg-muted/50 cursor-pointer flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-primary-100 rounded">
                              <BriefcaseIcon className="h-3.5 w-3.5 text-primary-600" />
                            </div>
                            <span className="text-sm font-medium">
                              {["Website Redesign", "Mobile App", "API Integration"][i % 3]}
                            </span>
                          </div>
                          <Badge variant="outline" className={["bg-blue-50 text-blue-700", "bg-green-50 text-green-700", "bg-amber-50 text-amber-700"][i % 3]}>
                            {["In Progress", "Completed", "Planning"][i % 3]}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Recent Activity</h3>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">View All</Button>
                    </div>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="p-1 bg-green-100 rounded-full mt-0.5">
                          <UsersIcon className="h-3 w-3 text-green-700" />
                        </div>
                        <div>
                          <p className="text-xs">New member <span className="font-medium">Sophia Davis</span> joined the team</p>
                          <p className="text-xs text-gray-500">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                          <BriefcaseIcon className="h-3 w-3 text-blue-700" />
                        </div>
                        <div>
                          <p className="text-xs">New project <span className="font-medium">API Integration</span> was assigned</p>
                          <p className="text-xs text-gray-500">5 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabbed content */}
          <Tabs defaultValue="members" className="mt-6">
            <TabsList>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="members" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Team Members ({teamWithDetails.memberCount})</h3>
                    <Button onClick={() => toast({ title: 'Add Member', description: 'This would open a dialog to add a new team member' })}>
                      <PlusIcon className="mr-2 h-4 w-4" /> Add Member
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="w-24 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamWithDetails.members.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  {member.avatar ? (
                                    <AvatarImage src={member.avatar} alt={member.name} />
                                  ) : (
                                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                  )}
                                </Avatar>
                                <span className="font-medium">{member.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{member.role}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <span className="sr-only">Open menu</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                                      <path d="M4 8C4 8.53043 3.78929 9.03914 3.41421 9.41421C3.03914 9.78929 2.53043 10 2 10C1.46957 10 0.960859 9.78929 0.585786 9.41421C0.210714 9.03914 0 8.53043 0 8C0 7.46957 0.210714 6.96086 0.585786 6.58579C0.960859 6.21071 1.46957 6 2 6C2.53043 6 3.03914 6.21071 3.41421 6.58579C3.78929 6.96086 4 7.46957 4 8ZM10 8C10 8.53043 9.78929 9.03914 9.41421 9.41421C9.03914 9.78929 8.53043 10 8 10C7.46957 10 6.96086 9.78929 6.58579 9.41421C6.21071 9.03914 6 8.53043 6 8C6 7.46957 6.21071 6.96086 6.58579 6.58579C6.96086 6.21071 7.46957 6 8 6C8.53043 6 9.03914 6.21071 9.41421 6.58579C9.78929 6.96086 10 7.46957 10 8ZM16 8C16 8.53043 15.7893 9.03914 15.4142 9.41421C15.0391 9.78929 14.5304 10 14 10C13.4696 10 12.9609 9.78929 12.5858 9.41421C12.2107 9.03914 12 8.53043 12 8C12 7.46957 12.2107 6.96086 12.5858 6.58579C12.9609 6.21071 13.4696 6 14 6C14.5304 6 15.0391 6.21071 15.4142 6.58579C15.7893 6.96086 16 7.46957 16 8Z" fill="currentColor"/>
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => setLocation(`/users/${member.id}`)}>
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Assign as Lead</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    Remove from Team
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="projects" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Team Projects ({teamWithDetails.projects})</h3>
                    <Button onClick={() => setLocation('/projects/new')}>
                      <PlusIcon className="mr-2 h-4 w-4" /> New Project
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {Array(teamWithDetails.projects).fill(0).map((_, i) => (
                      <div key={i} className="p-4 border rounded-md hover:shadow-sm cursor-pointer"
                           onClick={() => setLocation(`/projects/${i+1}`)}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">
                              {["Website Redesign", "Mobile App", "API Integration", "Cloud Migration"][i % 4]}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {["In Progress", "Planning", "Completed", "On Hold"][i % 4]}
                              {" • Due "}
                              {new Date(Date.now() + 1000 * 60 * 60 * 24 * (i * 15 + 10)).toLocaleDateString()}
                            </p>
                            <div className="flex items-center mt-2 gap-2">
                              <div className="flex -space-x-2">
                                {[...Array(3)].map((_, j) => (
                                  <Avatar key={j} className="h-6 w-6 border-2 border-white">
                                    <AvatarFallback className="text-xs">
                                      {String.fromCharCode(65 + j)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">3 members</span>
                            </div>
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
            
            <TabsContent value="performance" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Performance metrics will be displayed here. Data would include project completion rates, 
                      velocity, quality metrics, and other KPIs relevant to team performance.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <h4 className="text-sm text-gray-500">Projects Completed</h4>
                          <p className="text-2xl font-bold mt-1">12</p>
                          <p className="text-xs text-green-600 mt-1">+20% from last month</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <h4 className="text-sm text-gray-500">Avg. Completion Time</h4>
                          <p className="text-2xl font-bold mt-1">14 days</p>
                          <p className="text-xs text-red-600 mt-1">+2 days from last month</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <h4 className="text-sm text-gray-500">Satisfaction Score</h4>
                          <p className="text-2xl font-bold mt-1">4.8/5</p>
                          <p className="text-xs text-green-600 mt-1">+0.2 from last month</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Team Not Found</h2>
          <p className="text-gray-600 mb-6">
            The team you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => setLocation('/teams')}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Teams
          </Button>
        </div>
      )}
    </div>
  );
}