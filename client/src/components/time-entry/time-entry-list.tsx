import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TimeEntry } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { Clock, Calendar, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={activityFilter} onValueChange={setActivityFilter}>
            <SelectTrigger className="w-[180px]">
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
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : displayedEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No time entries found
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              Total: {totalHours.toFixed(2)} hours
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {entry.description || "No description"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(entry.startTime), 'PP')}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(entry.startTime), 'p')} - {format(new Date(entry.endTime), 'p')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                        {ACTIVITY_TYPES.find(t => t.value === entry.activityType)?.label || entry.activityType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {entry.duration.toFixed(2)} hrs
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}