'use client'; // Make this a client component for state and interactions

import React, { useState, useEffect } from 'react'; // Import hooks
// Remove cookies import: import { cookies } from 'next/headers';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient'; // Use browser client
import SectionTitle from '@/components/SectionTitle';
import Button from '@/components/Button';
// Remove redirect import: import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation'; // Use router for client-side redirect
import Link from 'next/link';
import AddressForm from '@/components/AddressForm';
import AddressCard from '@/components/AddressCard';
import toast from 'react-hot-toast'; // For notifications
import type { User } from '@supabase/supabase-js';

// Define type for Address
export interface Address {
  id: string;
  created_at: string;
  user_id: string;
  is_default: boolean;
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  phone?: string | null;
}

export default function AddressesPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // State to control form visibility
  const [editingAddress, setEditingAddress] = useState<Address | null>(null); // State for address being edited

  // Fetch user and addresses on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Check user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.error("Session error or no user:", sessionError);
        router.push('/account/login?redirect=/account/addresses'); // Redirect client-side
        return;
      }
      setUser(session.user);

      // Fetch user's addresses
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', session.user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching addresses:", error);
        toast.error("Could not load your addresses.");
        setAddresses([]); // Set empty array on error
      } else {
        setAddresses(data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [router, supabase]); // Add dependencies

  // --- CRUD Handlers ---

  const handleAddAddress = () => {
    setEditingAddress(null); // Ensure not editing
    setShowForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  const refreshAddresses = async () => {
      if (!user) return; // Should not happen if already checked
      setLoading(true); // Show loading indicator while refreshing
       const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

       if (error) {
           console.error("Error refreshing addresses:", error);
           toast.error("Failed to refresh addresses.");
       } else {
           setAddresses(data || []);
       }
       setLoading(false);
  };

  const handleFormSubmit = async (formData: Omit<Address, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return; // Guard clause

    try {
        // If editing, update existing address
        if (editingAddress) {
             // Handle default address logic: If setting this as default, unset others first
             if (formData.is_default) {
                 const { error: unsetError } = await supabase
                     .from('user_addresses')
                     .update({ is_default: false })
                     .eq('user_id', user.id)
                     .eq('is_default', true);
                 if (unsetError) throw new Error(`Failed to unset default: ${unsetError.message}`);
             }

            const { error } = await supabase
                .from('user_addresses')
                .update(formData)
                .eq('id', editingAddress.id);
            if (error) throw error;
            toast.success("Address updated successfully!");
        }
        // If adding new address
        else {
             // Handle default address logic: If setting this as default, unset others first
             if (formData.is_default) {
                 const { error: unsetError } = await supabase
                     .from('user_addresses')
                     .update({ is_default: false })
                     .eq('user_id', user.id)
                     .eq('is_default', true);
                 if (unsetError) throw new Error(`Failed to unset default: ${unsetError.message}`);
             }

            const { error } = await supabase
                .from('user_addresses')
                .insert({ ...formData, user_id: user.id }); // Add user_id
            if (error) throw error;
            toast.success("Address added successfully!");
        }
        setShowForm(false);
        setEditingAddress(null);
         await refreshAddresses(); // Refresh the list
     } catch (error) { // Explicitly type error later if needed, or use unknown
         const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
         console.error("Error saving address:", error);
         toast.error(`Failed to save address: ${errorMessage}`);
        // Re-throw or handle specific errors if needed
        throw error; // Re-throw to indicate submission failure to AddressForm
    }
  };

   const handleDeleteAddress = async (addressId: string) => {
       if (confirm("Are you sure you want to delete this address?")) {
           try {
               const { error } = await supabase.from('user_addresses').delete().eq('id', addressId);
               if (error) throw error;
                toast.success("Address deleted.");
                await refreshAddresses();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                console.error("Error deleting address:", error);
                toast.error(`Failed to delete address: ${errorMessage}`);
           }
       }
   };

   const handleSetDefaultAddress = async (addressId: string) => {
       if (!user) return;
        try {
            // Use a transaction or function for atomicity if possible, otherwise two steps:
            // 1. Unset current default
            const { error: unsetError } = await supabase
                .from('user_addresses')
                .update({ is_default: false })
                .eq('user_id', user.id)
                .eq('is_default', true);
            if (unsetError) throw new Error(`Failed to unset current default: ${unsetError.message}`);

            // 2. Set new default
            const { error: setError } = await supabase
                .from('user_addresses')
                .update({ is_default: true })
                .eq('id', addressId);
            if (setError) throw new Error(`Failed to set new default: ${setError.message}`);

            toast.success("Default address updated.");
             await refreshAddresses();
         } catch (error) {
             const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
             console.error("Error setting default address:", error);
             toast.error(`Failed to set default address: ${errorMessage}`);
        }
   };


  if (loading && !user) { // Show loading only if user isn't determined yet
      return (
          <div className="bg-background-body py-12 lg:py-20">
              <div className="w-full max-w-screen-lg mx-auto px-4 text-center">
                  <p className="text-text-light">Loading account details...</p>
              </div>
          </div>
      );
  }


  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <SectionTitle centered>My Addresses</SectionTitle>

        <div className="mt-8 font-poppins">
             <div className="mb-6 text-right">
                 <Button variant="primary" onClick={handleAddAddress} disabled={showForm}>
                     Add New Address
                 </Button>
             </div>

             {/* Conditionally render the form */}
             {showForm && (
                 <div className="mb-8">
                     <AddressForm
                        key={editingAddress ? editingAddress.id : 'new'} // Key helps reset form state when switching between add/edit
                        initialData={editingAddress}
                        onSubmit={handleFormSubmit}
                        onCancel={handleCancelForm}
                        submitButtonText={editingAddress ? 'Update Address' : 'Save Address'}
                     />
                 </div>
             )}

            {/* Display Addresses */}
            {loading && addresses.length === 0 && <p className="text-center text-text-light">Loading addresses...</p>}
            {!loading && addresses.length === 0 && !showForm && (
                <div className="text-center mt-8 bg-white p-12 border border-border-light rounded shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">No Saved Addresses</h2>
                    <p className="text-text-light mb-6">You haven't saved any shipping addresses yet.</p>
                    <Button variant="secondary" onClick={handleAddAddress}>Add Your First Address</Button>
                </div>
            )}
            {addresses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <AddressCard
                            key={address.id}
                            address={address}
                            onEdit={() => handleEditAddress(address)}
                            onDelete={() => handleDeleteAddress(address.id)}
                            onSetDefault={() => handleSetDefaultAddress(address.id)}
                        />
                    ))}
                </div>
            )}
        </div>

         <div className="mt-8 text-center">
            <Link href="/account" className="text-brand-gold hover:underline font-poppins text-sm">
                &larr; Back to Account
            </Link>
        </div>

      </div>
    </div>
  );
}
