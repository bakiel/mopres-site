'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import SizeGuideForm from '@/components/admin/SizeGuideForm';

interface EditSizeGuidePageProps {
  params: {
    id: string;
  };
}

export default function EditSizeGuidePage({ params }: EditSizeGuidePageProps) {
  const supabase = createClientComponentClient();
  const [sizeGuide, setSizeGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchSizeGuide = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('size_guides')
          .select('*')
          .eq('id', params.id)
          .single();
        
        if (error) throw error;
        
        setSizeGuide(data);
      } catch (error) {
        console.error('Error fetching size guide:', error);
        setError('Size guide not found or could not be loaded');
        toast.error('Failed to load size guide');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSizeGuide();
  }, [supabase, params.id]);
  
  return (
    <AdminLayout>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <SizeGuideForm initialData={sizeGuide} isEditing={true} />
      )}
    </AdminLayout>
  );
}
