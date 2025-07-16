import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Button from '@/components/Button';

interface AuthStatusProps {
  onVerified?: () => void;
  redirectTo?: string;
  showProfile?: boolean;
  requireAuth?: boolean;
}

const AuthStatus: React.FC<AuthStatusProps> = ({
  onVerified,
  redirectTo,
  showProfile = false,
  requireAuth = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setLoading(false);
          return;
        }
        
        if (data.session) {
          const { data: userData } = await supabase.auth.getUser();
          setUser(userData.user);
          
          // Check if email is confirmed
          setEmailVerified(userData.user?.email_confirmed_at !== null);
          
          // Call the callback if provided
          if (onVerified && userData.user?.email_confirmed_at) {
            onVerified();
          }
        }
        
        // If auth is required and no session exists, redirect
        if (requireAuth && !data.session && redirectTo) {
          window.location.href = `/account/login?redirect=${encodeURIComponent(redirectTo)}`;
        }
      } catch (err) {
        console.error('Unexpected error checking session:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, [onVerified, redirectTo, requireAuth, supabase.auth]);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    setSendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      
      if (error) {
        console.error('Error resending verification:', error);
        toast.error(error.message || 'Failed to resend verification email');
      } else {
        toast.success(`Verification email sent to ${user.email}`);
      }
    } catch (err) {
      console.error('Unexpected error resending verification:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Error signing out:', err);
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return <div className="py-2 text-center text-sm text-gray-500">Checking authentication status...</div>;
  }

  if (!user) {
    return null;
  }

  if (emailVerified === false) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md my-4">
        <p className="text-sm font-medium mb-2">
          Your email address ({user.email}) is not verified.
        </p>
        <button
          onClick={handleResendVerification}
          disabled={sendingEmail}
          className="text-xs font-medium text-amber-800 underline hover:text-amber-900 disabled:opacity-50"
        >
          {sendingEmail ? 'Sending...' : 'Resend verification email'}
        </button>
      </div>
    );
  }

  if (showProfile && user) {
    return (
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-md my-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Signed in as <span className="font-bold">{user.email}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Account verified {emailVerified ? '✓' : '✗'}
            </p>
          </div>
          <div className="flex space-x-2">
            <Link href="/account" className="text-xs text-brand-gold hover:underline">
              My Account
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs text-red-600 hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthStatus;