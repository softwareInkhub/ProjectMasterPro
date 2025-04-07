import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusIcon, FilterIcon, SortAscIcon, BuildingIcon, UserIcon, MapPinIcon } from "lucide-react";
import { useLocation } from "wouter";

export default function CompaniesPage() {
  const [, setLocation] = useLocation();
  const [filterActive, setFilterActive] = useState("all");

  // Sample companies data - this would come from an API in the real application
  const companies = [
    {
      id: 1,
      name: "Acme Corporation",
      description: "Global leader in technology solutions",
      industry: "Technology",
      employees: 1500,
      location: "New York, USA",
      founded: "1985",
      website: "https://acme-corp.example.com",
      logo: "🏢",
      status: "Active"
    },
    {
      id: 2,
      name: "Globex Industries",
      description: "Manufacturing and industrial solutions provider",
      industry: "Manufacturing",
      employees: 3200,
      location: "Chicago, USA",
      founded: "1974",
      website: "https://globex-ind.example.com",
      logo: "🏭",
      status: "Active"
    },
    {
      id: 3,
      name: "Initech Systems",
      description: "Enterprise software and IT services",
      industry: "Software",
      employees: 850,
      location: "Austin, USA",
      founded: "1999",
      website: "https://initech.example.com",
      logo: "💻",
      status: "Inactive"
    },
    {
      id: 4,
      name: "Massive Dynamics",
      description: "Research and development in emerging technologies",
      industry: "R&D",
      employees: 1200,
      location: "Boston, USA",
      founded: "2005",
      website: "https://massive-dyn.example.com",
      logo: "🔬",
      status: "Active"
    },
    {
      id: 5,
      name: "Stark Industries",
      description: "Advanced weapons and defense systems",
      industry: "Defense",
      employees: 4500,
      location: "Malibu, USA",
      founded: "1940",
      website: "https://stark-ind.example.com",
      logo: "⚙️",
      status: "Active"
    }
  ];

  // Filter companies based on active status filter
  const filteredCompanies = filterActive === "all" 
    ? companies 
    : companies.filter(company => 
        filterActive === "active" 
          ? company.status === "Active" 
          : company.status === "Inactive"
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
      
      {/* Companies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card 
            key={company.id} 
            className="hover:shadow-md transition-shadow cursor-pointer" 
            onClick={() => setLocation(`/companies/${company.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-3xl">{company.logo}</div>
                  <div>
                    <CardTitle>{company.name}</CardTitle>
                    <CardDescription>{company.description}</CardDescription>
                  </div>
                </div>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  company.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {company.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <BuildingIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Industry:</span>
                  <span className="font-medium">{company.industry}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Employees:</span>
                  <span className="font-medium">{company.employees.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPinIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{company.location}</span>
                </div>
                <div className="pt-2 mt-2 border-t text-sm text-right">
                  <Button variant="ghost" size="sm" className="hover:text-primary-600">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}