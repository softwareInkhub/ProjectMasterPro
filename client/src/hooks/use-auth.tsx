import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: { username: string; password: string; email: string; name: string; role: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Fetch current user data
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return null;

        const res = await apiRequest("GET", "/api/auth/user");
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            return null;
          }
          throw new Error(`Error fetching user: ${res.statusText}`);
        }
        
        const userData = await res.json();
        return userData;
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Update authentication state based on user data
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      if (!res.ok) {
        throw new Error("Invalid username or password");
      }
      const data = await res.json();
      return data;
    },
    onSuccess: (data) => {
      // Store token and refresh queries
      localStorage.setItem("token", data.token);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: { username: string; password: string; email: string; name: string; role: string }) => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }
      const data = await res.json();
      return data;
    },
    onSuccess: (data) => {
      // Store token and refresh queries
      localStorage.setItem("token", data.token);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      // Remove token and clear user data
      localStorage.removeItem("token");
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Authentication methods
  const login = async (credentials: { username: string; password: string }) => {
    await loginMutation.mutateAsync(credentials);
  };

  const register = async (userData: { username: string; password: string; email: string; name: string; role: string }) => {
    await registerMutation.mutateAsync(userData);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}