'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { logger, LogLevel } from '@/utils/logger';

// Dynamically import the AdminLogsViewer to ensure it runs client-side
const AdminLogsViewer = dynamic(
  () => import('@/components/admin/AdminLogsViewer'),
  { ssr: false }
);

export default function AdminLogsPage() {
  const [logAction, setLogAction] = useState('');
  
  // Function to generate test log entries
  const generateTestLogs = () => {
    logger.debug('Test debug message', { source: 'AdminLogsPage' });
    logger.info('Test info message', { source: 'AdminLogsPage' });
    logger.warn('Test warning message', { source: 'AdminLogsPage' });
    logger.error('Test error message', { source: 'AdminLogsPage' });
    logger.admin('Test admin action', { 
      source: 'AdminLogsPage', 
      action: 'test',
      timestamp: new Date().toISOString()
    });
    
    setLogAction('Generated test log entries');
  };
  
  const clearAllLogs = () => {
    logger.clearLogs();
    setLogAction('Cleared all log entries');
  };
  
  // Log custom admin action
  const logCustomAction = () => {
    if (!logAction.trim()) return;
    
    logger.admin('Custom admin action', { 
      action: logAction,
      user: 'Admin',
      timestamp: new Date().toISOString()
    });
    
    setLogAction('');
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Logs</h1>
          <div className="flex space-x-4">
            <Link href="/admin" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Admin Activity Logs</h2>
                <p className="text-sm text-gray-500 mt-1">
                  View and monitor all admin activity in the system
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-2">
                <button
                  onClick={generateTestLogs}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Generate Test Logs
                </button>
                <button
                  onClick={clearAllLogs}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Clear All Logs
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-2">Log Custom Admin Action</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={logAction}
                  onChange={(e) => setLogAction(e.target.value)}
                  placeholder="Describe admin action..."
                  className="flex-1 px-3 py-2 border rounded text-sm"
                />
                <button
                  onClick={logCustomAction}
                  disabled={!logAction.trim()}
                  className={`px-3 py-2 text-white text-sm rounded ${
                    logAction.trim() ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Log Action
                </button>
              </div>
            </div>
            
            {/* Full logs viewer with more space */}
            <AdminLogsViewer maxLogs={500} autoRefresh={true} refreshInterval={3000} />
            
            <div className="mt-8 text-sm text-gray-500">
              <h3 className="font-medium mb-2">About Admin Logging</h3>
              <p>
                This system logs all admin activities using different log levels:
              </p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li><span className="text-purple-600 font-medium">ADMIN</span> - Admin-specific actions like logins and operations</li>
                <li><span className="text-red-600 font-medium">ERROR</span> - System errors and failures</li>
                <li><span className="text-amber-600 font-medium">WARN</span> - Warnings and potential issues</li>
                <li><span className="text-blue-600 font-medium">INFO</span> - General information about system operations</li>
                <li><span className="text-gray-500 font-medium">DEBUG</span> - Detailed debugging information</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
