'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Button from '@/components/Button';
import Link from 'next/link';
import { slugify } from '@/utils/formatters';

// Types
interface PageEditorProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    content: string;
    meta_title: string | null;
    meta_description: string | null;
    status: string;
  };
  isEditing?: boolean;
}

// Default empty page
const emptyPage = {
  title: '',
  slug: '',
  content: '',
  meta_title: '',
  meta_description: '',
  status: 'draft'
};

export default function PageEditor({ initialData = emptyPage, isEditing = false }: PageEditorProps) {
  const supabase = createClientComponentClient();
  const [formData, setFormData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!initialData.slug);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updatedData = { ...prev, [name]: value };
      
      // Auto-generate slug when title changes if autoSlug is true
      if (name === 'title' && autoSlug) {
        updatedData.slug = slugify(value);
      }
      
      return updatedData;
    });
  };

  // Handle rich text editor content changes
  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  // Handle slug toggle
  const handleSlugToggle = () => {
    setAutoSlug(!autoSlug);
    if (!autoSlug) {
      // When turning on auto slug, update the slug based on current title
      setFormData(prev => ({
        ...prev,
        slug: slugify(prev.title)
      }));
    }
  };

  // Handle radio button changes
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Validate form
      if (!formData.title || !formData.slug || !formData.content) {
        toast.error('Title, slug, and content are required');
        setSaving(false);
        return;
      }
      
      // Check if slug is unique (except for current page if editing)
      const { data: existingPage, error: slugCheckError } = await supabase
        .from('content_pages')
        .select('id')
        .eq('slug', formData.slug)
        .not('id', 'eq', initialData.id || '')
        .single();
      
      if (slugCheckError && !slugCheckError.message.includes('No rows found')) {
        throw slugCheckError;
      }
      
      if (existingPage) {
        toast.error('A page with this slug already exists');
        setSaving(false);
        return;
      }
      
      // Prepare page data
      const pageData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        status: formData.status,
        updated_at: new Date().toISOString()
      };
      
      let pageId = initialData.id;
      
      if (isEditing && pageId) {
        // Update existing page
        const { error: updateError } = await supabase
          .from('content_pages')
          .update(pageData)
          .eq('id', pageId);
        
        if (updateError) throw updateError;
        
        toast.success('Page updated successfully');
      } else {
        // Create new page
        const { data: newPage, error: createError } = await supabase
          .from('content_pages')
          .insert({
            ...pageData,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();
        
        if (createError) throw createError;
        
        pageId = newPage.id;
        toast.success('Page created successfully');
      }
      
      // Add entry to admin_logs
      await supabase
        .from('admin_logs')
        .insert({
          action: isEditing ? 'UPDATE' : 'CREATE',
          entity_type: 'content_pages',
          entity_id: pageId,
          details: {
            title: formData.title,
            slug: formData.slug,
            status: formData.status
          }
        });
      
      // Redirect to pages list after short delay
      setTimeout(() => {
        window.location.href = '/admin/content/pages';
      }, 1500);
      
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  // Toggle preview mode
  const togglePreview = () => {
    setPreviewOpen(!previewOpen);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditing ? 'Edit Page' : 'Create New Page'}
        </h1>
        
        <div className="flex space-x-2">
          <Button 
            variant="secondary"
            onClick={togglePreview}
            type="button"
          >
            {previewOpen ? 'Edit' : 'Preview'}
          </Button>
          
          <Link href="/admin/content/pages">
            <Button variant="secondary">Cancel</Button>
          </Link>
        </div>
      </div>
      
      {previewOpen ? (
        // Preview Mode
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{formData.title || 'Untitled Page'}</h1>
            
            <div className="prose max-w-none pb-6 border-b border-gray-200 mb-6">
              {/* This would display the rendered HTML content */}
              <div dangerouslySetInnerHTML={{ __html: formData.content }} />
            </div>
            
            <div className="flex justify-end">
              <Button onClick={togglePreview} variant="primary">
                Back to Edit
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium mb-4">Page Information</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Page Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                      Slug *
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoSlug"
                        checked={autoSlug}
                        onChange={handleSlugToggle}
                        className="h-4 w-4 text-brand-primary focus:ring-brand-primary rounded border-gray-300 mr-2"
                      />
                      <label htmlFor="autoSlug" className="text-xs text-gray-600">
                        Auto-generate
                      </label>
                    </div>
                  </div>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    required
                    value={formData.slug}
                    onChange={handleChange}
                    disabled={autoSlug}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary ${
                      autoSlug ? 'bg-gray-100' : ''
                    }`}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Will be used as the URL path: yourdomain.com/pages/<strong>{formData.slug || 'example-slug'}</strong>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium mb-4">Page Content *</h2>
              
              <textarea
                id="content"
                name="content"
                rows={10}
                required
                value={formData.content}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                placeholder="Enter page content here... (HTML supported)"
              />
              <p className="mt-1 text-xs text-gray-500">
                HTML formatting is supported. For a richer editing experience, use a WYSIWYG editor.
              </p>
            </div>
            
            {/* SEO Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium mb-4">SEO Information</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    id="meta_title"
                    name="meta_title"
                    value={formData.meta_title || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave blank to use the page title
                  </p>
                </div>
                
                <div>
                  <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    rows={3}
                    value={formData.meta_description || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended: 150-160 characters for optimal display in search results
                  </p>
                </div>
              </div>
            </div>
            
            {/* Publishing Options */}
            <div>
              <h2 className="text-lg font-medium mb-4">Publishing Options</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="status-draft"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={handleRadioChange}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300"
                  />
                  <label htmlFor="status-draft" className="ml-2 block text-sm text-gray-700">
                    Draft - Save as draft (not visible on the site)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="status-published"
                    name="status"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={handleRadioChange}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300"
                  />
                  <label htmlFor="status-published" className="ml-2 block text-sm text-gray-700">
                    Published - Make this page visible on the site
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="flex items-center"
            >
              {saving && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isEditing ? 'Update Page' : 'Create Page'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
