'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import { Address } from '@/app/account/addresses/page'; // Import type

interface AddressFormProps {
  initialData?: Address | null; // For editing existing address
  onSubmit: (formData: Omit<Address, 'id' | 'created_at' | 'user_id'>) => Promise<void>; // Function to handle submission
  onCancel?: () => void; // Optional: Function to handle cancellation
  submitButtonText?: string;
}

const AddressForm: React.FC<AddressFormProps> = ({
  initialData = null,
  onSubmit,
  onCancel,
  submitButtonText = 'Save Address',
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'South Africa', // Default
    phone: '',
    is_default: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        address_line1: initialData.address_line1 || '',
        address_line2: initialData.address_line2 || '',
        city: initialData.city || '',
        province: initialData.province || '',
        postal_code: initialData.postal_code || '',
        country: initialData.country || 'South Africa',
        phone: initialData.phone || '',
        is_default: initialData.is_default || false,
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Handle checkbox separately
    const isCheckbox = type === 'checkbox';
    const inputValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: inputValue }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Prepare data, removing potentially null fields if needed by backend/DB
       const dataToSubmit = {
           ...formData,
           address_line2: formData.address_line2 || null, // Ensure null if empty
           phone: formData.phone || null, // Ensure null if empty
       };
      await onSubmit(dataToSubmit);
      // Optionally reset form or call onCancel after successful submission
      // if (!initialData) { // Reset only if adding new
      //   setFormData({ ...initial state... });
      // }
    } catch (error) {
      console.error("Error submitting address form:", error);
      // Error handling (e.g., toast notification) should ideally be in the parent component's onSubmit
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-poppins bg-white p-6 border border-border-light rounded shadow-md">
      <h3 className="text-lg font-semibold font-montserrat mb-4 border-b pb-2">
        {initialData ? 'Edit Address' : 'Add New Address'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleInputChange} required className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold" />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleInputChange} required className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold" />
        </div>
      </div>
      <div>
        <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input type="text" id="address_line1" name="address_line1" placeholder="Street address" value={formData.address_line1} onChange={handleInputChange} required className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold" />
      </div>
      <div>
        <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700 mb-1">Apartment, suite, etc. (Optional)</label>
        <input type="text" id="address_line2" name="address_line2" value={formData.address_line2 || ''} onChange={handleInputChange} className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} required className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold" />
        </div>
        <div>
          <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">Province</label>
          <select
            id="province"
            name="province"
            value={formData.province}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-border-light rounded bg-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
          >
            <option value="" disabled>Select Province...</option>
            <option value="Eastern Cape">Eastern Cape</option>
            <option value="Free State">Free State</option>
            <option value="Gauteng">Gauteng</option>
            <option value="KwaZulu-Natal">KwaZulu-Natal</option>
            <option value="Limpopo">Limpopo</option>
            <option value="Mpumalanga">Mpumalanga</option>
            <option value="North West">North West</option>
            <option value="Northern Cape">Northern Cape</option>
            <option value="Western Cape">Western Cape</option>
          </select>
        </div>
        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
          <input type="text" id="postal_code" name="postal_code" value={formData.postal_code} onChange={handleInputChange} required className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold" />
        </div>
      </div>
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country/Region</label>
        <select id="country" name="country" value={formData.country} onChange={handleInputChange} required className="w-full p-2 border border-border-light rounded bg-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
          <option>South Africa</option>
          {/* Add other countries if needed */}
        </select>
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
        <input type="tel" id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="For delivery updates" className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold" />
      </div>
       <div className="flex items-center">
            <input
                id="is_default"
                name="is_default"
                type="checkbox"
                checked={formData.is_default}
                onChange={handleInputChange}
                className="h-4 w-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold"
            />
            <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                Set as default shipping address
            </label>
        </div>
      <div className="flex justify-end gap-3 mt-6">
        {onCancel && (
          <Button type="button" variant="outline-light" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;
