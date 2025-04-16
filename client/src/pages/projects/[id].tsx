import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeftIcon,
  CalendarIcon,
  UsersIcon,
  FolderIcon,
  BriefcaseIcon,
  ClockIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckSquareIcon,
  BookOpenIcon,
  BookIcon,
  Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProjectDetailPage() {
  const [, params] = useRoute("/projects/:id");
  const [, setLocation] = useLocation();
  const projectId = params?.id;
  
  // State for dialog modals
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isAddTeamMemberDialogOpen, setIsAddTeamMemberDialogOpen] = useState(false);
  
  // Fetch project data from API
  const { data: projectData, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });
  
  // Fetch project team members 
  const { data: teamMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: [`/api/teams/${projectData?.teamId}/members`],
    enabled: !!projectData?.teamId,
  });

  // Fetch tasks for this project 
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
    enabled: !!projectId,
  });

  // Fetch epics for this project
  const { data: epics = [], isLoading: epicsLoading } = useQuery({
    queryKey: ['/api/epics'],
    queryFn: getQueryFn(),
    enabled: !!projectId,
  });
  
  // Get related data
  const { data: departments = [] } = useQuery({
    queryKey: ['/api/departments']
  });
  
  const { data: teams = [] } = useQuery({
    queryKey: ['/api/teams']
  });
  
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users']
  });
  
  // Create derived state from API data
  const [project, setProject] = useState<any>(null);
  
  // Update local state when API data changes
  useEffect(() => {
    if (projectData) {
      // Process related data
      const team = teams?.find(t => t.id === projectData.teamId);
      const department = departments?.find(d => d.id === projectData.departmentId);
      const projectManager = users?.find(u => u.id === projectData.projectManagerId);
      
      // Calculate task statistics
      const taskStats = {
        total: tasks.length,
        completed: tasks.filter((t: any) => t.status === "DONE").length,
        inProgress: tasks.filter((t: any) => t.status === "IN_PROGRESS").length,
        backlog: tasks.filter((t: any) => t.status === "TODO").length
      };
      
      // Set project with enhanced data
      setProject({
        ...projectData,
        members: teamMembers || [],
        tasks: taskStats,
        department: department?.name || "Unknown Department",
        team: team?.name || "Unknown Team",
        teamLead: projectManager?.firstName + " " + projectManager?.lastName || "Unknown",
        tags: ["project"], // Default tags since we don't have this in the schema
        client: "Internal", // Default client since we don't have this in the schema
        budget: 0 // Default budget since we don't have this in the schema
      });
    }
  }, [projectData, departments, teams, users, teamMembers, tasks]);
  
  // Edit form state
  const [editProject, setEditProject] = useState({
    name: "",
    description: "",
    status: "",
    priority: "",
    departmentId: "",
    teamId: "",
    teamLeadId: "",
    startDate: "",
    endDate: "",
    client: "",
    budget: ""
  });
  
  // Add team member form state
  const [newTeamMember, setNewTeamMember] = useState({
    userId: "",
    role: ""
  });
  
  // Load project data when component mounts or projectId changes
  useEffect(() => {
    // Only set up the edit form when project data is available
    if (projectId && project) {
      // Setup edit form with current project data
      setEditProject({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "",
        priority: project.priority || "",
        departmentId: project.departmentId ? project.departmentId.toString() : "",
        teamId: project.teamId ? project.teamId.toString() : "",
        teamLeadId: project.projectManagerId ? project.projectManagerId.toString() : "",
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        client: project.client || "Internal", // Default value
        budget: project.budget ? project.budget.toString() : "0" // Default value
      });
    }
  }, [projectId, project]);
  
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
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "On Hold": return "bg-yellow-100 text-yellow-800";
      case "Planning": return "bg-purple-100 text-purple-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Helper to get priority badge color
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
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
  
  // Handle editing the project
  const handleEditProject = () => {
    // API call would go here
    console.log("Updating project:", editProject);
    
    // Update local state for demo purposes
    setProject({
      ...project,
      name: editProject.name,
      description: editProject.description,
      status: editProject.status,
      priority: editProject.priority,
      departmentId: parseInt(editProject.departmentId),
      teamId: parseInt(editProject.teamId),
      teamLeadId: parseInt(editProject.teamLeadId),
      startDate: editProject.startDate,
      endDate: editProject.endDate,
      client: editProject.client,
      budget: parseInt(editProject.budget),
      updatedAt: new Date().toISOString().substring(0, 10)
    });
    
    setIsEditDialogOpen(false);
  };
  
  // Handle deleting the project
  const handleDeleteProject = () => {
    // API call would go here
    console.log("Deleting project:", projectId);
    setIsConfirmDeleteOpen(false);
    // Navigate back to projects list
    setLocation("/projects");
  };
  
  // Handle adding a team member
  const handleAddTeamMember = () => {
    // API call would go here
    console.log("Adding team member:", newTeamMember);
    
    // Sample new team member data
    const newMember = {
      id: parseInt(newTeamMember.userId),
      name: "New Team Member",
      role: newTeamMember.role,
      avatar: "NM"
    };
    
    // Update local state for demo purposes
    setProject({
      ...project,
      members: [...project.members, newMember],
      updatedAt: new Date().toISOString().substring(0, 10)
    });
    
    setIsAddTeamMemberDialogOpen(false);
    
    // Reset form
    setNewTeamMember({
      userId: "",
      role: ""
    });
  };
  
  // Handle removing a team member
  const handleRemoveTeamMember = (memberId: number) => {
    // API call would go here
    console.log("Removing team member:", memberId);
    
    // Update local state for demo purposes
    setProject({
      ...project,
      members: project.members.filter(member => member.id !== memberId),
      updatedAt: new Date().toISOString().substring(0, 10)
    });
  };

  // Loading state
  if (projectLoading || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading project details...</p>
      </div>
    );
  }

  // Error state
  if (projectError) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Project</h2>
        <p className="text-gray-600 mb-6">
          {projectError instanceof Error ? projectError.message : "An unknown error occurred."}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/projects")}
            className="mr-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Projects
          </Button>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-1 ${getStatusColor(project.status)}`}
              >
                {project.status}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-1 ${getPriorityColor(project.priority)}`}
              >
                {project.priority}
              </Badge>
            </div>
            <p className="text-gray-600 mt-3">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {project.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
              <EditIcon className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:bg-red-50 hover:text-red-600"
              onClick={() => setIsConfirmDeleteOpen(true)}
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </header>
      
      {/* Project details */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Progress card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Project completion</span>
                <span>{project.progress && project.progress.percentage ? project.progress.percentage : 0}%</span>
              </div>
              <Progress value={project.progress && project.progress.percentage ? project.progress.percentage : 0} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-3xl font-bold">{project.tasks.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-3xl font-bold">{project.tasks.inProgress}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-3xl font-bold">{project.tasks.backlog}</div>
                <div className="text-sm text-gray-600">Backlog</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Details card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Start Date</div>
                  <div className="font-medium">{formatDate(project.startDate)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">End Date</div>
                  <div className="font-medium">{formatDate(project.endDate)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Department</div>
                  <div 
                    className="font-medium cursor-pointer text-primary-600 hover:underline"
                    onClick={() => setLocation(`/departments/${project.departmentId}`)}
                  >
                    {project.department}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Team</div>
                  <div 
                    className="font-medium cursor-pointer text-primary-600 hover:underline"
                    onClick={() => setLocation(`/teams/${project.teamId}`)}
                  >
                    {project.team}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Project Manager</div>
                  <div className="font-medium">{project.teamLead}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Client</div>
                  <div className="font-medium">{project.client}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Budget</div>
                  <div className="font-medium">${typeof project.budget === 'number' ? project.budget.toLocaleString() : '0'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Created</div>
                  <div className="font-medium">{formatDate(project.createdAt)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for Team, Epics, Stories */}
      <Tabs defaultValue="team" className="mt-6">
        <TabsList>
          <TabsTrigger value="team" className="flex items-center">
            <UsersIcon className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="epics" className="flex items-center">
            <BookOpenIcon className="h-4 w-4 mr-2" />
            Epics
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center">
            <BookIcon className="h-4 w-4 mr-2" />
            Stories
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="team" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Team Members</h2>
            <Button onClick={() => setIsAddTeamMemberDialogOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Member
            </Button>
          </div>
          
          {project.members.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No team members assigned to this project.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.members.map((member) => (
                <Card key={member.id} className="flex items-center p-4">
                  <div
                    className={`flex-shrink-0 h-10 w-10 rounded-full ${getAvatarColor(member.name)} flex items-center justify-center text-white font-medium text-sm`}
                  >
                    {member.avatar}
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleRemoveTeamMember(member.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="epics" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Epics</h2>
            <Button onClick={() => setLocation('/epics/new')}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Create Epic
            </Button>
          </div>
          
          {epics.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No epics found for this project.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {epics.map((epic) => (
                <Card 
                  key={epic.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setLocation(`/epics/${epic.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-lg font-bold text-gray-900">{epic.name}</h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-1 ${getStatusColor(epic.status === "IN_PROGRESS" ? "In Progress" : epic.status)}`}
                          >
                            {epic.status === "IN_PROGRESS" ? "In Progress" : epic.status}
                          </Badge>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{epic.progress}% ({epic.completedStories}/{epic.storyCount} stories)</span>
                          </div>
                          <Progress value={epic.progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="stories" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Stories</h2>
            <Button onClick={() => setLocation('/stories/new')}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Create Story
            </Button>
          </div>
          
          <Button 
            variant="secondary" 
            className="w-full mb-4"
            onClick={() => setLocation('/stories')}
          >
            View All Project Stories
          </Button>
        </TabsContent>
      </Tabs>
      
      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project details and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Project Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter project name"
                value={editProject.name}
                onChange={(e) => setEditProject({...editProject, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter project description"
                rows={4}
                value={editProject.description}
                onChange={(e) => setEditProject({...editProject, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editProject.status}
                  onValueChange={(value) => setEditProject({...editProject, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select 
                  value={editProject.priority}
                  onValueChange={(value) => setEditProject({...editProject, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-department">Department</Label>
                <Select 
                  value={editProject.departmentId}
                  onValueChange={(value) => setEditProject({...editProject, departmentId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Engineering</SelectItem>
                    <SelectItem value="2">Marketing</SelectItem>
                    <SelectItem value="3">Finance</SelectItem>
                    <SelectItem value="4">Human Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-team">Team</Label>
                <Select 
                  value={editProject.teamId}
                  onValueChange={(value) => setEditProject({...editProject, teamId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Frontend Development</SelectItem>
                    <SelectItem value="2">Backend Development</SelectItem>
                    <SelectItem value="3">DevOps</SelectItem>
                    <SelectItem value="4">QA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-teamLead">Project Manager</Label>
                <Select 
                  value={editProject.teamLeadId}
                  onValueChange={(value) => setEditProject({...editProject, teamLeadId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Alice Chen</SelectItem>
                    <SelectItem value="8">Bob Jackson</SelectItem>
                    <SelectItem value="12">Charlie Martinez</SelectItem>
                    <SelectItem value="15">Diana Kim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-client">Client</Label>
                <Input
                  id="edit-client"
                  placeholder="Enter client name"
                  value={editProject.client}
                  onChange={(e) => setEditProject({...editProject, client: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={editProject.startDate}
                  onChange={(e) => setEditProject({...editProject, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={editProject.endDate}
                  onChange={(e) => setEditProject({...editProject, endDate: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-budget">Budget ($)</Label>
              <Input
                id="edit-budget"
                type="number"
                placeholder="Enter budget amount"
                value={editProject.budget}
                onChange={(e) => setEditProject({...editProject, budget: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProject}>Update Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-red-600">
              Warning: Deleting this project will also delete all associated epics, stories, and tasks.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProject}
            >
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Team Member Dialog */}
      <Dialog open={isAddTeamMemberDialogOpen} onOpenChange={setIsAddTeamMemberDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to this project team.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="member-select">Team Member</Label>
              <Select 
                value={newTeamMember.userId}
                onValueChange={(value) => setNewTeamMember({...newTeamMember, userId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">Fiona Wilson</SelectItem>
                  <SelectItem value="21">George Brown</SelectItem>
                  <SelectItem value="22">Hannah Lee</SelectItem>
                  <SelectItem value="23">Ian Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role-input">Role</Label>
              <Input
                id="role-input"
                placeholder="Enter role (e.g. Developer, Designer)"
                value={newTeamMember.role}
                onChange={(e) => setNewTeamMember({...newTeamMember, role: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTeamMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTeamMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}