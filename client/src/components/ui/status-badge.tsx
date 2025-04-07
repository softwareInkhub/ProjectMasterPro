import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
type EpicStatus = "BACKLOG" | "IN_PROGRESS" | "COMPLETED";
type StoryStatus = "BACKLOG" | "READY" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BLOCKED";

type StatusType = ProjectStatus | EpicStatus | StoryStatus | TaskStatus;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let label: string = status.replace("_", " ");
  
  // Define color scheme based on status
  switch (status) {
    // Project statuses
    case "PLANNING":
      variant = "outline";
      break;
    case "IN_PROGRESS":
      variant = "default";
      break;
    case "ON_HOLD":
      variant = "secondary";
      break;
    case "COMPLETED":
      variant = "default";
      break;
    case "CANCELLED":
      variant = "destructive";
      break;
      
    // Epic statuses
    case "BACKLOG":
      variant = "outline";
      break;
      
    // Story statuses
    case "READY":
      variant = "secondary";
      break;
    case "IN_REVIEW":
      variant = "secondary";
      break;
    case "DONE":
      variant = "default";
      break;
      
    // Task statuses
    case "TODO":
      variant = "outline";
      break;
    case "BLOCKED":
      variant = "destructive";
      break;
  }
  
  const baseColorMap = {
    "PLANNING": "bg-blue-50 text-blue-800 border-blue-200",
    "IN_PROGRESS": "bg-amber-50 text-amber-800 border-amber-200",
    "ON_HOLD": "bg-gray-100 text-gray-800 border-gray-200",
    "COMPLETED": "bg-green-50 text-green-800 border-green-200",
    "CANCELLED": "bg-red-50 text-red-800 border-red-200",
    "BACKLOG": "bg-gray-100 text-gray-800 border-gray-200",
    "READY": "bg-blue-50 text-blue-800 border-blue-200", 
    "IN_REVIEW": "bg-purple-50 text-purple-800 border-purple-200",
    "DONE": "bg-green-50 text-green-800 border-green-200",
    "TODO": "bg-gray-100 text-gray-800 border-gray-200",
    "BLOCKED": "bg-red-50 text-red-800 border-red-200",
  };
  
  return (
    <Badge
      variant={variant}
      className={cn(
        "text-xs font-medium px-2.5 py-0.5 rounded-full",
        baseColorMap[status as keyof typeof baseColorMap],
        className
      )}
    >
      {label}
    </Badge>
  );
}
