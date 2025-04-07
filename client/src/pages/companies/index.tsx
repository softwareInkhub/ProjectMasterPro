import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyApi } from "@/lib/api";
import { Company } from "@/types";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Companies() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch companies
  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  // Form schema for company creation/edit
  const formSchema = z.object({
    name: z.string().min(1, "Company name is required"),
    description: z.string().optional(),
    website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  });

  // Form setup for create
  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
    },
  });

  // Form setup for edit
  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
    },
  });

  // Create company mutation
  const createCompany = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await companyApi.create(data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Company created",
        description: "The company has been created successfully",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create company. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update company mutation
  const updateCompany = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof formSchema> }) => {
      const response = await companyApi.update(id, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Company updated",
        description: "The company has been updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update company. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete company mutation
  const deleteCompany = useMutation({
    mutationFn: async (id: string) => {
      await companyApi.delete(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Company deleted",
        description: "The company has been deleted successfully",
      });
      setSelectedCompany(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete company. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle create form submission
  const onCreateSubmit = (values: z.infer<typeof formSchema>) => {
    createCompany.mutate(values);
  };

  // Handle edit form submission
  const onEditSubmit = (values: z.infer<typeof formSchema>) => {
    if (selectedCompany) {
      updateCompany.mutate({ id: selectedCompany.id, data: values });
    }
  };

  // Handle edit dialog open
  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    editForm.reset({
      name: company.name,
      description: company.description || "",
      website: company.website || "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteCompany = (company: Company) => {
    setSelectedCompany(company);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedCompany) {
      deleteCompany.mutate(selectedCompany.id);
    }
  };

  // Table columns configuration
  const columns = [
    {
      header: "Name",
      accessorKey: "name" as keyof Company,
    },
    {
      header: "Website",
      accessorKey: "website" as keyof Company,
      cell: (company: Company) => 
        company.website ? (
          <a 
            href={company.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            {company.website}
          </a>
        ) : (
          "Not specified"
        ),
    },
    {
      header: "Created",
      accessorKey: "createdAt" as keyof Company,
      cell: (company: Company) => format(new Date(company.createdAt), "MMM d, yyyy"),
    },
    {
      header: "Actions",
      cell: (company: Company) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              handleEditCompany(company);
            }}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit company</span>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCompany(company);
                }}
              >
                <Trash className="h-4 w-4 text-destructive" />
                <span className="sr-only">Delete company</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Company</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{selectedCompany?.name}"? This action cannot be undone.
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

  // If user doesn't have required permissions
  const isAdmin = user?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Permission Denied</CardTitle>
          <CardDescription>You don't have permission to manage companies.</CardDescription>
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
        <h1 className="text-2xl font-bold">Companies</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
            </DialogHeader>
            
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input
                    {...createForm.register("name")}
                    placeholder="Enter company name"
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-sm text-red-600">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    {...createForm.register("description")}
                    placeholder="Enter company description"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    {...createForm.register("website")}
                    placeholder="https://example.com"
                  />
                  {createForm.formState.errors.website && (
                    <p className="text-sm text-red-600">{createForm.formState.errors.website.message}</p>
                  )}
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCompany.isPending}>
                    {createCompany.isPending ? "Creating..." : "Create Company"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Edit company dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  {...editForm.register("name")}
                  placeholder="Enter company name"
                />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  {...editForm.register("description")}
                  placeholder="Enter company description"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input
                  {...editForm.register("website")}
                  placeholder="https://example.com"
                />
                {editForm.formState.errors.website && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.website.message}</p>
                )}
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateCompany.isPending}>
                  {updateCompany.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">Loading companies...</div>
      ) : (
        <DataTable
          data={companies}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search companies..."
        />
      )}
    </div>
  );
}
