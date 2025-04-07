import { useState, useEffect } from "react";
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

export default function NewEpicPage() {
  const [, setLocation] = useLocation();
  
  // Extract projectId from query string if provided
  // It will be provided when creating an epic from a project page
  const searchParams = new URLSearchParams(window.location.search);
  const projectIdFromQuery = searchParams.get("projectId");
  
  // New epic form state
  const [newEpic, setNewEpic] = useState({
    name: "",
    description: "",
    status: "BACKLOG",
    priority: "MEDIUM", 
    projectId: projectIdFromQuery || "",
    startDate: "",
    endDate: ""
  });
  
  // Sample projects data
  const projects = [
    { id: 1, name: "Website Redesign" },
    { id: 2, name: "CRM Integration" },
    { id: 3, name: "Q4 Marketing Campaign" },
    { id: 4, name: "Infrastructure Migration" },
    { id: 5, name: "Mobile App Development" }
  ];
  
  // Handle creating a new epic
  const handleCreateEpic = () => {
    // API call would go here
    console.log("Creating new epic:", newEpic);
    
    // Check if we should return to a specific project page
    if (projectIdFromQuery) {
      setLocation(`/projects/${projectIdFromQuery}`);
    } else {
      // Navigate to epics list
      setLocation("/epics");
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => 
              projectIdFromQuery 
                ? setLocation(`/projects/${projectIdFromQuery}`) 
                : setLocation("/epics")
            }
            className="mr-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            {projectIdFromQuery ? "Back to Project" : "Back to Epics"}
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Epic</h1>
        <p className="text-gray-600 mt-1">Define a new epic to organize related user stories</p>
      </header>
      
      {/* Epic creation form */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Epic Details</CardTitle>
          <CardDescription>
            Enter the details for this new epic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Epic Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter epic name"
                  value={newEpic.name}
                  onChange={(e) => setNewEpic({...newEpic, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter epic description"
                  rows={4}
                  value={newEpic.description}
                  onChange={(e) => setNewEpic({...newEpic, description: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="project">Project *</Label>
                <Select 
                  value={newEpic.projectId}
                  onValueChange={(value) => setNewEpic({...newEpic, projectId: value})}
                  disabled={!!projectIdFromQuery} // Disable if projectId is provided in the URL
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={newEpic.status}
                  onValueChange={(value) => setNewEpic({...newEpic, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKLOG">Backlog</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select 
                  value={newEpic.priority}
                  onValueChange={(value) => setNewEpic({...newEpic, priority: value})}
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newEpic.startDate}
                  onChange={(e) => setNewEpic({...newEpic, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newEpic.endDate}
                  onChange={(e) => setNewEpic({...newEpic, endDate: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => 
              projectIdFromQuery 
                ? setLocation(`/projects/${projectIdFromQuery}`) 
                : setLocation("/epics")
            }
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateEpic}
            disabled={
              !newEpic.name || 
              !newEpic.status || 
              !newEpic.priority || 
              !newEpic.projectId || 
              !newEpic.startDate || 
              !newEpic.endDate
            }
          >
            Create Epic
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}