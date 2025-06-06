'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowserClient';
import { handleAuthError } from '@/lib/auth-utils';

export default function ForgotPasswordPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Log the environment variables as seen by the client
    console.log("ForgotPasswordPage: NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("ForgotPasswordPage: NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }, []); // Empty dependency array ensures this runs only once on mount

  const handlePasswordResetRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        // Redirect URL for the link in the email
        redirectTo: `${window.location.origin}/account/reset-password`,
      });

      if (resetError) {
        console.error("Password reset request error:", resetError);
        setError(handleAuthError(resetError));
      } else {
        setMessage("Password reset email sent from MoPres! Please check your inbox (and spam folder) for instructions.");
        setEmail(''); // Clear email field on success
      }
    } catch (catchError) {
      const errorMessage = catchError instanceof Error ? catchError.message : 'An unknown error occurred';
      console.error("Unexpected error during password reset request:", catchError);
      setError(`An unexpected error occurred: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-md mx-auto px-4">
        <SectionTitle centered>Reset Your Password</SectionTitle>
        <p className="text-center text-text-light mb-8 font-poppins">
          Enter your email address below, and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handlePasswordResetRequest} className="mt-8 space-y-6 font-poppins">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{message}</span>
            </div>
          )}
          {!message && (
            <>
              <div>
                <label htmlFor="email" className="block mb-2 font-medium text-sm text-text-dark">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 px-4 border border-border-light bg-white text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </>
          )}
        </form>

        <p className="mt-8 text-center text-sm text-text-light font-poppins">
          Remember your password?{' '}
          <Link href="/account/login" className="font-medium text-brand-gold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
