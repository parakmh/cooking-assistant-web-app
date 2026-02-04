import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiPost } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../lib/errors';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation(); // Added to get location state for redirects
  const { isAuthenticated, loginWithToken } = useAuth(); // Get isAuthenticated and loginWithToken

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: Location })?.from?.pathname || '/profile';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]); // Added location to dependencies

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // simplejwt returns { access: string, refresh: string }
      const response = await apiPost<{ access: string; refresh: string }>(
        '/auth/login',
        { email, password },
        false
      );
      // Store both access and refresh tokens
      loginWithToken(response.access, response.refresh);
      // Navigation is now handled by the useEffect above
    } catch (err: any) {
      setError(getErrorMessage(err));
      console.error('Login error:', err);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && <p className="text-red-500 bg-red-100 p-2 mb-4 rounded">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Don't have an account?{' '}
        <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
          Register here
        </a>
      </p>
    </div>
  );
};

export default LoginPage;
