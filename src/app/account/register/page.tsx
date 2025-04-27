'use client'; // This page requires client-side interaction for the form

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient'; // Import the factory function

export default function RegisterPage() {
  // Create the client instance inside the component
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // Removed unused router: const router = useRouter();

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setLoading(false);
        return;
    }

    try {
      // Attempt to sign up the user with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        // Options can be added here if needed, e.g., for redirect URL or user metadata
        // options: {
        //   emailRedirectTo: `${window.location.origin}/auth/callback`, // Example redirect
        // }
      });

      if (signUpError) {
        console.error("Supabase registration error:", signUpError);
        // Handle specific errors
        if (signUpError.message.includes("User already registered")) {
            setError("An account with this email already exists. Please login or use a different email.");
        } else if (signUpError.message.includes("Password should be at least 6 characters")) {
             setError("Password must be at least 6 characters long."); // Should be caught by client-side validation too
        }
        else {
            setError("Registration failed. Please try again later.");
        }
        setLoading(false);
        return;
      }

      // Handle case where user exists but is not confirmed (resend confirmation?)
      // Supabase v2 signUp returns data.user = null and data.session = null if confirmation is required
      // and doesn't throw an error for existing unconfirmed users by default.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
           setMessage("Confirmation email resent. Please check your inbox.");
      } else if (data.session === null && data.user) {
           // Standard success case where confirmation email is sent
           setMessage("Registration successful! Please check your email and click the confirmation link to activate your account.");
      } else {
           // Handle unexpected cases or if user is auto-confirmed (depends on Supabase settings)
           setMessage("Account created successfully.");
           // Maybe redirect immediately if auto-confirmed?
           // setTimeout(() => router.push('/account'), 2000);
      }


      // Optionally clear form fields on success
      // setEmail('');
      // setPassword('');
       // setConfirmPassword('');

    } catch (catchError) { // Explicitly type error later if needed, or use unknown
       const errorMessage = catchError instanceof Error ? catchError.message : 'An unknown error occurred';
       console.error("Unexpected error during registration:", catchError);
       setError(`An unexpected error occurred: ${errorMessage}`);
    } finally {
        setLoading(false); // Ensure loading is set to false in all cases
    }
  };

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-md mx-auto px-4">
        <SectionTitle centered>Create Your Account</SectionTitle>

        <form onSubmit={handleRegister} className="mt-8 space-y-6 font-poppins"> {/* Added font-poppins */}
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
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 px-4 border border-border-light bg-white font-poppins text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light"
              placeholder="Create a password (min. 6 characters)"
            />
          </div>

           <div>
            <label htmlFor="confirm-password" className="block mb-2 font-medium text-sm text-text-dark font-poppins"> {/* Added font-poppins */}
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-3 px-4 border border-border-light bg-white font-poppins text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light"
              placeholder="Re-enter your password"
            />
          </div>

          {/* TODO: Add Terms & Conditions checkbox if required */}

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-text-light font-poppins"> {/* Added font-poppins */}
          Already have an account?{' '}
          <Link
            href="/account/login"
            className="font-medium text-brand-gold hover:underline font-poppins"> {/* Added font-poppins */}
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
