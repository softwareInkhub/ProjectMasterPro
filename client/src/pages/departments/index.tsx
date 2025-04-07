import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  ArrowUpDownIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  FolderIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { IndeterminateCheckbox } from '@/components/ui/indeterminate-checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

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

export default function DepartmentsPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch departments
  const { data: departments = [], isLoading, error } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  // Fetch companies for filter
  const { data: companies = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['/api/companies'],
  });

  // Filter departments based on search and company filter
  const filteredDepartments = departments.filter(department => {
    const matchesSearch = department.name.toLowerCase().includes(search.toLowerCase()) || 
                         (department.description && department.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCompany = companyFilter && companyFilter !== 'all' ? department.companyId === companyFilter : true;
    return matchesSearch && matchesCompany;
  });

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get company name helper
  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : 'Unknown';
  };

  // Handle checkbox selection
  const handleSelect = (departmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDepartments(prev => [...prev, departmentId]);
    } else {
      setSelectedDepartments(prev => prev.filter(id => id !== departmentId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDepartments(filteredDepartments.map(d => d.id));
    } else {
      setSelectedDepartments([]);
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Departments</h2>
        <p className="text-gray-600 mb-6">
          We couldn't load the departments. Please try again later.
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderIcon className="h-6 w-6 text-primary-600" />
            Departments
          </h1>
          <Button onClick={() => setLocation('/departments/new')}>
            <PlusIcon className="mr-2 h-4 w-4" /> New Department
          </Button>
        </div>
      </header>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search departments..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-64">
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by company" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch actions */}
      {selectedDepartments.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-md">
          <span className="text-sm font-medium">
            {selectedDepartments.length} department{selectedDepartments.length !== 1 ? 's' : ''} selected
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // This would be a batch delete in a real app
                toast({
                  title: 'Batch delete',
                  description: `${selectedDepartments.length} departments would be deleted`,
                });
                setSelectedDepartments([]);
              }}
            >
              <TrashIcon className="mr-2 h-4 w-4" /> Delete Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDepartments([])}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="p-12 text-center">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No departments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {search || companyFilter ? (
                  "No departments match your search criteria."
                ) : (
                  "Get started by creating a new department."
                )}
              </p>
              <div className="mt-6">
                <Button onClick={() => setLocation('/departments/new')}>
                  <PlusIcon className="mr-2 h-4 w-4" /> New Department
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <IndeterminateCheckbox
                        checked={selectedDepartments.length === filteredDepartments.length && filteredDepartments.length > 0}
                        indeterminate={selectedDepartments.length > 0 && selectedDepartments.length < filteredDepartments.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all departments"
                      />
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="font-medium">
                        Name <ArrowUpDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Company</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="hidden lg:table-cell">Last Updated</TableHead>
                    <TableHead className="w-20 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.map((department) => (
                    <TableRow key={department.id} className="hover:bg-muted/50 cursor-pointer">
                      <TableCell className="p-2">
                        <IndeterminateCheckbox
                          checked={selectedDepartments.includes(department.id)}
                          onCheckedChange={(checked) => handleSelect(department.id, !!checked)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select ${department.name}`}
                        />
                      </TableCell>
                      <TableCell 
                        className="font-medium"
                        onClick={() => setLocation(`/departments/${department.id}`)}
                      >
                        <div className="flex flex-col">
                          <span className="hover:text-primary truncate">{department.name}</span>
                          {department.description && (
                            <span className="text-xs text-muted-foreground truncate max-w-xs">
                              {department.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell 
                        className="hidden md:table-cell"
                        onClick={() => setLocation(`/departments/${department.id}`)}
                      >
                        <Badge variant="outline" className="hover:bg-secondary">
                          {getCompanyName(department.companyId)}
                        </Badge>
                      </TableCell>
                      <TableCell 
                        className="hidden md:table-cell text-muted-foreground"
                        onClick={() => setLocation(`/departments/${department.id}`)}
                      >
                        {formatDate(department.createdAt)}
                      </TableCell>
                      <TableCell 
                        className="hidden lg:table-cell text-muted-foreground"
                        onClick={() => setLocation(`/departments/${department.id}`)}
                      >
                        {formatDate(department.updatedAt)}
                      </TableCell>
                      <TableCell className="p-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="sr-only">Open menu</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                                <path d="M4 8C4 8.53043 3.78929 9.03914 3.41421 9.41421C3.03914 9.78929 2.53043 10 2 10C1.46957 10 0.960859 9.78929 0.585786 9.41421C0.210714 9.03914 0 8.53043 0 8C0 7.46957 0.210714 6.96086 0.585786 6.58579C0.960859 6.21071 1.46957 6 2 6C2.53043 6 3.03914 6.21071 3.41421 6.58579C3.78929 6.96086 4 7.46957 4 8ZM10 8C10 8.53043 9.78929 9.03914 9.41421 9.41421C9.03914 9.78929 8.53043 10 8 10C7.46957 10 6.96086 9.78929 6.58579 9.41421C6.21071 9.03914 6 8.53043 6 8C6 7.46957 6.21071 6.96086 6.58579 6.58579C6.96086 6.21071 7.46957 6 8 6C8.53043 6 9.03914 6.21071 9.41421 6.58579C9.78929 6.96086 10 7.46957 10 8ZM16 8C16 8.53043 15.7893 9.03914 15.4142 9.41421C15.0391 9.78929 14.5304 10 14 10C13.4696 10 12.9609 9.78929 12.5858 9.41421C12.2107 9.03914 12 8.53043 12 8C12 7.46957 12.2107 6.96086 12.5858 6.58579C12.9609 6.21071 13.4696 6 14 6C14.5304 6 15.0391 6.21071 15.4142 6.58579C15.7893 6.96086 16 7.46957 16 8Z" fill="currentColor"/>
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setLocation(`/departments/${department.id}`)}>
                              <EyeIcon className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLocation(`/departments/edit/${department.id}`)}>
                              <PencilIcon className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => {
                                toast({
                                  title: 'Delete department',
                                  description: `You would delete ${department.name}`,
                                  variant: 'destructive',
                                });
                              }}
                            >
                              <TrashIcon className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}