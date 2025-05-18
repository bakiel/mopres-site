'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import Button from '@/components/admin/ui/Button';
import Input from '@/components/admin/ui/Input';
import { ADMIN_ROLE } from '@/lib/constants';
import { logger } from '@/utils/logger';
import { 
  authenticateAdmin, 
  createAdminSession,
  assignAdminRole, 
  checkAutoLoginStatus,
  disableAutoLogin
} from '@/utils/admin-auth'; // Import from the correct module

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@mopres.co.za');
  const [password, setPassword] = useState('secureAdminPassword123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [debug, setDebug] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(true); // Always show debug info for troubleshooting
  const [showAdminOverride, setShowAdminOverride] = useState(false);
  const [rememberedLogin, setRememberedLogin] = useState(false);
  
  const router = useRouter();
  // Get the singleton Supabase client
  const supabaseClient = supabase();

  // This replaced the previous auto-login functionality
  // Now we don't auto-login by default
  useEffect(() => {
    // Always disable auto-login by default
    disableAutoLogin();
    
    setDebug({
      type: 'login_page_loaded', 
      message: 'Login page loaded with auto-login disabled by default'
    });
    
    logger.admin('Login page loaded with auto-login disabled by default');
    setError('Please log in with your admin credentials.');
  }, []);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDebug(null);
    
    try {
      logger.admin('Manual login attempt', { email });
      console.log('Attempting login with email:', email);
      setDebug({type: 'login_attempt', email});
      
      // Try both methods - Supabase auth and localStorage override
      let loginSuccess = false;
      
      // First try Supabase auth
      try {
        // Use the authenticateAdmin utility function
        loginSuccess = await authenticateAdmin(email, password);
        
        if (loginSuccess) {
          logger.admin('Supabase login successful', { email });
          setDebug({type: 'sign_in_success', data: { email }});
          
          // If remember login is checked, don't set auto-login disabled flag
          if (rememberedLogin) {
            localStorage.removeItem('mopres_disable_auto_login');
            logger.admin('Auto-login enabled due to "Remember Login" option');
            setDebug({type: 'auto_login_enabled', message: 'Auto-login enabled due to "Remember Login" option'});
          }
        } else {
          logger.warn('Supabase authentication failed', { email });
          // We'll fall back to localStorage method below
        }
      } catch (authError) {
        logger.error('Authentication error', authError);
        console.error('Auth error:', authError);
        // We'll fall back to localStorage method below
      }
      
      if (!loginSuccess) {
        // Fall back to localStorage override
        logger.warn('Falling back to localStorage admin override', { email });
        setShowAdminOverride(true);
        setError('Supabase authentication failed. You can use the admin override option below.');
        setDebug({type: 'showing_admin_override', message: 'Offering localStorage admin override'});
        setLoading(false);
        return;
      }
      
      logger.admin('Admin login successful, redirecting...', { email });
      console.log('Admin login successful, redirecting...');
      
      // Set success message
      setError(null);
      setDebug({type: 'redirecting', message: 'Login successful! Redirecting to admin dashboard...'});
      
      // First try router push
      router.push('/admin');
      
      // Fallback to window.location after a short delay
      setTimeout(() => {
        const baseUrl = window.location.origin;
        window.location.href = `${baseUrl}/admin`;
      }, 2000);
      
    } catch (error: any) {
      logger.error('Unexpected login error', error);
      console.error('Login error:', error);
      setError(`Unexpected error: ${error.message}`);
      setDebug({type: 'login_error', error: error.message});
      setShowAdminOverride(true);
    } finally {
      setLoading(false);
    }
  };

  // Add admin override function
  const enableAdminOverride = () => {
    logger.admin('Admin override activated', { email });
    
    // Use our utility function with auto-login disabled by default
    createAdminSession(email, '73f8df24-fc99-41b2-9f5c-1a5c74c4564e');
    
    // If remember login is checked, enable auto-login
    if (rememberedLogin) {
      localStorage.removeItem('mopres_disable_auto_login');
      logger.admin('Auto-login enabled due to "Remember Login" option in admin override');
    }
    
    setDebug({type: 'admin_override_enabled', data: { email, rememberedLogin }});
    setError('Admin override enabled! Redirecting to admin dashboard...');
    
    setTimeout(() => {
      router.push('/admin');
    }, 1000);
  };
  
  // Add a testing function for creating admin role
  const createAdminUser = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebug({type: 'create_admin_start', message: 'Starting admin user creation process'});
      logger.admin('Starting admin user creation process', { email });
      
      // First, sign out to clear any existing sessions
      await supabaseClient.auth.signOut();
      
      // Sign up with admin credentials
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
          logger.info('User already exists, attempting to sign in and update role', { email });
          setDebug({type: 'user_exists', message: 'User already exists, attempting to sign in and update role'});
          
          // Try to sign in
          const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
          });
          
          if (signInError) {
            logger.error('Sign in error after signup', signInError);
            setError(`Sign in error after signup: ${signInError.message}`);
            setDebug({type: 'sign_in_after_signup_error', error: signInError});
            return;
          }
          
          logger.debug('Sign in after signup successful', { userId: signInData.user.id });
          setDebug({type: 'sign_in_after_signup_success', data: signInData});
          
          // Update user with admin role
          const roleAssigned = await assignAdminRole();
          
          if (!roleAssigned) {
            setError('Error updating user role');
            setDebug({type: 'update_role_error'});
            return;
          }
          
          logger.admin('Admin role updated for existing user', { email });
          setDebug({type: 'update_role_success'});
          setError('Admin user updated successfully. Try logging in now.');
          return;
        } else {
          logger.error('Sign up error', signUpError);
          setError(`Sign up error: ${signUpError.message}`);
          setDebug({type: 'sign_up_error', error: signUpError});
          return;
        }
      }
      
      logger.admin('Admin user created successfully', { 
        userId: signUpData?.user?.id,
        email: signUpData?.user?.email 
      });
      setDebug({type: 'sign_up_success', data: signUpData});
      setError('Admin user created successfully. Try logging in now.');
      
    } catch (error: any) {
      logger.error('Error creating admin user', error);
      setError(`Error creating admin user: ${error.message}`);
      setDebug({type: 'create_admin_error', error: error.message});
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
        
        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@mopres.co.za"
          />
          
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
          
          <div className="flex items-center">
            <input
              id="remember-login"
              type="checkbox"
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              checked={rememberedLogin}
              onChange={(e) => setRememberedLogin(e.target.checked)}
            />
            <label htmlFor="remember-login" className="ml-2 block text-sm text-gray-700">
              Remember login (enables auto-login)
            </label>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-semibold"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        
        <div className="flex justify-between mt-8">
          <button 
            onClick={createAdminUser}
            className="text-sm text-blue-600 hover:underline"
            disabled={loading}
          >
            Create Admin User
          </button>
          
          <Link href="/" className="text-sm text-brand-gold hover:underline font-medium">
            Return to Store
          </Link>
        </div>
        
        {showAdminOverride && (
          <div className="mt-6">
            <p className="text-sm text-orange-600 mb-2">Having trouble with Supabase authentication?</p>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full font-semibold bg-orange-500 hover:bg-orange-600"
              onClick={enableAdminOverride}
              disabled={loading}
            >
              Enable Admin Override
            </Button>
          </div>
        )}
        
        {/* Always show debug info for troubleshooting */}
        <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-60 text-xs">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <pre>{JSON.stringify(debug, null, 2)}</pre>
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/admin/basic-login" className="text-blue-500 hover:underline text-sm">
            Try Basic Login Page
          </Link>
          <span className="mx-2">|</span>
          <Link href="/standalone-login.html" className="text-blue-500 hover:underline text-sm">
            Standalone Login
          </Link>
          <span className="mx-2">|</span>
          <Link href="/api/auth-test" className="text-blue-500 hover:underline text-sm">
            Test Auth API
          </Link>
        </div>
      </div>
    </div>
  );
}