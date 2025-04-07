import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  SortAscIcon, 
  BookOpenIcon,
  BriefcaseIcon,
  CalendarIcon,
  TagIcon,
  ClipboardListIcon
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StoriesPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Sample stories data - this would come from an API in the real application
  const stories = [
    {
      id: 101,
      name: "User Registration",
      description: "Implement user registration with email confirmation",
      status: "DONE",
      priority: "HIGH",
      epicId: 1,
      epicName: "User Authentication System",
      projectId: 1,
      projectName: "Website Redesign",
      storyPoints: "8",
      assignee: { id: 5, name: "Alice Chen", avatar: "AC" },
      reporter: { id: 8, name: "Bob Jackson", avatar: "BJ" },
      startDate: "2023-09-18",
      dueDate: "2023-09-30",
      createdAt: "2023-09-15",
      updatedAt: "2023-09-30",
      taskCount: 5,
      completedTasks: 5
    },
    {
      id: 102,
      name: "User Login",
      description: "Implement secure login with JWT authentication",
      status: "DONE",
      priority: "HIGH",
      epicId: 1,
      epicName: "User Authentication System",
      projectId: 1,
      projectName: "Website Redesign",
      storyPoints: "5",
      assignee: { id: 5, name: "Alice Chen", avatar: "AC" },
      reporter: { id: 8, name: "Bob Jackson", avatar: "BJ" },
      startDate: "2023-10-01",
      dueDate: "2023-10-10",
      createdAt: "2023-09-15",
      updatedAt: "2023-10-10",
      taskCount: 4,
      completedTasks: 4
    },
    {
      id: 103,
      name: "Password Reset",
      description: "Implement password reset functionality with email notifications",
      status: "DONE",
      priority: "MEDIUM",
      epicId: 1,
      epicName: "User Authentication System",
      projectId: 1,
      projectName: "Website Redesign",
      storyPoints: "5",
      assignee: { id: 8, name: "Bob Jackson", avatar: "BJ" },
      reporter: { id: 5, name: "Alice Chen", avatar: "AC" },
      startDate: "2023-10-11",
      dueDate: "2023-10-20",
      createdAt: "2023-09-15",
      updatedAt: "2023-10-20",
      taskCount: 3,
      completedTasks: 3
    },
    {
      id: 104,
      name: "User Profile Management",
      description: "Allow users to view and edit their profile information",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      epicId: 1,
      epicName: "User Authentication System",
      projectId: 1,
      projectName: "Website Redesign",
      storyPoints: "5",
      assignee: { id: 5, name: "Alice Chen", avatar: "AC" },
      reporter: { id: 8, name: "Bob Jackson", avatar: "BJ" },
      startDate: "2023-10-21",
      dueDate: "2023-10-30",
      createdAt: "2023-09-15",
      updatedAt: "2023-10-25",
      taskCount: 4,
      completedTasks: 2
    },
    {
      id: 105,
      name: "Role-Based Authorization",
      description: "Implement role-based access control for different user types",
      status: "IN_PROGRESS",
      priority: "HIGH",
      epicId: 1,
      epicName: "User Authentication System",
      projectId: 1,
      projectName: "Website Redesign",
      storyPoints: "13",
      assignee: { id: 8, name: "Bob Jackson", avatar: "BJ" },
      reporter: { id: 5, name: "Alice Chen", avatar: "AC" },
      startDate: "2023-10-21",
      dueDate: "2023-11-10",
      createdAt: "2023-09-15",
      updatedAt: "2023-10-25",
      taskCount: 7,
      completedTasks: 3
    },
    {
      id: 201,
      name: "Dashboard Layout Design",
      description: "Create responsive layout for analytics dashboard",
      status: "BACKLOG",
      priority: "MEDIUM",
      epicId: 2,
      epicName: "Dashboard Analytics",
      projectId: 1,
      projectName: "Website Redesign",
      storyPoints: "5",
      assignee: null,
      reporter: { id: 5, name: "Alice Chen", avatar: "AC" },
      startDate: "2023-12-05",
      dueDate: "2023-12-15",
      createdAt: "2023-10-15",
      updatedAt: "2023-10-15",
      taskCount: 4,
      completedTasks: 0
    },
    {
      id: 301,
      name: "Customer Record API",
      description: "Create RESTful API endpoints for customer record management",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      epicId: 4,
      epicName: "Customer Management Interface",
      projectId: 2,
      projectName: "CRM Integration",
      storyPoints: "8",
      assignee: { id: 8, name: "Bob Jackson", avatar: "BJ" },
      reporter: { id: 12, name: "Charlie Martinez", avatar: "CM" },
      startDate: "2023-10-20",
      dueDate: "2023-11-05",
      createdAt: "2023-10-15",
      updatedAt: "2023-10-25",
      taskCount: 6,
      completedTasks: 3
    },
    {
      id: 401,
      name: "Facebook Integration",
      description: "Add Facebook login and sharing capabilities",
      status: "COMPLETED",
      priority: "MEDIUM",
      epicId: 5,
      epicName: "Social Media Integration",
      projectId: 3,
      projectName: "Q4 Marketing Campaign",
      storyPoints: "5",
      assignee: { id: 21, name: "Eric Thompson", avatar: "ET" },
      reporter: { id: 24, name: "Fiona Rodriguez", avatar: "FR" },
      startDate: "2023-10-01",
      dueDate: "2023-10-15",
      createdAt: "2023-09-20",
      updatedAt: "2023-10-15",
      taskCount: 4,
      completedTasks: 4
    }
  ];

  // New story form state
  const [newStory, setNewStory] = useState({
    name: "",
    description: "",
    epicId: "",
    status: "BACKLOG",
    priority: "MEDIUM",
    storyPoints: "",
    assigneeId: "",
    reporterId: "",
    startDate: "",
    dueDate: ""
  });

  // Filter stories based on search query and status filter
  const filteredStories = stories.filter(story => 
    (searchQuery === "" || 
      story.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.epicName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (story.assignee && story.assignee.name.toLowerCase().includes(searchQuery.toLowerCase()))
    ) && 
    (statusFilter === "all" || story.status === statusFilter)
  );

  // Format date string to more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Helper to get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case "BACKLOG": return "bg-gray-100 text-gray-800";
      case "READY": return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "IN_REVIEW": return "bg-purple-100 text-purple-800";
      case "DONE": return "bg-green-100 text-green-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Helper to get priority badge color
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "LOW": return "bg-green-100 text-green-800";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "HIGH": return "bg-orange-100 text-orange-800";
      case "CRITICAL": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get random color for avatar background
  const getAvatarColor = (name: string) => {
    if (!name) return "bg-gray-400";
    
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-red-500", "bg-purple-500", "bg-pink-500", 
      "bg-indigo-500", "bg-teal-500"
    ];
    
    // Simple hash function to get consistent color for a name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Handle creating a new story
  const handleCreateStory = () => {
    // API call would go here
    console.log("Creating new story:", newStory);
    setIsCreateDialogOpen(false);
    // Reset form
    setNewStory({
      name: "",
      description: "",
      epicId: "",
      status: "BACKLOG",
      priority: "MEDIUM",
      storyPoints: "",
      assigneeId: "",
      reporterId: "",
      startDate: "",
      dueDate: ""
    });
  };

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Stories</h1>
            <p className="text-gray-600 mt-1">Manage and track user stories across all projects</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" /> Create Story
          </Button>
        </div>
      </header>
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm text-gray-500 whitespace-nowrap">Status:</span>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "all" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : ""}
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "BACKLOG" ? "bg-gray-100 text-gray-800 hover:bg-gray-200" : ""}
            onClick={() => setStatusFilter("BACKLOG")}
          >
            Backlog
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "IN_PROGRESS" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : ""}
            onClick={() => setStatusFilter("IN_PROGRESS")}
          >
            In Progress
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "IN_REVIEW" ? "bg-purple-100 text-purple-800 hover:bg-purple-200" : ""}
            onClick={() => setStatusFilter("IN_REVIEW")}
          >
            Review
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={statusFilter === "DONE" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
            onClick={() => setStatusFilter("DONE")}
          >
            Done
          </Button>
        </div>
      </div>
      
      {/* Stories List */}
      {filteredStories.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No stories found matching your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredStories.map((story) => (
            <Card 
              key={story.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setLocation(`/stories/${story.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={story.status === "DONE" || story.status === "COMPLETED"}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Logic to toggle story completion would go here
                        }}
                      />
                      <div>
                        <h3 className={`text-lg font-bold text-gray-900 ${(story.status === "DONE" || story.status === "COMPLETED") ? "line-through" : ""}`}>
                          {story.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{story.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-1 ${getStatusColor(story.status)}`}
                          >
                            {story.status}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-1 ${getPriorityColor(story.priority)}`}
                          >
                            {story.priority}
                          </Badge>
                          {story.storyPoints && (
                            <Badge variant="outline" className="text-xs">
                              {story.storyPoints} points
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <BriefcaseIcon className="h-4 w-4 text-gray-500" />
                        <span 
                          className="font-medium cursor-pointer hover:text-primary-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/projects/${story.projectId}`);
                          }}
                        >
                          {story.projectName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <BookOpenIcon className="h-4 w-4 text-gray-500" />
                        <span 
                          className="font-medium cursor-pointer hover:text-primary-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/epics/${story.epicId}`);
                          }}
                        >
                          {story.epicName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{formatDate(story.dueDate)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ClipboardListIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{story.completedTasks}/{story.taskCount} tasks</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    {story.assignee ? (
                      <div className="flex flex-col items-center" title={`Assigned to ${story.assignee.name}`}>
                        <div 
                          className={`flex-shrink-0 h-8 w-8 rounded-full ${getAvatarColor(story.assignee.name)} flex items-center justify-center text-white font-medium text-sm`}
                        >
                          {story.assignee.avatar}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Assignee</div>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Assign functionality would go here
                        }}
                      >
                        Assign
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create Story Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Create New Story</DialogTitle>
            <DialogDescription>
              Add a new user story to track work items.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Story Name</Label>
              <Input
                id="name"
                placeholder="Enter story name"
                value={newStory.name}
                onChange={(e) => setNewStory({...newStory, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter story description"
                rows={4}
                value={newStory.description}
                onChange={(e) => setNewStory({...newStory, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="epic">Epic</Label>
                <Select 
                  value={newStory.epicId}
                  onValueChange={(value) => setNewStory({...newStory, epicId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select epic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">User Authentication System</SelectItem>
                    <SelectItem value="2">Dashboard Analytics</SelectItem>
                    <SelectItem value="3">Mobile Responsiveness</SelectItem>
                    <SelectItem value="4">Customer Management Interface</SelectItem>
                    <SelectItem value="5">Social Media Integration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newStory.status}
                  onValueChange={(value) => setNewStory({...newStory, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKLOG">Backlog</SelectItem>
                    <SelectItem value="READY">Ready</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newStory.priority}
                  onValueChange={(value) => setNewStory({...newStory, priority: value})}
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
              <div className="grid gap-2">
                <Label htmlFor="storyPoints">Story Points</Label>
                <Select 
                  value={newStory.storyPoints}
                  onValueChange={(value) => setNewStory({...newStory, storyPoints: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estimate effort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Small</SelectItem>
                    <SelectItem value="2">2 - Small</SelectItem>
                    <SelectItem value="3">3 - Small+</SelectItem>
                    <SelectItem value="5">5 - Medium</SelectItem>
                    <SelectItem value="8">8 - Large</SelectItem>
                    <SelectItem value="13">13 - Very Large</SelectItem>
                    <SelectItem value="21">21 - Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Select 
                  value={newStory.assigneeId}
                  onValueChange={(value) => setNewStory({...newStory, assigneeId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    <SelectItem value="5">Alice Chen</SelectItem>
                    <SelectItem value="8">Bob Jackson</SelectItem>
                    <SelectItem value="12">Charlie Martinez</SelectItem>
                    <SelectItem value="21">Eric Thompson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reporter">Reporter</Label>
                <Select 
                  value={newStory.reporterId}
                  onValueChange={(value) => setNewStory({...newStory, reporterId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reporter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Alice Chen</SelectItem>
                    <SelectItem value="8">Bob Jackson</SelectItem>
                    <SelectItem value="12">Charlie Martinez</SelectItem>
                    <SelectItem value="21">Eric Thompson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newStory.startDate}
                  onChange={(e) => setNewStory({...newStory, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newStory.dueDate}
                  onChange={(e) => setNewStory({...newStory, dueDate: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateStory}>Create Story</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}