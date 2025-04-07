import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  progress?: {
    value: number;
    label: string;
  };
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  progress,
  iconBgColor = "bg-blue-50",
  iconColor = "text-primary-500",
  className,
}: StatsCardProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow p-5", className)}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconBgColor, iconColor)}>
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={cn(
            "font-medium flex items-center",
            trend.isPositive ? "text-green-500" : "text-red-500"
          )}>
            {trend.isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {trend.value}
          </span>
          <span className="ml-2 text-gray-500">{trend.label}</span>
        </div>
      )}
      
      {progress && (
        <div className="mt-4 flex items-center text-sm">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${progress.value}%` }}
            ></div>
          </div>
          <span className="ml-2 text-gray-500">{progress.value}%</span>
        </div>
      )}
    </div>
  );
}
