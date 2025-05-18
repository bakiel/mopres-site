'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import CollectionForm from '@/components/admin/CollectionForm';
import { use } from 'react';

interface EditCollectionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditCollectionPage({ params }: EditCollectionPageProps) {
  const supabase = createClientComponentClient();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Unwrap params Promise using React.use
  const resolvedParams = use(params);
  const collectionId = resolvedParams.id;
  
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('collections')
          .select('id, name, description, slug, image_url, is_featured')
          .eq('id', collectionId)
          .single();
        
        if (error) throw error;
        
        if (!data) {
          setError('Collection not found');
          return;
        }
        
        setCollection(data);
      } catch (error) {
        console.error('Error loading collection:', error);
        toast.error('Failed to load collection');
        setError('Failed to load collection');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollection();
  }, [supabase, collectionId]);
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      </AdminLayout>
    );
  }
  
  if (error || !collection) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error || 'Collection not found'}</span>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <CollectionForm initialData={collection} isEditing={true} />
    </AdminLayout>
  );
}
