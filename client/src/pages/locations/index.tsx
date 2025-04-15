import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Location, locationTypes } from "@shared/schema";
import { Loader2, Plus, MapPin, Building, MapPinned } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function LocationsPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const { 
    data: locations, 
    isLoading,
    error 
  } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading locations",
        description: "Failed to load locations. Please try again later."
      });
    }
  }, [error, toast]);

  const formatAddress = (location: Location) => {
    const parts = [
      location.address,
      location.city,
      location.state,
      location.zipCode,
      location.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
          <p className="text-muted-foreground">Manage organization locations and facilities</p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
          <Button onClick={() => setLocation("/locations/new")}>
            <Plus className="h-4 w-4 mr-2" /> Add Location
          </Button>
        )}
      </div>

      {locations?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/20">
          <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-1">No Locations Found</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            You haven't added any locations yet. Locations help you track where your equipment and teams are based.
          </p>
          {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
            <Button onClick={() => setLocation("/locations/new")}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Location
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations?.map((location) => (
            <Card key={location.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <MapPinned className="h-5 w-5 mr-2 text-primary" />
                  {location.name}
                </CardTitle>
                <CardDescription>{formatAddress(location)}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="h-4 w-4 mr-2" />
                  <span>Company Location</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/locations/${location.id}`}>View Details</Link>
                </Button>
                {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/locations/edit/${location.id}`}>Edit</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}