import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Device, Location, User } from "@shared/schema";
import { Loader2, Plus, Laptop, Smartphone, Monitor, Server, Tablet, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function DevicesPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [locationFilter, setLocationFilter] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch devices, locations, and users
  const { 
    data: devices, 
    isLoading: isLoadingDevices,
    error: devicesError
  } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  const { data: locations } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  useEffect(() => {
    if (devicesError) {
      toast({
        variant: "destructive",
        title: "Error loading devices",
        description: "Failed to load devices. Please try again later."
      });
    }
  }, [devicesError, toast]);

  // Get device icon based on type
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "LAPTOP":
        return <Laptop className="h-5 w-5 mr-2 text-primary" />;
      case "DESKTOP":
        return <Monitor className="h-5 w-5 mr-2 text-primary" />;
      case "TABLET":
        return <Tablet className="h-5 w-5 mr-2 text-primary" />;
      case "PHONE":
        return <Smartphone className="h-5 w-5 mr-2 text-primary" />;
      case "SERVER":
        return <Server className="h-5 w-5 mr-2 text-primary" />;
      default:
        return <HardDrive className="h-5 w-5 mr-2 text-primary" />;
    }
  };

  // Get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Available</Badge>;
      case "ASSIGNED":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Assigned</Badge>;
      case "MAINTENANCE":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Maintenance</Badge>;
      case "RETIRED":
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Retired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Find user name by ID
  const getUserName = (userId?: string) => {
    if (!userId) return "Unassigned";
    const foundUser = users?.find(u => u.id === userId);
    return foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : "Unknown User";
  };

  // Find location name by ID
  const getLocationName = (locationId?: string) => {
    if (!locationId) return "No Location";
    const foundLocation = locations?.find(l => l.id === locationId);
    return foundLocation ? foundLocation.name : "Unknown Location";
  };

  // Filter devices
  const filteredDevices = devices?.filter(device => {
    let matches = true;
    
    // Apply status filter
    if (statusFilter && device.status !== statusFilter) {
      matches = false;
    }
    
    // Apply location filter
    if (locationFilter && device.locationId !== locationFilter) {
      matches = false;
    }
    
    // Apply search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const nameMatch = device.name.toLowerCase().includes(search);
      const serialMatch = device.serialNumber.toLowerCase().includes(search);
      const modelMatch = device.model?.toLowerCase().includes(search) || false;
      
      if (!(nameMatch || serialMatch || modelMatch)) {
        matches = false;
      }
    }
    
    return matches;
  });

  if (isLoadingDevices) {
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
          <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
          <p className="text-muted-foreground">Manage hardware devices and equipment</p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
          <Button onClick={() => setLocation("/devices/new")}>
            <Plus className="h-4 w-4 mr-2" /> Add Device
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="RETIRED">Retired</SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All locations</SelectItem>
              {locations?.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Devices List */}
      {!devices || devices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/20">
          <HardDrive className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-1">No Devices Found</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            You haven't added any devices yet. Devices can be assigned to team members and tracked across your organization.
          </p>
          {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
            <Button onClick={() => setLocation("/devices/new")}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Device
            </Button>
          )}
        </div>
      ) : filteredDevices?.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No devices match your filters</p>
          <Button 
            variant="link" 
            onClick={() => {
              setStatusFilter(undefined);
              setLocationFilter(undefined);
              setSearchTerm("");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices?.map((device) => (
            <Card key={device.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center">
                    {getDeviceIcon(device.type)}
                    {device.name}
                  </CardTitle>
                  {getStatusBadge(device.status)}
                </div>
                <CardDescription className="flex items-center">
                  <span className="font-mono text-xs bg-muted p-1 rounded">
                    {device.serialNumber}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Manufacturer:</span>
                  <span>{device.manufacturer || "Not specified"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Model:</span>
                  <span>{device.model || "Not specified"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Assigned to:</span>
                  <span>{getUserName(device.assignedToId)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{getLocationName(device.locationId)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/devices/${device.id}`}>View Details</Link>
                </Button>
                {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">Actions</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/devices/edit/${device.id}`}>Edit</Link>
                      </DropdownMenuItem>
                      {device.status !== "ASSIGNED" ? (
                        <DropdownMenuItem asChild>
                          <Link to={`/devices/${device.id}/assign`}>Assign</Link>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem asChild>
                          <Link to={`/devices/${device.id}/unassign`}>Unassign</Link>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}