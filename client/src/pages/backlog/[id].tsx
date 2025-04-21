import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Edit,
  FileText,
  Link2,
  ListChecks,
  MessageSquare,
  Paperclip,
  Plus,
  Trash2,
  Users2,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BacklogItemDetailPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [comment, setComment] = useState("");

  // Fetch backlog item data
  const { data: backlogItem, isLoading, error } = useQuery({
    queryKey: ["/api/backlog-items", id],
    queryFn: () => apiRequest("GET", `/api/backlog-items/${id}`).then(res => res.json()),
  });

  // Fetch sprints for reference
  const { data: sprints } = useQuery({
    queryKey: ["/api/sprints"],
    enabled: !!backlogItem,
  });

  // Fetch users for reference
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!backlogItem,
  });

  // Fetch comments for this backlog item
  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["/api/comments", { entityType: "BACKLOG", entityId: id }],
    queryFn: () => apiRequest("GET", `/api/comments?entityType=BACKLOG&entityId=${id}`).then(res => res.json()),
    enabled: !!id,
  });

  // Mutation to update backlog item status
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
        description: "The backlog item status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update the backlog item status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to update sprint assignment
  const updateSprintMutation = useMutation({
    mutationFn: async (sprintId: string | null) => {
      const response = await apiRequest("PUT", `/api/backlog-items/${id}`, { sprintId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/backlog-items", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/backlog-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sprints"] });
      toast({
        title: "Sprint Updated",
        description: "The backlog item has been assigned to a new sprint.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update sprint assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to update assignee
  const updateAssigneeMutation = useMutation({
    mutationFn: async (assigneeId: string | null) => {
      const response = await apiRequest("PUT", `/api/backlog-items/${id}`, { assigneeId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/backlog-items", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/backlog-items"] });
      toast({
        title: "Assignee Updated",
        description: "The backlog item has been assigned to a new user.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update assignee. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to delete backlog item
  const deleteBacklogItemMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/backlog-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/backlog-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sprints"] });
      toast({
        title: "Backlog Item Deleted",
        description: "The backlog item has been successfully deleted.",
      });
      setLocation("/backlog");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete backlog item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to add comment
  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/comments", {
        entityType: "BACKLOG",
        entityId: id,
        text,
      });
      return response.json();
    },
    onSuccess: () => {
      setComment("");
      refetchComments();
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate(status);
  };

  const handleSprintChange = (sprintId: string) => {
    updateSprintMutation.mutate(sprintId === "none" ? null : sprintId);
  };

  const handleAssigneeChange = (assigneeId: string) => {
    updateAssigneeMutation.mutate(assigneeId === "none" ? null : assigneeId);
  };

  const handleDelete = () => {
    deleteBacklogItemMutation.mutate();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addCommentMutation.mutate(comment);
    }
  };

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
            <p>Please check the backlog item ID and try again, or return to the backlog list.</p>
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
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "TO_DO": return "secondary";
      case "IN_PROGRESS": return "default";
      case "DONE": return "success";
      case "BLOCKED": return "destructive";
      default: return "outline";
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "USER_STORY": return "primary";
      case "BUG": return "destructive";
      case "TASK": return "default";
      case "FEATURE": return "secondary";
      case "EPIC": return "warning";
      default: return "outline";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "LOW": return "secondary";
      case "MEDIUM": return "default";
      case "HIGH": return "warning";
      case "CRITICAL": return "destructive";
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

  const getSprintName = (sprintId: string) => {
    if (!sprints) return "Unknown Sprint";
    const sprint = sprints.find((s: any) => s.id === sprintId);
    return sprint ? sprint.name : "Unknown Sprint";
  };

  const getUserName = (userId: string) => {
    if (!users) return "Unknown User";
    const user = users.find((u: any) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => setLocation("/backlog")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{backlogItem.title}</h1>
            <div className="flex items-center flex-wrap gap-2 mt-1">
              <Badge variant={getStatusBadgeVariant(backlogItem.status)}>
                {backlogItem.status.replace("_", " ")}
              </Badge>
              <Badge variant={getTypeBadgeVariant(backlogItem.type)}>
                {backlogItem.type.replace("_", " ")}
              </Badge>
              {backlogItem.priority && (
                <Badge variant={getPriorityBadgeVariant(backlogItem.priority)}>
                  {backlogItem.priority}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2 self-end md:self-auto">
          <Button variant="outline" onClick={() => setLocation(`/backlog/${id}/edit`)}>
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
                {backlogItem.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <ListChecks className="mr-2 h-5 w-5" />
                Acceptance Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!backlogItem.acceptanceCriteria || backlogItem.acceptanceCriteria.length === 0 ? (
                <p className="text-muted-foreground">No acceptance criteria specified.</p>
              ) : (
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {backlogItem.acceptanceCriteria.map((criteria: string, index: number) => (
                    <li key={index} className="pl-2">{criteria}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comments" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments
              </TabsTrigger>
              <TabsTrigger value="attachments" className="flex items-center">
                <Paperclip className="h-4 w-4 mr-2" />
                Attachments
              </TabsTrigger>
            </TabsList>
            <TabsContent value="comments" className="pt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Comments</CardTitle>
                  <CardDescription>
                    Discuss this backlog item with your team.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add new comment */}
                  <form onSubmit={handleCommentSubmit} className="space-y-3">
                    <Textarea
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={!comment.trim() || addCommentMutation.isPending}
                        size="sm"
                      >
                        {addCommentMutation.isPending ? "Adding..." : "Add Comment"}
                      </Button>
                    </div>
                  </form>

                  <Separator />

                  {/* Comments list */}
                  <div className="space-y-4">
                    {!comments || comments.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No comments yet. Be the first to comment!
                      </p>
                    ) : (
                      comments.map((comment: any) => (
                        <div key={comment.id} className="border rounded-md p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="font-medium">
                              {comment.authorId ? getUserName(comment.authorId) : "Unknown User"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </div>
                          </div>
                          <p className="text-sm whitespace-pre-line">{comment.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="attachments" className="pt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Attachments</CardTitle>
                  <CardDescription>
                    Files and documents related to this backlog item.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6">
                    <p className="text-muted-foreground mb-4">No attachments yet.</p>
                    <Button variant="outline" disabled>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Attachment
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Attachment functionality will be implemented in a future update.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {backlogItem.sprintId && (
                <>
                  <div>
                    <div className="font-medium mb-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      Sprint
                    </div>
                    <Select
                      value={backlogItem.sprintId || "none"}
                      onValueChange={handleSprintChange}
                      disabled={updateSprintMutation.isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select sprint" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Sprint</SelectItem>
                        {sprints?.map((sprint: any) => (
                          <SelectItem key={sprint.id} value={sprint.id}>
                            {sprint.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />
                </>
              )}

              <div>
                <div className="font-medium mb-1 flex items-center">
                  <Users2 className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  Assignee
                </div>
                <Select
                  value={backlogItem.assigneeId || "none"}
                  onValueChange={handleAssigneeChange}
                  disabled={updateAssigneeMutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {users?.map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <div className="font-medium mb-1">Status</div>
                <Select
                  value={backlogItem.status}
                  onValueChange={handleStatusChange}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TO_DO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {backlogItem.estimate && (
                <>
                  <div>
                    <div className="font-medium mb-1 flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      Estimate
                    </div>
                    <div className="text-sm text-muted-foreground">{backlogItem.estimate} points</div>
                  </div>

                  <Separator />
                </>
              )}

              {backlogItem.storyPoints && (
                <>
                  <div>
                    <div className="font-medium mb-1 flex items-center">
                      <ListChecks className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      Story Points
                    </div>
                    <div className="text-sm text-muted-foreground">{backlogItem.storyPoints} points</div>
                  </div>

                  <Separator />
                </>
              )}
              
              {backlogItem.dependencies && backlogItem.dependencies.length > 0 && (
                <>
                  <div>
                    <div className="font-medium mb-1 flex items-center">
                      <Link2 className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      Dependencies
                    </div>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {backlogItem.dependencies.map((dep: any, index: number) => (
                        <li key={index} className="truncate">
                          <Button 
                            variant="link" 
                            className="h-auto p-0 text-primary" 
                            onClick={() => setLocation(`/backlog/${dep.id}`)}
                          >
                            {dep.title}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />
                </>
              )}

              <div>
                <div className="text-sm text-muted-foreground">
                  <div className="mb-1">Created: {formatDate(backlogItem.createdAt)}</div>
                  <div>Last Updated: {formatDate(backlogItem.updatedAt)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {backlogItem.reporterId && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Reporter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {getUserName(backlogItem.reporterId).split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium">{getUserName(backlogItem.reporterId)}</div>
                    <div className="text-sm text-muted-foreground">Reporter</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {backlogItem.sprintId && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Related Sprint</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setLocation(`/sprints/${backlogItem.sprintId}`)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {getSprintName(backlogItem.sprintId)}
                </Button>
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
              This action cannot be undone. This will permanently delete the backlog item
              and remove it from any associated sprints.
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