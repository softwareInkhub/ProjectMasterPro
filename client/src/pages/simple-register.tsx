import React, { useState } from 'react';
import { Link } from 'wouter';

// Simple registration page with minimal dependencies
export default function SimpleRegister() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.companyName) errors.companyName = 'Company name is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setStatus(null);

    try {
      // Direct fetch to register API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          // Handle validation errors from server
          const serverErrors: Record<string, string> = {};
          data.errors.forEach((err: any) => {
            serverErrors[err.path[0]] = err.message;
          });
          setValidationErrors(serverErrors);
          throw new Error(data.message || 'Registration failed');
        }
        throw new Error(data.message || 'Registration failed');
      }

      // Save token to localStorage
      localStorage.setItem('authToken', data.token);
      
      setStatus({
        type: 'success',
        message: 'Registration successful! Redirecting...'
      });

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      console.error('Registration failed:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Simple Registration</h1>
        
        {status && (
          <div 
            className={`mb-4 p-3 rounded ${
              status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {status.message}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.email ? 'border-red-500' : ''
              }`}
              placeholder="Enter your email"
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.password ? 'border-red-500' : ''
              }`}
              placeholder="Enter your password"
            />
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.firstName ? 'border-red-500' : ''
              }`}
              placeholder="Enter your first name"
            />
            {validationErrors.firstName && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.lastName ? 'border-red-500' : ''
              }`}
              placeholder="Enter your last name"
            />
            {validationErrors.lastName && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.companyName ? 'border-red-500' : ''
              }`}
              placeholder="Enter your company name"
            />
            {validationErrors.companyName && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.companyName}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="mt-4 pt-4 border-t text-center text-sm text-gray-600">
          <p>
            Already have an account?{' '}
            <Link href="/simple-login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
          <p className="mt-2">
            <Link href="/login" className="text-blue-600 hover:underline">
              Go back to regular login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}