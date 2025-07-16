'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import { toast } from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import Button from '@/components/Button';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import Image from 'next/image';

// Types
interface Collection {
  id: string;
  name: string;
}

interface Size {
  size: string;
  quantity: number;
}

interface ProductFormProps {
  initialData?: {
    id?: string;
    name: string;
    sku: string;
    description: string;
    price: number;
    sale_price?: number | null;
    collection_id?: string | null;
    featured: boolean;
    in_stock: boolean;
    inventory_quantity: number;
    sizes?: Size[] | null;
    images?: string[] | null;
  };
  isEditing?: boolean;
}

// Default empty product
const emptyProduct = {
  name: '',
  sku: '',
  description: '',
  price: 0,
  sale_price: null,
  collection_id: null,
  featured: false,
  in_stock: true,
  inventory_quantity: 0,
  sizes: [],
  images: []
};

// Main component
export default function ProductForm({ initialData = emptyProduct, isEditing = false }: ProductFormProps) {
  const supabaseClient = supabase();
  
  const [formData, setFormData] = useState(initialData);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sizes, setSizes] = useState<Size[]>(initialData.sizes || []);
  const [productImages, setProductImages] = useState<string[]>(initialData.images || []);
  
  // Size options (EU sizes commonly used for luxury footwear)
  const sizeOptions = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'];
  
  // Load collections on mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('collections')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        
        setCollections(data || []);
      } catch (error) {
        console.error('Error loading collections:', error);
        toast.error('Failed to load collections');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollections();
  }, [supabase]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
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
  
  // Handle size quantity change
  const handleSizeChange = (size: string, quantity: number) => {
    // Update or add the size
    const updatedSizes = [...sizes];
    const existingIndex = updatedSizes.findIndex(s => s.size === size);
    
    if (existingIndex >= 0) {
      updatedSizes[existingIndex].quantity = quantity;
    } else {
      updatedSizes.push({ size, quantity });
    }
    
    setSizes(updatedSizes);
    
    // Calculate total inventory quantity
    const totalQuantity = updatedSizes.reduce((sum, s) => sum + s.quantity, 0);
    
    setFormData(prev => ({
      ...prev,
      inventory_quantity: totalQuantity
    }));
  };
  
  // Handle image upload
  const handleImageUpload = (imageData: string, index: number) => {
    const updatedImages = [...productImages];
    if (index === -1) {
      // Add new image
      updatedImages.push(imageData);
    } else {
      // Replace existing image
      updatedImages[index] = imageData;
    }
    setProductImages(updatedImages);
  };
  
  // Handle image removal
  const handleImageRemove = (index: number) => {
    const updatedImages = productImages.filter((_, i) => i !== index);
    setProductImages(updatedImages);
  };
  
  // Handle image reorder
  const handleImageReorder = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...productImages];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    setProductImages(updatedImages);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const productData = {
        ...formData,
        // Remove sizes and images from the main table data
        sizes: undefined,
        images: undefined
      };
      
      let productId = initialData.id;
      
      if (isEditing && productId) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);
        
        if (error) throw error;
        
        toast.success('Product updated successfully');
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single();
        
        if (error) throw error;
        
        productId = data.id;
        toast.success('Product created successfully');
      }
      
      // Handle product images
      if (productId && productImages.length > 0) {
        try {
          // Delete existing images
          if (isEditing) {
            await supabase
              .from('product_images')
              .delete()
              .eq('product_id', productId);
          }
          
          // Insert new images
          const imageRecords = productImages.map((imageData, index) => ({
            product_id: productId,
            image_url: imageData,
            display_order: index,
            is_primary: index === 0
          }));
          
          const { error: imageError } = await supabase
            .from('product_images')
            .insert(imageRecords);
          
          if (imageError) {
            console.error('Error saving product images:', imageError);
            toast.error('Product saved but images could not be saved');
          }
        } catch (error) {
          console.error('Error handling product images:', error);
        }
      }
      
      // Handle sizes in product_sizes table
      if (productId && sizes.length > 0) {
        try {
          // Delete existing sizes
          if (isEditing) {
            await supabase
              .from('product_sizes')
              .delete()
              .eq('product_id', productId);
          }
          
          // Insert new sizes
          const sizeRecords = sizes
            .filter(s => s.quantity > 0)
            .map(s => ({
              product_id: productId,
              size: s.size,
              quantity: s.quantity
            }));
          
          if (sizeRecords.length > 0) {
            const { error: sizeError } = await supabase
              .from('product_sizes')
              .insert(sizeRecords);
            
            if (sizeError) {
              console.error('Error saving product sizes:', sizeError);
              toast.error('Product saved but sizes could not be saved');
            }
          }
        } catch (error) {
          console.error('Error handling product sizes:', error);
        }
      }
      
      // Redirect to the products list page after short delay
      setTimeout(() => {
        window.location.href = '/admin/products';
      }, 1500);
      
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
        
        <Link href="/admin/products">
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
                  Product Name *
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
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                  SKU *
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  required
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
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
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
              
              <div>
                <label htmlFor="collection_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Collection
                </label>
                <select
                  id="collection_id"
                  name="collection_id"
                  value={formData.collection_id || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                >
                  <option value="">None</option>
                  {collections.map(collection => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Pricing */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium mb-4">Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price (ZAR) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
              
              <div>
                <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Price (ZAR)
                </label>
                <input
                  type="number"
                  id="sale_price"
                  name="sale_price"
                  min="0"
                  step="0.01"
                  value={formData.sale_price || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
            </div>
          </div>
          
          {/* Inventory */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium mb-4">Inventory</h2>
            
            <div className="mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="in_stock"
                    name="in_stock"
                    checked={formData.in_stock}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary rounded border-gray-300"
                  />
                  <label htmlFor="in_stock" className="ml-2 block text-sm text-gray-700">
                    In Stock
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary rounded border-gray-300"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    Featured Product
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Size Inventory</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {sizeOptions.map(size => {
                  const sizeData = sizes.find(s => s.size === size);
                  const quantity = sizeData ? sizeData.quantity : 0;
                  
                  return (
                    <div key={size} className="border rounded-md p-3">
                      <div className="text-sm font-medium mb-1">EU {size}</div>
                      <input
                        type="number"
                        min="0"
                        value={quantity}
                        onChange={(e) => handleSizeChange(size, parseInt(e.target.value, 10) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-brand-primary focus:border-brand-primary"
                      />
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                Total inventory: {formData.inventory_quantity} units
              </div>
            </div>
          </div>
          
          {/* Image Upload with 1:1 Cropping */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium mb-4">Product Images</h2>
            
            <div className="space-y-4">
              {/* Primary Image */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Primary Image</h3>
                <ImageUpload
                  currentImage={productImages[0]}
                  onImageChange={(imageData) => handleImageUpload(imageData, 0)}
                  label="Main Product Image"
                />
              </div>
              
              {/* Additional Images */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Show existing additional images */}
                  {productImages.slice(1).map((image, index) => (
                    <div key={index + 1} className="relative group">
                      <div className="aspect-square relative rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                          src={image}
                          alt={`Product image ${index + 2}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleImageRemove(index + 1)}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            title="Remove image"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add new image button - show only if less than 5 additional images */}
                  {productImages.length < 6 && (
                    <div className="aspect-square relative">
                      <ImageUpload
                        onImageChange={(imageData) => handleImageUpload(imageData, -1)}
                        label=""
                      />
                    </div>
                  )}
                </div>
                
                {productImages.length > 1 && (
                  <p className="text-sm text-gray-500 mt-2">
                    You can add up to 6 images total. Drag to reorder images.
                  </p>
                )}
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
            {isEditing ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
