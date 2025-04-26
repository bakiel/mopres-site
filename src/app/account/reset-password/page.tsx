'use client'; // This component needs client-side interaction

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient'; // Use browser client

export default function ResetPasswordPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(false); // Track if the token seems valid initially

  // Check for session or error on mount (Supabase handles token verification implicitly on updateUser)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error checking session:", sessionError);
        setError("Could not verify your session. The reset link might be invalid or expired.");
        setIsTokenValid(false);
      } else if (session) {
        // A session exists, meaning the user likely came from the email link
        setIsTokenValid(true);
      } else {
         // No session, but might still be valid if user just clicked link
         // We rely on updateUser to confirm validity
         setIsTokenValid(true); // Assume valid for now, let updateUser confirm
      }
    };
    checkSession();
  }, [supabase]); // Dependency array includes supabase

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) { // Basic password length check
        setError("Password must be at least 6 characters long.");
        return;
    }

    setLoading(true);

    try {
      // Supabase automatically uses the code from the URL fragment (#access_token=...)
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error("Error updating password:", updateError);
        setError(updateError.message || "Failed to update password. The link may have expired.");
      } else {
        setMessage("Password updated successfully! Redirecting to login...");
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/account/login');
        }, 2000);
      }
    } catch (err: any) {
      console.error("Unexpected error updating password:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-md mx-auto px-4">
        <SectionTitle centered>Reset Your Password</SectionTitle>

        <div className="bg-white p-6 md:p-8 border border-border-light rounded shadow-sm mt-8 font-poppins">
          {!isTokenValid && !error && (
             <p className="text-text-light text-center">Verifying reset link...</p>
          )}

          {isTokenValid && (
            <form onSubmit={handlePasswordUpdate}>
              <p className="text-text-light mb-6 text-center">
                Enter your new password below.
              </p>

              <div className="form-group mb-4">
                <label htmlFor="password" className="block mb-2.5 font-medium text-sm text-text-dark">New Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full py-3.5 px-4 border border-border-light bg-white font-poppins text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light"
                />
              </div>

              <div className="form-group mb-6">
                <label htmlFor="confirmPassword" className="block mb-2.5 font-medium text-sm text-text-dark">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
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
                disabled={loading || !isTokenValid} // Disable if token wasn't initially valid
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          )}
           {/* Show general error if token validation failed */}
           {!isTokenValid && error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
