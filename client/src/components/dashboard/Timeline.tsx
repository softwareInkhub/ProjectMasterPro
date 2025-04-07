import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { BookmarkIcon, FlagIcon, ClockIcon, CheckIcon } from "lucide-react";

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'start' | 'milestone' | 'epic' | 'completion' | 'upcoming';
  completed: boolean;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const getIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'start':
        return <FlagIcon className="h-4 w-4" />;
      case 'milestone':
        return <ClockIcon className="h-4 w-4" />;
      case 'epic':
        return <BookmarkIcon className="h-4 w-4" />;
      case 'completion':
        return <CheckIcon className="h-4 w-4" />;
      case 'upcoming':
        return <FlagIcon className="h-4 w-4" />;
      default:
        return <FlagIcon className="h-4 w-4" />;
    }
  };
  
  const getIconBackground = (type: TimelineEvent['type'], completed: boolean) => {
    if (!completed) return "bg-gray-300";
    
    switch (type) {
      case 'start':
        return "bg-primary-500";
      case 'milestone':
        return "bg-amber-500";
      case 'epic':
        return "bg-indigo-500";
      case 'completion':
        return "bg-green-500";
      case 'upcoming':
        return "bg-gray-300";
      default:
        return "bg-primary-500";
    }
  };
  
  return (
    <div className={cn("bg-white rounded-lg shadow p-6", className)}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h2>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-6 relative">
          {sortedEvents.map(event => (
            <div key={event.id} className="flex gap-4">
              <div className="relative">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white z-10 relative",
                  getIconBackground(event.type, event.completed)
                )}>
                  {getIcon(event.type)}
                </div>
              </div>
              
              <div className={cn(
                "flex-1 rounded-lg p-4",
                event.completed ? "bg-gray-50" : "bg-gray-50 border border-dashed border-gray-300"
              )}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(event.date), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
