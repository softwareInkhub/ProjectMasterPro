import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Plus, Filter, SearchIcon, ListIcon, ArrowUpDown } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { BacklogItem } from '@shared/schema';

export default function BacklogPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const { toast } = useToast();

  // Fetch backlog items
  const { data: backlogItems, isLoading, isError } = useQuery<BacklogItem[]>({
    queryKey: ['/api/backlog-items'],
  });

  // Handle filtering and searching
  const filteredItems = backlogItems?.filter(item => {
    // Apply search filter
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply priority filter
    const matchesPriority = !priorityFilter || item.priority === priorityFilter;
    
    // Apply type filter
    const matchesType = !typeFilter || item.type === typeFilter;
    
    return matchesSearch && matchesPriority && matchesType;
  });

  // Sort by rank
  const sortedItems = filteredItems ? [...filteredItems].sort((a, b) => {
    // Lower rank values should appear first (higher priority)
    return a.rank.localeCompare(b.rank);
  }) : [];

  // Backlog item delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/backlog-items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete backlog item');
      }
      
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/backlog-items'] });
      toast({
        title: 'Backlog item deleted',
        description: 'The backlog item has been successfully deleted',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete backlog item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });

  // Backlog item move to sprint mutation
  const moveToSprintMutation = useMutation({
    mutationFn: async ({ itemId, sprintId }: { itemId: string, sprintId: string }) => {
      const response = await fetch(`/api/backlog-items/${itemId}/move-to-sprint/${sprintId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to move item to sprint');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/backlog-items'] });
      toast({
        title: 'Item moved',
        description: 'The backlog item has been successfully moved to sprint',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to move item to sprint: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });

  // Helper function to determine priority color
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'LOW': return 'bg-blue-100 text-blue-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'UNASSIGNED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to determine status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'REFINED': return 'bg-purple-100 text-purple-800';
      case 'READY': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'DONE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to determine type icon and text
  const getTypeInfo = (type: string) => {
    switch(type) {
      case 'USER_STORY': 
        return { color: 'text-green-600', label: 'Story' };
      case 'BUG': 
        return { color: 'text-red-600', label: 'Bug' };
      case 'TASK': 
        return { color: 'text-blue-600', label: 'Task' };
      case 'EPIC': 
        return { color: 'text-purple-600', label: 'Epic' };
      case 'FEATURE': 
        return { color: 'text-yellow-600', label: 'Feature' };
      default: 
        return { color: 'text-gray-600', label: type };
    }
  };

  // Handle deletion
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this backlog item?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Failed to load backlog items.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Backlog</h1>
          <p className="text-muted-foreground mt-1 max-w-xl">
            Manage your product backlog. Prioritize and refine items before adding them to sprints.
          </p>
        </div>
        <Button 
          onClick={() => setLocation('/backlog/new')} 
          className="mt-4 md:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Backlog Item
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search backlog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {priorityFilter ? `Priority: ${priorityFilter}` : 'Priority'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setPriorityFilter(null)}>
              All Priorities
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPriorityFilter('CRITICAL')}>
              Critical
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPriorityFilter('HIGH')}>
              High
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPriorityFilter('MEDIUM')}>
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPriorityFilter('LOW')}>
              Low
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPriorityFilter('UNASSIGNED')}>
              Unassigned
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {typeFilter ? `Type: ${typeFilter.replace('_', ' ')}` : 'Type'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setTypeFilter(null)}>
              All Types
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter('USER_STORY')}>
              User Story
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter('BUG')}>
              Bug
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter('TASK')}>
              Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter('EPIC')}>
              Epic
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter('FEATURE')}>
              Feature
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-accent' : ''}>
              List View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewMode('board')} className={viewMode === 'board' ? 'bg-accent' : ''}>
              Board View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : sortedItems.length > 0 ? (
        viewMode === 'list' ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[120px]">Priority</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((item) => {
                  const typeInfo = getTypeInfo(item.type);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">
                        {item.id.substring(0, 8)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${typeInfo.color} border-0`}>
                          {typeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/backlog/${item.id}`} className="hover:underline">
                          {item.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              •••
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setLocation(`/backlog/${item.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setLocation(`/backlog/edit/${item.id}`)}>
                              Edit
                            </DropdownMenuItem>
                            {!item.sprintId && (
                              <DropdownMenuItem disabled>
                                Move to Sprint...
                              </DropdownMenuItem>
                            )}
                            {item.sprintId && (
                              <DropdownMenuItem onSelect={() => moveToSprintMutation.mutate({ 
                                itemId: item.id, 
                                sprintId: '' // This will remove it from sprint
                              })}>
                                Remove from Sprint
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onSelect={() => handleDelete(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['NEW', 'REFINED', 'READY', 'IN_PROGRESS', 'DONE'].map(status => (
              <div key={status} className="flex flex-col h-full">
                <div className="bg-gray-100 p-2 rounded-t-lg border border-b-0 border-gray-200">
                  <h3 className="font-medium">{status.replace('_', ' ')}</h3>
                </div>
                <div className="flex-1 bg-gray-50 p-2 rounded-b-lg border border-gray-200 min-h-[250px]">
                  {sortedItems.filter(item => item.status === status).map(item => {
                    const typeInfo = getTypeInfo(item.type);
                    return (
                      <Card key={item.id} className="mb-2 hover:shadow-md transition-shadow">
                        <CardHeader className="p-3">
                          <div className="flex justify-between items-start">
                            <Badge variant="outline" className={`${typeInfo.color} border-0`}>
                              {typeInfo.label}
                            </Badge>
                            <Badge className={getPriorityColor(item.priority)}>
                              {item.priority}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <Link href={`/backlog/${item.id}`} className="hover:underline">
                            <h4 className="font-medium">{item.title}</h4>
                          </Link>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </CardContent>
                        <CardFooter className="p-3 pt-0 flex justify-between">
                          <span className="text-xs text-muted-foreground">
                            ID: {item.id.substring(0, 8)}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                •••
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => setLocation(`/backlog/${item.id}`)}>
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setLocation(`/backlog/edit/${item.id}`)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onSelect={() => handleDelete(item.id)}
                                className="text-red-500"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <ListIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No backlog items found</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            {searchQuery || priorityFilter || typeFilter 
              ? "No backlog items match your search criteria. Try adjusting your filters."
              : "Get started by creating your first backlog item to organize your product development."}
          </p>
          <div className="mt-6">
            <Button onClick={() => setLocation('/backlog/new')}>Add Backlog Item</Button>
          </div>
        </div>
      )}
    </div>
  );
}