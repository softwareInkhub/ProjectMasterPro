import React, { useState, useEffect } from 'react';

export default function DirectLogin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if token exists on page load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setLoggedIn(true);
      setMessage('You are already logged in!');
    }
  }, []);

  const handleDirectLogin = async () => {
    setIsLoading(true);
    setMessage('Attempting login...');

    try {
      // Direct manual login with demo user
      localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZkNjk5MjBiLWEyMTQtNDc3Yi1iN2VjLTgwYTk3MDUzYzIwZSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MTI1MDQ4ODMsImV4cCI6MTc0NDA0MDg4M30.KSzp9MzJ2Lx0Rn8SSgRrkOzIgfDVtbUYrIBVl3Ceyt4');
      
      setMessage('Login successful! Token set in localStorage.');
      setLoggedIn(true);
      
      // Wait 2 seconds before redirecting
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
    } catch (error) {
      console.error('Login failed:', error);
      setMessage('Login failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setLoggedIn(false);
    setMessage('Logged out successfully');
  };

  const goToHomePage = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Direct Login</h1>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            This page uses a direct approach to log you in with the demo account.
            It will directly set the token in localStorage and redirect you.
          </p>
        </div>
        
        {message && (
          <div className={`mb-6 p-4 rounded-md ${loggedIn ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
            {message}
          </div>
        )}
        
        <div className="space-y-4">
          {!loggedIn ? (
            <button
              onClick={handleDirectLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login with Demo Account'}
            </button>
          ) : (
            <>
              <button
                onClick={goToHomePage}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium"
              >
                Go to Dashboard
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-md font-medium"
              >
                Logout
              </button>
            </>
          )}
        </div>
        
        <div className="mt-6 border-t pt-4">
          <h2 className="font-semibold mb-2">Debug Information:</h2>
          <div className="bg-gray-100 p-3 rounded-md text-xs font-mono">
            <p>authToken in localStorage: {localStorage.getItem('authToken') ? '✅ Present' : '❌ Not found'}</p>
            <p>Current URL: {window.location.href}</p>
          </div>
        </div>
      </div>
    </div>
  );
}