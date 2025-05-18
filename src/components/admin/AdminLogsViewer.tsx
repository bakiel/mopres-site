'use client';

import React, { useState, useEffect } from 'react';
import { logger, LogLevel } from '@/utils/logger';

interface AdminLogsViewerProps {
  maxLogs?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function AdminLogsViewer({ 
  maxLogs = 50, 
  autoRefresh = true,
  refreshInterval = 5000
}: AdminLogsViewerProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');
  
  // Fetch logs from logger utility
  const fetchLogs = () => {
    const allLogs = logger.getLogs();
    
    // Apply filtering
    const filteredLogs = filter === 'ALL' 
      ? allLogs 
      : allLogs.filter(log => log.level === filter);
    
    // Apply max logs limit (show most recent)
    const limitedLogs = filteredLogs.slice(-maxLogs);
    
    setLogs(limitedLogs);
  };
  
  // Setup auto-refresh
  useEffect(() => {
    // Initial fetch
    fetchLogs();
    
    // Set up automatic refresh
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      intervalId = setInterval(fetchLogs, refreshInterval);
    }
    
    // Cleanup interval
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval, filter, maxLogs]);
  
  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as LogLevel | 'ALL');
  };
  
  // Handle log clear
  const handleClearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };
  
  // Get appropriate color for log level
  const getLogColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'text-gray-500';
      case LogLevel.INFO:
        return 'text-blue-600';
      case LogLevel.WARN:
        return 'text-amber-600';
      case LogLevel.ERROR:
        return 'text-red-600';
      case LogLevel.ADMIN:
        return 'text-purple-600 font-medium';
      default:
        return 'text-gray-800';
    }
  };
  
  // Get emoji for log level
  const getLogEmoji = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG:
        return '🔍';
      case LogLevel.INFO:
        return 'ℹ️';
      case LogLevel.WARN:
        return '⚠️';
      case LogLevel.ERROR:
        return '❌';
      case LogLevel.ADMIN:
        return '👑';
      default:
        return '📄';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Admin Logs</h2>
        
        <div className="flex space-x-2">
          <select 
            value={filter}
            onChange={handleFilterChange}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="ALL">All Logs</option>
            <option value={LogLevel.ADMIN}>Admin Only</option>
            <option value={LogLevel.ERROR}>Errors Only</option>
            <option value={LogLevel.WARN}>Warnings</option>
            <option value={LogLevel.INFO}>Info</option>
            <option value={LogLevel.DEBUG}>Debug</option>
          </select>
          
          <button 
            onClick={fetchLogs}
            className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100 border border-blue-200"
          >
            Refresh
          </button>
          
          <button 
            onClick={handleClearLogs}
            className="px-2 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100 border border-red-200"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b text-sm font-medium grid grid-cols-12 gap-2">
          <div className="col-span-2">Timestamp</div>
          <div className="col-span-1">Level</div>
          <div className="col-span-5">Message</div>
          <div className="col-span-4">Data</div>
        </div>
        
        <div className="overflow-y-auto max-h-80">
          {logs.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No logs found. Admin activity will be recorded here.
            </div>
          ) : (
            logs.map((log, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-12 gap-2 p-2 text-sm border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
              >
                <div className="col-span-2 text-gray-500 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
                
                <div className={`col-span-1 ${getLogColor(log.level)}`}>
                  {getLogEmoji(log.level)}
                </div>
                
                <div className={`col-span-5 ${getLogColor(log.level)}`}>
                  {log.message}
                </div>
                
                <div className="col-span-4 overflow-x-auto">
                  {log.data ? (
                    <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                      {JSON.stringify(log.data, null, 1)}
                    </pre>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-2 text-right text-xs text-gray-500">
        Showing {logs.length} logs • Last refreshed: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}