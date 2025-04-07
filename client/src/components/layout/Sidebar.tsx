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
  MenuIcon,
  XIcon,
  UserIcon,
  BookOpenIcon,
  BookIcon,
  LogOutIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/App";

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Projects", href: "/projects", icon: BriefcaseIcon },
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

export default function Sidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  // User initials
  const userInitials = 'U'; // This could be dynamic based on the logged-in user
  
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-full bg-white shadow-md"
        >
          {isMobileMenuOpen ? (
            <XIcon className="h-5 w-5" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white pt-5 pb-4 overflow-y-auto border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900">Project Management</h1>
          </div>
          <div className="mt-8 flex-1 flex flex-col">
            <nav className="flex-1 px-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      isActive
                        ? "bg-gray-100 text-primary-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 flex-shrink-0 h-5 w-5",
                        isActive
                          ? "text-primary-600"
                          : "text-gray-500 group-hover:text-primary-600"
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t p-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 flex items-center justify-center text-white font-medium">
                    {userInitials}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">User</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                onClick={handleLogout}
              >
                <LogOutIcon className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu panel */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">Project Management</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md my-1",
                    isActive
                      ? "bg-gray-100 text-primary-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5",
                      isActive
                        ? "text-primary-600"
                        : "text-gray-500 group-hover:text-primary-600"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 flex border-t p-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 flex items-center justify-center text-white font-medium">
                    {userInitials}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">User</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                onClick={handleLogout}
              >
                <LogOutIcon className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}