import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Calendar } from "lucide-react";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Create a schema for the form
const sprintFormSchema = z.object({
  name: z.string().min(1, "Sprint name is required"),
  goal: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
  teamId: z.string().min(1, "Team is required"),
  scrumMasterId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  capacity: z.string().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "REVIEW", "COMPLETED"]).default("PLANNING"),
  notes: z.string().optional(),
});

type SprintFormValues = z.infer<typeof sprintFormSchema>;

export default function NewSprintPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Get projects for the dropdown
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    retry: 1,
  });

  // Get teams for the dropdown
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["/api/teams"],
    retry: 1,
  });

  // Get users for the scrum master dropdown
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    retry: 1,
  });

  // Set up the form
  const form = useForm<SprintFormValues>({
    resolver: zodResolver(sprintFormSchema),
    defaultValues: {
      name: "",
      goal: "",
      status: "PLANNING",
      capacity: "",
      notes: "",
    },
  });

  // Mutation to create a new sprint
  const createSprintMutation = useMutation({
    mutationFn: async (data: SprintFormValues) => {
      const response = await apiRequest("POST", "/api/sprints", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sprints"] });
      toast({
        title: "Sprint Created",
        description: "Your new sprint has been created successfully.",
      });
      setLocation("/sprints");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create sprint. Please check your input and try again.",
        variant: "destructive",
      });
      console.error("Sprint creation error:", error);
    },
  });

  const onSubmit = (data: SprintFormValues) => {
    // Make sure dates are in the correct format before submitting
    const formattedData = {
      ...data,
      startDate: data.startDate ? data.startDate.toISOString() : undefined,
      endDate: data.endDate ? data.endDate.toISOString() : undefined,
    };
    createSprintMutation.mutate(formattedData as any);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={() => setLocation("/sprints")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create New Sprint</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sprint Details</CardTitle>
          <CardDescription>
            Create a new sprint for your project. Provide all necessary details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sprint Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sprint 1 - Authentication" {...field} />
                      </FormControl>
                      <FormDescription>
                        Give your sprint a descriptive name.
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
                        value={field.value}
                        onValueChange={field.onChange}
                        defaultValue="PLANNING"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PLANNING">Planning</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="REVIEW">Review</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Current status of the sprint.
                      </FormDescription>
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
                        The project this sprint belongs to.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team*</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={teamsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teams?.map((team: any) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The team working on this sprint.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scrumMasterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scrum Master</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={usersLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a scrum master" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users?.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The scrum master for this sprint.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity (Story Points)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 20" {...field} />
                      </FormControl>
                      <FormDescription>
                        Planned capacity for this sprint in story points.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span className="text-muted-foreground">Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setStartDate(date);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When the sprint starts.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span className="text-muted-foreground">Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setEndDate(date);
                            }}
                            disabled={(date) => startDate ? date < startDate : false}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When the sprint ends.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sprint Goal</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Implement user authentication and registration functionality"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      A clear, concise goal for this sprint.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information about this sprint"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Additional notes, context, or instructions for the sprint.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/sprints")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createSprintMutation.isPending}
                >
                  {createSprintMutation.isPending ? "Creating..." : "Create Sprint"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}