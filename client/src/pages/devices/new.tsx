import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, HardDrive } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { InsertDevice, Company, Location, User, insertDeviceSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

// Extend the schema to add validation
const formSchema = insertDeviceSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  serialNumber: z.string().min(2, { message: "Serial number is required" }),
  type: z.enum(["LAPTOP", "DESKTOP", "TABLET", "PHONE", "SERVER", "OTHER"], {
    required_error: "Device type is required",
  }),
  companyId: z.string().min(1, { message: "Company is required" }),
});

export default function NewDevicePage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch companies, locations, and users
  const { data: companies, isLoading: isLoadingCompanies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const { data: locations } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      serialNumber: "",
      type: "LAPTOP",
      status: "AVAILABLE",
      manufacturer: "",
      model: "",
      notes: "",
      companyId: "",
      departmentId: undefined,
      locationId: undefined,
      assignedToId: undefined,
    },
  });

  // Mutation for creating a device
  const createDeviceMutation = useMutation({
    mutationFn: async (data: InsertDevice) => {
      const response = await apiRequest("POST", "/api/devices", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create device");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Device created",
        description: "The device has been created successfully.",
      });
      setLocation("/devices");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      setIsSubmitting(false);
    },
  });

  // Submit handler
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    createDeviceMutation.mutate(data);
  };

  // Filter locations by company
  const filteredLocations = locations?.filter(
    location => location.companyId === form.watch("companyId")
  );

  // Filter users by company
  const filteredUsers = users?.filter(
    user => user.companyId === form.watch("companyId")
  );

  if (isLoadingCompanies) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/devices")} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Device</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies?.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. MacBook Pro 16" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. ABC123XYZ456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LAPTOP">Laptop</SelectItem>
                            <SelectItem value="DESKTOP">Desktop</SelectItem>
                            <SelectItem value="TABLET">Tablet</SelectItem>
                            <SelectItem value="PHONE">Phone</SelectItem>
                            <SelectItem value="SERVER">Server</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AVAILABLE">Available</SelectItem>
                            <SelectItem value="ASSIGNED">Assigned</SelectItem>
                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                            <SelectItem value="RETIRED">Retired</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Apple, Dell, HP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. XPS 15, ThinkPad T14" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!form.watch("companyId") || !filteredLocations?.length}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              !form.watch("companyId") 
                                ? "Select a company first" 
                                : !filteredLocations?.length 
                                  ? "No locations available" 
                                  : "Select location"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredLocations?.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("status") === "ASSIGNED" && (
                  <FormField
                    control={form.control}
                    name="assignedToId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned To</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!form.watch("companyId") || !filteredUsers?.length}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                !form.watch("companyId") 
                                  ? "Select a company first" 
                                  : !filteredUsers?.length 
                                    ? "No users available" 
                                    : "Select user"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredUsers?.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.firstName} {user.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any additional information about this device"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Device"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="hidden md:block">
          <Card className="h-full bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center h-full p-6">
              <HardDrive className="h-24 w-24 text-primary/20 mb-6" />
              <h3 className="text-xl font-semibold mb-2 text-center">Device Inventory Management</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Track all company devices in a central inventory</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Assign devices to team members for accountability</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Monitor device status and maintenance needs</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Manage device locations across multiple offices</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Keep detailed records of hardware specifications</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}