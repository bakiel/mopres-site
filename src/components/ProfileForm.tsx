'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import type { User } from '@supabase/supabase-js';

interface ProfileFormProps {
  user: User | null; // Pass the user object
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user }) => {
  const supabase = createSupabaseBrowserClient();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(''); // Display only, not editable here
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Extract names from metadata, default to empty strings if not present
      setFirstName(user.user_metadata?.first_name || '');
      setLastName(user.user_metadata?.last_name || '');
      setEmail(user.email || ''); // Get email
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { // Use the 'data' field for user_metadata
          first_name: firstName,
          last_name: lastName,
        }
      });

      if (error) throw error;

      // Note: Supabase might require a page refresh or re-fetch of user data
      // for the changes in user_metadata to be reflected immediately everywhere.
      // Consider triggering a user state refresh in the parent component if needed.
      toast.success("Profile updated successfully!");
      // Optionally update local state if Supabase doesn't auto-refresh user object
      // setUser(data.user); // Assuming updateUser returns the updated user

    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleProfileUpdate} className="space-y-4 font-poppins bg-white p-6 border border-border-light rounded shadow-md">
      <h3 className="text-lg font-semibold font-montserrat mb-4 border-b pb-2">
        Edit Profile
      </h3>
      {/* Email (Display Only) */}
       <div>
          <label htmlFor="email_display" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email_display"
            value={email}
            disabled // Not editable here
            className="w-full p-2 border border-gray-200 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
          />
           <p className="text-xs text-gray-500 mt-1">Email cannot be changed here. Use password reset if needed.</p>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-border-light">
        <Button type="submit" variant="primary" disabled={isLoading || !user}>
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
