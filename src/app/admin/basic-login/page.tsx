'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { ADMIN_ROLE } from '@/lib/constants';
import { logger } from '@/utils/logger';
import { authenticateAdmin, createAdminSession, assignAdminRole } from '@/utils/admin-auth';

export default function BasicLoginPage() {
  const [email, setEmail] = useState('admin@mopres.co.za');
  const [password, setPassword] = useState('secureAdminPassword123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<any>(null);
  
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
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>Basic Admin Login</h1>
      
      <form onSubmit={handleLogin} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Password:
          </label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc' }}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{ 
            padding: '10px 15px', 
            background: loading ? '#cccccc' : '#4F46E5', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <button
          type="button"
          onClick={createTestAdmin}
          disabled={loading}
          style={{ 
            padding: '10px 15px',
            marginLeft: '10px',
            background: loading ? '#cccccc' : '#22C55E',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Create Admin User
        </button>
      </form>
      
      {error && (
        <div 
          onClick={error.includes('successful') ? goToDashboard : undefined}
          style={{ 
            padding: '10px', 
            background: error.includes('successful') ? '#d1fae5' : '#fee2e2', 
            color: error.includes('successful') ? '#047857' : '#b91c1c', 
            borderRadius: '4px',
            marginBottom: '20px',
            cursor: error.includes('successful') ? 'pointer' : 'default'
          }}
        >
          {error}
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <h3>Debug Info:</h3>
        <pre style={{ background: '#f1f5f9', padding: '10px', overflow: 'auto', maxHeight: '300px' }}>
          {JSON.stringify(debug, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/admin/login" style={{ color: '#3B82F6', textDecoration: 'underline', marginRight: '15px' }}>
          Return to Main Login
        </a>
        <a href="/standalone-login.html" style={{ color: '#3B82F6', textDecoration: 'underline', marginRight: '15px' }}>
          Try Standalone Login
        </a>
        <a href="/api/auth-test" style={{ color: '#3B82F6', textDecoration: 'underline' }}>
          Test Auth API
        </a>
      </div>
    </div>
  );
}