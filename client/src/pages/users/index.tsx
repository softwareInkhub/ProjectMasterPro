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
  BriefcaseIcon,
  Loader2,
  Trash2Icon,
  FilterIcon
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import React from "react";

interface UsersPageProps {
  new?: boolean;
  detail?: boolean;
}

export default function UsersPage({ new: isNew, detail: isDetail }: UsersPageProps = {}) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const { toast } = useToast();
  const params = useParams();
  
  // If we're in new mode, show the new user page
  if (isNew) {
    // Render the new user form from users/new.tsx
    const NewUser = React.lazy(() => import('./new'));
    return (
      <React.Suspense fallback={<div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>}>
        <NewUser />
      </React.Suspense>
    );
  }
  
  // If we're in detail mode, show the user detail page
  if (isDetail && params.id) {
    // For now, we'll just show a placeholder since we haven't created the detail page yet
    return (
      <div className="text-center p-8 border rounded-lg">
        <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">User Detail View</h3>
        <p className="text-gray-500 mb-4">
          Viewing details for user with ID: {params.id}
        </p>
        <Button onClick={() => setLocation('/users')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Users
        </Button>
      </div>
    );
  }

  // Fetch users data from API
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['/api/users'],
    queryFn: getQueryFn()
  });

  // Fetch companies data for mapping company IDs to names
  const { data: companies = [] } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: getQueryFn()
  });

  // Fetch departments data for mapping department IDs to names
  const { data: departments = [] } = useQuery({
    queryKey: ['/api/departments'],
    queryFn: getQueryFn()
  });

  // Fetch teams data for mapping team IDs to names
  const { data: teams = [] } = useQuery({
    queryKey: ['/api/teams'],
    queryFn: getQueryFn()
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create maps for easy lookups
  const companyMap = new Map();
  companies.forEach((company: any) => {
    companyMap.set(company.id, company.name);
  });

  const departmentMap = new Map();
  departments.forEach((department: any) => {
    departmentMap.set(department.id, department.name);
  });

  const teamMap = new Map();
  teams.forEach((team: any) => {
    teamMap.set(team.id, team.name);
  });

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Add additional information to users
  const enhancedUsers = users.map((user: User) => {
    // Create a display name from firstName and lastName
    const displayName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.email.split('@')[0];
    
    return {
      ...user,
      name: displayName,
      status: user.status || "ACTIVE", // Default to ACTIVE if status is not present
      avatar: getInitials(displayName),
      department: departmentMap.get(user.departmentId) || "Unassigned",
      team: teamMap.get(user.teamId) || "Unassigned",
      company: companyMap.get(user.companyId) || "Unassigned"
    };
  });

  // Filter users based on search query and role filter
  const filteredUsers = enhancedUsers.filter((user: any) => {
    // Apply search filter
    const matchesSearch = searchQuery === "" || 
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.team && user.team.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply role filter
    const matchesRole = filterRole === "all" || (user.role && user.role === filterRole);
    
    return matchesSearch && matchesRole;
  });

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
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            className={filterRole === "all" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : ""}
            onClick={() => setFilterRole("all")}
          >
            All Roles
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={filterRole === "ADMIN" ? "bg-purple-100 text-purple-800 hover:bg-purple-200" : ""}
            onClick={() => setFilterRole("ADMIN")}
          >
            Admins
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={filterRole === "MANAGER" ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200" : ""}
            onClick={() => setFilterRole("MANAGER")}
          >
            Managers
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={filterRole === "TEAM_LEAD" ? "bg-teal-100 text-teal-800 hover:bg-teal-200" : ""}
            onClick={() => setFilterRole("TEAM_LEAD")}
          >
            Team Leads
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={filterRole === "DEVELOPER" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
            onClick={() => setFilterRole("DEVELOPER")}
          >
            Developers
          </Button>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-500 mb-6">
          <p className="font-medium">Error loading users:</p>
          <p>{error.message}</p>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && !error && filteredUsers.length === 0 && (
        <div className="text-center p-8 border rounded-lg">
          <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No users found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? 
              "No users match your search criteria. Try adjusting your filters." : 
              "Let's create your first user to get started."}
          </p>
          <Button onClick={() => setLocation('/users/new')}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      )}
      
      {/* Users List */}
      {!isLoading && !error && filteredUsers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card 
              key={user.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${user.status === "INACTIVE" ? "opacity-70" : ""}`}
              onClick={() => setLocation(`/users/${user.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 h-12 w-12 rounded-full ${getAvatarColor(user.name || "")} flex items-center justify-center text-white font-semibold text-lg`}>
                    {user.avatar}
                  </div>
                  <div>
                    <CardTitle>{user.name}</CardTitle>
                    <CardDescription>{user.role || "User"}</CardDescription>
                  </div>
                  {user.status === "INACTIVE" && (
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
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <PhoneIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{user.phone}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <BuildingIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Department:</span>
                      {user.departmentId ? (
                        <span 
                          className="font-medium cursor-pointer hover:text-primary-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/departments/${user.departmentId}`);
                          }}
                        >
                          {user.department}
                        </span>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BriefcaseIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Team:</span>
                      {user.teamId ? (
                        <span 
                          className="font-medium cursor-pointer hover:text-primary-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/teams/${user.teamId}`);
                          }}
                        >
                          {user.team}
                        </span>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this user?')) {
                      deleteUserMutation.mutate(user.id);
                    }
                  }}
                >
                  <Trash2Icon className="h-4 w-4 mr-1" /> Delete
                </Button>
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
      )}
    </div>
  );
}