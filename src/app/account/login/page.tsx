'use client'; // This page requires client-side interaction for the form

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient'; // Import the factory function
import toast from 'react-hot-toast'; // Import toast

export default function LoginPage() {
  // Create the client instance inside the component
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false); // State to show resend button
  const router = useRouter(); // Initialize router

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        console.error("Supabase login error:", signInError);
        // Provide a user-friendly error message
        if (signInError.message.includes("Invalid login credentials")) {
             setError("Invalid email or password. Please try again.");
             setShowResend(false);
        } else if (signInError.message.includes("Email not confirmed")) {
             setError("Email not confirmed. Please check your inbox or resend the confirmation email.");
             setShowResend(true); // Show the resend button
        }
         else {
             setError("Login failed. Please try again later.");
             setShowResend(false);
        }
        setLoading(false);
        return;
      }

      // Login successful
      setMessage("Login successful! Redirecting to your account...");
      // Use full page navigation to ensure session cookie is sent reliably
      setTimeout(() => {
        window.location.assign('/account');
      }, 1500); // Delay for user to see the message

    } catch (catchError: any) {
      console.error("Unexpected error during login:", catchError);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
    // Keep loading true until redirect happens or error occurs
    // setLoading(false); // Removed this line - loading state ends on redirect or error
  };

  const handleResendConfirmation = async () => {
    if (!email) {
        toast.error("Please enter your email address first.");
        return;
    }
    setLoading(true); // Use the main loading state or add a specific one
    setError(null);
    setMessage(null);
    try {
        const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        });
        if (resendError) {
            console.error("Error resending confirmation:", resendError);
            toast.error(resendError.message || "Failed to resend confirmation email.");
        } else {
            toast.success("Confirmation email resent. Please check your inbox.");
            setShowResend(false); // Hide button after successful resend
        }
    } catch (err) {
        console.error("Unexpected error resending confirmation:", err);
        toast.error("An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-md mx-auto px-4"> {/* Centered, max-width container */}
        <SectionTitle centered>Login to Your Account</SectionTitle>

        <form onSubmit={handleLogin} className="mt-8 space-y-6 font-poppins"> {/* Added font-poppins */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
              {/* Show resend button conditionally */}
              {showResend && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  className="ml-2 text-xs font-semibold text-red-800 underline hover:text-red-600 disabled:opacity-50"
                  disabled={loading}
                >
                  Resend Email
                </button>
              )}
            </div>
          )}
           {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{message}</span>
            </div>
          )}
          <div>
            <label htmlFor="email" className="block mb-2 font-medium text-sm text-text-dark font-poppins"> {/* Added font-poppins */}
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
              className="w-full py-3 px-4 border border-border-light bg-white font-poppins text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 font-medium text-sm text-text-dark font-poppins"> {/* Added font-poppins */}
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 px-4 border border-border-light bg-white font-poppins text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            {/* TODO: Add Remember me checkbox if needed */}
            <div className="text-sm">
              <Link href="/account/forgot-password" className="font-medium text-brand-gold hover:underline font-poppins"> {/* Added font-poppins */}
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-text-light font-poppins"> {/* Added font-poppins */}
          Don't have an account?{' '}
          <Link href="/account/register" className="font-medium text-brand-gold hover:underline font-poppins"> {/* Added font-poppins */}
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
