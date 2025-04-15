import { Route, Switch, Redirect, useLocation } from "wouter";
import { useEffect, createContext, useContext, useState, ReactNode } from "react";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
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
import { Toaster } from "@/components/ui/toaster";

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
      <Toaster />
      <Switch>
        {/* Auth routes */}
        <Route path="/login" component={Login} />
        <Route path="/auth" component={Login} />
        <Route path="/test-login" component={() => {
          const TestLogin = require('./pages/test-login').default;
          return <TestLogin />;
        }} />
        
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
