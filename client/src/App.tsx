import { Route, Switch } from "wouter";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

// Simplified App component to get started
function App() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
            <h1 className="text-2xl font-bold mb-4 text-center">Project Management System</h1>
            <p className="mb-4 text-center">Welcome to the Project Management System. Please log in to continue.</p>
            <div className="flex justify-center">
              <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
