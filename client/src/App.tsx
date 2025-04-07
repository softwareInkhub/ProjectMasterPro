import { Route, Switch } from "wouter";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import ProjectsPage from "@/pages/projects";
import TasksPage from "@/pages/tasks";
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
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

export default App;
