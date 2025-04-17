import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TimeEntry } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Clock, Calendar, ClipboardList } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveGrid, CompactCard, CompactCardHeader, CompactCardTitle, CompactCardContent, CompactCardFooter } from "@/components/ui/responsive-grid";
import { Badge } from "@/components/ui/badge";

// Activity type options
const ACTIVITY_TYPES = [
  { value: "DEVELOPMENT", label: "Development" },
  { value: "DESIGN", label: "Design" },
  { value: "TESTING", label: "Testing" },
  { value: "DOCUMENTATION", label: "Documentation" },
  { value: "PLANNING", label: "Planning" },
  { value: "MEETING", label: "Meeting" },
  { value: "REVIEW", label: "Review" },
  { value: "BUGFIX", label: "Bugfix" },
  { value: "SUPPORT", label: "Support" },
  { value: "OTHER", label: "Other" }
];

interface TimeEntryListProps {
  taskId?: string;
  userId?: string;
  title?: string;
  limit?: number;
}

export function TimeEntryList({ taskId, userId, title = "Time Entries", limit }: TimeEntryListProps) {
  const [activityFilter, setActivityFilter] = useState<string>("");
  
  // Query time entries
  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ["/api/time-entries", { taskId, userId }],
    queryFn: async () => {
      let url = "/api/time-entries";
      const params = new URLSearchParams();
      
      if (taskId) params.append("taskId", taskId);
      if (userId) params.append("userId", userId);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await apiRequest("GET", url);
      return await res.json();
    },
    enabled: !!(taskId || userId)
  });

  // Filter time entries by activity type if filter is set
  const filteredEntries = activityFilter 
    ? (timeEntries as TimeEntry[]).filter(entry => entry.activityType === activityFilter)
    : (timeEntries as TimeEntry[]);
    
  // Limit number of entries if limit prop is provided
  const displayedEntries = limit ? filteredEntries.slice(0, limit) : filteredEntries;
  
  // Calculate total hours
  const totalHours = filteredEntries.reduce((sum, entry) => sum + Number(entry.duration || 0), 0);

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 sm:px-6">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <div className="flex items-center">
          <Select value={activityFilter} onValueChange={setActivityFilter}>
            <SelectTrigger className="w-[140px] sm:w-[180px]">
              <SelectValue placeholder="All activities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All activities</SelectItem>
              {ACTIVITY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : displayedEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No time entries found</p>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              Total: {totalHours.toFixed(2)} hours
            </div>
            
            {/* Mobile/Tablet View - Card Grid */}
            <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }} className="mb-6">
              {displayedEntries.map((entry) => (
                <CompactCard key={entry.id} className="hover:bg-accent/50 transition-colors">
                  <CompactCardHeader>
                    <div className="flex justify-between items-start">
                      <CompactCardTitle className="truncate">
                        {entry.description || "No description"}
                      </CompactCardTitle>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-0 text-xs font-normal">
                        {ACTIVITY_TYPES.find(t => t.value === entry.activityType)?.label || entry.activityType}
                      </Badge>
                    </div>
                  </CompactCardHeader>
                  <CompactCardContent className="space-y-2 pt-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-2" />
                      {format(new Date(entry.startTime), 'PP')}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-2" />
                      {format(new Date(entry.startTime), 'p')} - {entry.endTime ? format(new Date(entry.endTime), 'p') : 'In progress'}
                    </div>
                  </CompactCardContent>
                  <CompactCardFooter className="border-t border-border/50 justify-between">
                    <span className="text-sm">Duration</span>
                    <span className="font-medium">{Number(entry.duration || 0).toFixed(2)} hrs</span>
                  </CompactCardFooter>
                </CompactCard>
              ))}
            </ResponsiveGrid>
          </>
        )}
      </CardContent>
    </Card>
  );
}