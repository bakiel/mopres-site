'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import { toast } from 'react-hot-toast';
import ProductForm from '@/components/admin/ProductForm';
import AdminLayout from '@/components/admin/AdminLayout';
import { use } from 'react';

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Unwrap params Promise using React.use
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('products')
          .select(`
            id, name, sku, description, price, sale_price,
            collection_id, featured, in_stock, inventory_quantity
          `)
          .eq('id', productId)
          .single();
        
        if (error) throw error;
        
        if (!data) {
          setError('Product not found');
          return;
        }
        
        // TODO: Also fetch sizes from a related table if needed
        // TODO: Also fetch images from a related source if needed
        
        setProduct(data);
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Failed to load product');
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [supabase, productId]);
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      </AdminLayout>
    );
  }
  
  if (error || !product) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error || 'Product not found'}</span>
        </div>
      </AdminLayout>
    );
  }
  
  return <ProductForm initialData={product} isEditing={true} />;
}
