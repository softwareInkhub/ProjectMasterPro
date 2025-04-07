import { useQuery } from "@tanstack/react-query";
import { projectApi, userApi, departmentApi, teamApi, epicApi, taskApi } from "@/lib/api";
import { Project, User, Department, Team, Epic, Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeline, TimelineEvent } from "@/components/dashboard/Timeline";
import { ActivityFeed, Activity } from "@/components/dashboard/ActivityFeed";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { format } from "date-fns";

interface ProjectDetailsProps {
  id: string;
}

export default function ProjectDetails({ id }: ProjectDetailsProps) {
  const { toast } = useToast();

  // Fetch project details
  const { 
    data: project, 
    isLoading: projectLoading,
    error: projectError,
    refetch: refetchProject
  } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
  });

  // Fetch project manager
  const { data: projectManager } = useQuery<User>({
    queryKey: [`/api/users/${project?.projectManagerId}`],
    enabled: !!project?.projectManagerId,
  });

  // Fetch department
  const { data: department } = useQuery<Department>({
    queryKey: [`/api/departments/${project?.departmentId}`],
    enabled: !!project?.departmentId,
  });

  // Fetch team
  const { data: team } = useQuery<Team>({
    queryKey: [`/api/teams/${project?.teamId}`],
    enabled: !!project?.teamId,
  });

  // Fetch team members
  const { data: teamMembers = [] } = useQuery<User[]>({
    queryKey: [`/api/teams/${project?.teamId}/members`],
    enabled: !!project?.teamId,
  });

  // Fetch epics for this project
  const { 
    data: epics = [],
    isLoading: epicsLoading,
    refetch: refetchEpics
  } = useQuery<Epic[]>({
    queryKey: [`/api/epics?projectId=${id}`],
    enabled: !!id,
  });

  // Fetch all tasks for this project's epics
  const { 
    data: tasks = [],
    isLoading: tasksLoading,
    refetch: refetchTasks
  } = useQuery<Task[]>({
    queryKey: [`/api/tasks`],
    enabled: !!id,
  });

  // Filter tasks related to this project's epics
  const projectTasks = tasks.filter(task => {
    const epicIds = epics.map(epic => epic.id);
    // In a real app, this would be more efficient with proper API filtering
    return epicIds.some(epicId => task.storyId.includes(epicId));
  });

  // Handle project update
  const handleProjectUpdate = (updatedProject: Project) => {
    refetchProject();
    toast({
      title: "Project updated",
      description: "Project details have been updated successfully",
    });
  };

  // Create timeline events from project and epics
  const getTimelineEvents = (): TimelineEvent[] => {
    if (!project) return [];

    const events: TimelineEvent[] = [];
    
    // Project start
    if (project.startDate) {
      events.push({
        id: `project-start-${project.id}`,
        title: 'Project Start',
        description: 'Project kickoff and planning',
        date: project.startDate,
        type: 'start',
        completed: true,
      });
    }
    
    // Add epics as milestones
    epics.forEach(epic => {
      events.push({
        id: `epic-${epic.id}`,
        title: epic.name,
        description: epic.description || 'Epic milestone',
        date: epic.startDate || new Date().toISOString(), // Fallback to current date if not set
        type: 'epic',
        completed: epic.status === 'COMPLETED',
      });
    });
    
    // Project completion
    if (project.endDate) {
      events.push({
        id: `project-end-${project.id}`,
        title: 'Project Completion',
        description: 'Final delivery and handover',
        date: project.endDate,
        type: 'completion',
        completed: project.status === 'COMPLETED',
      });
    }
    
    // Sort by date
    return events.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  // Generate sample activities
  const getActivities = (): Activity[] => {
    if (!project || teamMembers.length === 0) return [];
    
    const activities: Activity[] = [];
    
    // Use team members to simulate activities
    const randomIndex = Math.floor(Math.random() * teamMembers.length);
    const user = teamMembers[randomIndex];
    
    if (user) {
      activities.push({
        id: 'activity-1',
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          initials: `${user.firstName[0]}${user.lastName[0]}`,
          avatarColor: 'bg-blue-500',
        },
        action: 'updated',
        target: {
          id: project.id,
          name: project.name,
          type: 'project',
        },
        timestamp: new Date().toISOString(),
      });
    }
    
    return activities;
  };

  // Epic table columns
  const epicColumns = [
    {
      header: "Name",
      accessorKey: "name" as keyof Epic,
    },
    {
      header: "Status",
      accessorKey: "status" as keyof Epic,
      cell: (epic: Epic) => <StatusBadge status={epic.status} />,
    },
    {
      header: "Priority",
      accessorKey: "priority" as keyof Epic,
      cell: (epic: Epic) => <PriorityBadge priority={epic.priority} />,
    },
    {
      header: "Start Date",
      accessorKey: "startDate" as keyof Epic,
      cell: (epic: Epic) => 
        epic.startDate ? format(new Date(epic.startDate), "MMM d, yyyy") : "Not set",
    },
    {
      header: "Progress",
      accessorKey: "progress" as keyof Epic,
      cell: (epic: Epic) => `${epic.progress.percentage || 0}%`,
    },
  ];

  // Team members table columns
  const teamMemberColumns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (user: User) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user.firstName[0]}{user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <span>{user.firstName} {user.lastName}</span>
        </div>
      ),
    },
    {
      header: "Role",
      accessorKey: "role" as keyof User,
      cell: (user: User) => user.role,
    },
    {
      header: "Email",
      accessorKey: "email" as keyof User,
    },
  ];

  // Handle errors
  if (projectError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">Failed to load project details</p>
        <Button onClick={() => refetchProject()}>Retry</Button>
      </div>
    );
  }

  // Loading state
  if (projectLoading) {
    return <div className="flex items-center justify-center h-64">Loading project details...</div>;
  }

  // If project not found
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg font-medium mb-4">Project not found</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectHeader 
        project={project} 
        projectManager={projectManager} 
        department={department}
        team={team}
        users={teamMembers}
        onUpdate={handleProjectUpdate}
      />
      
      {/* Project Tabs */}
      <Tabs defaultValue="overview" className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <TabsList className="h-auto p-0">
            <TabsTrigger 
              value="overview" 
              className="border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 font-medium text-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 font-medium text-sm"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger 
              value="epics" 
              className="border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 font-medium text-sm"
            >
              Epics
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 font-medium text-sm"
            >
              Team
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="p-6">
          <TabsContent value="overview" className="space-y-6">
            {/* Timeline and Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Timeline 
                events={getTimelineEvents()} 
                className="lg:col-span-2" 
              />
              
              <ActivityFeed 
                activities={getActivities()} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="tasks">
            <KanbanBoard 
              tasks={projectTasks} 
              users={teamMembers}
              refetchTasks={refetchTasks}
            />
          </TabsContent>
          
          <TabsContent value="epics">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Project Epics</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Epic
              </Button>
            </div>
            
            {epicsLoading ? (
              <div className="flex items-center justify-center h-32">Loading epics...</div>
            ) : (
              <DataTable
                data={epics}
                columns={epicColumns}
                searchKey="name"
                searchPlaceholder="Search epics..."
              />
            )}
          </TabsContent>
          
          <TabsContent value="team">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Project Team</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>
            
            <DataTable
              data={teamMembers}
              columns={teamMemberColumns}
              searchKey="firstName"
              searchPlaceholder="Search team members..."
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
