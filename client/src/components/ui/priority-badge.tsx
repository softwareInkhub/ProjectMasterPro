import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const priorityColorMap = {
    "LOW": "bg-green-100 text-green-800 border-green-200",
    "MEDIUM": "bg-amber-100 text-amber-800 border-amber-200",
    "HIGH": "bg-orange-100 text-orange-800 border-orange-200",
    "CRITICAL": "bg-red-100 text-red-800 border-red-200",
  };
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium px-2.5 py-0.5 rounded",
        priorityColorMap[priority],
        className
      )}
    >
      {priority}
    </Badge>
  );
}
