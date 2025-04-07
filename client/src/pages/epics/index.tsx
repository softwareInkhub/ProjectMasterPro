import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  BookOpenIcon,
  ClockIcon,
  CalendarIcon,
  CheckSquareIcon,
  BriefcaseIcon,
  Tag,
  MoreHorizontalIcon
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export default function EpicsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEpic, setSelectedEpic] = useState<any>(null);
  
  // Sample epic data - this would come from an API in the real application
  const epics = [
    {
      id: 1,
      name: "User Authentication System",
      description: "Implement secure user authentication and authorization functionality",
      status: "IN_PROGRESS",
      priority: "HIGH",
      projectId: 1,
      projectName: "Website Redesign",
      startDate: "2023-09-15",
      endDate: "2023-12-01",
      progress: 40,
      storyCount: 12,
      completedStories: 5,
      assignees: [
        { id: 5, name: "Alice Chen", avatar: "AC" },
        { id: 8, name: "Bob Jackson", avatar: "BJ" }
      ]
    },
    {
      id: 2,
      name: "Dashboard Analytics",
      description: "Create a comprehensive analytics dashboard with visualizations",
      status: "BACKLOG",
      priority: "MEDIUM",
      projectId: 1,
      projectName: "Website Redesign",
      startDate: "2023-12-05",
      endDate: "2024-01-20",
      progress: 0,
      storyCount: 8,
      completedStories: 0,
      assignees: [
        { id: 5, name: "Alice Chen", avatar: "AC" }
      ]
    },
    {
      id: 3,
      name: "Mobile Responsiveness",
      description: "Ensure all website components are fully responsive on mobile devices",
      status: "IN_PROGRESS",
      priority: "HIGH",
      projectId: 1,
      projectName: "Website Redesign",
      startDate: "2023-10-01",
      endDate: "2023-11-30",
      progress: 75,
      storyCount: 10,
      completedStories: 7,
      assignees: [
        { id: 5, name: "Alice Chen", avatar: "AC" },
        { id: 12, name: "Charlie Martinez", avatar: "CM" }
      ]
    },
    {
      id: 4,
      name: "Customer Management Interface",
      description: "Build customer data management screens for CRM system",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      projectId: 2,
      projectName: "CRM Integration",
      startDate: "2023-10-15",
      endDate: "2023-12-15",
      progress: 30,
      storyCount: 15,
      completedStories: 4,
      assignees: [
        { id: 8, name: "Bob Jackson", avatar: "BJ" }
      ]
    },
    {
      id: 5,
      name: "Social Media Integration",
      description: "Integrate social media sharing and authentication",
      status: "COMPLETED",
      priority: "MEDIUM",
      projectId: 3,
      projectName: "Q4 Marketing Campaign",
      startDate: "2023-10-01",
      endDate: "2023-11-15",
      progress: 100,
      storyCount: 6,
      completedStories: 6,
      assignees: [
        { id: 21, name: "Eric Thompson", avatar: "ET" }
      ]
    },
    {
      id: 6,
      name: "Continuous Integration Pipeline",
      description: "Set up automated testing and deployment workflows",
      status: "BACKLOG",
      priority: "HIGH",
      projectId: 4,
      projectName: "Infrastructure Migration",
      startDate: "2023-11-01",
      endDate: "2024-01-15",
      progress: 0,
      storyCount: 9,
      completedStories: 0,
      assignees: [
        { id: 12, name: "Charlie Martinez", avatar: "CM" }
      ]
    }
  ];

  // New epic form state
  const [newEpic, setNewEpic] = useState({
    name: "",
    description: "",
    status: "BACKLOG",
    priority: "MEDIUM",
    projectId: "1",
    startDate: "",
    endDate: ""
  });

  // Edit epic form state
  const [editEpic, setEditEpic] = useState({
    id: 0,
    name: "",
    description: "",
    status: "",
    priority: "",
    projectId: "",
    startDate: "",
    endDate: ""
  });

  // Filter epics based on search query and status filter
  const filteredEpics = epics.filter(epic => 
    (searchQuery === "" || 
      epic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      epic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      epic.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    ) && 
    (statusFilter === "all" || epic.status === statusFilter)
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
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
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
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-red-500", "bg-purple-500", "bg-pink-500", 
      "bg-indigo-500", "bg-teal-500"
    ];
    
    // Simple hash function to get consistent color for a name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Handle creating a new epic
  const handleCreateEpic = () => {
    // API call would go here
    console.log("Creating new epic:", newEpic);
    setIsCreateDialogOpen(false);
    // Reset form
    setNewEpic({
      name: "",
      description: "",
      status: "BACKLOG",
      priority: "MEDIUM",
      projectId: "1",
      startDate: "",
      endDate: ""
    });
  };

  // Handle editing an epic
  const handleEditEpic = () => {
    // API call would go here
    console.log("Updating epic:", editEpic);
    setIsEditDialogOpen(false);
  };

  // Initialize edit form when an epic is selected for editing
  const openEditDialog = (epic: any) => {
    setSelectedEpic(epic);
    setEditEpic({
      id: epic.id,
      name: epic.name,
      description: epic.description,
      status: epic.status,
      priority: epic.priority,
      projectId: epic.projectId.toString(),
      startDate: epic.startDate,
      endDate: epic.endDate
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Epics</h1>
            <p className="text-gray-600 mt-1">Manage large bodies of work across your projects</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" /> Create Epic
          </Button>
        </div>
      </header>
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search epics..."
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
            className={statusFilter === "COMPLETED" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
            onClick={() => setStatusFilter("COMPLETED")}
          >
            Completed
          </Button>
        </div>
      </div>
      
      {/* Epics List */}
      {filteredEpics.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No epics found matching your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEpics.map((epic) => (
            <Card 
              key={epic.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setLocation(`/epics/${epic.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{epic.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{epic.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-1 ${getStatusColor(epic.status)}`}
                        >
                          {epic.status === "IN_PROGRESS" ? "In Progress" : epic.status === "BACKLOG" ? "Backlog" : "Completed"}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-1 ${getPriorityColor(epic.priority)}`}
                        >
                          {epic.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{epic.progress}% ({epic.completedStories}/{epic.storyCount} stories)</span>
                      </div>
                      <Progress value={epic.progress} className="h-2" />
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <BriefcaseIcon className="h-4 w-4 text-gray-500" />
                        <span 
                          className="font-medium cursor-pointer hover:text-primary-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/projects/${epic.projectId}`);
                          }}
                        >
                          {epic.projectName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{formatDate(epic.startDate)} - {formatDate(epic.endDate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-between">
                    <div className="flex flex-wrap justify-end gap-1">
                      {epic.assignees.map((assignee) => (
                        <div 
                          key={assignee.id}
                          title={assignee.name}
                          className={`flex-shrink-0 h-8 w-8 rounded-full ${getAvatarColor(assignee.name)} flex items-center justify-center text-white font-medium text-sm`}
                        >
                          {assignee.avatar}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/epics/${epic.id}/stories`);
                        }}
                      >
                        <BookOpenIcon className="h-4 w-4 mr-1" />
                        Stories
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(epic);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create Epic Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Create New Epic</DialogTitle>
            <DialogDescription>
              Add a new epic to organize and track related user stories.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Epic Name</Label>
              <Input
                id="name"
                placeholder="Enter epic name"
                value={newEpic.name}
                onChange={(e) => setNewEpic({...newEpic, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter epic description"
                rows={4}
                value={newEpic.description}
                onChange={(e) => setNewEpic({...newEpic, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="project">Project</Label>
                <Select 
                  value={newEpic.projectId}
                  onValueChange={(value) => setNewEpic({...newEpic, projectId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Website Redesign</SelectItem>
                    <SelectItem value="2">CRM Integration</SelectItem>
                    <SelectItem value="3">Q4 Marketing Campaign</SelectItem>
                    <SelectItem value="4">Infrastructure Migration</SelectItem>
                    <SelectItem value="5">Mobile App Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newEpic.status}
                  onValueChange={(value) => setNewEpic({...newEpic, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKLOG">Backlog</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newEpic.priority}
                  onValueChange={(value) => setNewEpic({...newEpic, priority: value})}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newEpic.startDate}
                  onChange={(e) => setNewEpic({...newEpic, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newEpic.endDate}
                  onChange={(e) => setNewEpic({...newEpic, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEpic}>Create Epic</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Epic Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Epic</DialogTitle>
            <DialogDescription>
              Update epic details and track progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Epic Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter epic name"
                value={editEpic.name}
                onChange={(e) => setEditEpic({...editEpic, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter epic description"
                rows={4}
                value={editEpic.description}
                onChange={(e) => setEditEpic({...editEpic, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-project">Project</Label>
                <Select 
                  value={editEpic.projectId}
                  onValueChange={(value) => setEditEpic({...editEpic, projectId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Website Redesign</SelectItem>
                    <SelectItem value="2">CRM Integration</SelectItem>
                    <SelectItem value="3">Q4 Marketing Campaign</SelectItem>
                    <SelectItem value="4">Infrastructure Migration</SelectItem>
                    <SelectItem value="5">Mobile App Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editEpic.status}
                  onValueChange={(value) => setEditEpic({...editEpic, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKLOG">Backlog</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select 
                  value={editEpic.priority}
                  onValueChange={(value) => setEditEpic({...editEpic, priority: value})}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={editEpic.startDate}
                  onChange={(e) => setEditEpic({...editEpic, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={editEpic.endDate}
                  onChange={(e) => setEditEpic({...editEpic, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEpic}>Update Epic</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}