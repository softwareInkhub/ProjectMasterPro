import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { ArrowLeft, Clock, Edit, FileText, ListChecks, Tag, Trash2, Users } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BacklogItemDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedSprintId, setSelectedSprintId] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMoveToSprintDialog, setShowMoveToSprintDialog] = useState(false);

  // Fetch backlog item data
  const { data: backlogItem, isLoading, error } = useQuery({
    queryKey: ["/api/backlog-items", id],
    queryFn: () => apiRequest("GET", `/api/backlog-items/${id}`).then(res => res.json()),
  });

  // Fetch related data
  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
    enabled: !!backlogItem,
  });

  const { data: epics } = useQuery({
    queryKey: ["/api/epics"],
    enabled: !!backlogItem,
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!backlogItem,
  });

  const { data: sprints } = useQuery({
    queryKey: ["/api/sprints"],
    enabled: !!backlogItem,
  });

  // Mutation to delete the backlog item
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/backlog-items/${id}`);
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/backlog-items"] });
      toast({
        title: "Backlog Item Deleted",
        description: "The backlog item has been successfully deleted.",
      });
      setLocation("/backlog");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete the backlog item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to move the backlog item to a sprint
  const moveToSprintMutation = useMutation({
    mutationFn: async (sprintId: string) => {
      const response = await apiRequest("POST", `/api/backlog-items/${id}/move-to-sprint/${sprintId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/backlog-items", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/backlog-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sprints"] });
      toast({
        title: "Moved to Sprint",
        description: "The backlog item has been added to the sprint.",
      });
      setShowMoveToSprintDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to move the backlog item to the sprint. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to remove the backlog item from a sprint
  const removeFromSprintMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/backlog-items/${id}/remove-from-sprint`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/backlog-items", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/backlog-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sprints"] });
      toast({
        title: "Removed from Sprint",
        description: "The backlog item has been removed from the sprint.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove the backlog item from the sprint. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to update the status of the backlog item
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("PUT", `/api/backlog-items/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/backlog-items", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/backlog-items"] });
      toast({
        title: "Status Updated",
        description: "The backlog item status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update the status. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !backlogItem) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Backlog Item</CardTitle>
            <CardDescription>
              The requested backlog item could not be found or there was an error loading it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please check the ID and try again, or return to the backlog list.</p>
          </CardContent>
          <CardFooter>
            <Button variant="default" onClick={() => setLocation("/backlog")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Backlog
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

  const getEpicName = (epicId: string) => {
    if (!epics || !epicId) return "Not linked to an epic";
    const epic = epics.find((e: any) => e.id === epicId);
    return epic ? epic.name : "Unknown Epic";
  };

  const getUserName = (userId: string) => {
    if (!users || !userId) return "Unassigned";
    const user = users.find((u: any) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  const getSprintName = (sprintId: string) => {
    if (!sprints || !sprintId) return "Not in a sprint";
    const sprint = sprints.find((s: any) => s.id === sprintId);
    return sprint ? sprint.name : "Unknown Sprint";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "NEW": return "outline";
      case "REFINED": return "secondary";
      case "READY": return "default";
      case "IN_PROGRESS": return "default";
      case "DONE": return "success";
      default: return "outline";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "HIGH": return "destructive";
      case "MEDIUM": return "default";
      case "LOW": return "outline";
      case "CRITICAL": return "destructive";
      case "UNASSIGNED": return "outline";
      default: return "outline";
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleMoveToSprint = () => {
    if (selectedSprintId) {
      moveToSprintMutation.mutate(selectedSprintId);
    }
  };

  const handleRemoveFromSprint = () => {
    removeFromSprintMutation.mutate();
  };

  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate(status);
  };

  // Filter out sprints that aren't active or planning
  const availableSprints = sprints?.filter((sprint: any) => 
    ["PLANNING", "ACTIVE"].includes(sprint.status)
  ) || [];

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => setLocation("/backlog")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{backlogItem.title}</h1>
          <Badge variant={getStatusBadgeVariant(backlogItem.status)}>
            {backlogItem.status.replace("_", " ")}
          </Badge>
          <Badge variant={getPriorityBadgeVariant(backlogItem.priority)}>
            {backlogItem.priority}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setLocation(`/backlog/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDeleteClick}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="mr-2 h-4 w-4" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">
                {backlogItem.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {backlogItem.acceptanceCriteria && backlogItem.acceptanceCriteria.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <ListChecks className="mr-2 h-4 w-4" />
                  Acceptance Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {backlogItem.acceptanceCriteria.map((criteria: string, index: number) => (
                    <li key={index}>{criteria}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Project</p>
                  <p className="text-sm text-muted-foreground">
                    {getProjectName(backlogItem.projectId)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm text-muted-foreground">
                    {backlogItem.type.replace("_", " ")}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Epic</p>
                  <p className="text-sm text-muted-foreground">
                    {backlogItem.epicId ? getEpicName(backlogItem.epicId) : "Not linked to an epic"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Sprint</p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {backlogItem.sprintId ? getSprintName(backlogItem.sprintId) : "Not in a sprint"}
                    </p>
                    
                    {backlogItem.sprintId ? (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleRemoveFromSprint}
                        disabled={removeFromSprintMutation.isPending}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Dialog open={showMoveToSprintDialog} onOpenChange={setShowMoveToSprintDialog}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">Add to Sprint</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add to Sprint</DialogTitle>
                            <DialogDescription>
                              Select a sprint to add this backlog item to.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {availableSprints.length === 0 ? (
                            <div className="py-4">
                              <p className="text-center text-muted-foreground">
                                No active or planned sprints available.
                              </p>
                            </div>
                          ) : (
                            <div className="py-4">
                              <Select onValueChange={setSelectedSprintId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a sprint" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableSprints.map((sprint: any) => (
                                    <SelectItem key={sprint.id} value={sprint.id}>
                                      {sprint.name} ({sprint.status})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setShowMoveToSprintDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleMoveToSprint}
                              disabled={!selectedSprintId || moveToSprintMutation.isPending}
                            >
                              {moveToSprintMutation.isPending ? "Adding..." : "Add to Sprint"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Estimate</p>
                  <p className="text-sm text-muted-foreground">
                    {backlogItem.estimate || "Not estimated"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">People</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Assignee</p>
                  <p className="text-sm text-muted-foreground">
                    {backlogItem.assigneeId ? getUserName(backlogItem.assigneeId) : "Unassigned"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Reporter</p>
                  <p className="text-sm text-muted-foreground">
                    {backlogItem.reporterId ? getUserName(backlogItem.reporterId) : "Not specified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={backlogItem.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="REFINED">Refined</SelectItem>
                  <SelectItem value="READY">Ready</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="mt-4">
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(backlogItem.createdAt).toLocaleString()}
                </p>
              </div>
              
              <div className="mt-2">
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(backlogItem.updatedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {backlogItem.labels && backlogItem.labels.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Tag className="mr-2 h-4 w-4" />
                  Labels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {backlogItem.labels.map((label: string, index: number) => (
                    <Badge key={index} variant="outline">{label}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the backlog item
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