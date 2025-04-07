import { Route, Switch } from "wouter";
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

// Simplified App component without complex auth requirements
function App() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Project routes in correct order - most specific first */}
      <Route path="/projects/new">
        <Layout>
          <NewProjectPage />
        </Layout>
      </Route>
      <Route path="/projects/:id">
        <Layout>
          <ProjectDetailPage />
        </Layout>
      </Route>
      <Route path="/projects">
        <Layout>
          <ProjectsPage />
        </Layout>
      </Route>
      
      {/* Epic routes in correct order */}
      <Route path="/epics/new">
        <Layout>
          <NewEpicPage />
        </Layout>
      </Route>
      <Route path="/epics/:id">
        <Layout>
          <EpicDetailPage />
        </Layout>
      </Route>
      <Route path="/epics">
        <Layout>
          <EpicsPage />
        </Layout>
      </Route>
      
      {/* Story routes in correct order */}
      <Route path="/stories/new">
        <Layout>
          <NewStoryPage />
        </Layout>
      </Route>
      <Route path="/stories/:id">
        <Layout>
          <StoryDetailPage />
        </Layout>
      </Route>
      <Route path="/stories">
        <Layout>
          <StoriesPage />
        </Layout>
      </Route>
      
      {/* Other routes */}
      <Route path="/tasks">
        <Layout>
          <TasksPage />
        </Layout>
      </Route>
      <Route path="/companies">
        <Layout>
          <CompaniesPage />
        </Layout>
      </Route>
      <Route path="/departments">
        <Layout>
          <DepartmentsPage />
        </Layout>
      </Route>
      <Route path="/teams">
        <Layout>
          <TeamsPage />
        </Layout>
      </Route>
      <Route path="/users">
        <Layout>
          <UsersPage />
        </Layout>
      </Route>
      <Route path="/reports">
        <Layout>
          <ReportsPage />
        </Layout>
      </Route>
      
      {/* Home route - this should always be after all specific routes */}
      <Route path="/">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      
      {/* Not found route - this should always be last */}
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

export default App;
