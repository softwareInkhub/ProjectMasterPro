import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Epic, User, InsertStory } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ArrowLeftIcon } from 'lucide-react';
import { Placeholder } from '@/lib/constants';

export default function NewStoryPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Story data
  const [storyData, setStoryData] = useState<Partial<InsertStory>>({
    name: '',
    description: '',
    status: 'BACKLOG',
    priority: 'MEDIUM',
    epicId: '',
    assigneeId: '',
    reporterId: '',
    storyPoints: '',
    startDate: '',
    dueDate: '',
  });
  
  // Fetch reference data
  const { data: epics = [] } = useQuery<Epic[]>({
    queryKey: ['/api/epics'],
  });
  
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Create mutation
  const createStoryMutation = useMutation({
    mutationFn: async (story: InsertStory) => {
      const response = await apiRequest('POST', '/api/stories', story);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      toast({
        title: "Story created",
        description: "New story has been successfully created.",
      });
      setLocation('/stories');
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating story",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!storyData.name) {
      toast({
        title: "Validation Error",
        description: "Story name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!storyData.epicId) {
      toast({
        title: "Validation Error",
        description: "Epic is required",
        variant: "destructive"
      });
      return;
    }
    
    // Prepare story data, handling nullable fields
    const formattedStory = {
      ...storyData,
      assigneeId: storyData.assigneeId === Placeholder.UNASSIGNED ? null : storyData.assigneeId,
      reporterId: storyData.reporterId === Placeholder.UNASSIGNED ? null : storyData.reporterId,
      storyPoints: storyData.storyPoints === Placeholder.NOT_ESTIMATED ? null : storyData.storyPoints,
    } as InsertStory;
    
    // Add debug info
    console.log("Submitting story:", formattedStory);
    
    createStoryMutation.mutate(formattedStory);
  };
  
  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="outline" 
        className="mb-6" 
        onClick={() => setLocation('/stories')}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Stories
      </Button>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Story</CardTitle>
          <CardDescription>
            Add a new user story to track work items that deliver specific value to users
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Story Name <span className="text-red-500">*</span></Label>
              <Input 
                id="name" 
                placeholder="Enter story name"
                value={storyData.name}
                onChange={(e) => setStoryData({...storyData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Detailed description of the story"
                rows={4}
                value={storyData.description || ''}
                onChange={(e) => setStoryData({...storyData, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="epic">Epic <span className="text-red-500">*</span></Label>
                <Select 
                  value={storyData.epicId || ''}
                  onValueChange={(value) => setStoryData({...storyData, epicId: value})}
                  required
                >
                  <SelectTrigger id="epic">
                    <SelectValue placeholder="Select epic" />
                  </SelectTrigger>
                  <SelectContent>
                    {epics.map((epic: Epic) => (
                      <SelectItem key={epic.id} value={epic.id}>
                        {epic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                <Select 
                  value={storyData.status || 'BACKLOG'}
                  onValueChange={(value) => setStoryData({...storyData, status: value})}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKLOG">Backlog</SelectItem>
                    <SelectItem value="READY">Ready</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority <span className="text-red-500">*</span></Label>
                <Select 
                  value={storyData.priority || 'MEDIUM'}
                  onValueChange={(value) => setStoryData({...storyData, priority: value})}
                  required
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storyPoints">Story Points</Label>
                <Select 
                  value={storyData.storyPoints?.toString() || Placeholder.NOT_ESTIMATED}
                  onValueChange={(value) => setStoryData({...storyData, storyPoints: value})}
                >
                  <SelectTrigger id="storyPoints">
                    <SelectValue placeholder="Select story points" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Placeholder.NOT_ESTIMATED}>Not Estimated</SelectItem>
                    <SelectItem value="1">1 point</SelectItem>
                    <SelectItem value="2">2 points</SelectItem>
                    <SelectItem value="3">3 points</SelectItem>
                    <SelectItem value="5">5 points</SelectItem>
                    <SelectItem value="8">8 points</SelectItem>
                    <SelectItem value="13">13 points</SelectItem>
                    <SelectItem value="21">21 points</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Select 
                  value={storyData.assigneeId || Placeholder.UNASSIGNED}
                  onValueChange={(value) => setStoryData({...storyData, assigneeId: value})}
                >
                  <SelectTrigger id="assignee">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Placeholder.UNASSIGNED}>Unassigned</SelectItem>
                    {users.map((user: User) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reporter">Reporter</Label>
                <Select 
                  value={storyData.reporterId || Placeholder.UNASSIGNED}
                  onValueChange={(value) => setStoryData({...storyData, reporterId: value})}
                >
                  <SelectTrigger id="reporter">
                    <SelectValue placeholder="Select reporter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Placeholder.UNASSIGNED}>Unassigned</SelectItem>
                    {users.map((user: User) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date"
                  value={storyData.startDate || ''}
                  onChange={(e) => setStoryData({...storyData, startDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input 
                  id="dueDate" 
                  type="date"
                  value={storyData.dueDate || ''}
                  onChange={(e) => setStoryData({...storyData, dueDate: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setLocation('/stories')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createStoryMutation.isPending}
            >
              {createStoryMutation.isPending ? 'Creating...' : 'Create Story'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}