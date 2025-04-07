import { cn } from "@/lib/utils";
import { formatDistance } from "date-fns";
import { Link } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface Activity {
  id: string;
  user: {
    id: string;
    name: string;
    initials: string;
    avatarColor: string;
  };
  action: string;
  target: {
    name: string;
    id: string;
    type: string;
  };
  comment?: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  className?: string;
  showViewAll?: boolean;
}

export function ActivityFeed({ activities, className, showViewAll = true }: ActivityFeedProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow p-6", className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
        {showViewAll && (
          <Link href="/activities">
            <a className="text-sm text-primary-600 hover:text-primary-700">View all</a>
          </Link>
        )}
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No recent activities
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <Avatar className={cn("w-8 h-8 flex-shrink-0", activity.user.avatarColor)}>
                <AvatarFallback className="text-white text-xs">
                  {activity.user.initials}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <p className="text-sm">
                  <span className="font-medium text-gray-900">{activity.user.name}</span>
                  <span className="text-gray-500"> {activity.action} </span>
                  <Link href={`/${activity.target.type.toLowerCase()}s/${activity.target.id}`}>
                    <a className="font-medium text-gray-900">{activity.target.name}</a>
                  </Link>
                </p>
                
                {activity.comment && (
                  <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded">{activity.comment}</p>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistance(new Date(activity.timestamp), new Date(), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
