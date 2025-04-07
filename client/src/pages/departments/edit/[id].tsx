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

// Department type
interface Department {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
  parentDepartmentId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Company type for dropdown
interface Company {
  id: string;
  name: string;
}

// Define schema for form validation
const formSchema = z.object({
  name: z.string()
    .min(1, { message: 'Department name is required' })
    .max(100, { message: 'Department name cannot exceed 100 characters' }),
  description: z.string().nullable().optional(),
  companyId: z.string().min(1, { message: 'Company is required' }),
  parentDepartmentId: z.string().nullable().optional(),
});

export default function EditDepartmentPage() {
  const [, params] = useRoute('/departments/edit/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const departmentId = params?.id || '';
  const queryClient = useQueryClient();

  // Fetch companies for dropdown
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  // Fetch departments for parent department dropdown
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  // Fetch current department data
  const { data: department, isLoading, error } = useQuery<Department>({
    queryKey: ['/api/departments', departmentId],
    enabled: !!departmentId,
  });

  // Setup form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      companyId: '',
      parentDepartmentId: null,
    },
  });

  // Update form values when department data is loaded
  useEffect(() => {
    if (department) {
      form.reset({
        name: department.name,
        description: department.description || '',
        companyId: department.companyId,
        parentDepartmentId: department.parentDepartmentId,
      });
    }
  }, [department, form]);

  // Mutation for updating the department
  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest('PUT', `/api/departments/${departmentId}`, values);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Department updated',
        description: 'The department has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      setLocation(`/departments/${departmentId}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update department.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateMutation.mutate(values);
  };

  // Filter out current department from parent department options to prevent circular references
  const parentDepartmentOptions = departments.filter(dept => dept.id !== departmentId);

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Department</h2>
        <p className="text-gray-600 mb-6">
          We couldn't load the department details. Please try again later.
        </p>
        <Button onClick={() => setLocation('/departments')}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to Departments
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
            onClick={() => setLocation(`/departments/${departmentId}`)}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="h-6 border-l border-gray-300"></div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLoading ? <Skeleton className="h-8 w-40" /> : `Edit Department: ${department?.name}`}
          </h1>
        </div>
      </header>

      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Department Information</CardTitle>
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
                        <FormLabel>Department Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter department name" {...field} />
                        </FormControl>
                        <FormDescription>
                          The official name of the department within the organization.
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
                            placeholder="Enter department description" 
                            {...field} 
                            value={field.value || ''}
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description of the department's purpose and responsibilities.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="companyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a company" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The company this department belongs to.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="parentDepartmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Department (Optional)</FormLabel>
                          <Select
                            value={field.value || ''}
                            onValueChange={(value) => field.onChange(value === '' ? null : value)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a parent department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              {parentDepartmentOptions.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            If this is a sub-department, select its parent.
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
                      onClick={() => setLocation(`/departments/${departmentId}`)}
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