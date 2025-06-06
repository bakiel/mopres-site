'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowserClient';
import { handleAuthError, validatePassword } from '@/lib/auth-utils';

export default function ResetPasswordPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null); // null = checking, false = invalid, true = valid

  // Check for password recovery token in URL hash on mount
  useEffect(() => {
    // For debugging, list all URL parameters and hash values
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    console.log("URL params:", params);
    console.log("URL hash:", window.location.hash);
    
    // Supabase sends the recovery token in the URL fragment like #access_token=...&refresh_token=...&type=recovery
    // We only need the access_token part for updateUser, but Supabase handles session creation automatically
    // if the user clicks the link. We just need to check if the 'type=recovery' is present.
    const hash = window.location.hash;
    
    // Accept either recovery or a direct token parameter
    if (hash.includes('type=recovery') || params.token || params.access_token) {
        setTokenValid(true);
        console.log("Password recovery flow detected.");
    } else {
        console.warn("No password recovery token found in URL hash or params.");
        setError("Invalid or missing password reset link. Please request a new one.");
        setTokenValid(false);
    }
  }, []); // Run only once on mount

  const handlePasswordUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Validate password using utility function
    const passwordValidation = validatePassword(password, confirmPassword);
    if (passwordValidation !== true) {
      setError(passwordValidation);
      setLoading(false);
      return;
    }

    try {
      // Update the user's password using the session established by the recovery link
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error("Password update error:", updateError);
        setError(handleAuthError(updateError));
      } else {
        setMessage("Password updated successfully! You can now log in with your new password.");
        setPassword(''); // Clear fields
        setConfirmPassword('');
        // Redirect to login after a short delay
         setTimeout(() => router.push('/account/login'), 3000);
       }
    } catch (catchError) {
       const errorMessage = catchError instanceof Error ? catchError.message : 'An unknown error occurred';
       console.error("Unexpected error during password update:", catchError);
       setError(`An unexpected error occurred: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-md mx-auto px-4">
        <SectionTitle centered>Set New Password</SectionTitle>
        <p className="text-center text-text-light mb-6 font-poppins">
          Create your new MoPres account password below.
        </p>

        {tokenValid === null && <p className="text-center text-text-light">Verifying link...</p>}

        {tokenValid === false && (
             <div className="text-center mt-8 font-poppins">
                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <span className="block sm:inline">{error || "Invalid password reset link."}</span>
                 </div>
                 <Link href="/account/forgot-password">
                    <Button variant="secondary">Request New Link</Button>
                 </Link>
             </div>
        )}

        {tokenValid === true && (
            <form onSubmit={handlePasswordUpdate} className="mt-8 space-y-6 font-poppins">
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
                      <label htmlFor="password" className="block mb-2 font-medium text-sm text-text-dark">
                      New Password
                      </label>
                      <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-3 px-4 border border-border-light bg-white text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light"
                      placeholder="Enter new password (min. 6 characters)"
                      />
                  </div>
                  <div>
                      <label htmlFor="confirm-password" className="block mb-2 font-medium text-sm text-text-dark">
                      Confirm New Password
                      </label>
                      <input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full py-3 px-4 border border-border-light bg-white text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light"
                      placeholder="Re-enter your new password"
                      />
                  </div>
                  <div>
                      <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      disabled={loading}
                      >
                      {loading ? 'Updating...' : 'Update Password'}
                      </Button>
                  </div>
                </>
            )}
            {message && (
                 <p className="mt-8 text-center text-sm text-text-light font-poppins">
                    Redirecting to login...
                 </p>
            )}
            </form>
        )}
      </div>
    </div>
  );
}
