'use client';

import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import { toast } from 'react-hot-toast';
import Button from '@/components/Button';
import Link from 'next/link';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

// Types
interface SizeGuideFormProps {
  initialData?: {
    id?: string;
    name: string;
    product_category: string;
    content: SizeTableRow[];
    image_url: string | null;
    is_active: boolean;
  };
  isEditing?: boolean;
}

interface SizeTableRow {
  size_name: string;
  measurements: { [key: string]: string };
}

// Default empty size guide
const emptySizeGuide = {
  name: '',
  product_category: '',
  content: [{ size_name: '', measurements: { chest: '', waist: '', hips: '' } }],
  image_url: null,
  is_active: true,
};

export default function SizeGuideForm({ initialData = emptySizeGuide, isEditing = false }: SizeGuideFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [measurementFields, setMeasurementFields] = useState<string[]>(
    Object.keys(initialData.content[0]?.measurements || { chest: '', waist: '', hips: '' })
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData.image_url);
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const fileName = `size-guide-${Date.now()}.${fileExt}`;
      const filePath = `size-guides/${fileName}`;
      
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

  // Handle size table row changes
  const handleSizeRowChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updatedContent = [...prev.content];
      
      if (field === 'size_name') {
        updatedContent[index].size_name = value;
      } else {
        updatedContent[index].measurements[field] = value;
      }
      
      return {
        ...prev,
        content: updatedContent
      };
    });
  };

  // Add a new size row
  const addSizeRow = () => {
    setFormData(prev => {
      const newRow: SizeTableRow = {
        size_name: '',
        measurements: {}
      };
      
      // Initialize all measurement fields
      measurementFields.forEach(field => {
        newRow.measurements[field] = '';
      });
      
      return {
        ...prev,
        content: [...prev.content, newRow]
      };
    });
  };

  // Remove a size row
  const removeSizeRow = (index: number) => {
    if (formData.content.length === 1) {
      toast.error('At least one size row is required');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index)
    }));
  };

  // Add a new measurement field
  const addMeasurementField = () => {
    const newField = prompt('Enter new measurement field name (e.g., "sleeve" or "length"):');
    
    if (!newField) return;
    
    const normalizedField = newField.toLowerCase().trim();
    
    if (measurementFields.includes(normalizedField)) {
      toast.error('This measurement field already exists');
      return;
    }
    
    setMeasurementFields(prev => [...prev, normalizedField]);
    
    // Add the new field to all existing rows
    setFormData(prev => ({
      ...prev,
      content: prev.content.map(row => ({
        ...row,
        measurements: {
          ...row.measurements,
          [normalizedField]: ''
        }
      }))
    }));
  };

  // Remove a measurement field
  const removeMeasurementField = (field: string) => {
    if (measurementFields.length === 1) {
      toast.error('At least one measurement field is required');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to remove the "${field}" measurement field from all sizes?`)) {
      return;
    }
    
    setMeasurementFields(prev => prev.filter(f => f !== field));
    
    // Remove the field from all rows
    setFormData(prev => ({
      ...prev,
      content: prev.content.map(row => {
        const newMeasurements = { ...row.measurements };
        delete newMeasurements[field];
        
        return {
          ...row,
          measurements: newMeasurements
        };
      })
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Validate form
      if (!formData.name || !formData.product_category) {
        toast.error('Name and product category are required');
        setSaving(false);
        return;
      }
      
      // Validate size table
      const isTableValid = formData.content.every(row => 
        row.size_name.trim() !== '' && 
        Object.values(row.measurements).some(value => value.trim() !== '')
      );
      
      if (!isTableValid) {
        toast.error('All size rows must have a name and at least one measurement');
        setSaving(false);
        return;
      }
      
      // Upload image if selected
      let imageUrl = formData.image_url;
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      // Prepare size guide data
      const sizeGuideData = {
        name: formData.name,
        product_category: formData.product_category,
        content: formData.content,
        image_url: imageUrl,
        is_active: formData.is_active
      };
      
      let sizeGuideId = initialData.id;
      
      if (isEditing && sizeGuideId) {
        // Update existing size guide
        const { error: updateError } = await supabase
          .from('size_guides')
          .update(sizeGuideData)
          .eq('id', sizeGuideId);
        
        if (updateError) throw updateError;
        
        toast.success('Size guide updated successfully');
      } else {
        // Create new size guide
        const { data: newSizeGuide, error: createError } = await supabase
          .from('size_guides')
          .insert({
            ...sizeGuideData,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();
        
        if (createError) throw createError;
        
        sizeGuideId = newSizeGuide.id;
        toast.success('Size guide created successfully');
      }
      
      // Add entry to admin_logs
      await supabase
        .from('admin_logs')
        .insert({
          action: isEditing ? 'UPDATE' : 'CREATE',
          entity_type: 'size_guides',
          entity_id: sizeGuideId,
          details: {
            name: formData.name,
            product_category: formData.product_category
          }
        });
      
      // Redirect to size guides page after short delay
      setTimeout(() => {
        window.location.href = '/admin/content/size-guides';
      }, 1500);
      
    } catch (error) {
      console.error('Error saving size guide:', error);
      toast.error('Failed to save size guide');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditing ? 'Edit Size Guide' : 'Create New Size Guide'}
        </h1>
        
        <Link href="/admin/content/size-guides">
          <Button variant="secondary">Cancel</Button>
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium mb-4">Guide Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Guide Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                  placeholder="e.g. Women's Clothing Sizes"
                />
              </div>
              
              <div>
                <label htmlFor="product_category" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Category *
                </label>
                <input
                  type="text"
                  id="product_category"
                  name="product_category"
                  required
                  value={formData.product_category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                  placeholder="e.g. Women's Dresses"
                />
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
                  Size Guide is active
                </label>
              </div>
            </div>
          </div>
          
          {/* Guide Image */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium mb-4">Size Guide Image (Optional)</h2>
            
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
                  Recommended size: 800 x 600 pixels. Max size: 5MB.
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
                    alt="Size Guide Image" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400">No image selected</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Size Table */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Size Table</h2>
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addMeasurementField}
                  className="text-sm"
                >
                  Add Measurement
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    
                    {measurementFields.map(field => (
                      <th 
                        key={field} 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <div className="flex items-center space-x-1">
                          <span>{field}</span>
                          <button
                            type="button"
                            onClick={() => removeMeasurementField(field)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </th>
                    ))}
                    
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.content.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={row.size_name}
                          onChange={(e) => handleSizeRowChange(rowIndex, 'size_name', e.target.value)}
                          className="w-full p-1 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                          placeholder="e.g. Small"
                        />
                      </td>
                      
                      {measurementFields.map(field => (
                        <td key={field} className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={row.measurements[field] || ''}
                            onChange={(e) => handleSizeRowChange(rowIndex, field, e.target.value)}
                            className="w-full p-1 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                            placeholder="e.g. 36 inches"
                          />
                        </td>
                      ))}
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => removeSizeRow(rowIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={addSizeRow}
                className="text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" /> Add Size Row
              </Button>
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
            {isEditing ? 'Update Size Guide' : 'Create Size Guide'}
          </Button>
        </div>
      </form>
    </div>
  );
}
