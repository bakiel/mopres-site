'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import Button from '@/components/Button';
import Link from 'next/link';
import { slugify } from '@/utils/formatters';

// Types
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  sale_price: number | null;
  in_stock: boolean;
  image_url?: string | null;
}

interface CollectionFormProps {
  initialData?: {
    id?: string;
    name: string;
    description: string | null;
    slug: string;
    image_url: string | null;
    is_featured: boolean;
  };
  isEditing?: boolean;
}

// Default empty collection
const emptyCollection = {
  name: '',
  description: '',
  slug: '',
  image_url: null,
  is_featured: false,
};

export default function CollectionForm({ initialData = emptyCollection, isEditing = false }: CollectionFormProps) {
  const supabase = createClientComponentClient();
  const [formData, setFormData] = useState(initialData);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentProducts, setCurrentProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData.image_url);
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!initialData.slug);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch all products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name, sku, price, sale_price, in_stock, images')
          .order('name');
        
        if (productsError) throw productsError;
        
        // Process products and add image_url
        const processedProducts = (productsData || []).map(product => ({
          ...product,
          image_url: product.images && product.images.length > 0 
            ? `/product-images/${product.sku}.jpg` 
            : null
        }));
        
        setAllProducts(processedProducts);
        
        // If editing, fetch current products in this collection
        if (isEditing && initialData.id) {
          const { data: collectionProductsData, error: collectionProductsError } = await supabase
            .from('collection_products')
            .select('product_id')
            .eq('collection_id', initialData.id);
          
          if (collectionProductsError) throw collectionProductsError;
          
          const productIds = (collectionProductsData || []).map(item => item.product_id);
          setCurrentProducts(productIds);
          setSelectedProducts(productIds);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      }
    };
    
    fetchProducts();
  }, [supabase, isEditing, initialData.id]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [name]: type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked 
          : value
      };
      
      // Auto-generate slug when name changes if autoSlug is true
      if (name === 'name' && autoSlug) {
        updatedData.slug = slugify(value);
      }
      
      return updatedData;
    });
  };

  // Handle slug toggle
  const handleSlugToggle = () => {
    setAutoSlug(!autoSlug);
    if (!autoSlug) {
      // When turning on auto slug, update the slug based on current name
      setFormData(prev => ({
        ...prev,
        slug: slugify(prev.name)
      }));
    }
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
    if (!imageFile) return null;
    
    setIsUploading(true);
    
    try {
      // Generate a unique file name
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `collection-${Date.now()}.${fileExt}`;
      const filePath = `collections/${fileName}`;
      
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

  // Handle product selection
  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Validate form
      if (!formData.name || !formData.slug) {
        toast.error('Name and slug are required');
        setSaving(false);
        return;
      }
      
      // Check if slug is unique (except for current collection if editing)
      const { data: existingCollection, error: slugCheckError } = await supabase
        .from('collections')
        .select('id')
        .eq('slug', formData.slug)
        .not('id', 'eq', initialData.id || '')
        .single();
      
      if (slugCheckError && !slugCheckError.message.includes('No rows found')) {
        throw slugCheckError;
      }
      
      if (existingCollection) {
        toast.error('A collection with this slug already exists');
        setSaving(false);
        return;
      }
      
      // Upload image if selected
      let imageUrl = formData.image_url;
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      // Prepare collection data
      const collectionData = {
        name: formData.name,
        description: formData.description,
        slug: formData.slug,
        image_url: imageUrl,
        is_featured: formData.is_featured
      };
      
      let collectionId = initialData.id;
      
      if (isEditing && collectionId) {
        // Update existing collection
        const { error: updateError } = await supabase
          .from('collections')
          .update(collectionData)
          .eq('id', collectionId);
        
        if (updateError) throw updateError;
        
        toast.success('Collection updated successfully');
      } else {
        // Create new collection
        const { data: newCollection, error: createError } = await supabase
          .from('collections')
          .insert(collectionData)
          .select('id')
          .single();
        
        if (createError) throw createError;
        
        collectionId = newCollection.id;
        toast.success('Collection created successfully');
      }
      
      // Handle product assignments
      if (collectionId) {
        // First, determine products to add and remove
        const productsToAdd = selectedProducts.filter(id => !currentProducts.includes(id));
        const productsToRemove = currentProducts.filter(id => !selectedProducts.includes(id));
        
        // Remove unselected products
        if (productsToRemove.length > 0) {
          await supabase
            .from('collection_products')
            .delete()
            .eq('collection_id', collectionId)
            .in('product_id', productsToRemove);
        }
        
        // Add newly selected products
        if (productsToAdd.length > 0) {
          const productsToInsert = productsToAdd.map(productId => ({
            collection_id: collectionId,
            product_id: productId
          }));
          
          await supabase
            .from('collection_products')
            .insert(productsToInsert);
        }
      }
      
      // Add entry to admin_logs
      await supabase
        .from('admin_logs')
        .insert({
          action: isEditing ? 'UPDATE' : 'CREATE',
          entity_type: 'collections',
          entity_id: collectionId,
          details: {
            name: formData.name,
            slug: formData.slug
          }
        });
      
      // Redirect to collections page after short delay
      setTimeout(() => {
        window.location.href = '/admin/collections';
      }, 1500);
      
    } catch (error) {
      console.error('Error saving collection:', error);
      toast.error('Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  // Filtered products based on search query
  const filteredProducts = allProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditing ? 'Edit Collection' : 'Add New Collection'}
        </h1>
        
        <Link href="/admin/collections">
          <Button variant="secondary">Cancel</Button>
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Collection Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
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
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleCheckboxChange}
                  className="h-5 w-5 text-brand-primary focus:ring-brand-primary rounded border-gray-300"
                />
                <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                  Featured Collection
                </label>
              </div>
            </div>
          </div>
          
          {/* Collection Image */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium mb-4">Collection Banner Image</h2>
            
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
                    alt="Collection Banner" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">No image selected</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Product Assignment */}
          <div>
            <h2 className="text-lg font-medium mb-4">Assign Products</h2>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="mb-2 text-sm text-gray-600">
              {selectedProducts.length} products selected
            </div>
            
            <div className="border border-gray-200 rounded-md h-96 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No products found
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredProducts.map(product => (
                    <li key={product.id} className="p-3 hover:bg-gray-50">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                          className="h-4 w-4 text-brand-primary focus:ring-brand-primary rounded border-gray-300 mr-3"
                        />
                        
                        <div className="flex items-center flex-1">
                          <div className="h-12 w-12 flex-shrink-0 mr-3">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover rounded-md"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                                No image
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-medium">
                              {new Intl.NumberFormat('en-ZA', { 
                                style: 'currency', 
                                currency: 'ZAR' 
                              }).format(product.sale_price || product.price)}
                            </div>
                            
                            <div className={`text-xs ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                              {product.in_stock ? 'In Stock' : 'Out of Stock'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
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
            {isEditing ? 'Update Collection' : 'Create Collection'}
          </Button>
        </div>
      </form>
    </div>
  );
}
