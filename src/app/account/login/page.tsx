'use client'; // This page requires client-side interaction for the form

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { supabase } from '@/lib/supabaseClient'; // Ensure supabase is imported

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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
        } else if (signInError.message.includes("Email not confirmed")) {
             setError("Please confirm your email address before logging in.");
             // Optionally, add a button/link to resend confirmation email
        }
         else {
             setError("Login failed. Please try again later.");
        }
        setLoading(false);
        return;
      }

      // Login successful
      setMessage("Login successful! Redirecting to your account...");
      // Redirect to the account dashboard page after a short delay
      setTimeout(() => {
        router.push('/account'); // Redirect to the main account page
        // router.refresh(); // Optional: force refresh to update session state if needed elsewhere
      }, 1500); // Delay for user to see the message

    } catch (catchError: any) {
      console.error("Unexpected error during login:", catchError);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
    // Keep loading true until redirect happens or error occurs
    // setLoading(false); // Removed this line - loading state ends on redirect or error
  };

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-md mx-auto px-4"> {/* Centered, max-width container */}
        <SectionTitle centered>Login to Your Account</SectionTitle>

        <form onSubmit={handleLogin} className="mt-8 space-y-6 font-poppins"> {/* Added font-poppins */}
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
              <Link href="#" className="font-medium text-brand-gold hover:underline font-poppins"> {/* Added font-poppins */}
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
