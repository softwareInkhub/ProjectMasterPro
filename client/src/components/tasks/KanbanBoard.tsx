import { useState } from "react";
import { Task, User } from "@/types";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Filter, UserRound, PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { taskApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

interface KanbanBoardProps {
  tasks: Task[];
  users?: User[];
  storyId?: string;
  onTaskUpdate?: (updatedTask: Task) => void;
  refetchTasks?: () => void;
}

export function KanbanBoard({ 
  tasks, 
  users = [], 
  storyId,
  onTaskUpdate,
  refetchTasks
}: KanbanBoardProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Group tasks by status
  const tasksByStatus = {
    TODO: tasks.filter(task => task.status === "TODO"),
    IN_PROGRESS: tasks.filter(task => task.status === "IN_PROGRESS"),
    IN_REVIEW: tasks.filter(task => task.status === "IN_REVIEW"),
    DONE: tasks.filter(task => task.status === "DONE"),
  };

  // Form schema for task creation
  const formSchema = z.object({
    name: z.string().min(1, "Task name is required"),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    assigneeId: z.string().optional().nullable(),
    storyId: z.string(),
  });

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      priority: "MEDIUM",
      assigneeId: null,
      storyId: storyId || "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await taskApi.create({
        ...values,
        status: "TODO",
      });
      
      const newTask = await response.json();
      
      toast({
        title: "Task created",
        description: "The task has been created successfully.",
      });
      
      // Invalidate tasks cache
      queryClient.invalidateQueries({
        queryKey: ['/api/tasks'],
      });
      
      if (refetchTasks) {
        refetchTasks();
      }
      
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const response = await taskApi.update(taskId, { status: newStatus });
      const updatedTask = await response.json();
      
      // Invalidate tasks cache
      queryClient.invalidateQueries({
        queryKey: ['/api/tasks'],
      });
      
      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      }
      
      if (refetchTasks) {
        refetchTasks();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Task Board</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-1 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <UserRound className="mr-1 h-4 w-4" />
            Assignee
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusIcon className="mr-1 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Task Name</label>
                    <Input
                      {...form.register("name")}
                      placeholder="Enter task name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      {...form.register("description")}
                      placeholder="Enter task description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      onValueChange={(value) => form.setValue("priority", value as any)}
                      defaultValue="MEDIUM"
                    >
                      <SelectTrigger>
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
                    <label className="text-sm font-medium">Assignee</label>
                    <Select
                      onValueChange={(value) => form.setValue("assigneeId", value)}
                      defaultValue=""
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {!storyId && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Story ID</label>
                      <Input
                        {...form.register("storyId")}
                        placeholder="Enter story ID"
                      />
                      {form.formState.errors.storyId && (
                        <p className="text-sm text-red-600">{form.formState.errors.storyId.message}</p>
                      )}
                    </div>
                  )}
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Task</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Todo Column */}
        <div className="bg-gray-50 rounded-lg p-4 kanban-column">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center justify-between">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
              Todo
            </span>
            <span className="text-gray-500 bg-gray-200 text-xs px-2 py-0.5 rounded-full">
              {tasksByStatus.TODO.length}
            </span>
          </h3>
          
          <div className="space-y-3">
            {tasksByStatus.TODO.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                assignee={users.find(user => user.id === task.assigneeId)}
                onStatusChange={(newStatus) => updateTaskStatus(task.id, newStatus)}
              />
            ))}
            
            {tasksByStatus.TODO.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm italic">
                No tasks in todo
              </div>
            )}
          </div>
        </div>
        
        {/* In Progress Column */}
        <div className="bg-gray-50 rounded-lg p-4 kanban-column">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center justify-between">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              In Progress
            </span>
            <span className="text-gray-500 bg-gray-200 text-xs px-2 py-0.5 rounded-full">
              {tasksByStatus.IN_PROGRESS.length}
            </span>
          </h3>
          
          <div className="space-y-3">
            {tasksByStatus.IN_PROGRESS.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                assignee={users.find(user => user.id === task.assigneeId)}
                onStatusChange={(newStatus) => updateTaskStatus(task.id, newStatus)}
              />
            ))}
            
            {tasksByStatus.IN_PROGRESS.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm italic">
                No tasks in progress
              </div>
            )}
          </div>
        </div>
        
        {/* In Review Column */}
        <div className="bg-gray-50 rounded-lg p-4 kanban-column">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center justify-between">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              In Review
            </span>
            <span className="text-gray-500 bg-gray-200 text-xs px-2 py-0.5 rounded-full">
              {tasksByStatus.IN_REVIEW.length}
            </span>
          </h3>
          
          <div className="space-y-3">
            {tasksByStatus.IN_REVIEW.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                assignee={users.find(user => user.id === task.assigneeId)}
                onStatusChange={(newStatus) => updateTaskStatus(task.id, newStatus)}
              />
            ))}
            
            {tasksByStatus.IN_REVIEW.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm italic">
                No tasks in review
              </div>
            )}
          </div>
        </div>
        
        {/* Done Column */}
        <div className="bg-gray-50 rounded-lg p-4 kanban-column">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center justify-between">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Done
            </span>
            <span className="text-gray-500 bg-gray-200 text-xs px-2 py-0.5 rounded-full">
              {tasksByStatus.DONE.length}
            </span>
          </h3>
          
          <div className="space-y-3">
            {tasksByStatus.DONE.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                assignee={users.find(user => user.id === task.assigneeId)}
                onStatusChange={(newStatus) => updateTaskStatus(task.id, newStatus)}
              />
            ))}
            
            {tasksByStatus.DONE.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm italic">
                No completed tasks
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
