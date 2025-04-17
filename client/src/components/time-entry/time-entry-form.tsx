import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InsertTimeEntry, TimeEntry } from "@shared/schema";
import { Clock, PlayCircle, StopCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

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

interface TimeEntryFormProps {
  taskId: string;
}

export function TimeEntryForm({ taskId }: TimeEntryFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [description, setDescription] = useState("");
  const [activityType, setActivityType] = useState<string>("DEVELOPMENT");

  // Query to get time entries for this task
  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ["/api/time-entries", taskId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/time-entries?taskId=${taskId}`);
      return await res.json();
    },
    enabled: !!taskId
  });

  // Mutation to create a new time entry
  const createTimeEntryMutation = useMutation({
    mutationFn: async (timeEntry: InsertTimeEntry) => {
      const res = await apiRequest("POST", "/api/time-entries", timeEntry);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries", taskId] });
      toast({
        title: "Time entry created",
        description: "Your time entry has been saved successfully.",
      });
      setDescription("");
      setIsTracking(false);
      setStartTime(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save time entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a time entry
  const deleteTimeEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/time-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries", taskId] });
      toast({
        title: "Time entry deleted",
        description: "The time entry has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete time entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Start time tracking
  const startTracking = () => {
    setIsTracking(true);
    setStartTime(new Date());
  };

  // Stop time tracking and save
  const stopTracking = () => {
    if (!startTime) return;
    
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    const timeEntry: InsertTimeEntry = {
      taskId,
      userId: user!.id,
      startTime: startTime,
      endTime: endTime,
      duration: durationHours,
      description: description,
      activityType: activityType as any,
    };
    
    createTimeEntryMutation.mutate(timeEntry);
  };
  
  // Save time entry manually
  const saveManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get values from form (would need to add more form elements for manual entry)
    // For now just using the current state values
    if (!startTime) return;
    
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    const timeEntry: InsertTimeEntry = {
      taskId,
      userId: user!.id,
      startTime: startTime,
      endTime: endTime, 
      duration: durationHours,
      description: description,
      activityType: activityType as any,
    };
    
    createTimeEntryMutation.mutate(timeEntry);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            <span>Time Tracking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isTracking ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Started:</p>
                    <p className="font-medium">{startTime && format(startTime, 'PP p')}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ({startTime && formatDistanceToNow(startTime, { addSuffix: true })})
                    </p>
                  </div>
                  <Button 
                    variant="destructive"
                    size="icon"
                    onClick={() => stopTracking()}
                  >
                    <StopCircle className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What are you working on?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="activityType">Activity Type</Label>
                  <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger id="activityType">
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <Button 
                onClick={startTracking} 
                className="w-full"
                variant="default"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Tracking
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading time entries...</div>
          ) : timeEntries.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No time entries yet
            </div>
          ) : (
            <div className="space-y-4">
              {(timeEntries as TimeEntry[]).map((entry) => (
                <div key={entry.id} className="flex items-start justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{entry.description || "No description"}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(entry.startTime), 'PP p')} - {format(new Date(entry.endTime), 'p')}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                        {ACTIVITY_TYPES.find(t => t.value === entry.activityType)?.label || entry.activityType}
                      </span>
                      <span className="text-xs ml-2 text-muted-foreground">
                        {entry.duration.toFixed(2)} hours
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTimeEntryMutation.mutate(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}