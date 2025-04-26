'use client'; // This is a client component

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient'; // Import the factory function

export default function ForgotPasswordPage() {
  // Create the client instance inside the component
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        // Specify the redirect URL for the password reset page
        redirectTo: `${window.location.origin}/account/reset-password`,
      });

      if (resetError) {
        console.error("Error sending password reset email:", resetError);
        setError(resetError.message || "Failed to send password reset email.");
      } else {
        setMessage("Password reset email sent. Please check your inbox.");
        setEmail(''); // Clear the email field
      }
    } catch (err: any) {
      console.error("Unexpected error during password reset:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-md mx-auto px-4">
        <SectionTitle centered>Forgot Your Password?</SectionTitle>

        <div className="bg-white p-6 md:p-8 border border-border-light rounded shadow-sm mt-8 font-poppins">
          <p className="text-text-light mb-6 text-center">
            Enter your email address below and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleResetPassword}>
            <div className="form-group mb-6">
              <label htmlFor="email" className="block mb-2.5 font-medium text-sm text-text-dark">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full py-3.5 px-4 border border-border-light bg-white font-poppins text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light"
              />
            </div>

            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
                <span className="block sm:inline">{message}</span>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="text-center mt-6">
            <Link href="/account/login" className="text-brand-gold hover:underline text-sm">
              &larr; Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
