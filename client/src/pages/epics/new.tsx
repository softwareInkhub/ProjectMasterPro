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
import { Project, InsertEpic } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ArrowLeftIcon } from 'lucide-react';
import { Placeholder } from '@/lib/constants';

export default function NewEpicPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Epic data
  const [epicData, setEpicData] = useState<Partial<InsertEpic>>({
    name: '',
    description: '',
    status: 'BACKLOG',
    priority: 'MEDIUM',
    projectId: '',
    startDate: '',
    endDate: '',
    progress: { percentage: 0 }
  });
  
  // Fetch reference data
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  // Create mutation
  const createEpicMutation = useMutation({
    mutationFn: async (epic: InsertEpic) => {
      const response = await apiRequest('POST', '/api/epics', epic);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/epics'] });
      toast({
        title: "Epic created",
        description: "New epic has been successfully created."
      });
      setLocation('/epics');
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating epic",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare epic data, handling nullable fields
    const formattedEpic = {
      ...epicData,
      projectId: epicData.projectId === Placeholder.NO_PROJECT ? null : epicData.projectId,
    } as InsertEpic;
    
    createEpicMutation.mutate(formattedEpic);
  };
  
  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="outline" 
        className="mb-6" 
        onClick={() => setLocation('/epics')}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Epics
      </Button>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Epic</CardTitle>
          <CardDescription>
            Add a new epic to track large pieces of work that can be broken down into multiple stories
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Epic Name <span className="text-red-500">*</span></Label>
              <Input 
                id="name" 
                placeholder="Enter epic name"
                value={epicData.name}
                onChange={(e) => setEpicData({...epicData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Detailed description of the epic"
                rows={4}
                value={epicData.description || ''}
                onChange={(e) => setEpicData({...epicData, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select 
                  value={epicData.projectId || Placeholder.NO_PROJECT}
                  onValueChange={(value) => setEpicData({...epicData, projectId: value})}
                >
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Placeholder.NO_PROJECT}>No Project</SelectItem>
                    {projects.map((project: Project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                <Select 
                  value={epicData.status || 'BACKLOG'}
                  onValueChange={(value) => setEpicData({...epicData, status: value})}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKLOG">Backlog</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority <span className="text-red-500">*</span></Label>
                <Select 
                  value={epicData.priority || 'MEDIUM'}
                  onValueChange={(value) => setEpicData({...epicData, priority: value})}
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
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date"
                  value={epicData.startDate || ''}
                  onChange={(e) => setEpicData({...epicData, startDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  type="date"
                  value={epicData.endDate || ''}
                  onChange={(e) => setEpicData({...epicData, endDate: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setLocation('/epics')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createEpicMutation.isPending}
            >
              {createEpicMutation.isPending ? 'Creating...' : 'Create Epic'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}