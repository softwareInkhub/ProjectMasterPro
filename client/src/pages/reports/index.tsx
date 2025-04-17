import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  FilterIcon, 
  DownloadIcon, 
  BarChart3Icon, 
  PieChartIcon, 
  TrendingUpIcon,
  CalendarIcon,
  UsersIcon,
  BriefcaseIcon,
  ClipboardListIcon,
  CheckCircleIcon,
  Loader2
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useWebSocket } from "@/context/websocket-context";

type SummaryStatData = {
  name: string;
  value: number | string;
  icon: string;
  color: string;
  trend: string;
};

type ProjectStatusData = {
  name: string;
  value: number;
  color: string;
};

type TaskCompletionData = {
  name: string;
  completed: number;
  pending: number;
};

type TeamPerformanceData = {
  name: string;
  value: number;
  color: string;
};

type DepartmentSizeData = {
  name: string;
  value: number;
  color: string;
};

export default function ReportsPage() {
  const [, setLocation] = useLocation();
  const { connected, lastMessage } = useWebSocket();

  // Fetch real-time reports data
  const { data: summaryStats, isLoading: isLoadingSummary, refetch: refetchSummary } = useQuery<SummaryStatData[]>({
    queryKey: ["/api/reports/summary"],
  });

  const { data: projectStatusData, isLoading: isLoadingProjectStatus, refetch: refetchProjectStatus } = useQuery<ProjectStatusData[]>({
    queryKey: ["/api/reports/project-status"],
  });

  const { data: taskCompletionData, isLoading: isLoadingTaskCompletion, refetch: refetchTaskCompletion } = useQuery<TaskCompletionData[]>({
    queryKey: ["/api/reports/task-completion"],
  });

  const { data: teamPerformanceData, isLoading: isLoadingTeamPerformance, refetch: refetchTeamPerformance } = useQuery<TeamPerformanceData[]>({
    queryKey: ["/api/reports/team-performance"],
  });

  const { data: departmentAllocationData, isLoading: isLoadingDepartmentSize, refetch: refetchDepartmentSize } = useQuery<DepartmentSizeData[]>({
    queryKey: ["/api/reports/department-size"],
  });

  // Update reports when real-time events occur
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage);
        if (data && data.type) {
          // Check for events that should update reports
          const shouldRefresh = [
            'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_DELETED',
            'TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED',
            'USER_CREATED', 'USER_UPDATED', 'USER_DELETED',
            'TEAM_CREATED', 'TEAM_UPDATED', 'TEAM_DELETED',
            'TEAM_MEMBER_ADDED', 'TEAM_MEMBER_REMOVED',
            'DEPARTMENT_CREATED', 'DEPARTMENT_UPDATED', 'DEPARTMENT_DELETED'
          ].includes(data.type);
          
          if (shouldRefresh) {
            console.log("Refreshing reports data due to event:", data.type);
            refetchSummary();
            refetchProjectStatus();
            refetchTaskCompletion();
            refetchTeamPerformance();
            refetchDepartmentSize();
          }
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    }
  }, [lastMessage, refetchSummary, refetchProjectStatus, refetchTaskCompletion, refetchTeamPerformance, refetchDepartmentSize]);

  // Loading states
  const isLoading = isLoadingSummary || isLoadingProjectStatus || isLoadingTaskCompletion || 
                   isLoadingTeamPerformance || isLoadingDepartmentSize;

  // Map icon strings to actual icon components
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.FC<any>> = {
      "BriefcaseIcon": BriefcaseIcon,
      "ClipboardListIcon": ClipboardListIcon,
      "UsersIcon": UsersIcon,
      "CheckCircleIcon": CheckCircleIcon
    };
    
    return iconMap[iconName] || BriefcaseIcon;
  };

  // Create simple visualization components since we don't have a charting library
  const renderBarChart = (data: {name: string, value: number, color?: string}[], maxValue = 100) => (
    <div className="flex flex-col h-40 justify-end mt-4">
      <div className="flex items-end h-32 gap-2">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-primary-500 rounded-t"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || '#3b82f6'
              }}
            />
            <span className="text-xs mt-1 text-gray-600">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPieChart = (data: {name: string, value: number, color: string}[]) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;
    
    return (
      <div className="flex items-center justify-center mt-4">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {data.map((item, i) => {
              const percentage = (item.value / total) * 100;
              const startAngle = cumulativePercentage * 3.6; // 3.6 = 360 / 100
              cumulativePercentage += percentage;
              const endAngle = cumulativePercentage * 3.6;
              
              // Convert angles to radians and calculate x,y coordinates
              const startRad = (startAngle - 90) * Math.PI / 180;
              const endRad = (endAngle - 90) * Math.PI / 180;
              const x1 = 50 + 50 * Math.cos(startRad);
              const y1 = 50 + 50 * Math.sin(startRad);
              const x2 = 50 + 50 * Math.cos(endRad);
              const y2 = 50 + 50 * Math.sin(endRad);
              
              // Create arc flag (0 for < 180 degrees, 1 for >= 180 degrees)
              const largeArcFlag = percentage > 50 ? 1 : 0;
              
              // Generate path data
              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              return (
                <path 
                  key={i} 
                  d={pathData} 
                  fill={item.color} 
                  stroke="#fff" 
                  strokeWidth="1"
                />
              );
            })}
          </svg>
        </div>
        <div className="ml-4">
          <ul className="space-y-1">
            {data.map((item, i) => (
              <li key={i} className="flex items-center text-sm">
                <span 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700">{item.name}: </span>
                <span className="font-medium ml-1">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderStackedBarChart = (data: {name: string, completed: number, pending: number}[]) => (
    <div className="flex flex-col h-40 justify-end mt-4">
      <div className="flex items-end h-32 gap-2">
        {data.map((item, i) => {
          const total = item.completed + item.pending;
          const completedHeight = (item.completed / total) * 100;
          const pendingHeight = (item.pending / total) * 100;
          
          return (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className="w-full h-full flex flex-col-reverse">
                <div 
                  className="w-full bg-green-500 rounded-b"
                  style={{ height: `${completedHeight}%` }}
                />
                <div 
                  className="w-full bg-yellow-400 rounded-t"
                  style={{ height: `${pendingHeight}%` }}
                />
              </div>
              <span className="text-xs mt-1 text-gray-600">{item.name}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center mt-4 gap-6">
        <div className="flex items-center">
          <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2" />
          <span className="text-sm text-gray-600">Pending</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-2" />
          <span className="text-sm text-gray-600">Completed</span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Performance metrics and project insights</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" /> Last 30 Days
            </Button>
            <Button variant="outline" onClick={() => {
              refetchSummary();
              refetchProjectStatus();
              refetchTaskCompletion();
              refetchTeamPerformance();
              refetchDepartmentSize();
            }}>
              <DownloadIcon className="mr-2 h-4 w-4" /> Refresh Data
            </Button>
          </div>
        </div>
      </header>
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-gray-600">Loading reports data...</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {summaryStats?.map((stat, index) => {
              const IconComponent = getIconComponent(stat.icon);
              return (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                        <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          <TrendingUpIcon className="inline h-3 w-3 mr-1" />
                          {stat.trend}
                        </p>
                      </div>
                      <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Project Status Chart */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <PieChartIcon className="mr-2 h-5 w-5" />
                      Project Status
                    </CardTitle>
                    <CardDescription>Distribution of projects by current status</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => refetchProjectStatus()}
                  >
                    <FilterIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {projectStatusData && projectStatusData.length > 0 ? (
                  renderPieChart(projectStatusData)
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <PieChartIcon className="h-10 w-10 mb-2 opacity-30" />
                    <p>No project status data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Task Completion Chart */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <BarChart3Icon className="mr-2 h-5 w-5" />
                      Task Completion
                    </CardTitle>
                    <CardDescription>Weekly task completion progress</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => refetchTaskCompletion()}
                  >
                    <FilterIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {taskCompletionData && taskCompletionData.length > 0 ? (
                  renderStackedBarChart(taskCompletionData)
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <BarChart3Icon className="h-10 w-10 mb-2 opacity-30" />
                    <p>No task completion data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Team Performance Chart */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <UsersIcon className="mr-2 h-5 w-5" />
                      Team Performance
                    </CardTitle>
                    <CardDescription>Performance score by team (out of 100)</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => refetchTeamPerformance()}
                  >
                    <FilterIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {teamPerformanceData && teamPerformanceData.length > 0 ? (
                  renderBarChart(teamPerformanceData)
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <UsersIcon className="h-10 w-10 mb-2 opacity-30" />
                    <p>No team performance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Department Size Chart */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <PieChartIcon className="mr-2 h-5 w-5" />
                      Department Size
                    </CardTitle>
                    <CardDescription>Number of employees by department</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => refetchDepartmentSize()}
                  >
                    <FilterIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {departmentAllocationData && departmentAllocationData.length > 0 ? (
                  renderBarChart(departmentAllocationData)
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <UsersIcon className="h-10 w-10 mb-2 opacity-30" />
                    <p>No department size data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Report Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Project Progress Report", icon: BriefcaseIcon, description: "Detailed analysis of project timelines and milestones" },
              { title: "Team Productivity Report", icon: UsersIcon, description: "Insights into team efficiency and output" },
              { title: "Resource Allocation Report", icon: BarChart3Icon, description: "Overview of resource distribution across projects" }
            ].map((report, index) => (
              <Card 
                key={index} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setLocation(`/reports/${index + 1}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary-100">
                      <report.icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{report.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}