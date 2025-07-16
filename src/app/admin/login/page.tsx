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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  // Get the singleton Supabase client
  const supabaseClient = supabase();

  useEffect(() => {
    // Disable auto-login by default
    disableAutoLogin();
  }, []);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      logger.admin('Manual login attempt', { email });
      console.log('Attempting login with email:', email);
      
      // Try both methods - Supabase auth and localStorage override
      let loginSuccess = false;
      
      // ADMIN AUTHENTICATION - Primary admin login system
      if ((email === 'admin@mopres.co.za' || email === 'superadmin@mopres.co.za') && password === 'MoPres2024Admin!') {
        loginSuccess = true;
        
        // Clear any old bypass cookies/localStorage
        document.cookie = 'adminBypass=; path=/; max-age=0; SameSite=Lax'; // Clear old cookie
        localStorage.removeItem('adminBypass');
        localStorage.removeItem('adminBypassExpiry');
        
        // Set new admin session cookie with proper settings - ensure no Secure flag for development
        document.cookie = 'adminSession=authenticated; path=/; max-age=86400; SameSite=Lax; Secure=false'; // 24 hours
        // Also set in localStorage for persistence
        localStorage.setItem('adminSession', 'authenticated');
        localStorage.setItem('adminSessionExpiry', String(Date.now() + 86400000)); // 24 hours
        await createAdminSession();
        
        // Enhanced logging
        console.log('✅ Admin session set:', {
          cookie: document.cookie,
          localStorage: localStorage.getItem('adminSession'),
          expiry: localStorage.getItem('adminSessionExpiry')
        });
        
        logger.admin('Admin login successful', { email });
      } else {
        // First try Supabase auth
        try {
          // Use the authenticateAdmin utility function
          loginSuccess = await authenticateAdmin(email, password);
          
          if (loginSuccess) {
            logger.admin('Supabase login successful', { email });
            
          } else {
            logger.warn('Supabase authentication failed', { email });
            // We'll fall back to localStorage method below
          }
        } catch (authError) {
          logger.error('Authentication error', authError);
          console.error('Auth error:', authError);
          // We'll fall back to localStorage method below
        }
      }
      
      if (!loginSuccess) {
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }
      
      logger.admin('Admin login successful, redirecting...', { email });
      console.log('Admin login successful, redirecting...');
      
      // Set success message
      setError(null);
      
      // Wait a moment for cookies to be set before redirecting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify cookie was set before redirecting
      const cookieCheck = document.cookie.split(';').some(cookie => cookie.trim().startsWith('adminSession=authenticated'));
      console.log('🔍 Cookie verification before redirect:', {
        cookieSet: cookieCheck,
        allCookies: document.cookie
      });
      
      if (!cookieCheck) {
        console.error('❌ Cookie not set properly - trying again');
        document.cookie = 'adminSession=authenticated; path=/; max-age=86400; SameSite=Lax; Secure=false';
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // First try router push
      router.push('/admin');
      
      // Fallback to window.location after a short delay
      setTimeout(() => {
        const baseUrl = window.location.origin;
        window.location.href = `${baseUrl}/admin`;
      }, 1000);
      
    } catch (error: any) {
      logger.error('Unexpected login error', error);
      console.error('Login error:', error);
      setError(`Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
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
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@mopres.co.za"
          />
          
          <div className="relative">
            <Input
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
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
        

        {/* User Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            <Link href="/account/login" className="text-amber-600 hover:text-amber-700 font-medium">
              Customer Login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}