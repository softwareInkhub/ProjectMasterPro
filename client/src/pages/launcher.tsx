import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";

export default function LauncherPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>Application Launcher</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-gray-100">
        <header className="bg-white shadow-sm px-4 py-4 border-b">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Project Management System</h1>
          </div>
        </header>
        
        <main className="flex-1 p-4">
          <div className="container mx-auto py-10">
            <h2 className="text-xl font-semibold mb-6">Emergency Navigation</h2>
            
            {!isAuthenticated ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-6 mb-6">
                <h3 className="text-lg font-medium text-red-600 mb-2">Not Authenticated</h3>
                <p className="text-sm text-red-500 mb-4">You need to login first to access the application.</p>
                <button
                  onClick={() => window.location.href = '/simple-login'}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[
                  { name: "Dashboard", href: "/" },
                  { name: "Projects", href: "/projects" },
                  { name: "Sprints", href: "/sprints" },
                  { name: "Backlog", href: "/backlog" },
                  { name: "Epics", href: "/epics" },
                  { name: "Stories", href: "/stories" },
                  { name: "Tasks", href: "/tasks" },
                  { name: "Teams", href: "/teams" },
                  { name: "Users", href: "/users" },
                  { name: "Companies", href: "/companies" },
                  { name: "Departments", href: "/departments" },
                  { name: "Logout", href: "/simple-login" },
                ].map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-300 transition-all"
                  >
                    <span className="text-lg font-medium">{item.name}</span>
                  </a>
                ))}
              </div>
            )}
            
            {isAuthenticated && (
              <>
                <div className="mt-12">
                  <h2 className="text-xl font-semibold mb-6">Direct URLs (No Navigation Required)</h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
                    <h3 className="text-lg font-medium text-blue-700 mb-4">Sprint Management</h3>
                    <div className="space-y-2">
                      <div className="flex items-center bg-white rounded-md p-3 shadow-sm border border-gray-200">
                        <span className="flex-1 font-medium">All Sprints</span>
                        <button
                          onClick={() => {
                            const url = '/sprints';
                            window.open(url, '_blank')?.focus();
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Open in New Tab
                        </button>
                      </div>
                      
                      <div className="flex items-center bg-white rounded-md p-3 shadow-sm border border-gray-200">
                        <span className="flex-1 font-medium">Active Sprints</span>
                        <button
                          onClick={() => {
                            const url = '/api/sprints?status=ACTIVE';
                            fetch(url, {
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem('authToken')}`
                              }
                            })
                            .then(res => res.json())
                            .then(data => {
                              console.log('Active Sprints:', data);
                              alert(`Found ${data.length} active sprints. See console for details.`);
                            })
                            .catch(err => {
                              console.error(err);
                              alert('Error fetching sprints. See console for details.');
                            });
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Check API Directly
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-6">Debug Tools</h2>
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <button
                        onClick={() => {
                          const token = localStorage.getItem('authToken');
                          console.log('Current Auth Token:', token);
                          alert(`Auth Token: ${token ? 'Present' : 'Not found'}`);
                        }}
                        className="p-4 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-gray-50"
                      >
                        <h3 className="font-medium mb-1">Check Auth Token</h3>
                        <p className="text-sm text-gray-500">Verify if your authentication token exists</p>
                      </button>
                      
                      <button
                        onClick={() => {
                          localStorage.removeItem('authToken');
                          alert('Auth token removed. You will need to log in again.');
                          window.location.href = '/simple-login';
                        }}
                        className="p-4 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-gray-50"
                      >
                        <h3 className="font-medium mb-1">Clear Auth Token</h3>
                        <p className="text-sm text-gray-500">Remove your current authentication token</p>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
        
        <footer className="bg-white border-t px-4 py-3">
          <div className="container mx-auto text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Project Management System
          </div>
        </footer>
      </div>
    </>
  );
}