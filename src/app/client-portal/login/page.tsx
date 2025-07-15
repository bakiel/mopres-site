'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientPortalLoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple credential check (in production, this would use proper authentication)
    if (credentials.username === 'admin' && credentials.password === 'mopres2024') {
      // Set a cookie for authentication (in production, use proper auth tokens)
      document.cookie = 'clientPortalAuth=true; path=/; max-age=86400'; // 24 hours
      router.push('/client-portal');
    } else {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Client Portal</h1>
          <p className="mt-2 text-gray-600">Sign in to manage your store</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                required
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to main site
            </Link>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 font-medium mb-2">Demo Credentials:</p>
            <p className="text-sm text-gray-700">Username: <code className="bg-gray-200 px-1 rounded">admin</code></p>
            <p className="text-sm text-gray-700">Password: <code className="bg-gray-200 px-1 rounded">mopres2024</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}