import { Route, Switch, Redirect, useLocation } from "wouter";
import { useEffect, createContext, useContext, useState, ReactNode } from "react";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import ProjectsPage from "@/pages/projects";
import ProjectDetailPage from "@/pages/projects/[id]";
import NewProjectPage from "@/pages/projects/new";
import TasksPage from "@/pages/tasks";
import CompaniesPage from "@/pages/companies";
import DepartmentsPage from "@/pages/departments";
import TeamsPage from "@/pages/teams";
import UsersPage from "@/pages/users";
import ReportsPage from "@/pages/reports";
import EpicsPage from "@/pages/epics";
import EpicDetailPage from "@/pages/epics/[id]";
import NewEpicPage from "@/pages/epics/new";
import StoriesPage from "@/pages/stories";
import StoryDetailPage from "@/pages/stories/[id]";
import NewStoryPage from "@/pages/stories/new";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import { Loader2 } from "lucide-react";

// Create Auth Context
type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider component
function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if we have a token in localStorage
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Protected Route component
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Using Redirect component with state to return to the intended page after login
    return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/login" component={Login} />
        
        {/* Project routes in correct order - most specific first */}
        <Route path="/projects/new">
          <ProtectedRoute>
            <Layout>
              <NewProjectPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/projects/:id">
          <ProtectedRoute>
            <Layout>
              <ProjectDetailPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/projects">
          <ProtectedRoute>
            <Layout>
              <ProjectsPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        
        {/* Epic routes in correct order */}
        <Route path="/epics/new">
          <ProtectedRoute>
            <Layout>
              <NewEpicPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/epics/:id">
          <ProtectedRoute>
            <Layout>
              <EpicDetailPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/epics">
          <ProtectedRoute>
            <Layout>
              <EpicsPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        
        {/* Story routes in correct order */}
        <Route path="/stories/new">
          <ProtectedRoute>
            <Layout>
              <NewStoryPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/stories/:id">
          <ProtectedRoute>
            <Layout>
              <StoryDetailPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/stories">
          <ProtectedRoute>
            <Layout>
              <StoriesPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        
        {/* Other routes */}
        <Route path="/tasks">
          <ProtectedRoute>
            <Layout>
              <TasksPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/companies">
          <ProtectedRoute>
            <Layout>
              <CompaniesPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/departments">
          <ProtectedRoute>
            <Layout>
              <DepartmentsPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/teams">
          <ProtectedRoute>
            <Layout>
              <TeamsPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/users">
          <ProtectedRoute>
            <Layout>
              <UsersPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/reports">
          <ProtectedRoute>
            <Layout>
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        
        {/* Home route - this should always be after all specific routes */}
        <Route path="/">
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        </Route>
        
        {/* Not found route - this should always be last */}
        <Route>
          <Layout>
            <NotFound />
          </Layout>
        </Route>
      </Switch>
    </AuthProvider>
  );
}

export default App;
