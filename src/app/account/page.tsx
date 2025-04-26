'use client'; // Needs client-side state for user and interactions

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import SectionTitle from '@/components/SectionTitle';
import Button from '@/components/Button';
import ProfileForm from '@/components/ProfileForm';
import NotificationPreferencesForm from '@/components/NotificationPreferencesForm'; // Import notification form
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        console.error("Session error or no user:", error);
        router.push('/account/login?redirect=/account'); // Redirect if not logged in
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };
    getUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      toast.error(`Logout failed: ${error.message}`);
    } else {
      setUser(null); // Clear user state
      router.push('/'); // Redirect to homepage after logout
      // Optionally clear cart/other user-specific state here
      toast.success("Logged out successfully.");
    }
  };

  if (loading) {
    return (
      <div className="bg-background-body py-12 lg:py-20">
        <div className="w-full max-w-screen-lg mx-auto px-4 text-center">
          <p className="text-text-light">Loading account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
     // This case should ideally be handled by the redirect in useEffect,
     // but added as a fallback.
     return (
        <div className="bg-background-body py-12 lg:py-20">
            <div className="w-full max-w-screen-lg mx-auto px-4 text-center">
                <p className="text-text-light">Please log in to view your account.</p>
                <Link href="/account/login?redirect=/account">
                    <Button variant="primary" className="mt-4">Login</Button>
                </Link>
            </div>
        </div>
     );
  }

  // Get user's first name for greeting, fallback to 'Customer'
  const firstName = user.user_metadata?.first_name || 'Customer';

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <SectionTitle centered>My Account</SectionTitle>
        <p className="text-center text-text-light mb-10 font-poppins">
            Welcome back, {firstName}!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Sidebar/Navigation */}
          <div className="md:col-span-1 space-y-4">
             <h3 className="text-lg font-semibold font-montserrat mb-3">Account Menu</h3>
             <nav className="flex flex-col space-y-2 font-poppins text-sm">
                <Link href="/account/orders" className="text-text-dark hover:text-brand-gold p-2 rounded hover:bg-gray-100 transition-colors">Order History</Link>
                <Link href="/account/addresses" className="text-text-dark hover:text-brand-gold p-2 rounded hover:bg-gray-100 transition-colors">Manage Addresses</Link>
                <Link href="/account/wishlist" className="text-text-dark hover:text-brand-gold p-2 rounded hover:bg-gray-100 transition-colors">My Wishlist</Link>
                {/* Add link for Profile Editing section if needed, or keep form inline */}
                {/* <Link href="/account/profile" className="text-text-dark hover:text-brand-gold p-2 rounded hover:bg-gray-100 transition-colors">Edit Profile</Link> */}
                <button
                    onClick={handleLogout}
                    className="text-left text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                >
                    Logout
                </button>
             </nav>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-8"> {/* Added space-y */}
             {/* Render ProfileForm */}
             <ProfileForm user={user} />

             {/* Render Notification Preferences Form */}
             <NotificationPreferencesForm user={user} />

             {/* Placeholder for other dashboard content */}
             <div className="mt-8 bg-white p-6 border border-border-light rounded shadow-md">
                <h4 className="font-semibold font-montserrat mb-3">Account Overview</h4>
                <p className="text-sm text-text-light font-poppins">
                    From your account dashboard you can view your recent orders, manage your shipping addresses, and edit your password and account details.
                </p>
                {/* Add more dashboard widgets/summaries here later */}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
