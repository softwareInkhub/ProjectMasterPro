import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, UserIcon, Loader2 } from "lucide-react";

// Define form schema for user creation
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "MANAGER", "TEAM_LEAD", "DEVELOPER", "VIEWER"]).default("VIEWER"),
  companyId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  teamId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).default("ACTIVE"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewUserPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch companies, departments, and teams for select options
  const { data: companies = [] } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: getQueryFn()
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['/api/departments'],
    queryFn: getQueryFn()
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['/api/teams'],
    queryFn: getQueryFn()
  });

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "VIEWER",
      companyId: null,
      departmentId: null,
      teamId: null,
      status: "ACTIVE",
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Remove null or empty string values
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== null && v !== "")
      );
      
      const res = await apiRequest("POST", "/api/users", cleanedData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "The user has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      navigate("/users");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    createUserMutation.mutate(data);
  };

  // Filter departments and teams based on selected company
  const selectedCompanyId = form.watch("companyId");
  const filteredDepartments = departments.filter((dept: any) => 
    !selectedCompanyId || dept.companyId === selectedCompanyId
  );
  
  // Filter teams based on selected department
  const selectedDepartmentId = form.watch("departmentId");
  const filteredTeams = teams.filter((team: any) => 
    !selectedDepartmentId || team.departmentId === selectedDepartmentId
  );

  // Handle company change (reset department and team if company changes)
  const handleCompanyChange = (value: string) => {
    // Convert "_none" to null for the database
    form.setValue("companyId", value === "_none" ? null : value);
    form.setValue("departmentId", null);
    form.setValue("teamId", null);
  };

  // Handle department change (reset team if department changes)
  const handleDepartmentChange = (value: string) => {
    // Convert "_none" to null for the database
    form.setValue("departmentId", value === "_none" ? null : value);
    form.setValue("teamId", null);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/users")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <h1 className="text-3xl font-bold">Create User</h1>
        <p className="text-gray-600 mt-1">Add a new user to your organization</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Provide details about the user you want to add
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address*</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password*</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormDescription>
                        At least 6 characters long
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role*</FormLabel>
                      <Select 
                        defaultValue={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ADMIN">Administrator</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="TEAM_LEAD">Team Lead</SelectItem>
                          <SelectItem value="DEVELOPER">Developer</SelectItem>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determines the user's access and permission level
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
                          <SelectItem value="PENDING">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-6 mt-2">
                  <h3 className="text-lg font-medium mb-4">Organization Assignment</h3>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="companyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <Select 
                            value={field.value || ""}
                            onValueChange={handleCompanyChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a company" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="_none">None</SelectItem>
                              {companies.map((company: any) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="departmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select 
                            value={field.value || ""}
                            onValueChange={handleDepartmentChange}
                            disabled={!selectedCompanyId}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={selectedCompanyId ? "Select a department" : "Select a company first"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="_none">None</SelectItem>
                              {filteredDepartments.map((department: any) => (
                                <SelectItem key={department.id} value={department.id}>
                                  {department.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="teamId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team</FormLabel>
                          <Select 
                            value={field.value || ""}
                            onValueChange={(value) => field.onChange(value === "_none" ? null : value)}
                            disabled={!selectedDepartmentId}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={selectedDepartmentId ? "Select a team" : "Select a department first"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="_none">None</SelectItem>
                              {filteredTeams.map((team: any) => (
                                <SelectItem key={team.id} value={team.id}>
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/users")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create User
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
              <CardDescription>Helpful information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <UserIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">User Roles</h4>
                  <p className="text-xs text-gray-500">
                    Administrators have full access to the system. Managers can manage departments and teams.
                    Team Leads can manage their teams and projects. Developers have limited access based on their assignments.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Organization Assignment</h4>
                  <p className="text-xs text-gray-500">
                    Users can be assigned to a company, department, and team. This determines what projects and tasks they can access.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}