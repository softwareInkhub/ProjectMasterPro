import { useQuery } from "@tanstack/react-query";
import { projectApi, userApi, taskApi } from "@/lib/api";
import { Project, User, Task } from "@/types";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed, Activity } from "@/components/dashboard/ActivityFeed";
import { Timeline, TimelineEvent } from "@/components/dashboard/Timeline";
import { BookmarkIcon, FlagIcon, CalendarIcon, CheckCircleIcon, BriefcaseIcon, BookOpenIcon, ClipboardListIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { format, subDays } from "date-fns";

export default function Dashboard() {
  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  // Format data for charts
  const projectStatusData = [
    { name: 'Planning', value: projects.filter(p => p.status === 'PLANNING').length },
    { name: 'In Progress', value: projects.filter(p => p.status === 'IN_PROGRESS').length },
    { name: 'On Hold', value: projects.filter(p => p.status === 'ON_HOLD').length },
    { name: 'Completed', value: projects.filter(p => p.status === 'COMPLETED').length },
    { name: 'Cancelled', value: projects.filter(p => p.status === 'CANCELLED').length },
  ].filter(item => item.value > 0);

  const taskStatusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'TODO').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length },
    { name: 'In Review', value: tasks.filter(t => t.status === 'IN_REVIEW').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'DONE').length },
    { name: 'Blocked', value: tasks.filter(t => t.status === 'BLOCKED').length },
  ];

  const priorityData = [
    { name: 'Low', value: tasks.filter(t => t.priority === 'LOW').length },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'MEDIUM').length },
    { name: 'High', value: tasks.filter(t => t.priority === 'HIGH').length },
    { name: 'Critical', value: tasks.filter(t => t.priority === 'CRITICAL').length },
  ];

  const COLORS = ['#3b82f6', '#f59e0b', '#6366f1', '#10b981', '#ef4444'];

  // Generate sample activities
  const getActivities = (): Activity[] => {
    if (users.length === 0 || projects.length === 0 || tasks.length === 0) return [];

    const activities: Activity[] = [];
    
    if (tasks.length > 0 && users.length > 0) {
      // Add latest task activities
      const latestTasks = tasks.slice(0, Math.min(3, tasks.length));
      
      latestTasks.forEach((task, index) => {
        const user = users.find(u => u.id === task.assigneeId) || users[index % users.length];
        
        activities.push({
          id: `activity-${task.id}`,
          user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            initials: `${user.firstName[0]}${user.lastName[0]}`,
            avatarColor: index % 2 === 0 ? 'bg-blue-500' : 'bg-green-500',
          },
          action: index % 3 === 0 ? 'created' : (index % 3 === 1 ? 'updated' : 'completed'),
          target: {
            id: task.id,
            name: task.name,
            type: 'task',
          },
          timestamp: new Date(task.updatedAt).toISOString(),
        });
      });
    }

    if (projects.length > 0 && users.length > 0) {
      // Add latest project activities
      const latestProject = projects[0];
      const user = users[0];
      
      activities.push({
        id: `activity-project-${latestProject.id}`,
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          initials: `${user.firstName[0]}${user.lastName[0]}`,
          avatarColor: 'bg-purple-500',
        },
        action: 'updated',
        target: {
          id: latestProject.id,
          name: latestProject.name,
          type: 'project',
        },
        comment: 'Updated project timeline and added new milestones.',
        timestamp: subDays(new Date(), 1).toISOString(),
      });
    }

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  // Generate timeline events
  const getTimelineEvents = (): TimelineEvent[] => {
    if (projects.length === 0) return [];

    const timelineEvents: TimelineEvent[] = [];
    const currentDate = new Date();
    
    // Project start
    if (projects[0]?.startDate) {
      timelineEvents.push({
        id: 'timeline-start',
        title: 'Project Start',
        description: 'Initial project setup and team onboarding',
        date: projects[0].startDate,
        type: 'start',
        completed: true,
      });
    }

    // Add past milestone
    timelineEvents.push({
      id: 'timeline-milestone-1',
      title: 'Core Architecture Completed',
      description: 'Finished setting up the base architecture and infrastructure',
      date: subDays(currentDate, 45).toISOString(),
      type: 'milestone',
      completed: true,
    });

    // Add recent milestone
    timelineEvents.push({
      id: 'timeline-milestone-2',
      title: 'First Milestone Reached',
      description: 'Backend API development completed',
      date: subDays(currentDate, 15).toISOString(),
      type: 'epic',
      completed: true,
    });

    // Add upcoming milestone
    if (projects[0]?.endDate) {
      timelineEvents.push({
        id: 'timeline-completion',
        title: 'Project Completion',
        description: 'Final delivery and client handover',
        date: projects[0].endDate,
        type: 'completion',
        completed: false,
      });
    } else {
      timelineEvents.push({
        id: 'timeline-upcoming',
        title: 'Frontend Development',
        description: 'UI implementation and integration with backend',
        date: subDays(currentDate, -30).toISOString(),
        type: 'upcoming',
        completed: false,
      });
    }

    return timelineEvents;
  };

  const isLoading = projectsLoading || usersLoading || tasksLoading;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Projects"
          value={projects.length}
          icon={<BriefcaseIcon className="text-2xl" />}
          trend={{ value: 2, isPositive: true, label: "new since last month" }}
          iconBgColor="bg-blue-50"
          iconColor="text-primary-500"
        />
        
        <StatsCard
          title="User Stories"
          value={24}  // This would be dynamic in a real app
          icon={<BookOpenIcon className="text-2xl" />}
          trend={{ value: 8, isPositive: true, label: "new since last month" }}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-500"
        />
        
        <StatsCard
          title="Total Tasks"
          value={tasks.length}
          icon={<ClipboardListIcon className="text-2xl" />}
          trend={{ value: 12, isPositive: true, label: "new since last month" }}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-500"
        />
        
        <StatsCard
          title="Completed Tasks"
          value={tasks.filter(t => t.status === 'DONE').length}
          icon={<CheckCircleIcon className="text-2xl" />}
          progress={{ 
            value: Math.round((tasks.filter(t => t.status === 'DONE').length / Math.max(tasks.length, 1)) * 100), 
            label: "completion rate" 
          }}
          iconBgColor="bg-green-50"
          iconColor="text-green-500"
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Projects`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={taskStatusData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} Tasks`, 'Count']} />
                <Legend />
                <Bar dataKey="value" name="Tasks" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
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
    </div>
  );
}
