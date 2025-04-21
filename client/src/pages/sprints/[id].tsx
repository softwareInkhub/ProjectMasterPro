import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  ListChecks,
  PlusCircle,
  Trash2,
  Users2,
  BarChart,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SprintDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch sprint data
  const { data: sprint, isLoading, error } = useQuery({
    queryKey: ["/api/sprints", id],
    queryFn: () => apiRequest("GET", `/api/sprints/${id}`).then(res => res.json()),
  });

  // Fetch backlog items for this sprint
  const { data: backlogItems } = useQuery({
    queryKey: ["/api/backlog-items", { sprintId: id }],
    queryFn: () => apiRequest("GET", `/api/backlog-items?sprintId=${id}`).then(res => res.json()),
    enabled: !!id,
  });

  // Fetch projects for reference
  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
    enabled: !!sprint,
  });

  // Fetch teams for reference
  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
    enabled: !!sprint,
  });

  // Mutation to update sprint status
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PUT", `/api/sprints/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sprints", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/sprints"] });
      toast({
        title: "Status Updated",
        description: "The sprint status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update the sprint status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to delete sprint
  const deleteSprintMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/sprints/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sprints"] });
      toast({
        title: "Sprint Deleted",
        description: "The sprint has been successfully deleted.",
      });
      setLocation("/sprints");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete sprint. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate(status);
  };

  const handleDelete = () => {
    deleteSprintMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !sprint) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Sprint</CardTitle>
            <CardDescription>
              The requested sprint could not be found or there was an error loading it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please check the sprint ID and try again, or return to the sprints list.</p>
          </CardContent>
          <CardFooter>
            <Button variant="default" onClick={() => setLocation("/sprints")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sprints
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Helper functions
  const getProjectName = (projectId: string) => {
    if (!projects) return "Unknown Project";
    const project = projects.find((p: any) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  const getTeamName = (teamId: string) => {
    if (!teams) return "Unknown Team";
    const team = teams.find((t: any) => t.id === teamId);
    return team ? team.name : "Unknown Team";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PLANNING": return "secondary";
      case "ACTIVE": return "default";
      case "COMPLETED": return "success";
      case "CANCELLED": return "destructive";
      default: return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate sprint metrics
  const calculateSprintMetrics = () => {
    if (!backlogItems || backlogItems.length === 0) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        completionPercentage: 0,
      };
    }

    const total = backlogItems.length;
    const completed = backlogItems.filter((item: any) => item.status === "DONE").length;
    const inProgress = backlogItems.filter((item: any) => item.status === "IN_PROGRESS").length;
    const notStarted = total - completed - inProgress;
    const completionPercentage = Math.round((completed / total) * 100);

    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionPercentage,
    };
  };

  const metrics = calculateSprintMetrics();

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => setLocation("/sprints")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{sprint.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={getStatusBadgeVariant(sprint.status)}>
                {sprint.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 self-end md:self-auto">
          {sprint.status !== "COMPLETED" && (
            <Button variant="outline" onClick={() => setLocation(`/sprints/retrospective/${id}`)}>
              <BarChart className="mr-2 h-4 w-4" />
              Retrospective
            </Button>
          )}
          <Button variant="outline" onClick={() => setLocation(`/sprints/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="mr-2 h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">
                {sprint.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Sprint progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{metrics.completionPercentage}% Complete</span>
                  <span className="text-sm text-muted-foreground">
                    {metrics.completed}/{metrics.total} items
                  </span>
                </div>
                <Progress value={metrics.completionPercentage} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold">{metrics.notStarted}</div>
                  <div className="text-xs text-muted-foreground">Not Started</div>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold">{metrics.inProgress}</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold">{metrics.completed}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backlog items in this sprint */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                <ListChecks className="mr-2 h-5 w-5" />
                Sprint Backlog
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/backlog/new")}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              {!backlogItems || backlogItems.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No backlog items in this sprint yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {backlogItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setLocation(`/backlog/${item.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {item.description || "No description"}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            item.status === "DONE" ? "success" : 
                            item.status === "IN_PROGRESS" ? "default" : 
                            "outline"
                          }
                          className="ml-2"
                        >
                          {item.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center mr-3">
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {item.type.replace("_", " ")}
                          </span>
                        </div>
                        {item.estimate && (
                          <div className="flex items-center mr-3">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.estimate} pts
                          </div>
                        )}
                        {item.priority && (
                          <div className="flex items-center">
                            <span className={`px-2 py-0.5 rounded-full ${
                              item.priority === "HIGH" || item.priority === "CRITICAL" ? 
                              "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" :
                              item.priority === "MEDIUM" ? 
                              "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300" :
                              "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {backlogItems && backlogItems.length > 0 && (
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full text-center" 
                  onClick={() => setLocation("/backlog")}
                >
                  View All Backlog Items
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Retrospective section (if completed) */}
          {sprint.retrospective && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BarChart className="mr-2 h-5 w-5" />
                  Sprint Retrospective
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {sprint.retrospective.whatWentWell && sprint.retrospective.whatWentWell.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">What Went Well</h3>
                    <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                      {sprint.retrospective.whatWentWell.map((item: string, index: number) => (
                        <li key={`well-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {sprint.retrospective.whatCouldBeImproved && sprint.retrospective.whatCouldBeImproved.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">What Could Be Improved</h3>
                    <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                      {sprint.retrospective.whatCouldBeImproved.map((item: string, index: number) => (
                        <li key={`improve-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {sprint.retrospective.actionItems && sprint.retrospective.actionItems.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Action Items</h3>
                    <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                      {sprint.retrospective.actionItems.map((item: string, index: number) => (
                        <li key={`action-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setLocation(`/sprints/retrospective/${id}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Retrospective
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-medium mb-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  Timeline
                </div>
                <div className="text-sm grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-muted-foreground">Start Date</div>
                    <div>{formatDate(sprint.startDate)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">End Date</div>
                    <div>{formatDate(sprint.endDate)}</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="font-medium mb-1 flex items-center">
                  <FileText className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  Project
                </div>
                <div className="text-sm">
                  {sprint.projectId ? getProjectName(sprint.projectId) : "Not assigned to a project"}
                </div>
              </div>

              <Separator />

              <div>
                <div className="font-medium mb-1 flex items-center">
                  <Users2 className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  Team
                </div>
                <div className="text-sm">
                  {sprint.teamId ? getTeamName(sprint.teamId) : "Not assigned to a team"}
                </div>
              </div>

              <Separator />

              <div>
                <div className="font-medium mb-1">Status</div>
                <Select
                  value={sprint.status}
                  onValueChange={handleStatusChange}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger>
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

              <Separator />

              <div>
                <div className="text-sm text-muted-foreground">
                  <div className="mb-1">Created: {formatDate(sprint.createdAt)}</div>
                  <div>Last Updated: {formatDate(sprint.updatedAt)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals card */}
          {sprint.goals && sprint.goals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Sprint Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {sprint.goals.map((goal: string, index: number) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the sprint
              and remove any associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}