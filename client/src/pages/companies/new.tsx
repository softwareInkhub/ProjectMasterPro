import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertCompanySchema } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, BuildingIcon, Loader2 } from "lucide-react";

// Extend the company schema with validation
const formSchema = insertCompanySchema
  .extend({
    name: z.string().min(1, "Company name is required"),
    description: z.string().optional().nullable(),
    website: z.string().url("Please enter a valid URL").optional().nullable(),
  });

type FormValues = z.infer<typeof formSchema>;

export default function NewCompanyPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
    },
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/companies", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Company created",
        description: "The company has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      navigate("/companies");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create company",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    createCompanyMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/companies")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Button>
        <h1 className="text-3xl font-bold">Create Company</h1>
        <p className="text-gray-600 mt-1">Add a new company to your organization</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Provide details about the company you want to add
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation" {...field} />
                      </FormControl>
                      <FormDescription>
                        The official name of the company
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
                          placeholder="Brief description about the company"
                          className="resize-y min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a short description about the company's business
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://acmecorp.example.com" 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        The company's official website URL (include https://)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/companies")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createCompanyMutation.isPending}
                  >
                    {createCompanyMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Company
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
              <CardDescription>Helpful information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <BuildingIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Company Details</h4>
                  <p className="text-xs text-gray-500">
                    Provide accurate company information for better organization.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BuildingIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Website Format</h4>
                  <p className="text-xs text-gray-500">
                    Enter website URLs with the complete format (https://example.com).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}