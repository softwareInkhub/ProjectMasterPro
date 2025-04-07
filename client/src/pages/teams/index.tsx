import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  PlusIcon, 
  FilterIcon, 
  SortAscIcon, 
  UsersIcon, 
  BriefcaseIcon, 
  FolderIcon,
  UserIcon,
  ClipboardListIcon
} from "lucide-react";
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

export default function TeamsPage() {
  const [, setLocation] = useLocation();
  const params = useQueryParams();
  const departmentId = params.get("departmentId");

  // Sample teams data - this would come from an API in the real application
  const teams = [
    {
      id: 1,
      name: "Frontend Development",
      description: "Web application UI/UX and client-side functionality",
      departmentId: 1,
      departmentName: "Engineering",
      companyId: 1,
      companyName: "Acme Corporation",
      teamLead: "Alice Chen",
      teamLeadId: 5,
      members: 8,
      projects: 3,
      activeTasks: 24
    },
    {
      id: 2,
      name: "Backend Development",
      description: "API development and server-side functionality",
      departmentId: 1,
      departmentName: "Engineering",
      companyId: 1,
      companyName: "Acme Corporation",
      teamLead: "Bob Jackson",
      teamLeadId: 8,
      members: 6,
      projects: 2,
      activeTasks: 18
    },
    {
      id: 3,
      name: "DevOps",
      description: "Infrastructure management and deployment",
      departmentId: 1,
      departmentName: "Engineering",
      companyId: 1,
      companyName: "Acme Corporation",
      teamLead: "Charlie Martinez",
      teamLeadId: 12,
      members: 4,
      projects: 1,
      activeTasks: 11
    },
    {
      id: 4,
      name: "QA",
      description: "Quality assurance and testing",
      departmentId: 1,
      departmentName: "Engineering",
      companyId: 1,
      companyName: "Acme Corporation",
      teamLead: "Diana Kim",
      teamLeadId: 15,
      members: 5,
      projects: 2,
      activeTasks: 17
    },
    {
      id: 5,
      name: "Digital Marketing",
      description: "Online marketing strategies and campaigns",
      departmentId: 2,
      departmentName: "Marketing",
      companyId: 1,
      companyName: "Acme Corporation",
      teamLead: "Eric Thompson",
      teamLeadId: 21,
      members: 6,
      projects: 2,
      activeTasks: 14
    },
    {
      id: 6,
      name: "Brand Management",
      description: "Brand identity and strategy",
      departmentId: 2,
      departmentName: "Marketing",
      companyId: 1,
      companyName: "Acme Corporation",
      teamLead: "Fiona Rodriguez",
      teamLeadId: 24,
      members: 4,
      projects: 1,
      activeTasks: 9
    }
  ];

  // Filter teams by department if departmentId is provided
  const filteredTeams = departmentId
    ? teams.filter(team => team.departmentId === parseInt(departmentId))
    : teams;

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {departmentId ? `${filteredTeams[0]?.departmentName} Teams` : 'All Teams'}
            </h1>
            <p className="text-gray-600 mt-1">
              {departmentId 
                ? `Teams under ${filteredTeams[0]?.departmentName} department` 
                : 'Manage your organization teams across all departments'}
            </p>
          </div>
          <Button onClick={() => setLocation('/teams/new')}>
            <PlusIcon className="mr-2 h-4 w-4" /> Create Team
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
        {!departmentId && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Department:</span>
            <Button variant="outline" size="sm" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              All Departments
            </Button>
            <Button variant="outline" size="sm">
              Engineering
            </Button>
            <Button variant="outline" size="sm">
              Marketing
            </Button>
          </div>
        )}
      </div>
      
      {/* Teams List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTeams.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No teams found for this department.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTeams.map((team) => (
            <Card 
              key={team.id} 
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <UsersIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <CardTitle>{team.name}</CardTitle>
                      <CardDescription>{team.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <FolderIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Department:</span>
                      <span 
                        className="font-medium cursor-pointer hover:text-primary-600"
                        onClick={() => setLocation(`/departments/${team.departmentId}`)}
                      >
                        {team.departmentName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Team Lead:</span>
                      <span className="font-medium">{team.teamLead}</span>
                    </div>
                  </div>
                
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="flex items-center justify-center mb-1">
                        <UserIcon className="h-4 w-4 text-gray-600 mr-1" />
                        <span className="text-sm text-gray-600">Members</span>
                      </div>
                      <p className="text-lg font-bold">{team.members}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="flex items-center justify-center mb-1">
                        <BriefcaseIcon className="h-4 w-4 text-gray-600 mr-1" />
                        <span className="text-sm text-gray-600">Projects</span>
                      </div>
                      <p className="text-lg font-bold">{team.projects}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="flex items-center justify-center mb-1">
                        <ClipboardListIcon className="h-4 w-4 text-gray-600 mr-1" />
                        <span className="text-sm text-gray-600">Tasks</span>
                      </div>
                      <p className="text-lg font-bold">{team.activeTasks}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLocation(`/teams/${team.id}/members`)}
                >
                  Team Members
                </Button>
                <div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/teams/${team.id}/edit`);
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/teams/${team.id}`);
                    }}
                  >
                    Details
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}