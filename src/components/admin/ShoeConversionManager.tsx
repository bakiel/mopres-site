'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import { toast } from 'react-hot-toast';
import Button from '@/components/Button';

interface SizeConversionManagerProps {
  category?: 'women' | 'men' | 'children';
}

interface SizeConversion {
  za_uk: string;
  eu: string;
  us: string;
  cm: string;
}

// Default empty size conversion table for women's shoes
const defaultWomenSizes: SizeConversion[] = [
  { za_uk: '1', eu: '34', us: '3', cm: '21.6' },
  { za_uk: '2', eu: '35', us: '4', cm: '22.2' },
  { za_uk: '3', eu: '36', us: '5', cm: '23.0' },
  { za_uk: '4', eu: '37', us: '6', cm: '23.7' },
  { za_uk: '5', eu: '38', us: '7', cm: '24.3' },
  { za_uk: '6', eu: '39', us: '8', cm: '25.0' },
  { za_uk: '7', eu: '40', us: '9', cm: '25.7' },
  { za_uk: '8', eu: '41', us: '10', cm: '26.3' },
  { za_uk: '9', eu: '42', us: '11', cm: '27.0' },
  { za_uk: '10', eu: '43', us: '12', cm: '27.7' },
  { za_uk: '11', eu: '44', us: '13', cm: '28.3' },
  { za_uk: '12', eu: '45', us: '14', cm: '29.0' },
];

const ShoeConversionManager: React.FC<SizeConversionManagerProps> = ({ category = 'women' }) => {
  const [sizeConversions, setSizeConversions] = useState<SizeConversion[]>(defaultWomenSizes);
  const [loading, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load size conversions from database on component mount
  useEffect(() => {
    const loadSizeConversions = async () => {
      try {
        const { data, error } = await supabase
          .from('size_conversions')
          .select('*')
          .eq('category', category)
          .order('za_uk', { ascending: true });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setSizeConversions(data);
        }
      } catch (error) {
        console.error('Error loading size conversions:', error);
        toast.error('Failed to load size conversions');
      }
    };

    loadSizeConversions();
  }, [category, supabase]);

  // Handle input change
  const handleInputChange = (index: number, field: keyof SizeConversion, value: string) => {
    const updatedConversions = [...sizeConversions];
    updatedConversions[index][field] = value;
    setSizeConversions(updatedConversions);
  };

  // Add a new size row
  const addSizeRow = () => {
    setSizeConversions([
      ...sizeConversions,
      { za_uk: '', eu: '', us: '', cm: '' }
    ]);
  };

  // Remove a size row
  const removeSizeRow = (index: number) => {
    const updatedConversions = [...sizeConversions];
    updatedConversions.splice(index, 1);
    setSizeConversions(updatedConversions);
  };

  // Save size conversions
  const saveSizeConversions = async () => {
    // Validate inputs
    for (const conversion of sizeConversions) {
      if (!conversion.za_uk || !conversion.eu || !conversion.us || !conversion.cm) {
        toast.error('All fields are required for each size');
        return;
      }
    }

    setSaving(true);

    try {
      // First delete existing conversions for this category
      const { error: deleteError } = await supabase
        .from('size_conversions')
        .delete()
        .eq('category', category);

      if (deleteError) throw deleteError;

      // Then insert the new conversions
      const { error: insertError } = await supabase
        .from('size_conversions')
        .insert(
          sizeConversions.map(conversion => ({
            ...conversion,
            category
          }))
        );

      if (insertError) throw insertError;

      toast.success('Size conversions saved successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving size conversions:', error);
      toast.error('Failed to save size conversions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {category.charAt(0).toUpperCase() + category.slice(1)}'s Shoe Size Conversions
        </h2>
        
        {!isEditing ? (
          <Button
            variant="secondary"
            onClick={() => setIsEditing(true)}
          >
            Edit Size Chart
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={saveSizeConversions}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ZA/UK Size
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EU Size
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                US Size
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Foot Length (cm)
              </th>
              {isEditing && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sizeConversions.map((conversion, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="text"
                      value={conversion.za_uk}
                      onChange={(e) => handleInputChange(index, 'za_uk', e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <span className="font-medium text-gray-900">{conversion.za_uk}</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="text"
                      value={conversion.eu}
                      onChange={(e) => handleInputChange(index, 'eu', e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md"
                    />
                  ) : (
                    conversion.eu
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="text"
                      value={conversion.us}
                      onChange={(e) => handleInputChange(index, 'us', e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md"
                    />
                  ) : (
                    conversion.us
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="text"
                      value={conversion.cm}
                      onChange={(e) => handleInputChange(index, 'cm', e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md"
                    />
                  ) : (
                    conversion.cm
                  )}
                </td>
                {isEditing && (
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      onClick={() => removeSizeRow(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={addSizeRow}
            className="text-sm"
          >
            Add Size Row
          </Button>
        </div>
      )}

      <div className="mt-6 bg-gray-50 p-4 rounded-md">
        <h3 className="text-md font-medium text-gray-700 mb-2">Size Chart Notes</h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
          <li>South African (ZA) sizes are equivalent to UK sizes</li>
          <li>All measurements are approximate and may vary by style</li>
          <li>For best fit, measure foot length and refer to the cm column</li>
          <li>If between sizes, we recommend going up to the next size</li>
        </ul>
      </div>
    </div>
  );
};

export default ShoeConversionManager;
