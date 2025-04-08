import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertCompanySchema } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  Building2, 
  Building, 
  Globe, 
  CalendarDays, 
  Clock, 
  Loader2,
  Users,
  Briefcase,
  Trash2,
  PenSquare
} from "lucide-react";

// Extend the company schema with validation
const formSchema = insertCompanySchema
  .extend({
    name: z.string().min(1, "Company name is required"),
    description: z.string().optional().nullable(),
    website: z.string().url("Please enter a valid URL").optional().nullable(),
  });

type FormValues = z.infer<typeof formSchema>;

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const companyId = params.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch company data
  const { data: company, isLoading, error } = useQuery({
    queryKey: ['/api/companies', companyId],
    queryFn: getQueryFn(),
  });

  // Fetch company departments
  const { data: departments = [] } = useQuery({
    queryKey: ['/api/departments'],
    queryFn: getQueryFn(),
    select: (data) => data.filter((dept: any) => dept.companyId === companyId),
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      name: company?.name || "",
      description: company?.description || "",
      website: company?.website || "",
    },
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("PUT", `/api/companies/${companyId}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Company updated",
        description: "The company has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/companies', companyId] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update company",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/companies/${companyId}`);
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

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    updateCompanyMutation.mutate(data);
  };

  // Handle delete
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
      deleteCompanyMutation.mutate();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Error loading company</h3>
        <p>{(error as Error).message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate("/companies")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Button>
      </div>
    );
  }

  // If company not found
  if (!company) {
    return (
      <div className="p-6 bg-yellow-50 text-yellow-600 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Company not found</h3>
        <p>The company you're looking for doesn't exist or has been deleted.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate("/companies")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header with back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/companies")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <Badge variant={company.status === "ACTIVE" ? "success" : "secondary"}>
                {company.status === "ACTIVE" ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">{company.description || "No description provided"}</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleDelete}
              disabled={deleteCompanyMutation.isPending}
            >
              {deleteCompanyMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
            {!isEditing ? (
              <Button 
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <PenSquare className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <Button 
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              {!isEditing ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Name</h3>
                      <p className="text-lg">{company.name}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p>{company.description || "No description provided"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Website</h3>
                      {company.website ? (
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Globe className="h-4 w-4" />
                          {company.website}
                        </a>
                      ) : (
                        <p className="text-gray-400">No website provided</p>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Created</h3>
                          <p className="flex items-center gap-1 text-sm">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            {new Date(company.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                          <p className="flex items-center gap-1 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {new Date(company.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Company</CardTitle>
                    <CardDescription>Update the company information</CardDescription>
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
                                <Input {...field} />
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
                                  className="resize-y min-h-[100px]"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormDescription>
                                Include the full URL (e.g., https://example.com)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end gap-3 pt-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
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
              )}
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <Building className="h-5 w-5 text-blue-500 mr-2" />
                      <span>Departments</span>
                    </div>
                    <Badge variant="outline">{departments?.length || 0}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 text-indigo-500 mr-2" />
                      <span>Teams</span>
                    </div>
                    <Badge variant="outline">0</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-green-500 mr-2" />
                      <span>Employees</span>
                    </div>
                    <Badge variant="outline">0</Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/companies/${companyId}/departments/new`)}>
                    Add Department
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Departments</CardTitle>
                <CardDescription>
                  Departments in {company.name}
                </CardDescription>
              </div>
              <Button onClick={() => navigate(`/departments/new?companyId=${companyId}`)}>
                Add Department
              </Button>
            </CardHeader>
            <CardContent>
              {departments.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {departments.map((dept: any) => (
                    <Card key={dept.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/departments/${dept.id}`)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{dept.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          {dept.description || "No description provided"}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No departments yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    This company doesn't have any departments yet. Create a department to organize teams and employees.
                  </p>
                  <Button onClick={() => navigate(`/departments/new?companyId=${companyId}`)}>
                    Add First Department
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Teams Tab */}
        <TabsContent value="teams">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Teams</CardTitle>
                <CardDescription>
                  Teams in {company.name}
                </CardDescription>
              </div>
              <Button onClick={() => navigate(`/teams/new?companyId=${companyId}`)}>
                Add Team
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No teams yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  This company doesn't have any teams yet. Create a team to organize employees and their work.
                </p>
                <Button onClick={() => navigate(`/teams/new?companyId=${companyId}`)}>
                  Add First Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Employees Tab */}
        <TabsContent value="employees">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Employees</CardTitle>
                <CardDescription>
                  Employees in {company.name}
                </CardDescription>
              </div>
              <Button onClick={() => navigate(`/users/new?companyId=${companyId}`)}>
                Add Employee
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No employees yet</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  This company doesn't have any employees yet. Add employees to assign them to teams and projects.
                </p>
                <Button onClick={() => navigate(`/users/new?companyId=${companyId}`)}>
                  Add First Employee
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}