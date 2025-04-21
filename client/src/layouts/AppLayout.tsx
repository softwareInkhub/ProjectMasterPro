import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  MenuIcon,
  LayoutDashboard,
  Building2,
  Network,
  Users,
  FolderKanban,
  Calendar,
  ClipboardList,
  ChevronDown,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '@/lib/api';
import { Notification } from '@/types';
import { format } from 'date-fns';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  const unreadNotifications = notifications.filter(n => n.isRead === 'false');

  // Helper to get user initials
  const getUserInitials = () => {
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  const sidebarLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="mr-2 h-5 w-5" /> },
    { path: '/companies', label: 'Companies', icon: <Building2 className="mr-2 h-5 w-5" /> },
    { path: '/departments', label: 'Departments', icon: <Network className="mr-2 h-5 w-5" /> },
    { path: '/teams', label: 'Teams', icon: <Users className="mr-2 h-5 w-5" /> },
    { path: '/users', label: 'Users', icon: <Users className="mr-2 h-5 w-5" /> },
  ];

  const projectLinks = [
    { path: '/projects', label: 'All Projects', icon: <FolderKanban className="mr-2 h-5 w-5" /> },
    { path: '/projects/new', label: 'Create Project', icon: <FolderKanban className="mr-2 h-5 w-5" /> },
    { path: '/timeline', label: 'Timeline', icon: <Calendar className="mr-2 h-5 w-5" /> },
  ];

  const taskLinks = [
    { path: '/tasks', label: 'My Tasks', icon: <ClipboardList className="mr-2 h-5 w-5" /> },
    { path: '/tasks/kanban', label: 'Kanban Board', icon: <ClipboardList className="mr-2 h-5 w-5" /> },
  ];
  
  // Agile management links
  const agileLinks = [
    { path: '/sprints', label: 'Sprints', icon: <Calendar className="mr-2 h-5 w-5" /> },
    { path: '/backlog', label: 'Backlog', icon: <ClipboardList className="mr-2 h-5 w-5" /> },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar (desktop) */}
      <aside className={`w-64 bg-white shadow-md hidden md:block`}>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-primary-700">Project Management</h1>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="p-4">
          <div className="space-y-1">
            {sidebarLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a 
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded",
                    location === link.path 
                      ? "bg-primary-50 text-primary-700" 
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              </Link>
            ))}
          </div>
          
          {/* Projects Navigation Group */}
          <div className="pt-4 border-t border-gray-200 mt-4">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Projects
            </h3>
            <div className="mt-2 space-y-1">
              {projectLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <a 
                    className={cn(
                      "flex items-center px-2 py-2 text-sm font-medium rounded",
                      location === link.path 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </a>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Tasks Navigation Group */}
          <div className="pt-4 border-t border-gray-200 mt-4">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tasks
            </h3>
            <div className="mt-2 space-y-1">
              {taskLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <a 
                    className={cn(
                      "flex items-center px-2 py-2 text-sm font-medium rounded",
                      location === link.path 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </a>
                </Link>
              ))}
            </div>
          </div>

          {/* Agile Management Group */}
          <div className="pt-4 border-t border-gray-200 mt-4">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Agile Management
            </h3>
            <div className="mt-2 space-y-1">
              {agileLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <a 
                    className={cn(
                      "flex items-center px-2 py-2 text-sm font-medium rounded",
                      location === link.path 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </aside>
      
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-75 z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform z-30 transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-primary-700">Project Management</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(false)}
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="p-4">
          <div className="space-y-1">
            {sidebarLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a 
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded",
                    location === link.path 
                      ? "bg-primary-50 text-primary-700" 
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              </Link>
            ))}
          </div>
          
          {/* Projects Navigation Group */}
          <div className="pt-4 border-t border-gray-200 mt-4">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Projects
            </h3>
            <div className="mt-2 space-y-1">
              {projectLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <a 
                    className={cn(
                      "flex items-center px-2 py-2 text-sm font-medium rounded",
                      location === link.path 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </a>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Tasks Navigation Group */}
          <div className="pt-4 border-t border-gray-200 mt-4">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tasks
            </h3>
            <div className="mt-2 space-y-1">
              {taskLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <a 
                    className={cn(
                      "flex items-center px-2 py-2 text-sm font-medium rounded",
                      location === link.path 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </a>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Agile Management Group (Mobile) */}
          <div className="pt-4 border-t border-gray-200 mt-4">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Agile Management
            </h3>
            <div className="mt-2 space-y-1">
              {agileLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <a 
                    className={cn(
                      "flex items-center px-2 py-2 text-sm font-medium rounded",
                      location === link.path 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex justify-between items-center px-4 py-3">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={() => setMobileMenuOpen(true)}
              >
                <MenuIcon className="h-6 w-6 text-gray-500" />
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">
                  <FolderKanban className="h-4 w-4" />
                </span>
                <Link href="/projects">
                  <a className="text-sm text-gray-600">Projects</a>
                </Link>
                {location.includes('/projects/') && location !== '/projects/new' && (
                  <>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-800">
                      Project Details
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-gray-500" />
                    {unreadNotifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 text-xs text-white flex items-center justify-center">
                        {unreadNotifications.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <h3 className="font-medium">Notifications</h3>
                    {unreadNotifications.length > 0 && (
                      <Badge variant="secondary">{unreadNotifications.length} new</Badge>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div 
                          key={notification.id} 
                          className={cn(
                            "px-4 py-2 border-b last:border-0 hover:bg-gray-50",
                            notification.isRead === "false" && "bg-blue-50"
                          )}
                        >
                          <div className="text-sm font-medium">{notification.message}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-2 border-t text-center">
                      <Link href="/notifications">
                        <a className="text-sm text-primary-600 hover:text-primary-700">
                          View all notifications
                        </a>
                      </Link>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* User menu */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary-500 text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden md:block text-sm font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <a className="cursor-pointer w-full">Profile</a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <a className="cursor-pointer w-full">Settings</a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
