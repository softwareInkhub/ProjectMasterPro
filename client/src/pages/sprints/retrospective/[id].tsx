import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, X, Save, Check, ThumbsUp, ThumbsDown, LightbulbIcon } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SprintRetrospectivePage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [whatWentWell, setWhatWentWell] = useState<string[]>(['']);
  const [whatCouldBeImproved, setWhatCouldBeImproved] = useState<string[]>(['']);
  const [actionItems, setActionItems] = useState<string[]>(['']);
  const [generalNotes, setGeneralNotes] = useState<string>('');
  
  // Fetch sprint data
  const { data: sprint, isLoading, error } = useQuery({
    queryKey: ["/api/sprints", id],
    queryFn: () => apiRequest("GET", `/api/sprints/${id}`).then(res => res.json()),
    onSuccess: (data) => {
      // Initialize form with existing retrospective data if available
      if (data.retrospective) {
        setWhatWentWell(data.retrospective.whatWentWell?.length > 0 ? 
          data.retrospective.whatWentWell : ['']);
        setWhatCouldBeImproved(data.retrospective.whatCouldBeImproved?.length > 0 ? 
          data.retrospective.whatCouldBeImproved : ['']);
        setActionItems(data.retrospective.actionItems?.length > 0 ? 
          data.retrospective.actionItems : ['']);
        setGeneralNotes(data.retrospective.generalNotes || '');
      }
    }
  });

  // Mutation to save retrospective
  const saveRetrospectiveMutation = useMutation({
    mutationFn: async () => {
      const retrospectiveData = {
        whatWentWell: whatWentWell.filter(item => item.trim() !== ''),
        whatCouldBeImproved: whatCouldBeImproved.filter(item => item.trim() !== ''),
        actionItems: actionItems.filter(item => item.trim() !== ''),
        generalNotes: generalNotes.trim() !== '' ? generalNotes : undefined,
      };
      
      const response = await apiRequest("PUT", `/api/sprints/${id}/retrospective`, retrospectiveData);
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
      console.error("Retrospective save error:", error);
    },
  });

  // Helper functions for managing form items
  const addItem = (items: string[], setItems: React.Dispatch<React.SetStateAction<string[]>>) => {
    setItems([...items, '']);
  };

  const removeItem = (index: number, items: string[], setItems: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, value: string, items: string[], setItems: React.Dispatch<React.SetStateAction<string[]>>) => {
    const updated = [...items];
    updated[index] = value;
    setItems(updated);
  };

  const handleSave = () => {
    saveRetrospectiveMutation.mutate();
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

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={() => setLocation(`/sprints/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Sprint Retrospective</h1>
          <p className="text-muted-foreground">{sprint.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Retrospective for {sprint.name}</CardTitle>
          <CardDescription>
            Reflect on the sprint to identify what went well, what could be improved, and specific action items for the future.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="went-well" className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="went-well" className="flex items-center">
                <ThumbsUp className="mr-2 h-4 w-4" /> What Went Well
              </TabsTrigger>
              <TabsTrigger value="improve" className="flex items-center">
                <ThumbsDown className="mr-2 h-4 w-4" /> To Improve
              </TabsTrigger>
              <TabsTrigger value="action-items" className="flex items-center">
                <LightbulbIcon className="mr-2 h-4 w-4" /> Action Items
              </TabsTrigger>
            </TabsList>

            <TabsContent value="went-well" className="pt-4 space-y-4">
              <h3 className="text-lg font-medium">What Went Well</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Highlight positive aspects of the sprint, such as successful implementations, effective collaboration, or process improvements.
              </p>

              {whatWentWell.map((item, index) => (
                <div key={`well-${index}`} className="flex items-center gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value, whatWentWell, setWhatWentWell)}
                    placeholder="e.g., The team completed all high-priority tasks ahead of schedule"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index, whatWentWell, setWhatWentWell)}
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
                onClick={() => addItem(whatWentWell, setWhatWentWell)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </TabsContent>

            <TabsContent value="improve" className="pt-4 space-y-4">
              <h3 className="text-lg font-medium">What Could Be Improved</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Identify areas for improvement, such as communication issues, technical challenges, or process bottlenecks.
              </p>

              {whatCouldBeImproved.map((item, index) => (
                <div key={`improve-${index}`} className="flex items-center gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value, whatCouldBeImproved, setWhatCouldBeImproved)}
                    placeholder="e.g., Dependencies between tasks were not properly identified"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index, whatCouldBeImproved, setWhatCouldBeImproved)}
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
                onClick={() => addItem(whatCouldBeImproved, setWhatCouldBeImproved)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </TabsContent>

            <TabsContent value="action-items" className="pt-4 space-y-4">
              <h3 className="text-lg font-medium">Action Items</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Specify concrete, actionable steps to address issues and improve processes for future sprints.
              </p>

              {actionItems.map((item, index) => (
                <div key={`action-${index}`} className="flex items-center gap-2 mb-2">
                  <Input
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value, actionItems, setActionItems)}
                    placeholder="e.g., Create a dependency matrix for tasks before starting the next sprint"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index, actionItems, setActionItems)}
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
                onClick={() => addItem(actionItems, setActionItems)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">General Notes</h3>
            <p className="text-sm text-muted-foreground">
              Add any additional observations, context, or metrics that might be helpful for future reference.
            </p>
            <Textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Enter any general notes or context about the sprint..."
              rows={5}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setLocation(`/sprints/${id}`)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveRetrospectiveMutation.isPending}
          >
            {saveRetrospectiveMutation.isPending ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Retrospective
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}