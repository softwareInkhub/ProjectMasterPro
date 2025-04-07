import { Route, Switch } from "wouter";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import ProjectsPage from "@/pages/projects";
import TasksPage from "@/pages/tasks";
import CompaniesPage from "@/pages/companies";
import DepartmentsPage from "@/pages/departments";
import TeamsPage from "@/pages/teams";
import UsersPage from "@/pages/users";
import ReportsPage from "@/pages/reports";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";

// Simplified App component without complex auth requirements
function App() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      <Route path="/projects">
        <Layout>
          <ProjectsPage />
        </Layout>
      </Route>
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
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

export default App;
