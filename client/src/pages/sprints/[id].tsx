import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Edit, Trash2, Calendar, Users, ListTodo, CheckCircle2, AlertCircle, BarChart } from "lucide-react";
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
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SprintDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: sprint, isLoading: sprintLoading, error: sprintError } = useQuery({
    queryKey: ["/api/sprints", id],
    queryFn: () => apiRequest("GET", `/api/sprints/${id}`).then(res => res.json()),
  });

  const { data: backlogItems, isLoading: backlogLoading } = useQuery({
    queryKey: ["/api/backlog-items", { sprintId: id }],
    queryFn: () => apiRequest("GET", `/api/backlog-items?sprintId=${id}`).then(res => res.json()),
    enabled: !!sprint,
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!sprint,
  });

  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
    enabled: !!sprint,
  });

  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
    enabled: !!sprint,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/sprints/${id}`);
      return response.ok;
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
        description: "Failed to delete the sprint. Please try again.",
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/sprints/${id}`, { 
        status: "COMPLETED" 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sprints", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/sprints"] });
      toast({
        title: "Sprint Completed",
        description: "The sprint has been marked as completed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete the sprint. Please try again.",
        variant: "destructive",
      });
    },
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/sprints/${id}`, { 
        status: "ACTIVE" 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sprints", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/sprints"] });
      toast({
        title: "Sprint Activated",
        description: "The sprint has been activated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to activate the sprint. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (sprintLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (sprintError || !sprint) {
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

  // Helper functions to get names from IDs
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

  const getUserName = (userId: string) => {
    if (!users) return "Unknown User";
    const user = users.find((u: any) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE": return "default";
      case "PLANNING": return "outline";
      case "COMPLETED": return "secondary";
      case "REVIEW": return "warning";
      default: return "outline";
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleCompleteClick = () => {
    completeMutation.mutate();
  };

  const handleActivateClick = () => {
    activateMutation.mutate();
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => setLocation("/sprints")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{sprint.name}</h1>
          <Badge variant={getStatusBadgeVariant(sprint.status)}>
            {sprint.status}
          </Badge>
        </div>
        <div className="flex space-x-2">
          {sprint.status === "PLANNING" && (
            <Button onClick={handleActivateClick}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Start Sprint
            </Button>
          )}
          {sprint.status === "ACTIVE" && (
            <Button onClick={handleCompleteClick}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete Sprint
            </Button>
          )}
          <Button variant="outline" onClick={() => setLocation(`/sprints/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDeleteClick}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Sprint Progress</CardTitle>
          <CardDescription>
            Current completion: {sprint.completed || "0"} of {sprint.capacity || "0"} story points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={parseInt(sprint.completed || "0") / parseInt(sprint.capacity || "1") * 100} className="h-2" />
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="backlog-items">Backlog Items</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="retrospective">Retrospective</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="mr-2 h-4 w-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">
                      {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date:</span>
                    <span className="font-medium">
                      {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">
                      {sprint.startDate && sprint.endDate
                        ? `${Math.ceil(
                            (new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )} days`
                        : "Not set"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Users className="mr-2 h-4 w-4" />
                  Team & Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project:</span>
                    <span className="font-medium">
                      {getProjectName(sprint.projectId)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Team:</span>
                    <span className="font-medium">
                      {getTeamName(sprint.teamId)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scrum Master:</span>
                    <span className="font-medium">
                      {sprint.scrumMasterId ? getUserName(sprint.scrumMasterId) : "Not assigned"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sprint Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{sprint.goal || "No sprint goal defined."}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{sprint.notes || "No notes available."}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backlog-items" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Sprint Backlog Items</h3>
            <Button onClick={() => setLocation(`/sprints/${id}/add-items`)}>Add Items to Sprint</Button>
          </div>

          {backlogLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : !backlogItems || backlogItems.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Items</CardTitle>
                <CardDescription>
                  There are no backlog items in this sprint yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Add items to this sprint to start tracking your work.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {backlogItems.map((item: any) => (
                <Card key={item.id} className="hover:shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-base">
                          <span 
                            className="cursor-pointer hover:underline"
                            onClick={() => setLocation(`/backlog/${item.id}`)}
                          >
                            {item.title}
                          </span>
                        </CardTitle>
                        <CardDescription>{item.type}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant={
                          item.priority === "HIGH" ? "destructive" : 
                          item.priority === "MEDIUM" ? "default" : 
                          "outline"
                        }>
                          {item.priority}
                        </Badge>
                        <Badge variant={
                          item.status === "DONE" ? "default" : 
                          item.status === "IN_PROGRESS" ? "secondary" : 
                          "outline"
                        }>
                          {item.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex justify-between text-sm mt-2">
                      <span>Estimate: {item.estimate || "Not set"}</span>
                      {item.assigneeId && (
                        <span>Assigned to: {getUserName(item.assigneeId)}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sprint Metrics</CardTitle>
              <CardDescription>
                Performance metrics for the current sprint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Story Points</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Committed</p>
                      <p className="text-2xl font-bold">{sprint.capacity || "0"}</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{sprint.completed || "0"}</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Velocity</p>
                      <p className="text-2xl font-bold">
                        {sprint.status === "COMPLETED" 
                          ? (parseInt(sprint.completed || "0")).toFixed(1) 
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Backlog Items Status</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {!backlogItems ? (
                      <div className="col-span-4 text-center py-4">Loading...</div>
                    ) : (
                      <>
                        <div className="bg-muted p-4 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-2xl font-bold">{backlogItems.length}</p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">To Do</p>
                          <p className="text-2xl font-bold">
                            {backlogItems.filter((i: any) => i.status === "NEW" || i.status === "REFINED").length}
                          </p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">In Progress</p>
                          <p className="text-2xl font-bold">
                            {backlogItems.filter((i: any) => i.status === "IN_PROGRESS").length}
                          </p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">Done</p>
                          <p className="text-2xl font-bold">
                            {backlogItems.filter((i: any) => i.status === "DONE").length}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retrospective" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sprint Retrospective</CardTitle>
              <CardDescription>
                Review and feedback for the sprint
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sprint.status !== "COMPLETED" ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Retrospective Not Available</h3>
                  <p className="text-muted-foreground">
                    The retrospective will be available after the sprint is completed.
                  </p>
                </div>
              ) : sprint.retrospective ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">What Went Well</h3>
                    {sprint.retrospective.whatWentWell && sprint.retrospective.whatWentWell.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {sprint.retrospective.whatWentWell.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No items recorded.</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">What Could Be Improved</h3>
                    {sprint.retrospective.whatCouldBeImproved && sprint.retrospective.whatCouldBeImproved.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {sprint.retrospective.whatCouldBeImproved.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No items recorded.</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Action Items</h3>
                    {sprint.retrospective.actionItems && sprint.retrospective.actionItems.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {sprint.retrospective.actionItems.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No items recorded.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Retrospective Data</h3>
                  <p className="text-muted-foreground mb-4">
                    Add retrospective data to capture learnings from this sprint.
                  </p>
                  <Button 
                    onClick={() => setLocation(`/sprints/${id}/retrospective`)}
                    disabled={sprint.status !== "COMPLETED"}
                  >
                    Add Retrospective
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the sprint
              and remove its data from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}