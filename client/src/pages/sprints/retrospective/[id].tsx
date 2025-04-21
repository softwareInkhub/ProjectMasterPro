import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FormValues {
  whatWentWell: string[];
  whatCouldBeImproved: string[];
  actionItems: string[];
}

export default function SprintRetrospectivePage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Initialize state for each section
  const [whatWentWell, setWhatWentWell] = useState<string[]>(['']);
  const [whatCouldBeImproved, setWhatCouldBeImproved] = useState<string[]>(['']);
  const [actionItems, setActionItems] = useState<string[]>(['']);

  // Fetch sprint data
  const { data: sprint, isLoading, error } = useQuery({
    queryKey: ["/api/sprints", id],
    queryFn: () => apiRequest("GET", `/api/sprints/${id}`).then(res => res.json()),
  });

  // Set up the form
  const form = useForm<FormValues>({
    defaultValues: {
      whatWentWell: [''],
      whatCouldBeImproved: [''],
      actionItems: [''],
    },
  });

  // Mutation to update the sprint with retrospective data
  const updateRetroMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/sprints/${id}`, {
        retrospective: {
          whatWentWell: whatWentWell.filter(item => item.trim() !== ''),
          whatCouldBeImproved: whatCouldBeImproved.filter(item => item.trim() !== ''),
          actionItems: actionItems.filter(item => item.trim() !== ''),
        }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sprints", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/sprints"] });
      toast({
        title: "Retrospective Saved",
        description: "Your sprint retrospective has been saved successfully.",
      });
      setLocation(`/sprints/${id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save retrospective. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    updateRetroMutation.mutate(data);
  };

  // Helper functions to add/remove items in each section
  const addWhatWentWell = () => {
    setWhatWentWell([...whatWentWell, '']);
  };

  const removeWhatWentWell = (index: number) => {
    if (whatWentWell.length > 1) {
      setWhatWentWell(whatWentWell.filter((_, i) => i !== index));
    }
  };

  const addWhatCouldBeImproved = () => {
    setWhatCouldBeImproved([...whatCouldBeImproved, '']);
  };

  const removeWhatCouldBeImproved = (index: number) => {
    if (whatCouldBeImproved.length > 1) {
      setWhatCouldBeImproved(whatCouldBeImproved.filter((_, i) => i !== index));
    }
  };

  const addActionItem = () => {
    setActionItems([...actionItems, '']);
  };

  const removeActionItem = (index: number) => {
    if (actionItems.length > 1) {
      setActionItems(actionItems.filter((_, i) => i !== index));
    }
  };

  // Update item text in each section
  const updateWhatWentWell = (index: number, value: string) => {
    const updated = [...whatWentWell];
    updated[index] = value;
    setWhatWentWell(updated);
  };

  const updateWhatCouldBeImproved = (index: number, value: string) => {
    const updated = [...whatCouldBeImproved];
    updated[index] = value;
    setWhatCouldBeImproved(updated);
  };

  const updateActionItem = (index: number, value: string) => {
    const updated = [...actionItems];
    updated[index] = value;
    setActionItems(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !sprint) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Sprint</CardTitle>
            <CardDescription>
              The requested sprint could not be found or there was an error loading it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please check the sprint ID and try again, or return to the sprints list.</p>
          </CardContent>
          <CardFooter>
            <Button variant="default" onClick={() => setLocation("/sprints")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sprints
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Pre-fill the form if retrospective data already exists
  if (sprint.retrospective && !form.formState.isDirty) {
    if (sprint.retrospective.whatWentWell && sprint.retrospective.whatWentWell.length > 0) {
      setWhatWentWell(sprint.retrospective.whatWentWell);
    }
    if (sprint.retrospective.whatCouldBeImproved && sprint.retrospective.whatCouldBeImproved.length > 0) {
      setWhatCouldBeImproved(sprint.retrospective.whatCouldBeImproved);
    }
    if (sprint.retrospective.actionItems && sprint.retrospective.actionItems.length > 0) {
      setActionItems(sprint.retrospective.actionItems);
    }
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={() => setLocation(`/sprints/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Sprint Retrospective</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sprint: {sprint.name}</CardTitle>
          <CardDescription>
            Reflect on what went well, what could be improved, and define action items for future sprints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">What Went Well</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Highlight the positive aspects of this sprint that should be continued or built upon.
                </p>
                
                {whatWentWell.map((item, index) => (
                  <div key={`well-${index}`} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateWhatWentWell(index, e.target.value)}
                      placeholder="e.g., Daily stand-ups were effective and focused"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeWhatWentWell(index)}
                      disabled={whatWentWell.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addWhatWentWell}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">What Could Be Improved</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Identify areas where the team faced challenges or could have been more effective.
                </p>
                
                {whatCouldBeImproved.map((item, index) => (
                  <div key={`improve-${index}`} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateWhatCouldBeImproved(index, e.target.value)}
                      placeholder="e.g., Too many context switches reduced productivity"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeWhatCouldBeImproved(index)}
                      disabled={whatCouldBeImproved.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addWhatCouldBeImproved}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Action Items</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Define specific, actionable steps to implement in future sprints based on the retrospective.
                </p>
                
                {actionItems.map((item, index) => (
                  <div key={`action-${index}`} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateActionItem(index, e.target.value)}
                      placeholder="e.g., Implement a 'no meetings' day each week"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeActionItem(index)}
                      disabled={actionItems.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addActionItem}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(`/sprints/${id}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateRetroMutation.isPending}
                >
                  {updateRetroMutation.isPending ? "Saving..." : "Save Retrospective"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}