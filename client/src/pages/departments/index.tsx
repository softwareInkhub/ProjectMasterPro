import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  PlusIcon, 
  FilterIcon, 
  SortAscIcon, 
  FolderIcon, 
  UserIcon, 
  BuildingIcon, 
  BarChart3Icon 
} from "lucide-react";
import { useLocation } from "wouter";

export default function DepartmentsPage() {
  const [, setLocation] = useLocation();

  // Sample departments data - this would come from an API in the real application
  const departments = [
    {
      id: 1,
      name: "Engineering",
      description: "Software development and technical operations",
      companyId: 1,
      companyName: "Acme Corporation",
      headCount: 45,
      manager: "John Smith",
      budget: 2500000,
      teams: 5,
      projects: 8
    },
    {
      id: 2,
      name: "Marketing",
      description: "Brand management and marketing operations",
      companyId: 1,
      companyName: "Acme Corporation",
      headCount: 22,
      manager: "Emily Johnson",
      budget: 1800000,
      teams: 3,
      projects: 4
    },
    {
      id: 3,
      name: "Finance",
      description: "Financial planning and accounting",
      companyId: 1,
      companyName: "Acme Corporation",
      headCount: 18,
      manager: "Michael Wilson",
      budget: 950000,
      teams: 2,
      projects: 3
    },
    {
      id: 4,
      name: "Human Resources",
      description: "Recruitment and employee management",
      companyId: 1,
      companyName: "Acme Corporation",
      headCount: 12,
      manager: "Sarah Brown",
      budget: 750000,
      teams: 2,
      projects: 3
    },
    {
      id: 5,
      name: "Research & Development",
      description: "New product research and innovation",
      companyId: 2,
      companyName: "Globex Industries",
      headCount: 35,
      manager: "David Lee",
      budget: 3200000,
      teams: 4,
      projects: 6
    }
  ];

  // Format currency for budget
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
            <p className="text-gray-600 mt-1">Manage your organization's departments and teams</p>
          </div>
          <Button onClick={() => setLocation('/departments/new')}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add Department
          </Button>
        </div>
      </header>
      
      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm">
            <FilterIcon className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" size="sm">
            <SortAscIcon className="mr-2 h-4 w-4" /> Sort
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Company:</span>
          <Button variant="outline" size="sm" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            All Companies
          </Button>
          <Button variant="outline" size="sm">
            Acme Corporation
          </Button>
        </div>
      </div>
      
      {/* Departments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {departments.map((department) => (
          <Card 
            key={department.id} 
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FolderIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <CardTitle>{department.name}</CardTitle>
                    <CardDescription>{department.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <BuildingIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Company:</span>
                    <span 
                      className="font-medium cursor-pointer hover:text-primary-600"
                      onClick={() => setLocation(`/companies/${department.companyId}`)}
                    >
                      {department.companyName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Manager:</span>
                    <span className="font-medium">{department.manager}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3Icon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">{formatCurrency(department.budget)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Headcount</span>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{department.headCount}</span>
                      <span className="text-xs text-gray-500">people</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg text-center">
                      <span className="text-sm text-gray-600">Teams</span>
                      <p className="text-lg font-bold">{department.teams}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg text-center">
                      <span className="text-sm text-gray-600">Projects</span>
                      <p className="text-lg font-bold">{department.projects}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation(`/teams?departmentId=${department.id}`)}
              >
                View Teams
              </Button>
              <div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => setLocation(`/departments/${department.id}/edit`)}
                >
                  Edit
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => setLocation(`/departments/${department.id}`)}
                >
                  Details
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}