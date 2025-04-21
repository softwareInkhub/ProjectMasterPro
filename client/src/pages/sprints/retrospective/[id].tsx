import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Plus, Trash2, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface RetroItem {
  id: string;
  text: string;
}

export default function SprintRetrospectivePage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const sprintId = params.id;

  const [whatWentWell, setWhatWentWell] = useState<string[]>([""]);
  const [whatCouldBeImproved, setWhatCouldBeImproved] = useState<string[]>([""]);
  const [actionItems, setActionItems] = useState<string[]>([""]);
  const [generalNotes, setGeneralNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch sprint details
  const { data: sprint, isLoading, error } = useQuery({
    queryKey: [`/api/sprints/${sprintId}`],
    retry: 1,
  });

  // Initialize form with existing retrospective data if it exists
  useEffect(() => {
    if (sprint?.retrospective) {
      if (sprint.retrospective.whatWentWell?.length > 0) {
        setWhatWentWell(sprint.retrospective.whatWentWell);
      }
      if (sprint.retrospective.whatCouldBeImproved?.length > 0) {
        setWhatCouldBeImproved(sprint.retrospective.whatCouldBeImproved);
      }
      if (sprint.retrospective.actionItems?.length > 0) {
        setActionItems(sprint.retrospective.actionItems);
      }
      if (sprint.retrospective.generalNotes) {
        setGeneralNotes(sprint.retrospective.generalNotes);
      }
    }
  }, [sprint]);

  // Save retrospective
  const saveRetrospectiveMutation = useMutation({
    mutationFn: async (data: {
      whatWentWell: string[];
      whatCouldBeImproved: string[];
      actionItems: string[];
      generalNotes: string;
    }) => {
      const response = await apiRequest("PUT", `/api/sprints/${sprintId}/retrospective`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sprints/${sprintId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/sprints"] });
      toast({
        title: "Retrospective Saved",
        description: "The sprint retrospective has been saved successfully.",
      });
      setIsSubmitting(false);
      navigate(`/sprints/${sprintId}`);
    },
    onError: (error) => {
      console.error("Error saving retrospective:", error);
      toast({
        title: "Error",
        description: "Failed to save the retrospective. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const handleSaveRetrospective = () => {
    setIsSubmitting(true);
    
    // Filter out empty items
    const filteredWhatWentWell = whatWentWell.filter((item) => item.trim() !== "");
    const filteredWhatCouldBeImproved = whatCouldBeImproved.filter((item) => item.trim() !== "");
    const filteredActionItems = actionItems.filter((item) => item.trim() !== "");
    
    // Make sure there's at least one entry in each category
    if (filteredWhatWentWell.length === 0 || filteredWhatCouldBeImproved.length === 0 || filteredActionItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please ensure all sections have at least one entry.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    saveRetrospectiveMutation.mutate({
      whatWentWell: filteredWhatWentWell,
      whatCouldBeImproved: filteredWhatCouldBeImproved,
      actionItems: filteredActionItems,
      generalNotes: generalNotes.trim(),
    });
  };

  // Helper functions for lists
  const addItemToList = (list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter([...list, ""]);
  };

  const removeItemFromList = (list: string[], index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.length > 1) {
      const newList = [...list];
      newList.splice(index, 1);
      setter(newList);
    }
  };

  const updateItemInList = (list: string[], index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    const newList = [...list];
    newList[index] = value;
    setter(newList);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !sprint) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-500">Error loading sprint</h1>
        <p>Unable to load sprint details. Please try again.</p>
        <Button onClick={() => navigate("/sprints")} className="mt-4">
          Back to Sprints
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={() => navigate(`/sprints/${sprintId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Sprint Retrospective</h1>
          <p className="text-muted-foreground">{sprint.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-950 border-b">
            <CardTitle className="text-green-700 dark:text-green-300 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" />
              What Went Well
            </CardTitle>
            <CardDescription>
              Highlight the positive aspects of the sprint
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {whatWentWell.map((item, index) => (
              <div key={`well-${index}`} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateItemInList(whatWentWell, index, e.target.value, setWhatWentWell)}
                  placeholder="E.g., Team collaboration was excellent"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItemFromList(whatWentWell, index, setWhatWentWell)}
                  disabled={whatWentWell.length <= 1}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addItemToList(whatWentWell, setWhatWentWell)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-amber-50 dark:bg-amber-950 border-b">
            <CardTitle className="text-amber-700 dark:text-amber-300 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" />
              What Could Be Improved
            </CardTitle>
            <CardDescription>
              Identify areas for improvement in future sprints
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {whatCouldBeImproved.map((item, index) => (
              <div key={`improve-${index}`} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateItemInList(whatCouldBeImproved, index, e.target.value, setWhatCouldBeImproved)}
                  placeholder="E.g., Better estimation of story points"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItemFromList(whatCouldBeImproved, index, setWhatCouldBeImproved)}
                  disabled={whatCouldBeImproved.length <= 1}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addItemToList(whatCouldBeImproved, setWhatCouldBeImproved)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="bg-blue-50 dark:bg-blue-950 border-b">
          <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            Action Items
          </CardTitle>
          <CardDescription>
            Specific actions to implement for the next sprint
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {actionItems.map((item, index) => (
            <div key={`action-${index}`} className="flex items-center gap-2">
              <Input
                value={item}
                onChange={(e) => updateItemInList(actionItems, index, e.target.value, setActionItems)}
                placeholder="E.g., Schedule daily standups at 9 AM"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItemFromList(actionItems, index, setActionItems)}
                disabled={actionItems.length <= 1}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItemToList(actionItems, setActionItems)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General Notes</CardTitle>
          <CardDescription>
            Any additional observations or comments about the sprint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            placeholder="Add any additional thoughts or context about the sprint retrospective"
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => navigate(`/sprints/${sprintId}`)}>
          Cancel
        </Button>
        <Button 
          onClick={handleSaveRetrospective}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Retrospective"
          )}
        </Button>
      </div>
    </div>
  );
}