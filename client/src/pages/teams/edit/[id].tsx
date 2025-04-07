import { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Team type
interface Team {
  id: string;
  name: string;
  description: string | null;
  departmentId: string;
  leadId: string | null;
  createdAt: string;
  updatedAt: string;
}

// User type for team lead selection
interface User {
  id: string;
  name: string;
}

// Department type for dropdown
interface Department {
  id: string;
  name: string;
}

// Define schema for form validation
const formSchema = z.object({
  name: z.string()
    .min(1, { message: 'Team name is required' })
    .max(100, { message: 'Team name cannot exceed 100 characters' }),
  description: z.string().nullable().optional(),
  departmentId: z.string().min(1, { message: 'Department is required' }),
  leadId: z.string().nullable().optional(),
});

export default function EditTeamPage() {
  const [, params] = useRoute('/teams/edit/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const teamId = params?.id || '';
  const queryClient = useQueryClient();

  // Fetch departments for dropdown
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  // Fetch users for team lead dropdown
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Fetch current team data
  const { data: team, isLoading, error } = useQuery<Team>({
    queryKey: ['/api/teams', teamId],
    enabled: !!teamId,
  });

  // Setup form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      departmentId: '',
      leadId: null,
    },
  });

  // Update form values when team data is loaded
  useEffect(() => {
    if (team) {
      form.reset({
        name: team.name,
        description: team.description || '',
        departmentId: team.departmentId,
        leadId: team.leadId,
      });
    }
  }, [team, form]);

  // Mutation for updating the team
  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest('PUT', `/api/teams/${teamId}`, values);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Team updated',
        description: 'The team has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      setLocation(`/teams/${teamId}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update team.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateMutation.mutate(values);
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Team</h2>
        <p className="text-gray-600 mb-6">
          We couldn't load the team details. Please try again later.
        </p>
        <Button onClick={() => setLocation('/teams')}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Teams
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with navigation */}
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation(`/teams/${teamId}`)}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="h-6 border-l border-gray-300"></div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLoading ? <Skeleton className="h-8 w-40" /> : `Edit Team: ${team?.name}`}
          </h1>
        </div>
      </header>

      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter team name" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of the team within the organization.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter team description" 
                            {...field} 
                            value={field.value || ''}
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description of the team's purpose and responsibilities.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="departmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((department) => (
                                <SelectItem key={department.id} value={department.id}>
                                  {department.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The department this team belongs to.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="leadId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Lead (Optional)</FormLabel>
                          <Select
                            value={field.value || ''}
                            onValueChange={(value) => field.onChange(value === 'null' ? null : value)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a team lead" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="null">None</SelectItem>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The person who leads this team.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation(`/teams/${teamId}`)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <SaveIcon className="mr-2 h-4 w-4" /> Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}