import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, companyApi, departmentApi } from "@/lib/api";
import { User, Company, Department } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Users() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // Fetch users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Fetch companies for dropdown
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  // Fetch departments for dropdown
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  // Form schema for user creation
  const createFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["ADMIN", "MANAGER", "TEAM_LEAD", "DEVELOPER", "VIEWER"]),
    companyId: z.string().min(1, "Company is required"),
    departmentId: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).default("ACTIVE"),
  });

  // Form schema for user edit
  const editFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["ADMIN", "MANAGER", "TEAM_LEAD", "DEVELOPER", "VIEWER"]),
    companyId: z.string().min(1, "Company is required"),
    departmentId: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
  });

  // Form setup for create
  const createForm = useForm<z.infer<typeof createFormSchema>>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "DEVELOPER",
      companyId: currentUser?.companyId || "",
      departmentId: undefined,
      status: "ACTIVE",
    },
  });

  // Form setup for edit
  const editForm = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "DEVELOPER",
      companyId: "",
      departmentId: undefined,
      status: "ACTIVE",
    },
  });

  // Create user mutation
  const createUser = useMutation({
    mutationFn: async (data: z.infer<typeof createFormSchema>) => {
      const response = await userApi.create(data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "User created",
        description: "The user has been created successfully",
      });
      setIsCreateDialogOpen(false);
      createForm.reset({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "DEVELOPER",
        companyId: currentUser?.companyId || "",
        departmentId: undefined,
        status: "ACTIVE",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof editFormSchema> }) => {
      const response = await userApi.update(id, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "User updated",
        description: "The user has been updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      await userApi.delete(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully",
      });
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle create form submission
  const onCreateSubmit = (values: z.infer<typeof createFormSchema>) => {
    createUser.mutate(values);
  };

  // Handle edit form submission
  const onEditSubmit = (values: z.infer<typeof editFormSchema>) => {
    if (selectedUser) {
      updateUser.mutate({ id: selectedUser.id, data: values });
    }
  };

  // Handle edit dialog open
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      departmentId: user.departmentId,
      status: user.status,
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedUser) {
      deleteUser.mutate(selectedUser.id);
    }
  };

  // Find company name
  const getCompanyName = (companyId: string) => {
    const company = companies.find(company => company.id === companyId);
    return company ? company.name : "Unknown";
  };

  // Find department name
  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return "Not assigned";
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : "Unknown";
  };

  // Get user initials
  const getUserInitials = (user: User) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  // Get color based on role
  const getRoleBadgeVariant = (role: User['role']) => {
    switch (role) {
      case "ADMIN":
        return "destructive";
      case "MANAGER":
        return "default";
      case "TEAM_LEAD":
        return "secondary";
      case "DEVELOPER":
        return "outline";
      case "VIEWER":
        return "outline";
      default:
        return "outline";
    }
  };

  // Get color based on status
  const getStatusBadgeVariant = (status: User['status']) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "INACTIVE":
        return "destructive";
      case "PENDING":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Create custom Badge components
  const StatusBadge = ({ status }: { status: User['status'] }) => {
    const colorMap = {
      "ACTIVE": "bg-green-100 text-green-800 border-green-200",
      "INACTIVE": "bg-red-100 text-red-800 border-red-200",
      "PENDING": "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    
    return (
      <Badge 
        variant="outline" 
        className={`${colorMap[status]}`}
      >
        {status}
      </Badge>
    );
  };

  // Table columns configuration
  const columns = [
    {
      header: "User",
      accessorKey: "name",
      cell: (user: User) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessorKey: "role" as keyof User,
      cell: (user: User) => (
        <Badge variant={getRoleBadgeVariant(user.role)}>
          {user.role.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as keyof User,
      cell: (user: User) => <StatusBadge status={user.status} />,
    },
    {
      header: "Department",
      accessorKey: "departmentId" as keyof User,
      cell: (user: User) => getDepartmentName(user.departmentId),
    },
    {
      header: "Company",
      accessorKey: "companyId" as keyof User,
      cell: (user: User) => getCompanyName(user.companyId),
    },
    {
      header: "Actions",
      cell: (user: User) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              handleEditUser(user);
            }}
            disabled={currentUser?.role !== "ADMIN" && currentUser?.id !== user.id}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit user</span>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteUser(user);
                }}
                disabled={currentUser?.role !== "ADMIN" || currentUser?.id === user.id}
              >
                <Trash className="h-4 w-4 text-destructive" />
                <span className="sr-only">Delete user</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}? This action cannot be undone.
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

  // Check if user has required permissions
  const canManageUsers = currentUser?.role === "ADMIN";

  // Filter departments by company
  const filteredDepartments = departments.filter(
    department => department.companyId === createForm.watch("companyId")
  );

  // Filter departments for editing
  const filteredEditDepartments = departments.filter(
    department => department.companyId === editForm.watch("companyId")
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        
        {canManageUsers && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input
                        {...createForm.register("firstName")}
                        placeholder="Enter first name"
                      />
                      {createForm.formState.errors.firstName && (
                        <p className="text-sm text-red-600">{createForm.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input
                        {...createForm.register("lastName")}
                        placeholder="Enter last name"
                      />
                      {createForm.formState.errors.lastName && (
                        <p className="text-sm text-red-600">{createForm.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      {...createForm.register("email")}
                      type="email"
                      placeholder="Enter email address"
                    />
                    {createForm.formState.errors.email && (
                      <p className="text-sm text-red-600">{createForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      {...createForm.register("password")}
                      type="password"
                      placeholder="Enter password"
                    />
                    {createForm.formState.errors.password && (
                      <p className="text-sm text-red-600">{createForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Role</label>
                      <Select
                        onValueChange={(value) => createForm.setValue("role", value as any)}
                        defaultValue="DEVELOPER"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="TEAM_LEAD">Team Lead</SelectItem>
                          <SelectItem value="DEVELOPER">Developer</SelectItem>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      {createForm.formState.errors.role && (
                        <p className="text-sm text-red-600">{createForm.formState.errors.role.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        onValueChange={(value) => createForm.setValue("status", value as any)}
                        defaultValue="ACTIVE"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      {createForm.formState.errors.status && (
                        <p className="text-sm text-red-600">{createForm.formState.errors.status.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Company</label>
                      <Select
                        onValueChange={(value) => createForm.setValue("companyId", value)}
                        defaultValue={currentUser?.companyId}
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
                      <label className="text-sm font-medium">Department (Optional)</label>
                      <Select
                        onValueChange={(value) => createForm.setValue("departmentId", value)}
                        defaultValue=""
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {filteredDepartments.map((department) => (
                            <SelectItem key={department.id} value={department.id}>
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createUser.isPending}>
                      {createUser.isPending ? "Creating..." : "Create User"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {/* Edit user dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    {...editForm.register("firstName")}
                    placeholder="Enter first name"
                  />
                  {editForm.formState.errors.firstName && (
                    <p className="text-sm text-red-600">{editForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    {...editForm.register("lastName")}
                    placeholder="Enter last name"
                  />
                  {editForm.formState.errors.lastName && (
                    <p className="text-sm text-red-600">{editForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  {...editForm.register("email")}
                  type="email"
                  placeholder="Enter email address"
                />
                {editForm.formState.errors.email && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    onValueChange={(value) => editForm.setValue("role", value as any)}
                    defaultValue={selectedUser?.role}
                    disabled={currentUser?.role !== "ADMIN"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="TEAM_LEAD">Team Lead</SelectItem>
                      <SelectItem value="DEVELOPER">Developer</SelectItem>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  {editForm.formState.errors.role && (
                    <p className="text-sm text-red-600">{editForm.formState.errors.role.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    onValueChange={(value) => editForm.setValue("status", value as any)}
                    defaultValue={selectedUser?.status}
                    disabled={currentUser?.role !== "ADMIN"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  {editForm.formState.errors.status && (
                    <p className="text-sm text-red-600">{editForm.formState.errors.status.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <Select
                    onValueChange={(value) => editForm.setValue("companyId", value)}
                    defaultValue={selectedUser?.companyId}
                    disabled={currentUser?.role !== "ADMIN"}
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
                  <label className="text-sm font-medium">Department (Optional)</label>
                  <Select
                    onValueChange={(value) => editForm.setValue("departmentId", value)}
                    defaultValue={selectedUser?.departmentId || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {filteredEditDepartments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUser.isPending}>
                  {updateUser.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">Loading users...</div>
      ) : (
        <DataTable
          data={users}
          columns={columns}
          searchKey="firstName"
          searchPlaceholder="Search users..."
        />
      )}
    </div>
  );
}
