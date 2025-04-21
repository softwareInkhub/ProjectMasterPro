import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function SprintsPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("active");

  // Fetch sprints data
  const { data: sprints, isLoading, error } = useQuery({
    queryKey: ["/api/sprints"],
    retry: 1,
  });

  // Fetch projects data for reference
  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
    retry: 1,
  });

  // Helper function to get project name
  const getProjectName = (projectId: string) => {
    if (!projects) return "Unknown Project";
    const project = projects.find((p: any) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Sprints</CardTitle>
            <CardDescription>
              There was a problem loading the sprint data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please try refreshing the page or contact support if the problem persists.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredSprints = sprints?.filter((sprint: any) => {
    if (activeTab === "active") return sprint.status === "ACTIVE";
    if (activeTab === "planned") return sprint.status === "PLANNED";
    if (activeTab === "completed") return sprint.status === "COMPLETED";
    return true;
  }) || [];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sprints</h1>
        <Button onClick={() => setLocation("/sprints/new")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Sprint
        </Button>
      </div>

      <Tabs defaultValue="active" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        {["active", "planned", "completed", "all"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 pt-4">
            {filteredSprints.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Sprints Found</CardTitle>
                  <CardDescription>
                    {activeTab === "active" 
                      ? "There are no active sprints currently." 
                      : activeTab === "planned" 
                      ? "There are no planned sprints currently."
                      : activeTab === "completed"
                      ? "There are no completed sprints."
                      : "There are no sprints available."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Click the "New Sprint" button to create a sprint.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSprints.map((sprint: any) => (
                  <Card key={sprint.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-center">
                        <Link href={`/sprints/${sprint.id}`} className="text-lg font-semibold text-primary hover:underline">
                          {sprint.name}
                        </Link>
                        <Badge variant={sprint.status === "ACTIVE" ? "default" : 
                                       sprint.status === "PLANNED" ? "outline" : 
                                       "secondary"}>
                          {sprint.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{getProjectName(sprint.projectId)}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Start:</span>
                          <span className="font-medium">{new Date(sprint.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">End:</span>
                          <span className="font-medium">{new Date(sprint.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress:</span>
                          <span className="font-medium">{sprint.progress}%</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/sprints/${sprint.id}`} className="w-full">
                        <Button variant="outline" className="w-full text-sm">View Details</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}