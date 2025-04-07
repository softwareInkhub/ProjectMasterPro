import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { taskApi, userApi } from "@/lib/api";
import { Task, User } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { format, isValid } from "date-fns";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Tasks() {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [filter, setFilter] = useState<"all" | "assigned">("all");
  const { user } = useAuth();
  
  // Fetch all tasks
  const { data: tasks = [], isLoading, refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Fetch users for assignee info
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Filter tasks based on the selected filter
  const filteredTasks = filter === "assigned" && user 
    ? tasks.filter(task => task.assigneeId === user.id)
    : tasks;
  
  // Table columns configuration
  const columns = [
    {
      header: "Name",
      accessorKey: "name" as keyof Task,
    },
    {
      header: "Status",
      accessorKey: "status" as keyof Task,
      cell: (task: Task) => <StatusBadge status={task.status} />,
    },
    {
      header: "Priority",
      accessorKey: "priority" as keyof Task,
      cell: (task: Task) => <PriorityBadge priority={task.priority} />,
    },
    {
      header: "Assignee",
      accessorKey: "assigneeId" as keyof Task,
      cell: (task: Task) => {
        const assignee = users.find(u => u.id === task.assigneeId);
        if (!assignee) return "Unassigned";
        
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback>
                {assignee.firstName[0]}{assignee.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <span>{assignee.firstName} {assignee.lastName}</span>
          </div>
        );
      },
    },
    {
      header: "Due Date",
      accessorKey: "dueDate" as keyof Task,
      cell: (task: Task) => 
        task.dueDate && isValid(new Date(task.dueDate)) 
          ? format(new Date(task.dueDate), "MMM d, yyyy")
          : "Not set",
    },
  ];
  
  // Handle view toggle
  const handleViewChange = (newView: "list" | "kanban") => {
    setView(newView);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-40">
            <Select value={filter} onValueChange={(value) => setFilter(value as "all" | "assigned")}>
              <SelectTrigger>
                <SelectValue placeholder="Filter tasks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="assigned">My Tasks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Tabs value={view} className="w-auto">
            <TabsList>
              <TabsTrigger value="list" onClick={() => handleViewChange("list")}>
                List View
              </TabsTrigger>
              <TabsTrigger value="kanban" onClick={() => handleViewChange("kanban")}>
                Kanban Board
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">Loading tasks...</div>
      ) : (
        <div>
          <TabsContent value="list" className="mt-0">
            <DataTable
              data={filteredTasks}
              columns={columns}
              searchKey="name"
              searchPlaceholder="Search tasks..."
            />
          </TabsContent>
          
          <TabsContent value="kanban" className="mt-0">
            <KanbanBoard 
              tasks={filteredTasks} 
              users={users}
              refetchTasks={refetchTasks}
            />
          </TabsContent>
        </div>
      )}
    </div>
  );
}
