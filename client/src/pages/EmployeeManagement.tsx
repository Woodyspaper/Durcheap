import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Store,
  ShoppingCart,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import type { User } from "@shared/schema";

const employeeFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["buyer", "seller", "admin"], {
    required_error: "Please select a role",
  }),
});

export default function EmployeeManagement() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const employeeForm = useForm<z.infer<typeof employeeFormSchema>>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      email: "",
      role: "buyer",
    },
  });

  // Fetch all employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/employees"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Add employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof employeeFormSchema>) => {
      return await apiRequest("POST", "/api/admin/employees", data);
    },
    onSuccess: () => {
      toast({
        title: "Employee Added",
        description: "Employee access has been granted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/employees"] });
      setShowAddDialog(false);
      employeeForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 500);
        return;
      }
      toast({
        title: "Failed to Add Employee",
        description: "Could not grant employee access. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update employee role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest("PATCH", `/api/admin/employees/${userId}/role`, { role });
    },
    onSuccess: () => {
      toast({
        title: "Role Updated",
        description: "Employee role has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/employees"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 500);
        return;
      }
      toast({
        title: "Failed to Update Role",
        description: "Could not update employee role. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove employee mutation
  const removeEmployeeMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/admin/employees/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Employee Removed",
        description: "Employee access has been revoked successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/employees"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 500);
        return;
      }
      
      // Handle seller with active products/orders
      if (error.message && error.message.includes("Cannot remove seller access")) {
        const errorData = JSON.parse(error.message.split('400: ')[1] || '{}');
        toast({
          title: "Cannot Remove Seller Access",
          description: errorData.details ? 
            `Seller has ${errorData.details.activeProducts} active products and ${errorData.details.activeOrders} pending orders. ${errorData.details.suggestion}` :
            "Seller has active products or pending orders. Please resolve these first.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Failed to Remove Employee",
        description: "Could not revoke employee access. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-16 w-16 text-red-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-6">
                You need administrator privileges to access employee management.
              </p>
              <Button onClick={() => window.location.href = "/"}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const filteredEmployees = employees.filter((employee: User) => {
    const matchesSearch = 
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === "all" || employee.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "seller":
        return <Store className="h-4 w-4" />;
      case "buyer":
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "seller":
        return "default";
      case "buyer":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600 mt-2">
              Manage employee access and roles for your organization
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => window.location.href = "/admin/seller-transition"} variant="outline">
              <Store className="h-4 w-4 mr-2" />
              Seller Transitions
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Grant access to a new employee by entering their email and selecting their role.
                </DialogDescription>
              </DialogHeader>
              <Form {...employeeForm}>
                <form
                  onSubmit={employeeForm.handleSubmit((data) => addEmployeeMutation.mutate(data))}
                  className="space-y-4"
                >
                  <FormField
                    control={employeeForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="employee@company.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={employeeForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buyer">Buyer - Customer access only</SelectItem>
                              <SelectItem value="seller">Seller - Can manage products and orders</SelectItem>
                              <SelectItem value="admin">Admin - Full platform access</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addEmployeeMutation.isPending}>
                      {addEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold">{employees.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administrators</p>
                  <p className="text-2xl font-bold">
                    {employees.filter((emp: User) => emp.role === "admin").length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sellers</p>
                  <p className="text-2xl font-bold">
                    {employees.filter((emp: User) => emp.role === "seller").length}
                  </p>
                </div>
                <Store className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Buyers</p>
                  <p className="text-2xl font-bold">
                    {employees.filter((emp: User) => emp.role === "buyer").length}
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Employees</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Label htmlFor="role-filter">Filter by Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Administrators</SelectItem>
                    <SelectItem value="seller">Sellers</SelectItem>
                    <SelectItem value="buyer">Buyers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {employeesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    </div>
                    <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No employees found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedRole !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Start by adding your first employee."}
                </p>
                {!searchTerm && selectedRole === "all" && (
                  <Button onClick={() => setShowAddDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add First Employee
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEmployees.map((employee: User) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={employee.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(employee.firstName || undefined, employee.lastName || undefined)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">
                            {employee.firstName && employee.lastName
                              ? `${employee.firstName} ${employee.lastName}`
                              : "Unnamed User"}
                          </h3>
                          <Badge variant={getRoleBadgeVariant(employee.role)}>
                            <div className="flex items-center space-x-1">
                              {getRoleIcon(employee.role)}
                              <span className="capitalize">{employee.role}</span>
                            </div>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{employee.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Joined {new Date(employee.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={employee.role}
                        onValueChange={(role) =>
                          updateRoleMutation.mutate({ userId: employee.id, role })
                        }
                        disabled={updateRoleMutation.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buyer">Buyer</SelectItem>
                          <SelectItem value="seller">Seller</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Employee Access</AlertDialogTitle>
                            <AlertDialogDescription>
                              <div className="space-y-3">
                                <p>
                                  Are you sure you want to remove access for{" "}
                                  <strong>{employee.email}</strong>?
                                </p>
                                {employee.role === "seller" && (
                                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                    <div className="flex items-start space-x-2">
                                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                      <div className="text-sm">
                                        <p className="font-medium text-yellow-800">Seller Account Warning</p>
                                        <p className="text-yellow-700">
                                          This will deactivate all their products and prevent new orders. 
                                          Make sure they have no pending orders before proceeding.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <p className="text-sm text-gray-600">
                                  This will revoke their employee privileges but won't delete their account.
                                  They can still use the platform as a regular buyer.
                                </p>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeEmployeeMutation.mutate(employee.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remove Access
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  );
}