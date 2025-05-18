'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Button from '@/components/Button';
import Link from 'next/link';
import { formatDate } from '@/utils/formatters';

// Types
interface BannerFormProps {
  initialData?: {
    id?: string;
    title: string;
    image_url: string | null;
    link_url: string | null;
    start_date: string | null;
    end_date: string | null;
    position: number;
    is_active: boolean;
  };
  isEditing?: boolean;
}

// Default empty banner
const emptyBanner = {
  title: '',
  image_url: null,
  link_url: null,
  start_date: null,
  end_date: null,
  position: 0,
  is_active: true,
};

export default function BannerForm({ initialData = emptyBanner, isEditing = false }: BannerFormProps) {
  const supabase = createClientComponentClient();
  const [formData, setFormData] = useState(initialData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData.image_url);
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Handle date changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value || null
    }));
  };

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload image to storage
  const uploadImage = async () => {
    if (!imageFile) return initialData.image_url;
    
    setIsUploading(true);
    
    try {
      // Generate a unique file name
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, imageFile);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage.from('public').getPublicUrl(filePath);
      
      setIsUploading(false);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setIsUploading(false);
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Validate form
      if (!formData.title) {
        toast.error('Banner title is required');
        setSaving(false);
        return;
      }
      
      if (!imagePreview && !initialData.image_url) {
        toast.error('Banner image is required');
        setSaving(false);
        return;
      }
      
      // Validate dates if both are provided
      if (formData.start_date && formData.end_date) {
        const startDate = new Date(formData.start_date);
        const endDate = new Date(formData.end_date);
        
        if (startDate > endDate) {
          toast.error('End date must be after start date');
          setSaving(false);
          return;
        }
      }
      
      // Upload image if selected
      let imageUrl = formData.image_url;
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      // Prepare banner data
      const bannerData = {
        title: formData.title,
        image_url: imageUrl,
        link_url: formData.link_url,
        start_date: formData.start_date,
        end_date: formData.end_date,
        position: formData.position,
        is_active: formData.is_active
      };
      
      let bannerId = initialData.id;
      
      if (isEditing && bannerId) {
        // Update existing banner
        const { error: updateError } = await supabase
          .from('content_banners')
          .update(bannerData)
          .eq('id', bannerId);
        
        if (updateError) throw updateError;
        
        toast.success('Banner updated successfully');
      } else {
        // Create new banner
        const { data: newBanner, error: createError } = await supabase
          .from('content_banners')
          .insert(bannerData)
          .select('id')
          .single();
        
        if (createError) throw createError;
        
        bannerId = newBanner.id;
        toast.success('Banner created successfully');
      }
      
      // Add entry to admin_logs
      await supabase
        .from('admin_logs')
        .insert({
          action: isEditing ? 'UPDATE' : 'CREATE',
          entity_type: 'content_banners',
          entity_id: bannerId,
          details: {
            title: formData.title
          }
        });
      
      // Redirect to banners page after short delay
      setTimeout(() => {
        window.location.href = '/admin/content/banners';
      }, 1500);
      
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditing ? 'Edit Banner' : 'Create New Banner'}
        </h1>
        
        <Link href="/admin/content/banners">
          <Button variant="secondary">Cancel</Button>
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium mb-4">Banner Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                  placeholder="e.g. Summer Sale Banner"
                />
              </div>
              
              <div>
                <label htmlFor="link_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL (optional)
                </label>
                <input
                  type="url"
                  id="link_url"
                  name="link_url"
                  value={formData.link_url || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                  placeholder="e.g. /collections/summer-sale"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter a relative path or full URL
                </p>
              </div>
            </div>
          </div>
          
          {/* Banner Image */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium mb-4">Banner Image *</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select Image
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  Recommended size: 1200 x 400 pixels. Max size: 5MB.
                </p>
                {imagePreview && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                      setFormData(prev => ({ ...prev, image_url: null }));
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Image
                  </button>
                )}
              </div>
              
              <div className="bg-gray-100 rounded-md overflow-hidden h-40 flex items-center justify-center">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Banner Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">No image selected</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Display Settings */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium mb-4">Display Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  id="position"
                  name="position"
                  min="0"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Lower numbers display first
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 text-brand-primary focus:ring-brand-primary rounded border-gray-300"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Banner is active
                </label>
              </div>
            </div>
          </div>
          
          {/* Schedule */}
          <div>
            <h2 className="text-lg font-medium mb-4">Schedule (Optional)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date || ''}
                  onChange={handleDateChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank to start immediately
                </p>
              </div>
              
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date || ''}
                  onChange={handleDateChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank for no end date
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={saving || isUploading}
            className="flex items-center"
          >
            {(saving || isUploading) && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isEditing ? 'Update Banner' : 'Create Banner'}
          </Button>
        </div>
      </form>
    </div>
  );
}
