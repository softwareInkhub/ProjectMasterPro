import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

export default function BacklogPage() {
  const [, setLocation] = useLocation();
  const [projectFilter, setProjectFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Define interface for backlog items and projects
  interface BacklogItem {
    id: string;
    title: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: string;
    projectId: string;
    storyPoints: number;
    createdAt: string;
  }

  interface Project {
    id: string;
    name: string;
  }

  // Fetch backlog items data
  const { data: backlogItems = [], isLoading, error } = useQuery<BacklogItem[]>({
    queryKey: ["/api/backlog-items"],
    retry: 1,
  });

  // Fetch projects data for filtering
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    retry: 1,
  });

  const toggleItemExpansion = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Helper function to get project name
  const getProjectName = (projectId: string) => {
    if (!projects.length) return "Unknown Project";
    const project = projects.find((p: Project) => p.id === projectId);
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
            <CardTitle className="text-destructive">Error Loading Backlog</CardTitle>
            <CardDescription>
              There was a problem loading the backlog data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please try refreshing the page or contact support if the problem persists.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter by project if needed
  const filteredItems = backlogItems.filter((item: BacklogItem) => {
    if (projectFilter === "all") return true;
    return item.projectId === projectFilter;
  });

  // Sort items by priority
  const sortedItems = [...filteredItems].sort((a: BacklogItem, b: BacklogItem) => {
    // Priority values: HIGH(3), MEDIUM(2), LOW(1)
    const priorityValues: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const priorityA = priorityValues[a.priority] || 0;
    const priorityB = priorityValues[b.priority] || 0;
    
    return sortDirection === "desc" 
      ? priorityB - priorityA 
      : priorityA - priorityB;
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Backlog</h1>
        <Button onClick={() => setLocation("/backlog/new")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              defaultValue="all" 
              onValueChange={(value) => setProjectFilter(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project: Project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sort By Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}
            >
              {sortDirection === "asc" ? (
                <span className="flex items-center">
                  Low to High <ChevronUp className="ml-2 h-4 w-4" />
                </span>
              ) : (
                <span className="flex items-center">
                  High to Low <ChevronDown className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span className="font-medium">{filteredItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span>High Priority:</span>
                <span className="font-medium">
                  {filteredItems.filter((item: BacklogItem) => item.priority === "HIGH").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ready for Sprint:</span>
                <span className="font-medium">
                  {filteredItems.filter((item: BacklogItem) => item.status === "READY").length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      {sortedItems.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Backlog Items</CardTitle>
            <CardDescription>
              There are no items in the backlog for the selected filters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Click the "Add Item" button to create a new backlog item.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((item: BacklogItem) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Checkbox id={`item-${item.id}`} />
                      <CardTitle className="text-lg">
                        <Link 
                          href={`/backlog/${item.id}`} 
                          className="hover:underline text-primary"
                        >
                          {item.title}
                        </Link>
                      </CardTitle>
                      <Badge variant={
                        item.priority === "HIGH" ? "destructive" : 
                        item.priority === "MEDIUM" ? "default" : 
                        "outline"
                      }>
                        {item.priority}
                      </Badge>
                      <Badge variant={
                        item.status === "READY" ? "default" : 
                        item.status === "IN_PROGRESS" ? "secondary" : 
                        "outline"
                      }>
                        {item.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      Project: {getProjectName(item.projectId)}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleItemExpansion(item.id)}
                  >
                    {expandedItems[item.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              {expandedItems[item.id] && (
                <>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-medium">Description:</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium">Story Points:</h4>
                          <p className="text-sm">{item.storyPoints}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Created On:</h4>
                          <p className="text-sm">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setLocation(`/backlog/${item.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => setLocation(`/backlog/${item.id}`)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}