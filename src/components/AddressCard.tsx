'use client'; // Needs client-side interaction for buttons

import React from 'react';
import Button from './Button'; // Assuming Button is usable client-side
import { Address } from '@/app/account/addresses/page'; // Import type from page for now

interface AddressCardProps {
  address: Address;
  onEdit: () => void; // Changed from (addressId: string) as we call it directly
  onDelete: () => void; // Changed from (addressId: string)
  onSetDefault: () => void; // Changed from (addressId: string)
}

// Destructure the props
const AddressCard: React.FC<AddressCardProps> = ({ address, onEdit, onDelete, onSetDefault }) => {

  // Use the passed-in props directly in onClick handlers
  const handleEdit = () => {
    onEdit(); // Call the prop function
    // console.log("Edit address:", address.id);
    // TODO: Implement edit functionality (e.g., open modal with AddressForm)
    // alert("Edit functionality not yet implemented.");
  };

  const handleDelete = async () => {
    // Confirmation logic might be better handled in the parent page
    // if (confirm("Are you sure you want to delete this address?")) {
      onDelete(); // Call the prop function
      // console.log("Delete address:", address.id);
      // TODO: Implement delete functionality (call Supabase delete)
      // alert("Delete functionality not yet implemented.");
      // Example:
      // const supabase = createSupabaseBrowserClient();
      // const { error } = await supabase.from('user_addresses').delete().eq('id', address.id);
      // if (error) { toast.error(...) } else { toast.success(...); // refresh addresses }
    // }
  };

  const handleSetDefault = async () => {
     if (address.is_default) return; // Already default
     onSetDefault(); // Call the prop function
     // console.log("Set default address:", address.id);
     // TODO: Implement set default functionality (call Supabase update)
     // alert("Set default functionality not yet implemented.");
     // Example: Needs a transaction or function to unset other defaults first
     // const supabase = createSupabaseBrowserClient();
     // // 1. Unset current default
     // await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', address.user_id).eq('is_default', true);
     // // 2. Set new default
     // await supabase.from('user_addresses').update({ is_default: true }).eq('id', address.id);
     // // Handle errors and refresh
  };


  return (
    <div className={`bg-white p-5 border rounded shadow-sm relative ${address.is_default ? 'border-brand-gold border-2' : 'border-border-light'}`}>
      {address.is_default && (
        <span className="absolute top-2 right-2 bg-brand-gold text-white text-xs font-medium px-2 py-0.5 rounded">
          Default
        </span>
      )}
      <p className="font-semibold text-text-dark mb-2">
        {address.first_name} {address.last_name}
      </p>
      <div className="text-sm text-text-light space-y-1">
        <p>{address.address_line1}</p>
        {address.address_line2 && <p>{address.address_line2}</p>}
        <p>{address.city}, {address.province}, {address.postal_code}</p>
        <p>{address.country}</p>
        {address.phone && <p>Phone: {address.phone}</p>}
      </div>
      <div className="mt-4 pt-4 border-t border-border-light flex flex-wrap gap-2">
        <Button variant="outline-light" onClick={handleEdit} className="text-xs px-3 py-1">Edit</Button> {/* Removed size, added padding */}
        {/* Changed variant, removed size, added text/border color classes */}
        <Button variant="outline-light" onClick={handleDelete} className="text-xs px-3 py-1 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-500">Delete</Button>
        {/* Restore conditional rendering */}
        {!address.is_default && (
          <Button variant="secondary" onClick={handleSetDefault} className="text-xs px-3 py-1">Set as Default</Button>
        )}
      </div>
    </div>
  );
};

export default AddressCard;
