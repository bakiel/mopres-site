'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CheckIcon } from '@heroicons/react/24/outline';

interface SettingsFormProps {
  title?: string;
  description?: string;
  initialData?: Record<string, any>;
  onSave: (data: Record<string, any>) => Promise<void>;
  children: React.ReactNode;
}

export default function SettingsForm({ 
  title, 
  description, 
  initialData = {}, 
  onSave,
  children 
}: SettingsFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // Clear any existing timeout to prevent multiple saves
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set a new timeout for auto-save
    const timeout = setTimeout(() => {
      handleSave();
    }, 1000); // Auto-save after 1 second of inactivity

    setAutoSaveTimeout(timeout);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(formData);
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Clone children and pass necessary props
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        formData,
        onChange: handleChange,
        isDisabled: isSaving
      });
    }
    return child;
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {title && <h2 className="text-xl font-semibold text-gray-800 mb-1">{title}</h2>}
      {description && <p className="text-gray-600 mb-6">{description}</p>}
      
      <div className="space-y-6">
        {childrenWithProps}
      </div>
      
      <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
        <div>
          {showSavedMessage && (
            <div className="flex items-center text-green-600">
              <CheckIcon className="h-5 w-5 mr-1" />
              <span>Settings saved</span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
