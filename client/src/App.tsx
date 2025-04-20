import { Route, Switch, Redirect, useLocation } from "wouter";
import { useEffect, createContext, useContext, useState, ReactNode, lazy, Suspense } from "react";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Backlog from "@/pages/backlog";
import ProjectsPage from "@/pages/projects";
import ProjectDetailPage from "@/pages/projects/[id]";
import NewProjectPage from "@/pages/projects/new";
import TasksPage from "@/pages/tasks";
import TaskDetailPage from "@/pages/tasks/[id]";
import NewTaskPage from "@/pages/tasks/new";
import CompaniesPage from "@/pages/companies";
import DepartmentsPage from "@/pages/departments";
import DepartmentDetailPage from "@/pages/departments/[id]";
import EditDepartmentPage from "@/pages/departments/edit/[id]";
import NewDepartmentPage from "@/pages/departments/new";
import TeamsPage from "@/pages/teams";
import TeamDetailPage from "@/pages/teams/[id]";
import EditTeamPage from "@/pages/teams/edit/[id]";
import NewTeamPage from "@/pages/teams/new";
import UsersPage from "@/pages/users";
import ReportsPage from "@/pages/reports";
import SettingsPage from "@/pages/settings";
import EpicsPage from "@/pages/epics";
import EpicDetailPage from "@/pages/epics/[id]";
import NewEpicPage from "@/pages/epics/new";
import StoriesPage from "@/pages/stories";
import StoryDetailPage from "@/pages/stories/[id]";
import NewStoryPage from "@/pages/stories/new";
import LocationsPage from "@/pages/locations";
import NewLocationPage from "@/pages/locations/new";
import DevicesPage from "@/pages/devices";
import NewDevicePage from "@/pages/devices/new";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import { Loader2 } from "lucide-react";

import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { WebSocketProvider } from "@/context/websocket-context";
import { Toaster } from "@/components/ui/toaster";

// Protected Route component
function ProtectedRoute({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [location] = useLocation();

  // Simple token checking without using useAuth hook
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Check for token changes
    const intervalId = setInterval(checkAuth, 1000);
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to our direct login page
    return <Redirect to={`/direct-login?redirect=${encodeURIComponent(location)}`} />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Toaster />
        <Switch>
        {/* Auth routes */}
        <Route path="/login">
          <div>
            <iframe src="/direct-login" style={{ width: "100%", height: "100vh", border: "none" }}></iframe>
          </div>
        </Route>
        <Route path="/auth">
          <div>
            <iframe src="/direct-login" style={{ width: "100%", height: "100vh", border: "none" }}></iframe>
          </div>
        </Route>
        <Route path="/direct-login">
          {() => {
            const DirectLogin = lazy(() => import('./pages/direct-login'));
            return (
              <Suspense fallback={<div>Loading...</div>}>
                <DirectLogin />
              </Suspense>
            );
          }}
        </Route>
        <Route path="/simple-login">
          {/* Import SimpleLogin from './pages/simple-login' */}
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
              <h1 className="text-2xl font-bold mb-6 text-center">Simple Login</h1>
              <form onSubmit={(e) => {
                e.preventDefault();
                const email = (document.getElementById('email') as HTMLInputElement).value;
                const password = (document.getElementById('password') as HTMLInputElement).value;
                
                fetch('/api/auth/login', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email, password }),
                })
                .then(response => response.json())
                .then(data => {
                  localStorage.setItem('authToken', data.token);
                  window.location.href = '/';
                })
                .catch(error => {
                  console.error('Login error:', error);
                });
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                    defaultValue="admin@example.com"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    id="password"
                    type="password"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                    defaultValue="password123"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Login
                </button>
                
                <button
                  type="button"
                  className="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  onClick={() => {
                    fetch('/api/auth/login', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ 
                        email: 'admin@example.com', 
                        password: 'password123' 
                      }),
                    })
                    .then(response => response.json())
                    .then(data => {
                      localStorage.setItem('authToken', data.token);
                      window.location.href = '/';
                    })
                    .catch(error => {
                      console.error('Login error:', error);
                    });
                  }}
                >
                  Login with Demo Account
                </button>
              </form>
            </div>
          </div>
        </Route>
        <Route path="/simple-register">
          {/* Simple inline registration form */}
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
              <h1 className="text-2xl font-bold mb-6 text-center">Simple Registration</h1>
              <form onSubmit={(e) => {
                e.preventDefault();
                const email = (document.getElementById('reg-email') as HTMLInputElement).value;
                const password = (document.getElementById('reg-password') as HTMLInputElement).value;
                const firstName = (document.getElementById('reg-firstName') as HTMLInputElement).value;
                const lastName = (document.getElementById('reg-lastName') as HTMLInputElement).value;
                const companyName = (document.getElementById('reg-companyName') as HTMLInputElement).value;
                
                fetch('/api/auth/register', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ 
                    email, 
                    password, 
                    firstName, 
                    lastName, 
                    companyName 
                  }),
                })
                .then(response => response.json())
                .then(data => {
                  localStorage.setItem('authToken', data.token);
                  window.location.href = '/';
                })
                .catch(error => {
                  console.error('Registration error:', error);
                });
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    id="reg-email"
                    type="email"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    id="reg-firstName"
                    type="text"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    id="reg-lastName"
                    type="text"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your last name"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <input
                    id="reg-companyName"
                    type="text"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your company name"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Register
                </button>
                
                <div className="mt-4 text-center">
                  <a href="/simple-login" className="text-blue-500 hover:underline">Already have an account? Login</a>
                </div>
              </form>
            </div>
          </div>
        </Route>
        <Route path="/test-login">
          {/* Simple test login page */}
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
              <h1 className="text-2xl font-bold mb-6 text-center">Test Login</h1>
              <div className="text-center">
                <a href="/simple-login" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                  Go to Simple Login
                </a>
              </div>
            </div>
          </div>
        </Route>
        
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
        
        {/* Task routes in correct order */}
        <Route path="/tasks/new">
          <ProtectedRoute>
            <Layout>
              <NewTaskPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/tasks/:id">
          <ProtectedRoute>
            <Layout>
              <TaskDetailPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/tasks">
          <ProtectedRoute>
            <Layout>
              <TasksPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        {/* Company routes in correct order - most specific first */}
        <Route path="/companies/new">
          <ProtectedRoute>
            <Layout>
              <CompaniesPage new={true} />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/companies/:id">
          <ProtectedRoute>
            <Layout>
              <CompaniesPage detail={true} />
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
        {/* Department routes in correct order */}
        <Route path="/departments/new">
          <ProtectedRoute>
            <Layout>
              <NewDepartmentPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/departments/edit/:id">
          <ProtectedRoute>
            <Layout>
              <EditDepartmentPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/departments/:id">
          <ProtectedRoute>
            <Layout>
              <DepartmentDetailPage />
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
        {/* Team routes in correct order */}
        <Route path="/teams/new">
          <ProtectedRoute>
            <Layout>
              <NewTeamPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/teams/edit/:id">
          <ProtectedRoute>
            <Layout>
              <EditTeamPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/teams/:id">
          <ProtectedRoute>
            <Layout>
              <TeamDetailPage />
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
        {/* User routes in correct order - most specific first */}
        <Route path="/users/new">
          <ProtectedRoute>
            <Layout>
              <UsersPage new={true} />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/users/:id">
          <ProtectedRoute>
            <Layout>
              <UsersPage detail={true} />
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
        <Route path="/settings">
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        </Route>

        {/* Location routes */}
        <Route path="/locations/new">
          <ProtectedRoute>
            <Layout>
              <NewLocationPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/locations">
          <ProtectedRoute>
            <Layout>
              <LocationsPage />
            </Layout>
          </ProtectedRoute>
        </Route>

        {/* Device routes */}
        <Route path="/devices/new">
          <ProtectedRoute>
            <Layout>
              <NewDevicePage />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/devices">
          <ProtectedRoute>
            <Layout>
              <DevicesPage />
            </Layout>
          </ProtectedRoute>
        </Route>
        
        {/* Backlog route */}
        <Route path="/backlog">
          <ProtectedRoute>
            <Layout>
              <Backlog />
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
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
