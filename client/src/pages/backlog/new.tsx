import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Create a schema for the form
const backlogItemFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL", "UNASSIGNED"]),
  type: z.enum(["USER_STORY", "BUG", "TASK", "EPIC", "FEATURE"]),
  status: z.enum(["NEW", "REFINED", "READY", "IN_PROGRESS", "DONE"]),
  projectId: z.string().min(1, "Project is required"),
  epicId: z.string().optional(),
  assigneeId: z.string().optional(),
  reporterId: z.string().optional(),
  sprintId: z.string().optional(),
  estimate: z.string().optional(),
  rank: z.string(),
  labels: z.array(z.string()).optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
});

type BacklogItemFormValues = z.infer<typeof backlogItemFormSchema>;

export default function NewBacklogItemPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [labels, setLabels] = useState<string[]>(['']);
  const [criteria, setCriteria] = useState<string[]>(['']);

  // Get projects for the dropdown
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    retry: 1,
  });

  // Get epics for the dropdown
  const { data: epics, isLoading: epicsLoading } = useQuery({
    queryKey: ["/api/epics"],
    retry: 1,
  });

  // Get users for the assignee dropdown
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    retry: 1,
  });

  // Get sprints for the dropdown
  const { data: sprints, isLoading: sprintsLoading } = useQuery({
    queryKey: ["/api/sprints"],
    retry: 1,
  });

  // Get backlog items for rank calculation
  const { data: backlogItems } = useQuery({
    queryKey: ["/api/backlog-items"],
    retry: 1,
  });

  // Set up the form
  const form = useForm<BacklogItemFormValues>({
    resolver: zodResolver(backlogItemFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      type: "USER_STORY",
      status: "NEW",
      rank: "10000", // Default rank value
      labels: [],
      acceptanceCriteria: [],
    },
  });

  // Helper functions for labels and acceptance criteria
  const addLabel = () => {
    setLabels([...labels, '']);
  };

  const removeLabel = (index: number) => {
    if (labels.length > 1) {
      setLabels(labels.filter((_, i) => i !== index));
    }
  };

  const updateLabel = (index: number, value: string) => {
    const updated = [...labels];
    updated[index] = value;
    setLabels(updated);
  };

  const addCriteria = () => {
    setCriteria([...criteria, '']);
  };

  const removeCriteria = (index: number) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter((_, i) => i !== index));
    }
  };

  const updateCriteria = (index: number, value: string) => {
    const updated = [...criteria];
    updated[index] = value;
    setCriteria(updated);
  };

  // Mutation to create a new backlog item
  const createBacklogItemMutation = useMutation({
    mutationFn: async (data: BacklogItemFormValues) => {
      // Calculate a reasonable rank value if not provided
      if (!data.rank || data.rank === "10000") {
        const existingItems = backlogItems || [];
        if (existingItems.length > 0) {
          // Find the highest rank and add 1000
          const highestRank = Math.max(...existingItems.map((item: any) => parseInt(item.rank) || 0));
          data.rank = (highestRank + 1000).toString();
        } else {
          data.rank = "10000"; // Default starting rank
        }
      }

      // Add labels and acceptance criteria
      data.labels = labels.filter(label => label.trim() !== '');
      data.acceptanceCriteria = criteria.filter(c => c.trim() !== '');
      
      const response = await apiRequest("POST", "/api/backlog-items", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/backlog-items"] });
      toast({
        title: "Backlog Item Created",
        description: "Your new backlog item has been created successfully.",
      });
      setLocation("/backlog");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create backlog item. Please check your input and try again.",
        variant: "destructive",
      });
      console.error("Backlog item creation error:", error);
    },
  });

  const onSubmit = (data: BacklogItemFormValues) => {
    createBacklogItemMutation.mutate(data);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={() => setLocation("/backlog")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create New Backlog Item</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backlog Item Details</CardTitle>
          <CardDescription>
            Create a new backlog item. Provide all necessary details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear, concise title for the backlog item.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type*</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        defaultValue="USER_STORY"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USER_STORY">User Story</SelectItem>
                          <SelectItem value="BUG">Bug</SelectItem>
                          <SelectItem value="TASK">Task</SelectItem>
                          <SelectItem value="EPIC">Epic</SelectItem>
                          <SelectItem value="FEATURE">Feature</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority*</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        defaultValue="MEDIUM"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                          <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status*</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        defaultValue="NEW"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="REFINED">Refined</SelectItem>
                          <SelectItem value="READY">Ready</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimate (Story Points)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project*</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={projectsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects?.map((project: any) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The project this backlog item belongs to.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="epicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Epic</FormLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={epicsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an epic" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {epics?.map((epic: any) => (
                            <SelectItem key={epic.id} value={epic.id}>
                              {epic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The epic this backlog item is part of.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assigneeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignee</FormLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={usersLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an assignee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {users?.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The person assigned to work on this backlog item.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reporterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reporter</FormLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={usersLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a reporter" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Not specified</SelectItem>
                          {users?.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The person who reported or requested this backlog item.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sprintId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sprint</FormLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={sprintsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a sprint" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Not in a sprint</SelectItem>
                          {sprints?.filter((sprint: any) => 
                            ["PLANNING", "ACTIVE"].includes(sprint.status)
                          ).map((sprint: any) => (
                            <SelectItem key={sprint.id} value={sprint.id}>
                              {sprint.name} ({sprint.status})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The sprint this backlog item is scheduled for.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a detailed description of the backlog item"
                        {...field}
                        rows={5}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description including context and requirements.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Labels</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add labels to categorize this backlog item.
                  </p>
                  
                  {labels.map((label, index) => (
                    <div key={`label-${index}`} className="flex items-center gap-2 mb-2">
                      <Input
                        value={label}
                        onChange={(e) => updateLabel(index, e.target.value)}
                        placeholder="e.g., frontend, performance, security"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLabel(index)}
                        disabled={labels.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLabel}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Label
                  </Button>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Acceptance Criteria</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Define conditions that must be met for this backlog item to be considered complete.
                  </p>
                  
                  {criteria.map((item, index) => (
                    <div key={`criteria-${index}`} className="flex items-center gap-2 mb-2">
                      <Input
                        value={item}
                        onChange={(e) => updateCriteria(index, e.target.value)}
                        placeholder="e.g., User can log in with valid credentials"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCriteria(index)}
                        disabled={criteria.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCriteria}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Acceptance Criteria
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/backlog")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createBacklogItemMutation.isPending}
                >
                  {createBacklogItemMutation.isPending ? "Creating..." : "Create Backlog Item"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}