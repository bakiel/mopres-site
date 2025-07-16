'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import { useRouter } from 'next/navigation';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface UserFormProps {
  initialData?: {
    id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    permissions?: Record<string, boolean>;
  };
  isNew?: boolean;
}

const ROLES = [
  { id: 'admin', name: 'Administrator', description: 'Full access to all features' },
  { id: 'editor', name: 'Editor', description: 'Can edit content, products, and orders' },
  { id: 'viewer', name: 'Viewer', description: 'Read-only access to all features' },
];

const PERMISSIONS = [
  { id: 'products', name: 'Products', description: 'Manage products and collections' },
  { id: 'orders', name: 'Orders', description: 'View and manage customer orders' },
  { id: 'customers', name: 'Customers', description: 'Access to customer information' },
  { id: 'content', name: 'Content', description: 'Edit website content and blogs' },
  { id: 'analytics', name: 'Analytics', description: 'View store analytics and reports' },
  { id: 'settings', name: 'Settings', description: 'Modify store settings' },
];

export default function UserForm({ initialData = {}, isNew = false }: UserFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'viewer',
    permissions: {},
    password: '',
    confirmPassword: '',
    ...initialData,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();
  const supabaseClient = supabase();

  useEffect(() => {
    if (formData.role === 'admin') {
      // Admin role gets all permissions
      const allPermissions = PERMISSIONS.reduce((acc, permission) => {
        return { ...acc, [permission.id]: true };
      }, {});
      
      setFormData(prev => ({
        ...prev,
        permissions: allPermissions
      }));
    }
  }, [formData.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePermissionChange = (id: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [id]: checked
      }
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.first_name) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (isNew || formData.password) {
      if (isNew && !formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password && formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isNew) {
        // Create new user flow
        const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          user_metadata: {
            role: formData.role
          },
          email_confirm: true
        });
        
        if (authError) throw authError;
        
        // Insert into admin_users table
        const { error: insertError } = await supabaseClient
          .from('admin_users')
          .insert({
            id: authData.user.id,
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role,
            permissions: formData.permissions
          });
          
        if (insertError) throw insertError;
      } else {
        // Update existing user
        const updates = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          permissions: formData.permissions
        };
        
        const { error: updateError } = await supabaseClient
          .from('admin_users')
          .update(updates)
          .eq('id', initialData.id);
          
        if (updateError) throw updateError;
        
        // Update user metadata with role
        const { error: metadataError } = await supabaseClient.auth.admin.updateUserById(
          initialData.id!,
          { user_metadata: { role: formData.role } }
        );
        
        if (metadataError) throw metadataError;
        
        // Update password if provided
        if (formData.password) {
          const { error: passwordError } = await supabaseClient.auth.admin.updateUserById(
            initialData.id!,
            { password: formData.password }
          );
          
          if (passwordError) throw passwordError;
        }
      }
      
      setShowSuccessMessage(true);
      
      // Redirect back to users list after a brief delay
      setTimeout(() => {
        router.push('/admin/settings/users');
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error('Error saving user:', error);
      setErrors(prev => ({
        ...prev,
        form: 'An error occurred while saving the user. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      {showSuccessMessage && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded">
          User has been {isNew ? 'created' : 'updated'} successfully!
        </div>
      )}
      
      {errors.form && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded flex items-start">
          <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5" />
          <span>{errors.form}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isNew}
            className={`w-full p-2 border rounded ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } ${!isNew ? 'bg-gray-100' : ''}`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {ROLES.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {ROLES.find(r => r.id === formData.role)?.description}
          </p>
        </div>
        
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.first_name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.last_name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
          )}
        </div>
      </div>
      
      {/* Password fields - only shown for new users or when editing */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          {isNew ? 'Set Password' : 'Change Password (Optional)'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {isNew ? 'Password' : 'New Password'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Permissions section - disabled for admin role */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Permissions</h3>
        {formData.role === 'admin' ? (
          <p className="text-sm text-gray-500 italic mb-2">
            Administrators have full access to all features by default.
          </p>
        ) : (
          <p className="text-sm text-gray-500 mb-2">
            Select the features this user can access:
          </p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PERMISSIONS.map(permission => (
            <div key={permission.id} className="flex items-start">
              <input
                type="checkbox"
                id={`permission-${permission.id}`}
                checked={!!formData.permissions[permission.id]}
                onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                disabled={formData.role === 'admin'}
                className="mt-1 h-4 w-4 text-brand-primary border-gray-300 rounded"
              />
              <label htmlFor={`permission-${permission.id}`} className="ml-2 block text-sm">
                <span className="font-medium text-gray-700">{permission.name}</span>
                <span className="text-gray-500 block">{permission.description}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push('/admin/settings/users')}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : (isNew ? 'Create User' : 'Update User')}
        </button>
      </div>
    </form>
  );
}
