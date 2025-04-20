import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { CalendarIcon, PlusIcon, SparklesIcon, CheckIcon, ClockIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Sprint type definition
type Sprint = {
  id: string;
  name: string;
  goal?: string;
  projectId: string;
  teamId: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

// Project type definition 
type Project = {
  id: string;
  name: string;
  status: string;
};

// Team type definition
type Team = {
  id: string;
  name: string;
};

// Custom DatePicker component
interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

function DatePicker({ date, onSelect, className }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && onSelect) {
      onSelect(date);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default function SprintsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch sprints
  const {
    data: sprints,
    isLoading: isLoadingSprints,
    error: sprintsError,
  } = useQuery<Sprint[]>({
    queryKey: ["/api/sprints"],
  });

  // Fetch projects for dropdown
  const {
    data: projects,
    isLoading: isLoadingProjects,
  } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch teams for dropdown
  const {
    data: teams,
    isLoading: isLoadingTeams,
  } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Form state for creating a sprint
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    projectId: "",
    teamId: "",
    status: "PLANNING",
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 14)), // Default to 2 weeks
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle date changes
  const handleDateChange = (date: Date | undefined, field: 'startDate' | 'endDate'): void => {
    if (date) {
      setFormData((prev) => ({ ...prev, [field]: date }));
    }
  };

  // Create sprint mutation
  const createSprintMutation = useMutation({
    mutationFn: async (newSprint: any) => {
      const res = await fetch("/api/sprints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(newSprint),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create sprint");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sprints"] });
      toast({
        title: "Sprint created",
        description: "The sprint has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      goal: "",
      projectId: "",
      teamId: "",
      status: "PLANNING",
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 14)),
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSprintMutation.mutate({
      ...formData,
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString(),
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PLANNING":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "ACTIVE":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "CANCELLED":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Get project name by ID
  const getProjectName = (projectId: string) => {
    if (!projects) return "Loading...";
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Unknown project";
  };

  // Get team name by ID
  const getTeamName = (teamId: string) => {
    if (!teams) return "Loading...";
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : "Unknown team";
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Sprints</h1>
            <p className="text-gray-600 mt-1">Manage your project sprints</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                New Sprint
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Sprint</DialogTitle>
                  <DialogDescription>
                    Add a new sprint to your project. Fill in the details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="goal" className="text-right pt-2">
                      Goal
                    </Label>
                    <Textarea
                      id="goal"
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      className="col-span-3"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="projectId" className="text-right">
                      Project
                    </Label>
                    <Select
                      name="projectId"
                      value={formData.projectId}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, projectId: value }))}
                      required
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingProjects ? (
                          <SelectItem value="loading" disabled>
                            Loading projects...
                          </SelectItem>
                        ) : (
                          projects?.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="teamId" className="text-right">
                      Team
                    </Label>
                    <Select
                      name="teamId"
                      value={formData.teamId}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, teamId: value }))}
                      required
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingTeams ? (
                          <SelectItem value="loading" disabled>
                            Loading teams...
                          </SelectItem>
                        ) : (
                          teams?.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Select
                      name="status"
                      value={formData.status}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                      required
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLANNING">Planning</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startDate" className="text-right">
                      Start Date
                    </Label>
                    <div className="col-span-3">
                      <DatePicker 
                        date={formData.startDate}
                        onSelect={(date: Date) => handleDateChange(date, 'startDate')}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endDate" className="text-right">
                      End Date
                    </Label>
                    <div className="col-span-3">
                      <DatePicker
                        date={formData.endDate}
                        onSelect={(date: Date) => handleDateChange(date, 'endDate')}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createSprintMutation.isPending}
                  >
                    {createSprintMutation.isPending ? "Creating..." : "Create Sprint"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoadingSprints ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="w-full">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-4 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : sprintsError ? (
          <div className="bg-red-50 p-4 rounded border border-red-200 text-red-800">
            <h3 className="text-lg font-semibold">Error loading sprints</h3>
            <p>{(sprintsError as Error).message || "Please try again later."}</p>
          </div>
        ) : sprints && sprints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sprints.map((sprint) => (
              <Link key={sprint.id} href={`/sprints/${sprint.id}`}>
                <Card className="w-full h-full cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{sprint.name}</CardTitle>
                      <Badge className={getStatusBadgeColor(sprint.status)}>
                        {sprint.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <span className="font-medium">Project:</span> {getProjectName(sprint.projectId)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {sprint.goal && (
                        <p className="text-sm text-gray-600">{sprint.goal}</p>
                      )}
                      <div className="flex flex-col space-y-1 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span>{formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <SparklesIcon className="h-3.5 w-3.5" />
                          <span>Team: {getTeamName(sprint.teamId)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="w-full flex justify-end">
                      {sprint.status === "ACTIVE" && (
                        <Badge variant="outline" className="text-xs">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          In Progress
                        </Badge>
                      )}
                      {sprint.status === "COMPLETED" && (
                        <Badge variant="outline" className="text-xs">
                          <CheckIcon className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No sprints yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first sprint to start planning your work.
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New Sprint
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}