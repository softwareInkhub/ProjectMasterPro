import { useState, useEffect } from 'react';
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
import { Story, Task, User, InsertTask } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ArrowLeftIcon } from 'lucide-react';
import { Placeholder } from '@/lib/constants';

export default function NewTaskPage() {
  const [setLocation] = useLocation();
  const { toast } = useToast();
  
  // Task data
  const [taskData, setTaskData] = useState<Partial<InsertTask>>({
    name: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    storyId: '',
    assigneeId: '',
    reporterId: '',
    estimatedHours: '',
    dueDate: '',
  });
  
  // Fetch reference data
  const { data: stories = [] } = useQuery<Story[]>({
    queryKey: ['/api/stories'],
  });
  
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Create mutation
  const createTaskMutation = useMutation({
    mutationFn: async (task: InsertTask) => {
      const response = await apiRequest('POST', '/api/tasks', task);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task created",
        description: "New task has been successfully created.",
      });
      setLocation('/tasks');
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare task data, handling nullable fields
    const formattedTask = {
      ...taskData,
      storyId: taskData.storyId === Placeholder.NONE ? null : taskData.storyId,
      assigneeId: taskData.assigneeId === Placeholder.UNASSIGNED ? null : taskData.assigneeId,
      reporterId: taskData.reporterId === Placeholder.UNASSIGNED ? null : taskData.reporterId,
      estimatedHours: taskData.estimatedHours === Placeholder.NOT_ESTIMATED ? null : taskData.estimatedHours,
    } as InsertTask;
    
    createTaskMutation.mutate(formattedTask);
  };
  
  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="outline" 
        className="mb-6" 
        onClick={() => setLocation('/tasks')}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Tasks
      </Button>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Task</CardTitle>
          <CardDescription>
            Add a new task to track individual work items
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Task Name <span className="text-red-500">*</span></Label>
              <Input 
                id="name" 
                placeholder="Enter task name"
                value={taskData.name}
                onChange={(e) => setTaskData({...taskData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Detailed description of the task"
                rows={4}
                value={taskData.description || ''}
                onChange={(e) => setTaskData({...taskData, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="story">Story</Label>
                <Select 
                  value={taskData.storyId || Placeholder.NONE}
                  onValueChange={(value) => setTaskData({...taskData, storyId: value})}
                >
                  <SelectTrigger id="story">
                    <SelectValue placeholder="Select story" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Placeholder.NONE}>None</SelectItem>
                    {stories.map((story: Story) => (
                      <SelectItem key={story.id} value={story.id}>
                        {story.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Select 
                  value={taskData.assigneeId || Placeholder.UNASSIGNED}
                  onValueChange={(value) => setTaskData({...taskData, assigneeId: value})}
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
                  value={taskData.reporterId || Placeholder.UNASSIGNED}
                  onValueChange={(value) => setTaskData({...taskData, reporterId: value})}
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
                <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                <Select 
                  value={taskData.status || 'TODO'}
                  onValueChange={(value) => setTaskData({...taskData, status: value})}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                    <SelectItem value="BLOCKED">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority <span className="text-red-500">*</span></Label>
                <Select 
                  value={taskData.priority || 'MEDIUM'}
                  onValueChange={(value) => setTaskData({...taskData, priority: value})}
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
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Select 
                  value={taskData.estimatedHours?.toString() || Placeholder.NOT_ESTIMATED}
                  onValueChange={(value) => setTaskData({...taskData, estimatedHours: value})}
                >
                  <SelectTrigger id="estimatedHours">
                    <SelectValue placeholder="Select estimation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Placeholder.NOT_ESTIMATED}>Not Estimated</SelectItem>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="16">16 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="40">40 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input 
                  id="dueDate" 
                  type="date"
                  value={taskData.dueDate || ''}
                  onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setLocation('/tasks')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}