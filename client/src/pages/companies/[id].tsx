import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Building2, Loader2, UserIcon, Building, Briefcase } from "lucide-react";

// Define form schema for company update
const formSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional().nullable(),
  website: z.string().url("Please enter a valid URL").optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CompanyDetailPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");

  // Fetch company details
  const { data: company, isLoading, error } = useQuery({
    queryKey: ['/api/companies', params.id],
    queryFn: getQueryFn(),
    enabled: !!params.id,
  });

  // Fetch departments for this company
  const { data: departments = [] } = useQuery({
    queryKey: ['/api/departments'],
    queryFn: getQueryFn(),
    select: (data: any) => data.filter((dept: any) => dept.companyId === params.id),
    enabled: !!params.id,
  });

  // Fetch users for this company
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: getQueryFn(),
    select: (data: any) => data.filter((user: any) => user.companyId === params.id),
    enabled: !!params.id,
  });

  // Create form with default values from company data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: company?.name || "",
      description: company?.description || "",
      website: company?.website || "",
      status: company?.status || "ACTIVE",
    },
    values: company ? {
      name: company.name,
      description: company.description || "",
      website: company.website || "",
      status: company.status || "ACTIVE",
    } : undefined,
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Remove null or empty string values
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== null && v !== "")
      );
      
      const res = await apiRequest("PUT", `/api/companies/${params.id}`, cleanedData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Company updated",
        description: "The company has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies', params.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update company",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    updateCompanyMutation.mutate(data);
  };

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/companies/${params.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Company deleted",
        description: "The company has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      navigate("/companies");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete company",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle company deletion
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      deleteCompanyMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-500 mb-6">
        <p className="font-medium">Error loading company:</p>
        <p>{(error as Error).message}</p>
        <Button 
          className="mt-4" 
          variant="outline" 
          onClick={() => navigate("/companies")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Button>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Company not found</h3>
        <p className="text-gray-500 mb-4">
          The company you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/companies")}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Companies
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/companies")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-gray-600 mt-1">
              {company.description || "No description provided"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCompanyMutation.isPending}
            >
              {deleteCompanyMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Company
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Company Details</TabsTrigger>
          <TabsTrigger value="departments">Departments ({departments.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  View and edit company details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Corporation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief description of the company" 
                              className="resize-none min-h-[100px]"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a brief overview of the company's activities and focus areas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL</FormLabel>
                          <FormControl>
                            <Input 
                              type="url" 
                              placeholder="https://example.com" 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Include the full URL with https://
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            defaultValue={field.value} 
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Inactive companies won't appear in active filters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3 pt-3">
                      <Button 
                        type="submit"
                        disabled={updateCompanyMutation.isPending}
                      >
                        {updateCompanyMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Status:</span>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      company.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {company.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Departments:</span>
                    </div>
                    <span className="text-sm">{departments.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Users:</span>
                    </div>
                    <span className="text-sm">{users.length}</span>
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Created:</span>
                      <span className="text-sm">{new Date(company.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Last Updated:</span>
                      <span className="text-sm">{new Date(company.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/departments/new")}
                  >
                    <Building className="mr-2 h-4 w-4" /> Add Department
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/users/new")}
                  >
                    <UserIcon className="mr-2 h-4 w-4" /> Add User
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Departments</CardTitle>
                <Button onClick={() => navigate("/departments/new")}>
                  <Building className="mr-2 h-4 w-4" /> Add Department
                </Button>
              </div>
              <CardDescription>
                Departments within this company
              </CardDescription>
            </CardHeader>
            <CardContent>
              {departments.length === 0 ? (
                <div className="text-center p-8 border rounded-lg">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No departments found</h3>
                  <p className="text-gray-500 mb-4">
                    This company doesn't have any departments yet.
                  </p>
                  <Button onClick={() => navigate("/departments/new")}>
                    <Building className="mr-2 h-4 w-4" /> Add Department
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {departments.map((department: any) => (
                    <Card key={department.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/departments/${department.id}`)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle>{department.name}</CardTitle>
                        <CardDescription>{department.description || "No description"}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Users:</span>
                          </div>
                          <span className="text-sm font-medium">
                            {users.filter((user: any) => user.departmentId === department.id).length}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Users</CardTitle>
                <Button onClick={() => navigate("/users/new")}>
                  <UserIcon className="mr-2 h-4 w-4" /> Add User
                </Button>
              </div>
              <CardDescription>
                Users assigned to this company
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center p-8 border rounded-lg">
                  <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No users found</h3>
                  <p className="text-gray-500 mb-4">
                    This company doesn't have any users assigned yet.
                  </p>
                  <Button onClick={() => navigate("/users/new")}>
                    <UserIcon className="mr-2 h-4 w-4" /> Add User
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user: any) => {
                    // Create a display name from firstName and lastName
                    const displayName = user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.email.split('@')[0];
                    
                    // Get initials for avatar
                    const initials = displayName
                      .split(' ')
                      .map(part => part[0])
                      .join('')
                      .toUpperCase();

                    return (
                      <Card 
                        key={user.id} 
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/users/${user.id}`)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                              {initials}
                            </div>
                            <div>
                              <CardTitle className="text-base">{displayName}</CardTitle>
                              <CardDescription>{user.email}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="text-sm text-gray-500">
                            Role: <span className="font-medium">{user.role || "User"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}