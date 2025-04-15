import React, { useState } from 'react';
import { Link } from 'wouter';

// Simple login page with minimal dependencies
export default function SimpleLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      // Direct fetch to login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token to localStorage
      localStorage.setItem('authToken', data.token);
      
      setStatus({
        type: 'success',
        message: 'Login successful! Redirecting...'
      });

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Login failed:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Login failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('admin@example.com');
    setPassword('password123');
    setLoading(true);
    setStatus(null);

    try {
      // Direct fetch to login API with demo credentials
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'admin@example.com', 
          password: 'password123' 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Demo login failed');
      }

      // Save token to localStorage
      localStorage.setItem('authToken', data.token);
      
      setStatus({
        type: 'success',
        message: 'Demo login successful! Redirecting...'
      });

      // Show redirection status with debug info
      console.log('Login successful, token:', data.token);
      console.log('Redirecting to dashboard...');

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Demo login failed:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Demo login failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Simple Login</h1>
        
        {status && (
          <div 
            className={`mb-4 p-3 rounded ${
              status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {status.message}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-4">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login with Demo Account'}
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t text-center text-sm text-gray-600">
          <p>
            <Link href="/login" className="text-blue-600 hover:underline">
              Go back to regular login
            </Link>
          </p>
        </div>
        
        <div className="mt-4 p-4 bg-gray-100 rounded text-sm text-gray-700">
          <h2 className="font-medium mb-2">Debug Information:</h2>
          <p>Current token: {localStorage.getItem('authToken') ? '✅ Token exists' : '❌ No token'}</p>
          <p>Current URL: {window.location.href}</p>
        </div>
      </div>
    </div>
  );
}