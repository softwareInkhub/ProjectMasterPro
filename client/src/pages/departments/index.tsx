import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentApi, companyApi } from "@/lib/api";
import { Department, Company } from "@/types";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Departments() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch departments
  const { data: departments = [], isLoading } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  // Fetch companies for dropdown
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  // Form schema for department creation/edit
  const formSchema = z.object({
    name: z.string().min(1, "Department name is required"),
    description: z.string().optional(),
    companyId: z.string().min(1, "Company is required"),
    parentDepartmentId: z.string().optional().nullable(),
  });

  // Form setup for create
  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      companyId: user?.companyId || "",
      parentDepartmentId: null,
    },
  });

  // Form setup for edit
  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      companyId: "",
      parentDepartmentId: null,
    },
  });

  // Create department mutation
  const createDepartment = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await departmentApi.create(data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({
        title: "Department created",
        description: "The department has been created successfully",
      });
      setIsCreateDialogOpen(false);
      createForm.reset({
        name: "",
        description: "",
        companyId: user?.companyId || "",
        parentDepartmentId: null,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create department. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update department mutation
  const updateDepartment = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof formSchema> }) => {
      const response = await departmentApi.update(id, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({
        title: "Department updated",
        description: "The department has been updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedDepartment(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update department. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete department mutation
  const deleteDepartment = useMutation({
    mutationFn: async (id: string) => {
      await departmentApi.delete(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({
        title: "Department deleted",
        description: "The department has been deleted successfully",
      });
      setSelectedDepartment(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete department. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle create form submission
  const onCreateSubmit = (values: z.infer<typeof formSchema>) => {
    createDepartment.mutate({
      ...values,
      parentDepartmentId: values.parentDepartmentId || undefined,
    });
  };

  // Handle edit form submission
  const onEditSubmit = (values: z.infer<typeof formSchema>) => {
    if (selectedDepartment) {
      updateDepartment.mutate({
        id: selectedDepartment.id,
        data: {
          ...values,
          parentDepartmentId: values.parentDepartmentId || undefined,
        },
      });
    }
  };

  // Handle edit dialog open
  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    editForm.reset({
      name: department.name,
      description: department.description || "",
      companyId: department.companyId,
      parentDepartmentId: department.parentDepartmentId || null,
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteDepartment = (department: Department) => {
    setSelectedDepartment(department);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedDepartment) {
      deleteDepartment.mutate(selectedDepartment.id);
    }
  };

  // Find parent department name
  const getParentDepartmentName = (parentId?: string) => {
    if (!parentId) return "None";
    const parent = departments.find(dept => dept.id === parentId);
    return parent ? parent.name : "Unknown";
  };

  // Find company name
  const getCompanyName = (companyId: string) => {
    const company = companies.find(company => company.id === companyId);
    return company ? company.name : "Unknown";
  };

  // Table columns configuration
  const columns = [
    {
      header: "Name",
      accessorKey: "name" as keyof Department,
    },
    {
      header: "Company",
      accessorKey: "companyId" as keyof Department,
      cell: (department: Department) => getCompanyName(department.companyId),
    },
    {
      header: "Parent Department",
      accessorKey: "parentDepartmentId" as keyof Department,
      cell: (department: Department) => getParentDepartmentName(department.parentDepartmentId),
    },
    {
      header: "Created",
      accessorKey: "createdAt" as keyof Department,
      cell: (department: Department) => format(new Date(department.createdAt), "MMM d, yyyy"),
    },
    {
      header: "Actions",
      cell: (department: Department) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              handleEditDepartment(department);
            }}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit department</span>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDepartment(department);
                }}
              >
                <Trash className="h-4 w-4 text-destructive" />
                <span className="sr-only">Delete department</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Department</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{selectedDepartment?.name}"? This action cannot be undone.
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
  const canManageDepartments = user?.role === "ADMIN" || user?.role === "MANAGER";

  if (!canManageDepartments) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Permission Denied</CardTitle>
          <CardDescription>You don't have permission to manage departments.</CardDescription>
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
        <h1 className="text-2xl font-bold">Departments</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
            </DialogHeader>
            
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department Name</label>
                  <Input
                    {...createForm.register("name")}
                    placeholder="Enter department name"
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-sm text-red-600">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    {...createForm.register("description")}
                    placeholder="Enter department description"
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
                  <label className="text-sm font-medium">Parent Department (Optional)</label>
                  <Select
                    onValueChange={(value) => createForm.setValue("parentDepartmentId", value)}
                    defaultValue=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createDepartment.isPending}>
                    {createDepartment.isPending ? "Creating..." : "Create Department"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Edit department dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department Name</label>
                <Input
                  {...editForm.register("name")}
                  placeholder="Enter department name"
                />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  {...editForm.register("description")}
                  placeholder="Enter department description"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Select
                  onValueChange={(value) => editForm.setValue("companyId", value)}
                  defaultValue={selectedDepartment?.companyId}
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
                <label className="text-sm font-medium">Parent Department (Optional)</label>
                <Select
                  onValueChange={(value) => editForm.setValue("parentDepartmentId", value)}
                  defaultValue={selectedDepartment?.parentDepartmentId || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {departments
                      .filter(dept => dept.id !== selectedDepartment?.id) // Prevent circular reference
                      .map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
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
                <Button type="submit" disabled={updateDepartment.isPending}>
                  {updateDepartment.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">Loading departments...</div>
      ) : (
        <DataTable
          data={departments}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search departments..."
        />
      )}
    </div>
  );
}
