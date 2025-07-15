'use client';

import React, { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowserClient';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      
      // Test 1: Check if we can connect
      setStatus('Connecting to Supabase...');
      
      // Test 2: Try to fetch products table structure
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      if (productsError) {
        setStatus(`Error fetching products: ${productsError.message}`);
        return;
      }
      
      // Test 3: Try to fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .limit(1);
      
      if (ordersError) {
        setStatus(`Error fetching orders: ${ordersError.message}`);
        return;
      }
      
      setStatus('✅ Successfully connected to Supabase!');
      setTables([
        { name: 'products', sample: products?.[0] || 'No data' },
        { name: 'orders', sample: orders?.[0] || 'No data' }
      ]);
      
    } catch (error) {
      setStatus(`Connection error: ${error}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Connection Status:</h2>
        <p className={status.includes('✅') ? 'text-green-600' : 'text-gray-700'}>
          {status}
        </p>
      </div>
      
      {tables.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Table Samples:</h2>
          {tables.map((table, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold">{table.name}:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(table.sample, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <button
          onClick={testSupabaseConnection}
          className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}