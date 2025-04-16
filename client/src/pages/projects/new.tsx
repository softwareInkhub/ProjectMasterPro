import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, queryClient, apiRequest } from "@/lib/queryClient";
import { Project, InsertProject, Company, Department, Team } from "@shared/schema";

export default function NewProject() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertProject>>({
    name: "",
    description: "",
    status: "PLANNING",
    priority: "MEDIUM"
  });

  // Fetch data for select fields
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
    queryFn: getQueryFn()
  });

  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
    queryFn: getQueryFn()
  });

  const { data: teams = [], isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
    queryFn: getQueryFn()
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<any[]>({
    queryKey: ['/api/users'],
    queryFn: getQueryFn()
  });
  
  // Filter departments and teams based on selected company
  const filteredDepartments = departments.filter((dept: Department) => 
    !formData.companyId || dept.companyId === formData.companyId
  );
  
  const filteredTeams = teams.filter((team: Team) => 
    !formData.companyId || team.companyId === formData.companyId
  );

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Sending project data:", data);
      const res = await apiRequest('POST', '/api/projects', data);
      if (!res.ok) {
        // Parse the error response
        const errorData = await res.json();
        console.error("Project API error response:", errorData);
        
        // Format error messages for display
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorDetails = errorData.errors.map((err: any) => {
            return `Field: ${err.path || 'unknown'}, Error: ${err.message || 'invalid value'}`;
          }).join('\n');
          throw new Error(`${errorData.message}: ${errorDetails}`);
        }
        
        throw new Error(errorData.message || 'Unknown server error');
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsSubmitting(false);
      toast({
        title: "Project created",
        description: "The project has been created successfully."
      });
      setLocation(`/projects/${data.id}`);
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      console.error("Project creation error:", error);
      
      toast({
        title: "Failed to create project",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        title: "Missing required field",
        description: "Project name is required.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.companyId) {
      toast({
        title: "Missing required field",
        description: "Company is required.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.teamId) {
      toast({
        title: "Missing required field",
        description: "Team is required.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Prepare data for submission with proper date objects
    // We need to match the InsertProject schema exactly
  // Use type assertion to avoid TypeScript errors with Date objects
  const dataToSubmit = {
    // Required fields
    name: formData.name,
    companyId: formData.companyId,
    teamId: formData.teamId,
    status: formData.status || "PLANNING", 
    priority: formData.priority || "MEDIUM",
    
    // Optional fields with null/undefined handling
    description: formData.description || undefined,
    departmentId: formData.departmentId === "" ? undefined : formData.departmentId,
    projectManagerId: formData.projectManagerId === "" ? undefined : formData.projectManagerId,
  } as InsertProject;
  
  // Handle date objects separately to avoid TypeScript issues
  if (formData.startDate) {
    dataToSubmit.startDate = new Date(formData.startDate as string);
  }
  if (formData.endDate) {
    dataToSubmit.endDate = new Date(formData.endDate as string);
  }
    
    createProjectMutation.mutate(dataToSubmit);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    // Special handling for companyId changes
    if (name === "companyId") {
      // Reset department and team when company changes
      const updatedData: Partial<InsertProject> = {
        ...formData,
        [name]: value,
        departmentId: "",
        teamId: ""
      };
      setFormData(updatedData);
    } else if (value === "none") {
      // Handle all "none" values by setting to empty string
      setFormData(prev => ({ ...prev, [name]: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => setLocation("/projects")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Projects
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Project</CardTitle>
          <CardDescription>Add a new project to your organization</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Project Information</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter project name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter project description"
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Organization</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyId">Company *</Label>
                  <Select 
                    name="companyId"
                    onValueChange={(value) => handleSelectChange("companyId", value)}
                    value={formData.companyId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCompanies ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </div>
                      ) : (
                        companies.map(company => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="departmentId">Department</Label>
                  <Select 
                    name="departmentId"
                    onValueChange={(value) => handleSelectChange("departmentId", value)}
                    value={formData.departmentId || "none"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {isLoadingDepartments ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </div>
                      ) : (
                        filteredDepartments.map((department: Department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="teamId">Team *</Label>
                  <Select 
                    name="teamId"
                    onValueChange={(value) => handleSelectChange("teamId", value)}
                    value={formData.teamId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingTeams ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </div>
                      ) : (
                        filteredTeams.map((team: Team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectManagerId">Project Manager</Label>
                  <Select 
                    name="projectManagerId"
                    onValueChange={(value) => handleSelectChange("projectManagerId", value)}
                    value={formData.projectManagerId || "none"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </div>
                      ) : (
                        users.map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status & Scheduling</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    name="status"
                    onValueChange={(value) => handleSelectChange("status", value)}
                    value={formData.status || "PLANNING"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNING">Planning</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    name="priority"
                    onValueChange={(value) => handleSelectChange("priority", value)}
                    value={formData.priority || "MEDIUM"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={typeof formData.startDate === 'string' ? formData.startDate : ""}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={typeof formData.endDate === 'string' ? formData.endDate : ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4 flex justify-end gap-2">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => setLocation("/projects")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}