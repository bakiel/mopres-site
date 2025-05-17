'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

export default function RegisterPage() {
  // Create the client instance inside the component
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
      });

      if (signUpError) {
        console.error("Registration error:", signUpError);
        // Handle specific errors
        if (signUpError.message.includes("User already registered")) {
            setError("An account with this email already exists. Please login or use a different email.");
        } else if (signUpError.message.includes("Password should be at least 6 characters")) {
             setError("Password must be at least 6 characters long.");
        }
        else {
            setError("Registration failed. Please try again later.");
        }
        setLoading(false);
        return;
      }

      // Handle case where user exists but is not confirmed (resend confirmation?)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
           setMessage("Confirmation email resent. Please check your inbox.");
      } else if (data.session === null && data.user) {
           // Standard success case where confirmation email is sent
           setMessage("Registration successful! Please check your email and click the confirmation link from MoPres to activate your account.");
      } else {
           // Handle unexpected cases or if user is auto-confirmed
           setMessage("Account created successfully.");
      }

    } catch (catchError) {
       const errorMessage = catchError instanceof Error ? catchError.message : 'An unknown error occurred';
       console.error("Unexpected error during registration:", catchError);
       setError(`An unexpected error occurred: ${errorMessage}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-md mx-auto px-4">
        <SectionTitle centered>Create Your MoPres Account</SectionTitle>
        
        <p className="text-center text-text-light mb-6 font-poppins">
          Join MoPres to access exclusive contemporary luxury footwear from South Africa.
        </p>

        <form onSubmit={handleRegister} className="mt-8 space-y-6 font-poppins">
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
            <label htmlFor="email" className="block mb-2 font-medium text-sm text-text-dark font-poppins">
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
            <label htmlFor="password" className="block mb-2 font-medium text-sm text-text-dark font-poppins">
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
            <label htmlFor="confirm-password" className="block mb-2 font-medium text-sm text-text-dark font-poppins">
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

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-text-light">
              I agree to the MoPres <Link href="/policies/terms" className="text-brand-gold hover:underline">Terms & Conditions</Link> and <Link href="/policies/privacy" className="text-brand-gold hover:underline">Privacy Policy</Link>
            </label>
          </div>

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

        <p className="mt-8 text-center text-sm text-text-light font-poppins">
          Already have an account?{' '}
          <Link
            href="/account/login"
            className="font-medium text-brand-gold hover:underline font-poppins">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
