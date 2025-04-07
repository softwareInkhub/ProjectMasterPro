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
  CheckCircleIcon
} from "lucide-react";
import { useLocation } from "wouter";

export default function ReportsPage() {
  const [, setLocation] = useLocation();

  // Sample data for charts - this would come from API in the real application
  const projectStatusData = [
    { name: "Completed", value: 12, color: "#4ade80" }, // green-400
    { name: "In Progress", value: 18, color: "#60a5fa" }, // blue-400
    { name: "On Hold", value: 5, color: "#facc15" }, // yellow-400
    { name: "Planning", value: 8, color: "#a78bfa" }, // violet-400
    { name: "Cancelled", value: 2, color: "#f87171" }, // red-400
  ];

  const taskCompletionData = [
    { name: "Week 1", completed: 18, pending: 23 },
    { name: "Week 2", completed: 24, pending: 27 },
    { name: "Week 3", completed: 32, pending: 21 },
    { name: "Week 4", completed: 38, pending: 15 },
  ];

  const teamPerformanceData = [
    { name: "Frontend Development", value: 92, color: "#60a5fa" },
    { name: "Backend Development", value: 88, color: "#34d399" },
    { name: "DevOps", value: 95, color: "#a78bfa" },
    { name: "QA", value: 78, color: "#f87171" },
    { name: "Digital Marketing", value: 85, color: "#fbbf24" },
  ];

  const departmentAllocationData = [
    { name: "Engineering", value: 45, color: "#60a5fa" },
    { name: "Marketing", value: 22, color: "#34d399" },
    { name: "Finance", value: 18, color: "#a78bfa" },
    { name: "Human Resources", value: 12, color: "#f87171" },
    { name: "R&D", value: 25, color: "#fbbf24" },
  ];

  // Summary stats
  const summaryStats = [
    { name: "Total Projects", value: 45, icon: BriefcaseIcon, color: "text-blue-600", trend: "+8% from last month" },
    { name: "Active Tasks", value: 189, icon: ClipboardListIcon, color: "text-yellow-600", trend: "+12% from last month" },
    { name: "Team Members", value: 78, icon: UsersIcon, color: "text-purple-600", trend: "+3 new this month" },
    { name: "Completion Rate", value: "87%", icon: CheckCircleIcon, color: "text-green-600", trend: "+5% from last month" },
  ];

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
            <Button variant="outline">
              <DownloadIcon className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
      </header>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryStats.map((stat, index) => (
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
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
              <Button variant="ghost" size="sm">
                <FilterIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderPieChart(projectStatusData)}
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
              <Button variant="ghost" size="sm">
                <FilterIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderStackedBarChart(taskCompletionData)}
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
              <Button variant="ghost" size="sm">
                <FilterIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderBarChart(teamPerformanceData)}
          </CardContent>
        </Card>
        
        {/* Department Allocation Chart */}
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
              <Button variant="ghost" size="sm">
                <FilterIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderBarChart(departmentAllocationData)}
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
    </div>
  );
}