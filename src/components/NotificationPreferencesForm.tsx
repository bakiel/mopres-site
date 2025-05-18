'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowserClient';
import toast from 'react-hot-toast';
import type { User } from '@supabase/supabase-js';

interface NotificationPreferencesFormProps {
  user: User | null; // Pass the user object
}

const NotificationPreferencesForm: React.FC<NotificationPreferencesFormProps> = ({ user }) => {
  const supabase = createSupabaseBrowserClient();
  // State for the preference, default to true or based on existing metadata
  const [allowMarketing, setAllowMarketing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.allow_marketing_emails !== undefined) {
      setAllowMarketing(user.user_metadata.allow_marketing_emails);
    } else {
      // Default to true if not set? Or false? Let's default to true for now.
      setAllowMarketing(true);
    }
  }, [user]);

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAllowMarketing(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { // Update user_metadata
          allow_marketing_emails: allowMarketing,
        }
      });

      if (error) throw error;

      toast.success("Notification preferences updated!");

    } catch (error: any) {
      console.error("Error updating notification preferences:", error);
      toast.error(`Failed to update preferences: ${error.message}`);
      // Revert local state if update failed
      setAllowMarketing(user.user_metadata?.allow_marketing_emails ?? true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-poppins bg-white p-6 border border-border-light rounded shadow-md mt-8">
      <h3 className="text-lg font-semibold font-montserrat mb-4 border-b pb-2">
        Notification Preferences
      </h3>
      <div className="flex items-start">
            <div className="flex items-center h-5">
                <input
                    id="allow_marketing_emails"
                    name="allow_marketing_emails"
                    type="checkbox"
                    checked={allowMarketing}
                    onChange={handlePreferenceChange}
                    className="focus:ring-brand-gold h-4 w-4 text-brand-gold border-gray-300 rounded"
                />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor="allow_marketing_emails" className="font-medium text-gray-700">Marketing Emails</label>
                <p className="text-gray-500 text-xs">Receive occasional emails about new products, promotions, and sales.</p>
            </div>
        </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-border-light">
        <Button type="submit" variant="primary" disabled={isLoading || !user}>
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </form>
  );
};

export default NotificationPreferencesForm;
