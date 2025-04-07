import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewProjectPage() {
  const [, setLocation] = useLocation();
  
  // New project form state
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "Planning",
    priority: "Medium",
    departmentId: "",
    teamId: "",
    teamLeadId: "",
    startDate: "",
    endDate: "",
    client: "",
    budget: ""
  });
  
  // Sample departments data
  const departments = [
    { id: 1, name: "Engineering" },
    { id: 2, name: "Marketing" },
    { id: 3, name: "Finance" },
    { id: 4, name: "Human Resources" }
  ];
  
  // Sample teams data
  const teams = [
    { id: 1, name: "Frontend Development", departmentId: 1 },
    { id: 2, name: "Backend Development", departmentId: 1 },
    { id: 3, name: "DevOps", departmentId: 1 },
    { id: 4, name: "QA", departmentId: 1 },
    { id: 5, name: "Social Media", departmentId: 2 },
    { id: 6, name: "Content Creation", departmentId: 2 }
  ];
  
  // Sample users data
  const users = [
    { id: 5, name: "Alice Chen", departmentId: 1 },
    { id: 8, name: "Bob Jackson", departmentId: 1 },
    { id: 12, name: "Charlie Martinez", departmentId: 1 },
    { id: 15, name: "Diana Kim", departmentId: 1 },
    { id: 18, name: "Eric Thompson", departmentId: 2 }
  ];
  
  // Filter teams based on selected department
  const filteredTeams = newProject.departmentId 
    ? teams.filter(team => team.departmentId === parseInt(newProject.departmentId))
    : [];
    
  // Filter users based on selected department
  const filteredUsers = newProject.departmentId 
    ? users.filter(user => user.departmentId === parseInt(newProject.departmentId))
    : [];
    
  // Handle creating a new project
  const handleCreateProject = () => {
    // API call would go here
    console.log("Creating new project:", newProject);
    
    // Navigate to projects list with success message
    setLocation("/projects");
  };

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/projects")}
            className="mr-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Projects
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-600 mt-1">Fill in the details to create a new project</p>
      </header>
      
      {/* Project creation form */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Enter the basic information to get started with your new project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter project description"
                  rows={4}
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={newProject.status}
                  onValueChange={(value) => setNewProject({...newProject, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select 
                  value={newProject.priority}
                  onValueChange={(value) => setNewProject({...newProject, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="department">Department *</Label>
                <Select 
                  value={newProject.departmentId}
                  onValueChange={(value) => setNewProject({
                    ...newProject, 
                    departmentId: value,
                    teamId: "", // Reset team when department changes
                    teamLeadId: "" // Reset team lead when department changes
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="team">Team *</Label>
                <Select 
                  value={newProject.teamId}
                  onValueChange={(value) => setNewProject({...newProject, teamId: value})}
                  disabled={!newProject.departmentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !newProject.departmentId 
                        ? "Select a department first" 
                        : "Select team"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTeams.length > 0 ? (
                      filteredTeams.map(team => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-teams">No teams available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="teamLead">Project Manager *</Label>
                <Select 
                  value={newProject.teamLeadId}
                  onValueChange={(value) => setNewProject({...newProject, teamLeadId: value})}
                  disabled={!newProject.departmentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !newProject.departmentId 
                        ? "Select a department first" 
                        : "Select project manager"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users">No users available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client">Client</Label>
                <Input
                  id="client"
                  placeholder="Enter client name"
                  value={newProject.client}
                  onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Enter budget amount"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/projects")}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateProject}
            disabled={
              !newProject.name || 
              !newProject.status || 
              !newProject.priority || 
              !newProject.departmentId || 
              !newProject.teamId || 
              !newProject.teamLeadId || 
              !newProject.startDate || 
              !newProject.endDate
            }
          >
            Create Project
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}