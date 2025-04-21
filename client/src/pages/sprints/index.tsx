import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Plus, Filter, SearchIcon, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Sprint } from '@shared/schema';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';

export default function SprintsPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch sprints
  const { data: sprints, isLoading, isError } = useQuery<Sprint[]>({
    queryKey: ['/api/sprints'],
  });

  // Handle filtering and searching
  const filteredSprints = sprints?.filter(sprint => {
    // Apply search filter
    const matchesSearch = !searchQuery || 
      sprint.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      sprint.goal?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = !statusFilter || sprint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get unique projects to populate filter
  const projects = sprints ? [...new Set(sprints.map(sprint => sprint.projectId))] : [];

  // Helper function to determine status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PLANNING': return 'bg-blue-100 text-blue-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'; 
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Sprint delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/sprints/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete sprint');
      }
      
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sprints'] });
      toast({
        title: 'Sprint deleted',
        description: 'The sprint has been successfully deleted',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete sprint: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });

  // Handle deletion
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this sprint?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Failed to load sprints.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Sprints</h1>
          <p className="text-muted-foreground mt-1 max-w-xl">
            Plan and track your team's progress with sprints. Organize work into time-bound iterations.
          </p>
        </div>
        <Button 
          onClick={() => setLocation('/sprints/new')} 
          className="mt-4 md:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Sprint
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search sprints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {statusFilter ? `Status: ${statusFilter}` : 'Filter'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('PLANNING')}>
              Planning
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('ACTIVE')}>
              Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('REVIEW')}>
              Review
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('COMPLETED')}>
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('CANCELLED')}>
              Cancelled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <ResponsiveGrid>
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="min-h-[200px]">
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-20" />
              </CardFooter>
            </Card>
          ))}
        </ResponsiveGrid>
      ) : filteredSprints && filteredSprints.length > 0 ? (
        <ResponsiveGrid>
          {filteredSprints.map((sprint) => (
            <Card key={sprint.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{sprint.name}</CardTitle>
                  <Badge className={getStatusColor(sprint.status)}>
                    {sprint.status.replace('_', ' ')}
                  </Badge>
                </div>
                {sprint.teamId && (
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    Team ID: {sprint.teamId.substring(0, 8)}...
                  </div>
                )}
              </CardHeader>
              <CardContent className="pb-3">
                {sprint.goal && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {sprint.goal.length > 150
                      ? `${sprint.goal.substring(0, 150)}...`
                      : sprint.goal}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm mt-3">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span>
                      {sprint.startDate 
                        ? format(new Date(sprint.startDate), 'MMM d') 
                        : 'No start date'}
                    </span>
                  </div>
                  <span>-</span>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span>
                      {sprint.endDate 
                        ? format(new Date(sprint.endDate), 'MMM d') 
                        : 'No end date'}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Link href={`/sprints/${sprint.id}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      •••
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setLocation(`/sprints/edit/${sprint.id}`)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onSelect={() => handleDelete(sprint.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </ResponsiveGrid>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No sprints found</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            {searchQuery || statusFilter
              ? "No sprints match your search criteria. Try adjusting your filters."
              : "Get started by creating your first sprint to organize your team's work."}
          </p>
          <div className="mt-6">
            <Button onClick={() => setLocation('/sprints/new')}>Create Sprint</Button>
          </div>
        </div>
      )}
    </div>
  );
}