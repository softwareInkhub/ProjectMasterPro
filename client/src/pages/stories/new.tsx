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
import { Story, InsertStory } from "@shared/schema";
import { PLACEHOLDER_VALUES } from "@/lib/constants";

export default function NewStory() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertStory>>({
    name: "",
    description: "",
    status: "BACKLOG",
    priority: "MEDIUM",
    storyPoints: PLACEHOLDER_VALUES.NOT_ESTIMATED,
    assigneeId: PLACEHOLDER_VALUES.UNASSIGNED
  });

  // Fetch epics for the select field
  const { data: epics = [], isLoading: isLoadingEpics } = useQuery<any[]>({
    queryKey: ['/api/epics']
  });

  // Fetch users for assignee select field
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<any[]>({
    queryKey: ['/api/users']
  });

  // For debugging - log to see what's happening
  useEffect(() => {
    console.log("Current form data:", formData);
    console.log("Epics data:", epics);
    console.log("Users data:", users);
  }, [formData, epics, users]);
  
  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: async (data: InsertStory) => {
      const res = await apiRequest('POST', '/api/stories', data);
      const result = await res.json();
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      setIsSubmitting(false);
      toast({
        title: "Story created",
        description: "The story has been created successfully."
      });
      setLocation(`/stories/${data.id}`);
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      toast({
        title: "Failed to create story",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        title: "Missing required field",
        description: "Story name is required.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.epicId) {
      toast({
        title: "Missing required field",
        description: "Epic is required.",
        variant: "destructive"
      });
      return;
    }
    
    // Transform the special values before submitting
    const dataToSubmit = { ...formData };
    
    // Convert placeholder values to null
    if (dataToSubmit.storyPoints === PLACEHOLDER_VALUES.NOT_ESTIMATED) {
      dataToSubmit.storyPoints = null;
    }
    
    if (dataToSubmit.assigneeId === PLACEHOLDER_VALUES.UNASSIGNED) {
      dataToSubmit.assigneeId = null;
    }
    
    console.log("Submitting data:", dataToSubmit);
    
    setIsSubmitting(true);
    createStoryMutation.mutate(dataToSubmit as InsertStory);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    // All values go straight to the form data
    setFormData(prev => ({ ...prev, [name]: value }));
    
    console.log(`Setting ${name} to ${value}`);
  };

  // Get points options
  const pointsOptions = [1, 2, 3, 5, 8, 13, 21];

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => setLocation("/stories")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Stories
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Story</CardTitle>
          <CardDescription>Add a new user story to break down epics into manageable work</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Story Information</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Story Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter story name"
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
                    placeholder="Enter story description"
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Epic & Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="epicId">Epic *</Label>
                  <Select 
                    name="epicId"
                    onValueChange={(value) => handleSelectChange("epicId", value)}
                    value={formData.epicId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select epic" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingEpics ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </div>
                      ) : (
                        <>
                          {epics && epics.length > 0 ? (
                            epics.map((epic: any) => (
                              <SelectItem key={epic.id} value={epic.id}>
                                {epic.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm">No epics available, please create one first</div>
                          )}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storyPoints">Story Points</Label>
                  <Select 
                    name="storyPoints"
                    onValueChange={(value) => handleSelectChange("storyPoints", value)}
                    value={formData.storyPoints || PLACEHOLDER_VALUES.NOT_ESTIMATED}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select points" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PLACEHOLDER_VALUES.NOT_ESTIMATED}>Not estimated</SelectItem>
                      {pointsOptions.map(points => (
                        <SelectItem key={points} value={points.toString()}>
                          {points}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assigneeId">Assignee</Label>
                  <Select 
                    name="assigneeId"
                    onValueChange={(value) => handleSelectChange("assigneeId", value)}
                    value={formData.assigneeId || PLACEHOLDER_VALUES.UNASSIGNED}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PLACEHOLDER_VALUES.UNASSIGNED}>Unassigned</SelectItem>
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </div>
                      ) : (
                        <>
                          {users && users.length > 0 ? (
                            users.map((user: any) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.firstName} {user.lastName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1 text-sm">No users found</div>
                          )}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Timeline</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={String(formData.startDate || "")}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={String(formData.dueDate || "")}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status & Priority</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    name="status"
                    onValueChange={(value) => handleSelectChange("status", value)}
                    value={formData.status || "BACKLOG"}
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
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4 flex justify-end gap-2">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => setLocation("/stories")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Story
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}