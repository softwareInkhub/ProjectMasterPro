import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ChevronRight, Plus, Filter, List, Search } from "lucide-react";
import { Helmet } from "react-helmet";
import { Story, Epic } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const Backlog = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("stories");
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusView, setStatusView] = useState("grid");
  
  // Fetch all stories in Backlog status
  const {
    data: stories,
    isLoading: storiesLoading,
    error: storiesError,
  } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
    select: (data: Story[]) => data.filter((story: Story) => story.status === "BACKLOG"),
  });

  // Fetch all epics in Backlog status
  const {
    data: epics,
    isLoading: epicsLoading,
    error: epicsError,
  } = useQuery<Epic[]>({
    queryKey: ["/api/epics"],
    select: (data: Epic[]) => data.filter((epic: Epic) => epic.status === "BACKLOG"),
  });

  // Filter stories based on search term and priority
  const filteredStories = stories?.filter((story: Story) => {
    const matchesSearch = searchTerm === "" || 
      story.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (story.description && story.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPriority = priorityFilter === "" || story.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  // Filter epics based on search term and priority
  const filteredEpics = epics?.filter((epic: Epic) => {
    const matchesSearch = searchTerm === "" || 
      epic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (epic.description && epic.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPriority = priorityFilter === "" || epic.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "MEDIUM":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "HIGH":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "CRITICAL":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <>
      <Helmet>
        <title>Backlog | Project Management</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Backlog</h1>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <span>Dashboard</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span>Backlog</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className={statusView === "grid" ? "bg-muted" : ""}
            onClick={() => setStatusView("grid")}
          >
            <Filter className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant="outline"
            className={statusView === "list" ? "bg-muted" : ""}
            onClick={() => setStatusView("list")}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          {selectedTab === "stories" ? (
            <Button asChild>
              <Link to="/stories/new">
                <Plus className="h-4 w-4 mr-2" />
                New Story
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/epics/new">
                <Plus className="h-4 w-4 mr-2" />
                New Epic
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search backlog items..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="stories" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="stories">Stories</TabsTrigger>
          <TabsTrigger value="epics">Epics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stories" className="space-y-4">
          {storiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter className="p-4 flex justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : storiesError ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load backlog stories. Please try again later.
              </AlertDescription>
            </Alert>
          ) : filteredStories && filteredStories.length > 0 ? (
            statusView === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStories.map((story: Story) => (
                  <Link key={story.id} href={`/stories/${story.id}`}>
                    <Card className="h-full cursor-pointer hover:border-primary transition-all overflow-hidden">
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg line-clamp-2">{story.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {story.epicId ? `Epic: ${story.epicId.slice(0, 8)}` : "No Epic"}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityColor(story.priority)}`}>
                            {story.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <CardDescription className="line-clamp-3 text-xs">
                          {story.description || "No description"}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="p-4 flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {story.storyPoints ? `${story.storyPoints} points` : "No points"}
                        </span>
                        <span className="text-muted-foreground">
                          Created: {formatDate(story.createdAt)}
                        </span>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="grid grid-cols-12 p-4 bg-muted font-medium">
                  <div className="col-span-6">Name</div>
                  <div className="col-span-2">Priority</div>
                  <div className="col-span-2">Points</div>
                  <div className="col-span-2">Created</div>
                </div>
                <ScrollArea className="h-[60vh]">
                  {filteredStories.map((story: Story, index: number) => (
                    <React.Fragment key={story.id}>
                      {index > 0 && <Separator />}
                      <Link href={`/stories/${story.id}`}>
                        <div className="grid grid-cols-12 p-4 hover:bg-muted/50 cursor-pointer">
                          <div className="col-span-6">
                            <div className="font-medium">{story.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {story.description || "No description"}
                            </div>
                          </div>
                          <div className="col-span-2 flex items-center">
                            <Badge className={`${getPriorityColor(story.priority)}`}>
                              {story.priority}
                            </Badge>
                          </div>
                          <div className="col-span-2 flex items-center text-sm">
                            {story.storyPoints || "—"}
                          </div>
                          <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                            {formatDate(story.createdAt)}
                          </div>
                        </div>
                      </Link>
                    </React.Fragment>
                  ))}
                </ScrollArea>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No backlog stories found</h3>
              <p className="text-muted-foreground mt-1">
                Create a new story or change your search filters
              </p>
              <Button asChild className="mt-4">
                <Link to="/stories/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Story
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="epics" className="space-y-4">
          {epicsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter className="p-4 flex justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : epicsError ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load backlog epics. Please try again later.
              </AlertDescription>
            </Alert>
          ) : filteredEpics && filteredEpics.length > 0 ? (
            statusView === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEpics.map((epic: Epic) => (
                  <Link key={epic.id} href={`/epics/${epic.id}`}>
                    <Card className="h-full cursor-pointer hover:border-primary transition-all overflow-hidden">
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg line-clamp-2">{epic.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {`Project: ${epic.projectId.slice(0, 8)}`}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityColor(epic.priority)}`}>
                            {epic.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <CardDescription className="line-clamp-3 text-xs">
                          {epic.description || "No description"}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="p-4 flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Progress: {epic.progress && typeof epic.progress === 'object' ? `${(epic.progress as {percentage: number}).percentage}%` : "0%"}
                        </span>
                        <span className="text-muted-foreground">
                          Created: {formatDate(epic.createdAt)}
                        </span>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="grid grid-cols-12 p-4 bg-muted font-medium">
                  <div className="col-span-6">Name</div>
                  <div className="col-span-2">Priority</div>
                  <div className="col-span-2">Progress</div>
                  <div className="col-span-2">Created</div>
                </div>
                <ScrollArea className="h-[60vh]">
                  {filteredEpics.map((epic: Epic, index: number) => (
                    <React.Fragment key={epic.id}>
                      {index > 0 && <Separator />}
                      <Link href={`/epics/${epic.id}`}>
                        <div className="grid grid-cols-12 p-4 hover:bg-muted/50 cursor-pointer">
                          <div className="col-span-6">
                            <div className="font-medium">{epic.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {epic.description || "No description"}
                            </div>
                          </div>
                          <div className="col-span-2 flex items-center">
                            <Badge className={`${getPriorityColor(epic.priority)}`}>
                              {epic.priority}
                            </Badge>
                          </div>
                          <div className="col-span-2 flex items-center text-sm">
                            {epic.progress && typeof epic.progress === 'object' ? `${(epic.progress as {percentage: number}).percentage}%` : "0%"}
                          </div>
                          <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                            {formatDate(epic.createdAt)}
                          </div>
                        </div>
                      </Link>
                    </React.Fragment>
                  ))}
                </ScrollArea>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No backlog epics found</h3>
              <p className="text-muted-foreground mt-1">
                Create a new epic or change your search filters
              </p>
              <Button asChild className="mt-4">
                <Link to="/epics/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Epic
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
    </>
  );
};

export default Backlog;