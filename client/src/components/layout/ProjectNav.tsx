import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3Icon,
  BriefcaseIcon,
  ClipboardListIcon,
  FolderIcon,
  HomeIcon,
  LandmarkIcon,
  SettingsIcon,
  UsersIcon,
  UserIcon,
  BookOpenIcon,
  BookIcon,
  LogOutIcon,
  ListIcon,
  SparklesIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

// Define navigation items - guaranteed to include Sprints and Backlog
const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Projects", href: "/projects", icon: BriefcaseIcon },
  { name: "Sprints", href: "/sprints", icon: SparklesIcon },
  { name: "Backlog", href: "/backlog", icon: ListIcon },
  { name: "Epics", href: "/epics", icon: BookOpenIcon },
  { name: "Stories", href: "/stories", icon: BookIcon },
  { name: "Tasks", href: "/tasks", icon: ClipboardListIcon },
  { name: "Companies", href: "/companies", icon: LandmarkIcon },
  { name: "Departments", href: "/departments", icon: FolderIcon },
  { name: "Teams", href: "/teams", icon: UsersIcon },
  { name: "Users", href: "/users", icon: UserIcon },
  { name: "Reports", href: "/reports", icon: BarChart3Icon },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export default function ProjectNav() {
  const [location] = useLocation();
  
  return (
    <div className="bg-white border-r h-full w-64 fixed top-0 left-0 overflow-y-auto">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Project Management</h1>
      </div>
      
      <nav className="p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            
            return (
              <a 
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    isActive
                      ? "text-primary-600"
                      : "text-gray-500"
                  )}
                />
                {item.name}
              </a>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 border-t mt-auto">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-medium">
            U
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">User</p>
          </div>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={() => {
              localStorage.removeItem('authToken');
              window.location.href = '/login';
            }}
          >
            <LogOutIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}