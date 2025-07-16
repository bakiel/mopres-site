'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase-singleton';
import { ADMIN_ROLE } from '@/lib/constants';
import { logger } from '@/utils/logger';
import { authenticateAdmin, createAdminSession, assignAdminRole } from '@/utils/admin-auth';

export default function BasicLoginPage() {
  const [email, setEmail] = useState('admin@mopres.co.za');
  const [password, setPassword] = useState('secureAdminPassword123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<any>(null);
  const [imgError, setImgError] = useState(false);
  
  const router = useRouter();
  const supabaseClient = supabase();
  
  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      logger.debug('Checking for existing session in basic login page');
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        const { data: { user } } = await supabaseClient.auth.getUser();
        logger.info('Session found in basic login page', { 
          userId: user?.id,
          email: user?.email
        });
        setDebug({
          sessionFound: true,
          user
        });
      } else {
        logger.debug('No session found in basic login page');
      }
    };
    
    checkSession();
  }, [supabaseClient]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDebug(null);
    
    try {
      logger.admin('Manual login attempt on basic login page', { email });
      console.log('Attempting login with email:', email);
      
      // Clear the auto-login disable flag if it exists
      try {
        localStorage.removeItem('mopres_disable_auto_login');
        logger.debug('Cleared auto-login disable flag');
      } catch (flagError) {
        logger.error('Clearing auto-login flag failed', flagError);
      }
      
      // Use our authenticateAdmin utility function that includes logging
      const success = await authenticateAdmin(email, password);
      setDebug({ success, email });
      
      if (!success) {
        logger.warn('Login failed - user does not have admin role', { email });
        setError('You do not have permission to access the admin area.');
        setLoading(false);
        return;
      }
      
      logger.admin('Admin login successful on basic login page', { email });
      console.log('Admin login successful!');
      setError('Admin login successful! Click to proceed to dashboard.');
      
      // Add a button to navigate to the dashboard
      const adminButton = document.createElement('button');
      adminButton.textContent = 'Go to Admin Dashboard';
      adminButton.style.padding = '10px 15px';
      adminButton.style.marginTop = '15px';
      adminButton.style.background = '#AF8F53';
      adminButton.style.color = 'white';
      adminButton.style.border = 'none';
      adminButton.style.borderRadius = '4px';
      adminButton.style.cursor = 'pointer';
      adminButton.onclick = () => router.push('/admin');
      
      // Find the error div and append the button
      const errorDiv = document.querySelector('[style*="background: rgb(209, 250, 229)"]');
      if (errorDiv) {
        errorDiv.appendChild(adminButton);
      }
      
    } catch (error: any) {
      logger.error('Login error on basic login page', error);
      console.error('Login error:', error);
      setError(`Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to create an admin user for testing
  const createTestAdmin = async () => {
    try {
      setLoading(true);
      setError(null);
      logger.admin('Attempting to create test admin user', { email });
      
      // Clear the auto-login disable flag if it exists
      try {
        localStorage.removeItem('mopres_disable_auto_login');
        logger.debug('Cleared auto-login disable flag');
      } catch (flagError) {
        logger.error('Clearing auto-login flag failed', flagError);
      }
      
      // First, sign out to clear any existing sessions
      await supabaseClient.auth.signOut();
      
      // Sign up with admin credentials (including role in user_metadata)
      const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: ADMIN_ROLE
          }
        }
      });
      
      if (signUpError) {
        // Check if it's already registered error
        if (signUpError.message.includes('already registered')) {
          logger.info('User already exists, attempting to update with admin role', { email });
          
          // Try to sign in
          const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
          });
          
          if (signInError) {
            logger.error('Sign in error when trying to update existing user', signInError);
            setError(`Sign in error: ${signInError.message}`);
            setDebug({signin_error: signInError});
            setLoading(false);
            return;
          }
          
          // Update user with admin role
          const success = await assignAdminRole();
          
          if (!success) {
            logger.error('Error updating user with admin role');
            setError(`Error updating role`);
            setDebug({update_error: 'Failed to assign admin role'});
            setLoading(false);
            return;
          }
          
          logger.admin('Existing user updated with admin role', { 
            userId: signInData.user.id,
            email: signInData.user.email 
          });
          setError('Existing user updated with admin role successfully');
          setDebug({
            status: 'success_update',
            user: signInData.user
          });
          return;
        } else {
          logger.error('Error creating admin user', signUpError);
          setError(`Sign up error: ${signUpError.message}`);
          setDebug({signup_error: signUpError});
          setLoading(false);
          return;
        }
      }
      
      logger.admin('Admin user created successfully', { 
        userId: signUpData?.user?.id,
        email: signUpData?.user?.email 
      });
      setError('Admin user created successfully');
      setDebug({
        status: 'success_create',
        user: signUpData?.user
      });
      
    } catch (error: any) {
      logger.error('Unexpected error creating admin user', error);
      setError(`Error creating admin: ${error.message}`);
      setDebug({error});
    } finally {
      setLoading(false);
    }
  };
  
  const goToDashboard = () => {
    logger.admin('User navigating to admin dashboard from basic login page', { email });
    router.push('/admin');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border-t-4 border-amber-600">
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
            <div className="text-2xl font-bold text-amber-600">MoPres Fashion</div>
          )}
        </div>
        
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-8">
          Admin Login
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <button
              type="button"
              onClick={createTestAdmin}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Create Admin User
            </button>
          </div>
        </form>
      
        {error && (
          <div 
            onClick={error.includes('successful') ? goToDashboard : undefined}
            className={`mt-6 p-4 rounded-lg cursor-${error.includes('successful') ? 'pointer' : 'default'} ${
              error.includes('successful') 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {error}
          </div>
        )}
        
        {/* Debug info - only show if there's debug data */}
        {debug && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Info:</h3>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-40 text-xs text-gray-600">
              {JSON.stringify(debug, null, 2)}
            </pre>
          </div>
        )}
        
        {/* Alternative login options - only show if there's an error */}
        {error && (
          <div className="mt-6 text-center space-x-4">
            <a href="/admin/login" className="text-blue-600 hover:underline text-sm">
              Return to Main Login
            </a>
            <span className="text-gray-400">|</span>
            <a href="/standalone-login.html" className="text-blue-600 hover:underline text-sm">
              Try Standalone Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}