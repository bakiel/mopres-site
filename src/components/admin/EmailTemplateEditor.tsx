'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ExclamationCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface EmailTemplateEditorProps {
  template?: {
    id?: string;
    name?: string;
    subject?: string;
    content?: string;
    variables?: string[];
    type?: string;
    is_active?: boolean;
  };
  isNew?: boolean;
}

const EMAIL_TYPES = [
  { id: 'order', name: 'Order Notifications' },
  { id: 'account', name: 'Account Emails' },
  { id: 'marketing', name: 'Marketing Emails' },
];

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet',
  'align',
  'link', 'image',
];

export default function EmailTemplateEditor({ 
  template = {}, 
  isNew = false 
}: EmailTemplateEditorProps) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    variables: [],
    type: 'order',
    is_active: true,
    ...template,
  });
  
  const [previewEmail, setPreviewEmail] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  
  const router = useRouter();
  const supabaseClient = supabase();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleEditorChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleVariableAdd = (variable: string) => {
    if (!variable || formData.variables.includes(variable)) return;
    
    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, variable]
    }));
  };

  const handleVariableRemove = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }));
  };

  const togglePreview = () => {
    setShowPreview(prev => !prev);
    
    if (!showPreview && previewIframeRef.current) {
      // Inject template content into the iframe when showing preview
      const previewContent = replacePlaceholders(formData.content);
      const doc = previewIframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; }
              </style>
            </head>
            <body>
              ${previewContent}
            </body>
          </html>
        `);
        doc.close();
      }
    }
  };

  const replacePlaceholders = (content: string) => {
    let previewContent = content;
    
    // Replace placeholders with sample data
    const sampleData: Record<string, string> = {
      customer_name: 'John Doe',
      order_number: '#12345',
      order_items: '<p>1x Premium Sneakers - R1,200.00</p><p>2x Cotton Socks - R120.00</p>',
      order_total: '1,320.00',
      tracking_number: 'TRACK123456ZA',
      estimated_delivery: 'May 22, 2025',
      reset_link: 'https://mopres.co.za/reset-password?token=sample',
    };
    
    formData.variables.forEach(variable => {
      const regex = new RegExp(`{{${variable}}}`, 'g');
      previewContent = previewContent.replace(regex, sampleData[variable] || `[${variable}]`);
    });
    
    return previewContent;
  };

  const sendTestEmail = async () => {
    if (!previewEmail) {
      setErrors({ previewEmail: 'Please enter an email address' });
      return;
    }
    
    try {
      // Call your API endpoint to send a test email
      // This is just a placeholder - implement the actual API call
      const response = await fetch('/api/admin/email/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: previewEmail,
          subject: formData.subject,
          content: replacePlaceholders(formData.content),
          templateId: formData.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send test email');
      }
      
      setTestEmailSent(true);
      setTimeout(() => setTestEmailSent(false), 3000);
    } catch (error) {
      console.error('Error sending test email:', error);
      setErrors({ test: 'Failed to send test email. Please try again.' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = 'Template name is required';
    }
    
    if (!formData.subject) {
      newErrors.subject = 'Email subject is required';
    }
    
    if (!formData.content) {
      newErrors.content = 'Email content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { id, ...data } = formData;
      
      if (isNew) {
        // Create new template
        const { error } = await supabaseClient
          .from('email_templates')
          .insert({
            ...data,
            variables: data.variables.length ? data.variables : null,
          });
          
        if (error) throw error;
      } else {
        // Update existing template
        const { error } = await supabaseClient
          .from('email_templates')
          .update({
            ...data,
            variables: data.variables.length ? data.variables : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
          
        if (error) throw error;
      }
      
      // Redirect back to email templates list
      router.push('/admin/settings/email');
      router.refresh();
    } catch (error) {
      console.error('Error saving email template:', error);
      setErrors({ form: 'An error occurred while saving the template. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
      {errors.form && (
        <div className="p-4 bg-red-50 text-red-700 rounded-t-lg flex items-start">
          <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5" />
          <span>{errors.form}</span>
        </div>
      )}
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Order Confirmation"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Email Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              {EMAIL_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Email Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Your Order #{{order_number}} has been confirmed"
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Email Content
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={togglePreview}
                className="text-sm text-brand-primary hover:text-brand-primary-dark"
              >
                {showPreview ? 'Edit Template' : 'Preview Template'}
              </button>
            </div>
          </div>
          
          <div className={`${showPreview ? 'hidden' : 'block'}`}>
            <ReactQuill
              value={formData.content}
              onChange={handleEditorChange}
              modules={quillModules}
              formats={quillFormats}
              className={errors.content ? 'border border-red-500 rounded' : ''}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
          </div>
          
          <div className={`${showPreview ? 'block' : 'hidden'} border border-gray-300 rounded`}>
            <iframe
              ref={previewIframeRef}
              title="Email Preview"
              className="w-full h-[400px]"
            ></iframe>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Variables
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.variables.map(variable => (
                <div key={variable} className="bg-gray-100 rounded px-2 py-1 flex items-center text-sm">
                  <span className="mr-1">{variable}</span>
                  <button
                    type="button"
                    onClick={() => handleVariableRemove(variable)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    &times;
                  </button>
                </div>
              ))}
              {formData.variables.length === 0 && (
                <p className="text-sm text-gray-500 italic">No variables added</p>
              )}
            </div>
            <div className="flex">
              <input
                type="text"
                placeholder="Add a variable e.g., order_number"
                className="w-full p-2 border border-gray-300 rounded-l"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleVariableAdd((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  handleVariableAdd(input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r hover:bg-gray-300"
              >
                Add
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Use variables in your template with double curly braces. Example: {'{{order_number}}'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send Test Email
            </label>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter email address"
                value={previewEmail}
                onChange={(e) => setPreviewEmail(e.target.value)}
                className={`w-full p-2 border rounded-l ${
                  errors.previewEmail ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={sendTestEmail}
                className="px-4 py-2 bg-brand-primary text-white rounded-r hover:bg-brand-primary-dark flex items-center"
              >
                <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                Send
              </button>
            </div>
            {errors.previewEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.previewEmail}</p>
            )}
            {errors.test && (
              <p className="mt-1 text-sm text-red-600">{errors.test}</p>
            )}
            {testEmailSent && (
              <p className="mt-1 text-sm text-green-600">Test email sent successfully!</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-brand-primary border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
            Template Active
          </label>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push('/admin/settings/email')}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : (isNew ? 'Create Template' : 'Update Template')}
        </button>
      </div>
    </form>
  );
}
