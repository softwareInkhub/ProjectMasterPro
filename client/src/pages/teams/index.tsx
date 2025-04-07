import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamApi, companyApi, userApi } from "@/lib/api";
import { Team, Company, User } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash, Users, UserPlus } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Teams() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch teams
  const { data: teams = [], isLoading } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
  });

  // Fetch companies for dropdown
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  // Fetch users for team members
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Fetch team members when a team is selected
  const { data: teamMembers = [], refetch: refetchTeamMembers } = useQuery<User[]>({
    queryKey: [`/api/teams/${selectedTeam?.id}/members`],
    enabled: !!selectedTeam?.id,
  });

  // Form schema for team creation/edit
  const formSchema = z.object({
    name: z.string().min(1, "Team name is required"),
    description: z.string().optional(),
    companyId: z.string().min(1, "Company is required"),
    parentTeamId: z.string().optional().nullable(),
  });

  // Form setup for create
  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      companyId: user?.companyId || "",
      parentTeamId: null,
    },
  });

  // Form setup for edit
  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      companyId: "",
      parentTeamId: null,
    },
  });

  // Create team mutation
  const createTeam = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await teamApi.create(data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      toast({
        title: "Team created",
        description: "The team has been created successfully",
      });
      setIsCreateDialogOpen(false);
      createForm.reset({
        name: "",
        description: "",
        companyId: user?.companyId || "",
        parentTeamId: null,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update team mutation
  const updateTeam = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof formSchema> }) => {
      const response = await teamApi.update(id, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      toast({
        title: "Team updated",
        description: "The team has been updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedTeam(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update team. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete team mutation
  const deleteTeam = useMutation({
    mutationFn: async (id: string) => {
      await teamApi.delete(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      toast({
        title: "Team deleted",
        description: "The team has been deleted successfully",
      });
      setSelectedTeam(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add member to team mutation
  const addMember = useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      await teamApi.addMember(teamId, userId);
      return { teamId, userId };
    },
    onSuccess: () => {
      refetchTeamMembers();
      toast({
        title: "Member added",
        description: "The member has been added to the team",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add member to the team. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove member from team mutation
  const removeMember = useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      await teamApi.removeMember(teamId, userId);
      return { teamId, userId };
    },
    onSuccess: () => {
      refetchTeamMembers();
      toast({
        title: "Member removed",
        description: "The member has been removed from the team",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove member from the team. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle create form submission
  const onCreateSubmit = (values: z.infer<typeof formSchema>) => {
    createTeam.mutate({
      ...values,
      parentTeamId: values.parentTeamId || undefined,
    });
  };

  // Handle edit form submission
  const onEditSubmit = (values: z.infer<typeof formSchema>) => {
    if (selectedTeam) {
      updateTeam.mutate({
        id: selectedTeam.id,
        data: {
          ...values,
          parentTeamId: values.parentTeamId || undefined,
        },
      });
    }
  };

  // Handle edit dialog open
  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    editForm.reset({
      name: team.name,
      description: team.description || "",
      companyId: team.companyId,
      parentTeamId: team.parentTeamId || null,
    });
    setIsEditDialogOpen(true);
  };

  // Handle manage members dialog open
  const handleManageMembers = (team: Team) => {
    setSelectedTeam(team);
    setIsMembersDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteTeam = (team: Team) => {
    setSelectedTeam(team);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedTeam) {
      deleteTeam.mutate(selectedTeam.id);
    }
  };

  // Handle member toggle
  const toggleMember = (userId: string) => {
    if (!selectedTeam) return;
    
    const isCurrentMember = teamMembers.some(member => member.id === userId);
    
    if (isCurrentMember) {
      removeMember.mutate({ teamId: selectedTeam.id, userId });
    } else {
      addMember.mutate({ teamId: selectedTeam.id, userId });
    }
  };

  // Find parent team name
  const getParentTeamName = (parentId?: string) => {
    if (!parentId) return "None";
    const parent = teams.find(team => team.id === parentId);
    return parent ? parent.name : "Unknown";
  };

  // Find company name
  const getCompanyName = (companyId: string) => {
    const company = companies.find(company => company.id === companyId);
    return company ? company.name : "Unknown";
  };

  // Get user initials
  const getUserInitials = (user: User) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  // Check if user has required permissions
  const canManageTeams = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "TEAM_LEAD";

  // Table columns configuration
  const columns = [
    {
      header: "Name",
      accessorKey: "name" as keyof Team,
    },
    {
      header: "Company",
      accessorKey: "companyId" as keyof Team,
      cell: (team: Team) => getCompanyName(team.companyId),
    },
    {
      header: "Parent Team",
      accessorKey: "parentTeamId" as keyof Team,
      cell: (team: Team) => getParentTeamName(team.parentTeamId),
    },
    {
      header: "Created",
      accessorKey: "createdAt" as keyof Team,
      cell: (team: Team) => format(new Date(team.createdAt), "MMM d, yyyy"),
    },
    {
      header: "Actions",
      cell: (team: Team) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              handleManageMembers(team);
            }}
          >
            <Users className="h-4 w-4" />
            <span className="sr-only">Manage members</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              handleEditTeam(team);
            }}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit team</span>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTeam(team);
                }}
              >
                <Trash className="h-4 w-4 text-destructive" />
                <span className="sr-only">Delete team</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Team</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{selectedTeam?.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  if (!canManageTeams) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Permission Denied</CardTitle>
          <CardDescription>You don't have permission to manage teams.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please contact an administrator if you believe you should have access to this page.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Teams</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Team Name</label>
                  <Input
                    {...createForm.register("name")}
                    placeholder="Enter team name"
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-sm text-red-600">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    {...createForm.register("description")}
                    placeholder="Enter team description"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <Select
                    onValueChange={(value) => createForm.setValue("companyId", value)}
                    defaultValue={user?.companyId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {createForm.formState.errors.companyId && (
                    <p className="text-sm text-red-600">{createForm.formState.errors.companyId.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Parent Team (Optional)</label>
                  <Select
                    onValueChange={(value) => createForm.setValue("parentTeamId", value)}
                    defaultValue=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTeam.isPending}>
                    {createTeam.isPending ? "Creating..." : "Create Team"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Edit team dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Name</label>
                <Input
                  {...editForm.register("name")}
                  placeholder="Enter team name"
                />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  {...editForm.register("description")}
                  placeholder="Enter team description"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Select
                  onValueChange={(value) => editForm.setValue("companyId", value)}
                  defaultValue={selectedTeam?.companyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editForm.formState.errors.companyId && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.companyId.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent Team (Optional)</label>
                <Select
                  onValueChange={(value) => editForm.setValue("parentTeamId", value)}
                  defaultValue={selectedTeam?.parentTeamId || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {teams
                      .filter(team => team.id !== selectedTeam?.id) // Prevent circular reference
                      .map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTeam.isPending}>
                  {updateTeam.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Manage team members dialog */}
      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Team Members - {selectedTeam?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Current Members: {teamMembers.length}</h3>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Members</span>
              </Button>
            </div>
            
            <div className="border rounded-md">
              <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
                {users.map((potentialMember) => {
                  const isTeamMember = teamMembers.some(member => member.id === potentialMember.id);
                  
                  return (
                    <div 
                      key={potentialMember.id} 
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {getUserInitials(potentialMember)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {potentialMember.firstName} {potentialMember.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{potentialMember.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500 mr-2">{potentialMember.role}</p>
                        <Checkbox 
                          checked={isTeamMember}
                          onCheckedChange={() => toggleMember(potentialMember.id)}
                          disabled={addMember.isPending || removeMember.isPending}
                        />
                      </div>
                    </div>
                  );
                })}
                
                {users.length === 0 && (
                  <div className="text-center py-4 text-gray-500">No users available</div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsMembersDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">Loading teams...</div>
      ) : (
        <DataTable
          data={teams}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search teams..."
        />
      )}
    </div>
  );
}
