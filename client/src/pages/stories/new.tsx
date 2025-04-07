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

export default function NewStoryPage() {
  const [, setLocation] = useLocation();
  
  // Extract projectId or epicId from query string if provided
  // It will be provided when creating a story from a project or epic page
  const searchParams = new URLSearchParams(window.location.search);
  const projectIdFromQuery = searchParams.get("projectId");
  const epicIdFromQuery = searchParams.get("epicId");
  
  // New story form state
  const [newStory, setNewStory] = useState({
    name: "",
    description: "",
    epicId: epicIdFromQuery || "",
    status: "BACKLOG",
    priority: "MEDIUM",
    storyPoints: "",
    assigneeId: "",
    reporterId: "",
    startDate: "",
    dueDate: ""
  });
  
  // Sample epics data
  const epics = [
    { id: 1, name: "User Authentication System", projectId: 1 },
    { id: 2, name: "Dashboard Analytics", projectId: 1 },
    { id: 3, name: "Mobile Responsiveness", projectId: 1 },
    { id: 4, name: "Customer Management Interface", projectId: 2 },
    { id: 5, name: "Social Media Integration", projectId: 3 }
  ];
  
  // Filtered epics based on projectId if provided
  const filteredEpics = projectIdFromQuery
    ? epics.filter(epic => epic.projectId === parseInt(projectIdFromQuery))
    : epics;
  
  // Sample users data
  const users = [
    { id: 5, name: "Alice Chen" },
    { id: 8, name: "Bob Jackson" },
    { id: 12, name: "Charlie Martinez" },
    { id: 15, name: "Diana Kim" },
    { id: 21, name: "Eric Thompson" }
  ];
  
  // Handle creating a new story
  const handleCreateStory = () => {
    // API call would go here
    console.log("Creating new story:", newStory);
    
    // Check if we should return to a specific epic page
    if (epicIdFromQuery) {
      setLocation(`/epics/${epicIdFromQuery}`);
    } else if (projectIdFromQuery) {
      // Return to project page
      setLocation(`/projects/${projectIdFromQuery}`);
    } else {
      // Navigate to stories list
      setLocation("/stories");
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
            onClick={() => {
              if (epicIdFromQuery) {
                setLocation(`/epics/${epicIdFromQuery}`);
              } else if (projectIdFromQuery) {
                setLocation(`/projects/${projectIdFromQuery}`);
              } else {
                setLocation("/stories");
              }
            }}
            className="mr-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            {epicIdFromQuery ? "Back to Epic" : 
             projectIdFromQuery ? "Back to Project" : 
             "Back to Stories"}
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Story</h1>
        <p className="text-gray-600 mt-1">Add a user story to track specific work items</p>
      </header>
      
      {/* Story creation form */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Story Details</CardTitle>
          <CardDescription>
            Enter the details for this new user story.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Story Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter story name"
                  value={newStory.name}
                  onChange={(e) => setNewStory({...newStory, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter story description"
                  rows={4}
                  value={newStory.description}
                  onChange={(e) => setNewStory({...newStory, description: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="epic">Epic *</Label>
                <Select 
                  value={newStory.epicId}
                  onValueChange={(value) => setNewStory({...newStory, epicId: value})}
                  disabled={!!epicIdFromQuery} // Disable if epicId is provided in the URL
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select epic" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredEpics.length > 0 ? (
                      filteredEpics.map(epic => (
                        <SelectItem key={epic.id} value={epic.id.toString()}>
                          {epic.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-epics">No epics available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={newStory.status}
                  onValueChange={(value) => setNewStory({...newStory, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKLOG">Backlog</SelectItem>
                    <SelectItem value="READY">Ready</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select 
                  value={newStory.priority}
                  onValueChange={(value) => setNewStory({...newStory, priority: value})}
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
              <div className="grid gap-2">
                <Label htmlFor="storyPoints">Story Points</Label>
                <Select 
                  value={newStory.storyPoints}
                  onValueChange={(value) => setNewStory({...newStory, storyPoints: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estimate effort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Small</SelectItem>
                    <SelectItem value="2">2 - Small</SelectItem>
                    <SelectItem value="3">3 - Small+</SelectItem>
                    <SelectItem value="5">5 - Medium</SelectItem>
                    <SelectItem value="8">8 - Large</SelectItem>
                    <SelectItem value="13">13 - Very Large</SelectItem>
                    <SelectItem value="21">21 - Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Select 
                  value={newStory.assigneeId}
                  onValueChange={(value) => setNewStory({...newStory, assigneeId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.length > 0 ? (
                      users.map(user => (
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
                <Label htmlFor="reporter">Reporter</Label>
                <Select 
                  value={newStory.reporterId}
                  onValueChange={(value) => setNewStory({...newStory, reporterId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reporter" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.length > 0 ? (
                      users.map(user => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users-reporter">No users available</SelectItem>
                    )}
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
                  value={newStory.startDate}
                  onChange={(e) => setNewStory({...newStory, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newStory.dueDate}
                  onChange={(e) => setNewStory({...newStory, dueDate: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              if (epicIdFromQuery) {
                setLocation(`/epics/${epicIdFromQuery}`);
              } else if (projectIdFromQuery) {
                setLocation(`/projects/${projectIdFromQuery}`);
              } else {
                setLocation("/stories");
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateStory}
            disabled={
              !newStory.name || 
              !newStory.status || 
              !newStory.priority || 
              !newStory.epicId || 
              !newStory.startDate || 
              !newStory.dueDate
            }
          >
            Create Story
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}