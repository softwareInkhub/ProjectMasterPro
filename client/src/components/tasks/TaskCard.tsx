import { Task, User } from "@/types";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface TaskCardProps {
  task: Task;
  assignee?: User;
  onStatusChange?: (newStatus: Task['status']) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TaskCard({ 
  task, 
  assignee,
  onStatusChange,
  onEdit,
  onDelete
}: TaskCardProps) {
  const priorityBorderColorMap = {
    "LOW": "border-l-green-500",
    "MEDIUM": "border-l-amber-500",
    "HIGH": "border-l-orange-500",
    "CRITICAL": "border-l-red-500",
  };
  
  // Get initials from user
  const getInitials = (user?: User) => {
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  // Get avatar background color based on name
  const getAvatarColor = (user?: User) => {
    if (!user) return 'bg-gray-500';
    
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-pink-500', 'bg-purple-500', 
      'bg-amber-500', 'bg-red-500', 'bg-indigo-500'
    ];
    
    // Simple hash function
    const nameHash = `${user.firstName}${user.lastName}`.split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    return colors[nameHash % colors.length];
  };
  
  // Status options
  const statusOptions = [
    { value: "TODO", label: "Todo" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "IN_REVIEW", label: "In Review" },
    { value: "DONE", label: "Done" },
    { value: "BLOCKED", label: "Blocked" },
  ];

  return (
    <div className={cn(
      "task-card bg-white rounded-md shadow-sm p-3 border-l-4 cursor-pointer",
      priorityBorderColorMap[task.priority as keyof typeof priorityBorderColorMap],
    )}>
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-gray-900 text-sm">{task.name}</h4>
        <div className="flex items-center gap-1">
          <PriorityBadge priority={task.priority} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onStatusChange && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                    Change Status
                  </div>
                  {statusOptions.map(option => (
                    <DropdownMenuItem
                      key={option.value}
                      disabled={task.status === option.value}
                      onClick={() => onStatusChange(option.value as Task['status'])}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                  <div className="h-px my-1 bg-gray-200" />
                </>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  Edit Task
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={onDelete} 
                  className="text-red-600 focus:text-red-600"
                >
                  Delete Task
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-500 text-xs mt-1">{task.description}</p>
      )}
      
      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center text-xs text-gray-500">
          {task.dueDate && (
            <>
              <CalendarIcon className="mr-1 h-3 w-3" />
              {format(new Date(task.dueDate), "MMM d")}
            </>
          )}
        </div>
        
        {assignee ? (
          <Avatar className={cn("w-6 h-6", getAvatarColor(assignee))}>
            <AvatarFallback className="text-white text-xs">
              {getInitials(assignee)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">?</span>
          </div>
        )}
      </div>
    </div>
  );
}
