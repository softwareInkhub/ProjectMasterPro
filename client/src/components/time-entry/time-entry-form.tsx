import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InsertTimeEntry } from "@shared/schema";
import { Clock, PlayCircle, StopCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ResponsiveGrid } from "@/components/ui/responsive-grid"; 
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
      duration: durationHours.toString(), // Convert to string to match schema type
      description: description,
      activityType: activityType as any,
    };
    
    createTimeEntryMutation.mutate(timeEntry);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-0 bg-background">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center text-lg">
            <Clock className="mr-2 h-4 w-4" />
            <span>Time Tracker</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-4">
            {isTracking ? (
              <div className="space-y-4">
                {/* Tracking in progress UI */}
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-0">
                      Recording time
                    </Badge>
                    <Button 
                      variant="destructive"
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => stopTracking()}
                    >
                      <StopCircle className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <p className="text-sm text-muted-foreground">Started:</p>
                      <p className="font-medium">{startTime && format(startTime, 'PP p')}</p>
                    </div>
                    <div className="text-sm text-primary font-medium">
                      {startTime && formatDistanceToNow(startTime, { addSuffix: true })}
                    </div>
                  </div>
                </div>
                
                <ResponsiveGrid cols={{ default: 1, sm: 2 }} className="gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-medium">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What are you working on?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="resize-none h-24"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="activityType" className="text-xs font-medium">Activity Type</Label>
                    <Select value={activityType} onValueChange={setActivityType}>
                      <SelectTrigger id="activityType" className="h-10">
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
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ACTIVITY_TYPES.slice(0, 5).map((type) => (
                        <Button 
                          key={type.value} 
                          size="sm"
                          variant={activityType === type.value ? "default" : "outline"}
                          className="h-7 text-xs rounded-full px-3"
                          onClick={() => setActivityType(type.value)}
                        >
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </ResponsiveGrid>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4 space-y-3">
                <p className="text-center text-muted-foreground text-sm max-w-sm">
                  Track time spent on this task to help with reporting and productivity analysis.
                </p>
                <Button 
                  onClick={startTracking} 
                  className="w-full sm:w-auto"
                  variant="default"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Start Tracking
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* We'll let the TimeEntryList component show the entries instead */}
      <Separator className="my-4" />
    </div>
  );
}