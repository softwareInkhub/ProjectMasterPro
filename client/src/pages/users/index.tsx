import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  PlusIcon, 
  SearchIcon, 
  SortAscIcon, 
  UserIcon, 
  MailIcon,
  PhoneIcon,
  BuildingIcon,
  BriefcaseIcon
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function UsersPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Sample users data - this would come from an API in the real application
  const users = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@acmecorp.example",
      phone: "+1 (555) 123-4567",
      role: "Developer",
      department: "Engineering",
      departmentId: 1,
      team: "Frontend Development",
      teamId: 1,
      company: "Acme Corporation",
      companyId: 1,
      avatar: "JS",
      status: "Active"
    },
    {
      id: 2,
      name: "Emily Johnson",
      email: "emily.johnson@acmecorp.example",
      phone: "+1 (555) 234-5678",
      role: "Manager",
      department: "Marketing",
      departmentId: 2,
      team: "Digital Marketing",
      teamId: 5,
      company: "Acme Corporation",
      companyId: 1,
      avatar: "EJ",
      status: "Active"
    },
    {
      id: 3,
      name: "Michael Wilson",
      email: "michael.wilson@acmecorp.example",
      phone: "+1 (555) 345-6789",
      role: "Manager",
      department: "Finance",
      departmentId: 3,
      team: "Financial Planning",
      teamId: 7,
      company: "Acme Corporation",
      companyId: 1,
      avatar: "MW",
      status: "Active"
    },
    {
      id: 4,
      name: "Sarah Brown",
      email: "sarah.brown@acmecorp.example",
      phone: "+1 (555) 456-7890",
      role: "Manager",
      department: "Human Resources",
      departmentId: 4,
      team: "Recruitment",
      teamId: 9,
      company: "Acme Corporation",
      companyId: 1,
      avatar: "SB",
      status: "Active"
    },
    {
      id: 5,
      name: "Alice Chen",
      email: "alice.chen@acmecorp.example",
      phone: "+1 (555) 567-8901",
      role: "Team Lead",
      department: "Engineering",
      departmentId: 1,
      team: "Frontend Development",
      teamId: 1,
      company: "Acme Corporation",
      companyId: 1,
      avatar: "AC",
      status: "Active"
    },
    {
      id: 6,
      name: "David Lee",
      email: "david.lee@globex.example",
      phone: "+1 (555) 678-9012",
      role: "Manager",
      department: "Research & Development",
      departmentId: 5,
      team: "Product Innovation",
      teamId: 12,
      company: "Globex Industries",
      companyId: 2,
      avatar: "DL",
      status: "Active"
    },
    {
      id: 7,
      name: "Emma Wilson",
      email: "emma.wilson@acmecorp.example",
      phone: "+1 (555) 789-0123",
      role: "Developer",
      department: "Engineering",
      departmentId: 1,
      team: "Backend Development",
      teamId: 2,
      company: "Acme Corporation",
      companyId: 1,
      avatar: "EW",
      status: "Inactive"
    },
    {
      id: 8,
      name: "Bob Jackson",
      email: "bob.jackson@acmecorp.example",
      phone: "+1 (555) 890-1234",
      role: "Team Lead",
      department: "Engineering",
      departmentId: 1,
      team: "Backend Development",
      teamId: 2,
      company: "Acme Corporation",
      companyId: 1,
      avatar: "BJ",
      status: "Active"
    }
  ];

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    searchQuery === "" || 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
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

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-1">Manage user accounts and team assignments</p>
          </div>
          <Button onClick={() => setLocation('/users/new')}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </header>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:w-72">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <SortAscIcon className="mr-2 h-4 w-4" /> Sort
          </Button>
          <Button variant="outline" size="sm">
            Active
          </Button>
          <Button variant="outline" size="sm">
            All
          </Button>
        </div>
      </div>
      
      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card 
            key={user.id} 
            className={`hover:shadow-md transition-shadow cursor-pointer ${user.status === "Inactive" ? "opacity-70" : ""}`}
            onClick={() => setLocation(`/users/${user.id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 h-12 w-12 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white font-semibold text-lg`}>
                  {user.avatar || getInitials(user.name)}
                </div>
                <div>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>{user.role}</CardDescription>
                </div>
                {user.status === "Inactive" && (
                  <span className="ml-auto px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MailIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <PhoneIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{user.phone}</span>
                </div>
                <div className="pt-2 border-t mt-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <BuildingIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Department:</span>
                    <span 
                      className="font-medium cursor-pointer hover:text-primary-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/departments/${user.departmentId}`);
                      }}
                    >
                      {user.department}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BriefcaseIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Team:</span>
                    <span 
                      className="font-medium cursor-pointer hover:text-primary-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/teams/${user.teamId}`);
                      }}
                    >
                      {user.team}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation(`/users/${user.id}/edit`);
                }}
              >
                Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}