'use client'; // Needs client-side checks for auth status initially

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js'; // Import User type

export default function AccountDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        // Handle error appropriately, maybe redirect to login
        router.push('/account/login');
        return;
      }

      if (!session?.user) {
        // No user session found, redirect to login
        console.log("No active session, redirecting to login.");
        router.push('/account/login');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/account/login'); // Redirect on logout
        } else if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null);
          // No redirect needed on sign in, already on account page or will be redirected here
        }
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]); // Add router to dependency array

  const handleLogout = async () => {
    setLoading(true); // Indicate loading state
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      alert("Logout failed. Please try again."); // Simple error feedback
      setLoading(false);
    }
    // Listener above will handle redirect
  };

  if (loading) {
    return (
      <div className="bg-background-body py-12 lg:py-20">
        <div className="w-full max-w-screen-xl mx-auto px-4 text-center">
          <p className="text-text-light">Loading account details...</p>
        </div>
      </div>
    );
  }

  // Should not reach here if loading is false and user is null due to redirect
  if (!user) {
     return null; // Or a fallback UI, though redirect should handle it
  }

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4"> {/* Wider container */}
        <SectionTitle centered>My Account</SectionTitle>

        <div className="bg-white p-8 border border-border-light rounded shadow-sm mt-8 font-poppins"> {/* Added font-poppins */}
          <h2 className="text-2xl font-semibold mb-4">Welcome, {user.email}!</h2>
          <p className="text-text-light mb-8">Manage your orders, wishlist, and personal details here.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Link to Order History */}
            <Link href="/account/orders" className="block p-6 border border-border-light rounded hover:shadow-md hover:border-brand-gold transition-all duration-200">
              <h3 className="font-semibold text-lg mb-2">Order History</h3>
              <p className="text-sm text-text-light">View your past orders and track current shipments.</p>
            </Link>

            {/* Link to Wishlist */}
            <Link href="/account/wishlist" className="block p-6 border border-border-light rounded hover:shadow-md hover:border-brand-gold transition-all duration-200">
              <h3 className="font-semibold text-lg mb-2">My Wishlist</h3>
              <p className="text-sm text-text-light">View and manage items saved to your wishlist.</p>
            </Link>

            {/* Link to Profile/Details (Optional - Create page later) */}
            {/* <Link href="/account/profile" className="block p-6 border border-border-light rounded hover:shadow-md hover:border-brand-gold transition-all duration-200">
              <h3 className="font-semibold text-lg mb-2">Personal Details</h3>
              <p className="text-sm text-text-light">Update your name, email, or password.</p>
            </Link> */}

             {/* Link to Addresses (Optional - Create page later) */}
            {/* <Link href="/account/addresses" className="block p-6 border border-border-light rounded hover:shadow-md hover:border-brand-gold transition-all duration-200">
              <h3 className="font-semibold text-lg mb-2">Addresses</h3>
              <p className="text-sm text-text-light">Manage your saved shipping addresses.</p>
            </Link> */}
          </div>

          <div className="mt-10 pt-6 border-t border-border-light">
            <Button onClick={handleLogout} variant="secondary" disabled={loading}>
              {loading ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
