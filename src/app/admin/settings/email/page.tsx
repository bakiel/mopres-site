'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  DocumentDuplicateIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  type: string;
  is_active: boolean;
  updated_at: string;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  
  const router = useRouter();
  
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        setTemplates(data || []);
      } catch (error) {
        console.error('Error fetching email templates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTemplates();
  }, [supabase]);
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTemplates(filteredTemplates.map(template => template.id));
    } else {
      setSelectedTemplates([]);
    }
  };
  
  const handleSelectTemplate = (templateId: string) => {
    if (selectedTemplates.includes(templateId)) {
      setSelectedTemplates(selectedTemplates.filter(id => id !== templateId));
    } else {
      setSelectedTemplates([...selectedTemplates, templateId]);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
  };
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || template.type === typeFilter;
    
    return matchesSearch && matchesType;
  });
  
  const confirmDelete = (templateId: string) => {
    setTemplateToDelete(templateId);
    setIsDeleteModalOpen(true);
  };
  
  const handleDelete = async () => {
    if (!templateToDelete) return;
    
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateToDelete);
      
      if (error) throw error;
      
      // Update UI
      setTemplates(templates.filter(template => template.id !== templateToDelete));
      setSelectedTemplates(selectedTemplates.filter(id => id !== templateToDelete));
      
      setIsDeleteModalOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };
  
  const openCreateModal = () => {
    setIsCreateModalOpen(true);
    setNewTemplateName('');
    setDuplicateError(null);
  };
  
  const createTemplate = async () => {
    try {
      // Check if name already exists
      const existingTemplate = templates.find(t => 
        t.name.toLowerCase() === newTemplateName.toLowerCase()
      );
      
      if (existingTemplate) {
        setDuplicateError('A template with this name already exists');
        return;
      }
      
      // Create new template
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: newTemplateName,
          subject: 'New Email Template',
          content: '<p>Your email content here</p>',
          variables: [],
          type: 'order',
          is_active: false,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Close modal and redirect to edit page
      setIsCreateModalOpen(false);
      router.push(`/admin/settings/email/${data.id}`);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };
  
  const handleToggleActive = async (templateId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: !currentStatus })
        .eq('id', templateId);
      
      if (error) throw error;
      
      // Update templates in UI
      setTemplates(templates.map(template => 
        template.id === templateId 
          ? { ...template, is_active: !currentStatus } 
          : template
      ));
    } catch (error) {
      console.error('Error toggling template status:', error);
    }
  };
  
  const handleDuplicate = async (templateId: string) => {
    try {
      // Find template to duplicate
      const templateToDuplicate = templates.find(t => t.id === templateId);
      
      if (!templateToDuplicate) return;
      
      // Create duplicate with "Copy of" prefix
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: `Copy of ${templateToDuplicate.name}`,
          subject: templateToDuplicate.subject,
          content: templateToDuplicate.content,
          variables: templateToDuplicate.variables,
          type: templateToDuplicate.type,
          is_active: false, // Set as inactive by default
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add to templates array
      setTemplates([data, ...templates]);
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };
  
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-800';
      case 'account':
        return 'bg-purple-100 text-purple-800';
      case 'marketing':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };
  
  const getTemplateTypeLabel = (type: string) => {
    switch (type) {
      case 'order':
        return 'Order';
      case 'account':
        return 'Account';
      case 'marketing':
        return 'Marketing';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Email Templates</h1>
          <p className="text-gray-600">Manage email notifications sent to customers</p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primary-dark flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          New Template
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={typeFilter}
                onChange={handleTypeFilterChange}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="all">All Types</option>
                <option value="order">Order</option>
                <option value="account">Account</option>
                <option value="marketing">Marketing</option>
              </select>
              
              {selectedTemplates.length > 0 && (
                <>
                  <span className="text-sm text-gray-500">
                    {selectedTemplates.length} selected
                  </span>
                  
                  <button
                    onClick={() => {
                      if (selectedTemplates.length === 1) {
                        confirmDelete(selectedTemplates[0]);
                      } else {
                        // For bulk delete, we would implement this here
                        alert('Bulk delete not implemented yet');
                      }
                    }}
                    className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Templates Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      filteredTemplates.length > 0 && 
                      selectedTemplates.length === filteredTemplates.length
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-brand-primary border-gray-300 rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No email templates found
                  </td>
                </tr>
              ) : (
                filteredTemplates.map(template => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTemplates.includes(template.id)}
                        onChange={() => handleSelectTemplate(template.id)}
                        className="h-4 w-4 text-brand-primary border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {template.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {template.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeColor(template.type)}`}>
                        {getTemplateTypeLabel(template.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleToggleActive(template.id, template.is_active)}
                        className="flex items-center"
                      >
                        {template.is_active ? (
                          <>
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
                            <span className="text-sm text-green-600">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-5 w-5 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-500">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(template.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleDuplicate(template.id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Duplicate template"
                        >
                          <DocumentDuplicateIcon className="h-5 w-5" />
                        </button>
                        <Link
                          href={`/admin/settings/email/${template.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit template"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => confirmDelete(template.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete template"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this email template? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setTemplateToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Template Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Template</h3>
            
            <div className="mb-4">
              <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <input
                type="text"
                id="templateName"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className={`w-full p-2 border rounded ${
                  duplicateError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter template name"
              />
              {duplicateError && (
                <p className="mt-1 text-sm text-red-600">{duplicateError}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createTemplate}
                disabled={!newTemplateName.trim()}
                className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primary-dark disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
