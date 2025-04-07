import { useState } from "react";
import { Project, User, Department, Team } from "@/types";
import { format } from "date-fns";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Edit, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { projectApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProjectHeaderProps {
  project: Project;
  projectManager?: User;
  department?: Department;
  team?: Team;
  users?: User[];
  onUpdate?: (updatedProject: Project) => void;
}

export function ProjectHeader({ 
  project, 
  projectManager, 
  department, 
  team,
  users = [],
  onUpdate
}: ProjectHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form schema for project edit
  const formSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
    status: z.enum(["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    startDate: z.date().optional().nullable(),
    endDate: z.date().optional().nullable(),
    projectManagerId: z.string().optional().nullable(),
  });

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project.name,
      description: project.description || "",
      status: project.status,
      priority: project.priority,
      startDate: project.startDate ? new Date(project.startDate) : null,
      endDate: project.endDate ? new Date(project.endDate) : null,
      projectManagerId: project.projectManagerId || null,
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await projectApi.update(project.id, {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString() : undefined,
        endDate: values.endDate ? values.endDate.toISOString() : undefined,
      });
      
      const updatedProject = await response.json();
      
      toast({
        title: "Project updated",
        description: "The project has been updated successfully.",
      });
      
      // Invalidate projects cache
      queryClient.invalidateQueries({
        queryKey: ['/api/projects'],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${project.id}`],
      });
      
      if (onUpdate) {
        onUpdate(updatedProject);
      }
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Formatting dates
  const dateRange = () => {
    if (project.startDate && project.endDate) {
      return `${format(new Date(project.startDate), 'MMM d, yyyy')} - ${format(new Date(project.endDate), 'MMM d, yyyy')}`;
    }
    if (project.startDate) {
      return `From ${format(new Date(project.startDate), 'MMM d, yyyy')}`;
    }
    if (project.endDate) {
      return `Until ${format(new Date(project.endDate), 'MMM d, yyyy')}`;
    }
    return "No dates set";
  };

  // Get initials from user
  const getInitials = (user?: User) => {
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span className="inline-flex items-center">
              <TeamIcon className="mr-1 h-4 w-4" />
              {team?.name || "No team assigned"}
            </span>
            <span className="inline-flex items-center">
              <CalendarIcon className="mr-1 h-4 w-4" />
              {dateRange()}
            </span>
            <StatusBadge status={project.status} />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project Name</label>
                    <Input
                      {...form.register("name")}
                      placeholder="Enter project name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      {...form.register("description")}
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        onValueChange={(value) => form.setValue("status", value as any)}
                        defaultValue={project.status}
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
                      <label className="text-sm font-medium">Priority</label>
                      <Select
                        onValueChange={(value) => form.setValue("priority", value as any)}
                        defaultValue={project.priority}
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
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !form.watch("startDate") && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.watch("startDate") ? (
                              format(form.watch("startDate")!, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={form.watch("startDate") || undefined}
                            onSelect={(date) => form.setValue("startDate", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !form.watch("endDate") && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.watch("endDate") ? (
                              format(form.watch("endDate")!, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={form.watch("endDate") || undefined}
                            onSelect={(date) => form.setValue("endDate", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project Manager</label>
                    <Select
                      onValueChange={(value) => form.setValue("projectManagerId", value)}
                      defaultValue={project.projectManagerId || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">None</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="mt-6 border-t border-gray-200 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase">Project Manager</h3>
            <div className="mt-1 flex items-center gap-2">
              {projectManager ? (
                <>
                  <Avatar className="w-6 h-6 bg-indigo-500">
                    <AvatarFallback className="text-white text-xs">
                      {getInitials(projectManager)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {projectManager.firstName} {projectManager.lastName}
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">Not assigned</span>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase">Department</h3>
            <div className="mt-1 text-sm">
              {department?.name || "Not assigned"}
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase">Priority</h3>
            <div className="mt-1">
              <PriorityBadge priority={project.priority} />
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase">Progress</h3>
            <div className="mt-1 flex items-center gap-2">
              <Progress value={project.progress.percentage || 0} className="h-2.5 w-full" />
              <span className="text-sm font-medium">{project.progress.percentage || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}
