'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import Button from '@/components/Button';
import { 
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '@/utils/formatters';

// Import Ruler Icon separately
import { RulerSquare } from 'lucide-react';

// Types
interface SizeGuide {
  id: string;
  name: string;
  product_category: string;
  is_active: boolean;
  created_at: string;
  image_url: string | null;
  content: any;
}

export default function SizeGuidesPage() {
  const supabase = createClientComponentClient();
  const [sizeGuides, setSizeGuides] = useState<SizeGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedGuides, setSelectedGuides] = useState<string[]>([]);
  const [processingBulk, setProcessingBulk] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Fetch size guides
  useEffect(() => {
    const fetchSizeGuides = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('size_guides')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setSizeGuides(data || []);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data?.map(guide => guide.product_category) || [])];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching size guides:', error);
        toast.error('Failed to load size guides');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSizeGuides();
  }, [supabase]);

  // Handle search and filtering
  const filteredGuides = sizeGuides.filter(guide => {
    const matchesSearch = 
      guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.product_category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || guide.product_category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Handle selection of a guide
  const toggleSelection = (id: string) => {
    setSelectedGuides(prev => 
      prev.includes(id) 
        ? prev.filter(guideId => guideId !== id) 
        : [...prev, id]
    );
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedGuides.length === filteredGuides.length) {
      setSelectedGuides([]);
    } else {
      setSelectedGuides(filteredGuides.map(guide => guide.id));
    }
  };

  // Handle bulk action
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedGuides.length === 0) return;
    
    try {
      setProcessingBulk(true);
      
      if (action === 'delete') {
        // Confirm deletion
        if (!window.confirm(`Are you sure you want to delete ${selectedGuides.length} selected size guide(s)? This action cannot be undone.`)) {
          setProcessingBulk(false);
          return;
        }
        
        await supabase
          .from('size_guides')
          .delete()
          .in('id', selectedGuides);
        
        setSizeGuides(prev => 
          prev.filter(guide => !selectedGuides.includes(guide.id))
        );
        
        toast.success(`Deleted ${selectedGuides.length} size guides`);
      } else {
        // Activate/deactivate guides
        const is_active = action === 'activate';
        
        await supabase
          .from('size_guides')
          .update({ is_active })
          .in('id', selectedGuides);
        
        setSizeGuides(prev => 
          prev.map(guide => 
            selectedGuides.includes(guide.id) 
              ? { ...guide, is_active } 
              : guide
          )
        );
        
        toast.success(`${is_active ? 'Activated' : 'Deactivated'} ${selectedGuides.length} size guides`);
      }
      
      // Reset selections after action
      setSelectedGuides([]);
      
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform action');
    } finally {
      setProcessingBulk(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Size Guides</h1>
        
        <Link href="/admin/content/size-guides/new">
          <Button variant="primary" className="flex items-center">
            <PlusIcon className="h-5 w-5 mr-1" /> Add Size Guide
          </Button>
        </Link>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or category..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Bulk Actions */}
      {selectedGuides.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center">
          <span className="text-sm text-gray-700 mr-4">
            {selectedGuides.length} guides selected
          </span>
          
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={() => handleBulkAction('activate')}
              disabled={processingBulk}
              className="text-sm"
            >
              Activate
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => handleBulkAction('deactivate')}
              disabled={processingBulk}
              className="text-sm"
            >
              Deactivate
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => handleBulkAction('delete')}
              disabled={processingBulk}
              className="text-sm bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
            >
              <TrashIcon className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </div>
      )}
      
      {/* Size Guides Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      ) : filteredGuides.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <RulerSquare className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No size guides found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || categoryFilter !== 'all' 
              ? 'Try adjusting your search or filters.' 
              : 'Get started by creating a new size guide.'}
          </p>
          <div className="mt-6">
            <Link href="/admin/content/size-guides/new">
              <Button variant="primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Size Guide
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedGuides.length === filteredGuides.length && filteredGuides.length > 0}
                        onChange={toggleSelectAll}
                        className="mr-2 h-4 w-4 text-brand-primary focus:ring-brand-primary rounded border-gray-300"
                      />
                      Guide Name
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preview
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuides.map((guide) => (
                  <tr key={guide.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedGuides.includes(guide.id)}
                          onChange={() => toggleSelection(guide.id)}
                          className="mr-3 h-4 w-4 text-brand-primary focus:ring-brand-primary rounded border-gray-300"
                        />
                        <div className="text-sm font-medium text-gray-900">{guide.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{guide.product_category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(guide.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        guide.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {guide.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {guide.content && (
                        <span className="text-sm text-gray-500">
                          {Array.isArray(guide.content) ? guide.content.length : 0} sizes
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          href={`/admin/content/size-guides/${guide.id}`}
                          className="text-brand-primary hover:text-brand-primary-dark"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
