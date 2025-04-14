import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  PlusIcon, 
  FilterIcon, 
  SortAscIcon, 
  BuildingIcon, 
  UserIcon,
  Loader2,
  Trash2Icon
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Company } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CompaniesPageProps {
  new?: boolean;
  detail?: boolean;
}

// Define the lazy components outside of the component function
const NewCompanyPage = React.lazy(() => import('./new'));
const CompanyDetailPage = React.lazy(() => import('./[id]'));

export default function CompaniesPage({ new: isNew, detail: isDetail }: CompaniesPageProps = {}) {
  const [, setLocation] = useLocation();
  const [filterActive, setFilterActive] = useState("all");
  const { toast } = useToast();
  const params = useParams();

  // Handle different rendering modes
  if (isNew) {
    return (
      <React.Suspense fallback={<div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>}>
        <NewCompanyPage />
      </React.Suspense>
    );
  }
  
  if (isDetail && params.id) {
    return (
      <React.Suspense fallback={<div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>}>
        <CompanyDetailPage />
      </React.Suspense>
    );
  }

  // For the main companies list view
  // Fetch companies data from API
  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: getQueryFn()
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      await apiRequest("DELETE", `/api/companies/${companyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Company deleted",
        description: "The company has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete company",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Define company logos based on industry
  const getCompanyLogo = (industry?: string) => {
    switch (industry?.toLowerCase()) {
      case 'technology': return '🏢';
      case 'manufacturing': return '🏭';
      case 'software': return '💻';
      case 'r&d': return '🔬';
      case 'defense': return '⚙️';
      default: return '🏢';
    }
  };

  // Add status to companies if not present
  const companiesWithStatus = companies.map((company: any) => ({
    ...company,
    status: company.status || "ACTIVE" // Default to ACTIVE if status is not present
  }));

  // Filter companies based on active status filter
  const filteredCompanies = filterActive === "all" 
    ? companiesWithStatus 
    : companiesWithStatus.filter((company: any) => 
        filterActive === "active" 
          ? company.status === "ACTIVE" 
          : company.status === "INACTIVE"
      );

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
            <p className="text-gray-600 mt-1">Manage your organization's companies</p>
          </div>
          <Button onClick={() => setLocation('/companies/new')}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add Company
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
          <span className="text-sm text-gray-500">Status:</span>
          <Button 
            variant="outline" 
            size="sm" 
            className={filterActive === "all" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : ""}
            onClick={() => setFilterActive("all")}
          >
            All
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={filterActive === "active" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
            onClick={() => setFilterActive("active")}
          >
            Active
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={filterActive === "inactive" ? "bg-gray-100 text-gray-800 hover:bg-gray-200" : ""}
            onClick={() => setFilterActive("inactive")}
          >
            Inactive
          </Button>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-500 mb-6">
          <p className="font-medium">Error loading companies:</p>
          <p>{(error as Error).message}</p>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && !error && filteredCompanies.length === 0 && (
        <div className="text-center p-8 border rounded-lg">
          <BuildingIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No companies found</h3>
          <p className="text-gray-500 mb-4">
            {filterActive !== "all" 
              ? `No ${filterActive} companies found. Try adjusting your filters.` 
              : "Let's create your first company to get started."}
          </p>
          <Button onClick={() => setLocation('/companies/new')}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add Company
          </Button>
        </div>
      )}
      
      {/* Companies List */}
      {!isLoading && !error && filteredCompanies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company: any) => (
            <Card 
              key={company.id} 
              className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => setLocation(`/companies/${company.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-3xl">{getCompanyLogo(company.name)}</div>
                    <div>
                      <CardTitle>{company.name}</CardTitle>
                      <CardDescription>{company.description}</CardDescription>
                    </div>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    company.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {company.status === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <BuildingIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Website:</span>
                    <span className="font-medium">{company.website || "Not specified"}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t flex justify-between items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this company?')) {
                          deleteCompanyMutation.mutate(company.id);
                        }
                      }}
                    >
                      <Trash2Icon className="h-4 w-4 mr-1" /> Delete
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:text-primary-600">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}