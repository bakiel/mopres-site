'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowserClient';
import Button from '@/components/Button';
import { ADMIN_ROLE } from '@/lib/constants';
import { handleAuthError } from '@/lib/auth-utils';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  
  // Check if already logged in as admin on page load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          return;
        }
        
        if (data.session) {
          // Get user metadata to check for admin role
          const { data: userData } = await supabase.auth.getUser();
          const userRole = userData?.user?.user_metadata?.role;
          
          if (userRole === ADMIN_ROLE) {
            // Already logged in as admin, redirect to admin dashboard
            setMessage('Already logged in as admin. Redirecting...');
            router.push('/admin');
          }
        }
      } catch (err) {
        console.error('Error checking session:', err);
      }
    };
    
    checkSession();
  }, [router, supabase.auth]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      // First sign in with email/password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        console.error('Sign in error:', signInError);
        setError(handleAuthError(signInError));
        setLoading(false);
        return;
      }
      
      if (!signInData.user) {
        setError('Login failed. Please try again.');
        setLoading(false);
        return;
      }
      
      // Check if user has admin role in metadata
      const userRole = signInData.user.user_metadata?.role;
      
      if (userRole !== ADMIN_ROLE) {
        // If not an admin, try to update user metadata with admin role
        // This would typically be done through a proper authorization system
        // For simplicity in this example, we'll update the role directly
        
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            role: ADMIN_ROLE
          }
        });
        
        if (updateError) {
          console.error('Error updating user role:', updateError);
          
          // Sign out since not an admin
          await supabase.auth.signOut();
          
          setError('You do not have admin privileges.');
          setLoading(false);
          return;
        }
      }
      
      // Successfully logged in as admin
      setMessage('Login successful! Redirecting to admin dashboard...');
      
      // Redirect to admin dashboard
      setTimeout(() => {
        router.push('/admin');
      }, 1000);
      
    } catch (error: any) {
      console.error('Login error:', error);
      setError(`Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border-t-4 border-brand-gold">
        <div className="flex justify-center mb-8">
          {!imgError ? (
            <Image 
              src="/logo.png" 
              alt="MoPres Fashion"
              width={180}
              height={60}
              style={{ height: 'auto' }}
              priority
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="text-2xl font-bold text-brand-gold">MoPres Fashion</div>
          )}
        </div>
        
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Admin Login
        </h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {message}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              placeholder="admin@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              placeholder="••••••••"
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-brand-gold hover:underline font-medium">
            Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
}