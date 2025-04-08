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

export default function NewStory() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertStory>>({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM"
  });

  // Fetch epics for the select field
  const { data: epics = [], isLoading: isLoadingEpics } = useQuery({
    queryKey: ['/api/epics']
  });

  // Fetch users for assignee select field
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users']
  });

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
    if (!formData.title) {
      toast({
        title: "Missing required field",
        description: "Story title is required.",
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
    
    setIsSubmitting(true);
    createStoryMutation.mutate(formData as InsertStory);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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
                  <Label htmlFor="title">Story Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter story title"
                    value={formData.title}
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
                        epics.map(epic => (
                          <SelectItem key={epic.id} value={epic.id}>
                            {epic.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="points">Story Points</Label>
                  <Select 
                    name="points"
                    onValueChange={(value) => handleSelectChange("points", value)}
                    value={formData.points?.toString() || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select points" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not estimated</SelectItem>
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
                    value={formData.assigneeId || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </div>
                      ) : (
                        users.map(user => (
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
              <h3 className="text-lg font-medium">Status & Priority</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    name="status"
                    onValueChange={(value) => handleSelectChange("status", value)}
                    value={formData.status || "TODO"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="IN_REVIEW">In Review</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                      <SelectItem value="BLOCKED">Blocked</SelectItem>
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