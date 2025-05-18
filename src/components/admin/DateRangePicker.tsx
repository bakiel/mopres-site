'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface DateRangePickerProps {
  onDateRangeChange: (startDate: Date, endDate: Date, label: string) => void;
  className?: string;
}

const predefinedRanges = [
  { label: 'Today', getDates: () => {
    const today = new Date();
    return { startDate: today, endDate: today };
  }},
  { label: 'Yesterday', getDates: () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return { startDate: yesterday, endDate: yesterday };
  }},
  { label: 'Last 7 Days', getDates: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    return { startDate: start, endDate: end };
  }},
  { label: 'Last 30 Days', getDates: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);
    return { startDate: start, endDate: end };
  }},
  { label: 'This Month', getDates: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date();
    return { startDate: start, endDate: end };
  }},
  { label: 'Last Month', getDates: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startDate: start, endDate: end };
  }},
  { label: 'This Year', getDates: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date();
    return { startDate: start, endDate: end };
  }},
  { label: 'Last Year', getDates: () => {
    const now = new Date();
    const start = new Date(now.getFullYear() - 1, 0, 1);
    const end = new Date(now.getFullYear() - 1, 11, 31);
    return { startDate: start, endDate: end };
  }},
  { label: 'All Time', getDates: () => {
    // Using a distant past date for "all time"
    const start = new Date(2010, 0, 1);
    const end = new Date();
    return { startDate: start, endDate: end };
  }}
];

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DateRangePicker({ onDateRangeChange, className = '' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('Last 30 Days');
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [customRange, setCustomRange] = useState(false);
  
  useEffect(() => {
    // Initialize with default range (Last 30 Days)
    onDateRangeChange(startDate, endDate, selectedRange);
  }, []);
  
  const handleRangeSelect = (rangeLabel: string) => {
    if (rangeLabel === 'Custom Range') {
      setCustomRange(true);
      setSelectedRange(rangeLabel);
    } else {
      setCustomRange(false);
      const selectedRangeObj = predefinedRanges.find(range => range.label === rangeLabel);
      if (selectedRangeObj) {
        const { startDate: newStartDate, endDate: newEndDate } = selectedRangeObj.getDates();
        setStartDate(newStartDate);
        setEndDate(newEndDate);
        setSelectedRange(rangeLabel);
        onDateRangeChange(newStartDate, newEndDate, rangeLabel);
      }
    }
    setIsOpen(false);
  };
  
  const handleCustomRangeChange = () => {
    onDateRangeChange(startDate, endDate, 'Custom Range');
  };
  
  const formatDateDisplay = (start: Date, end: Date): string => {
    if (selectedRange !== 'Custom Range') {
      return selectedRange;
    }
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };
  
  return (
    <div className={`relative inline-block text-left ${className}`}>
      <div>
        <button
          type="button"
          className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{formatDateDisplay(startDate, endDate)}</span>
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {predefinedRanges.map((range) => (
              <button
                key={range.label}
                onClick={() => handleRangeSelect(range.label)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  selectedRange === range.label && !customRange ? 'bg-gray-100 text-brand-primary' : 'text-gray-700'
                }`}
                role="menuitem"
              >
                {range.label}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => handleRangeSelect('Custom Range')}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  customRange ? 'bg-gray-100 text-brand-primary' : 'text-gray-700'
                }`}
                role="menuitem"
              >
                Custom Range
              </button>
              
              {customRange && (
                <div className="px-4 py-3">
                  <div className="flex flex-col space-y-3">
                    <div>
                      <label htmlFor="start-date" className="block text-xs font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="start-date"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                        value={formatDateForInput(startDate)}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          setStartDate(date);
                          setSelectedRange('Custom Range');
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor="end-date" className="block text-xs font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="end-date"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                        value={formatDateForInput(endDate)}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          setEndDate(date);
                          setSelectedRange('Custom Range');
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-primary text-base font-medium text-white hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary sm:text-sm"
                      onClick={() => {
                        handleCustomRangeChange();
                        setIsOpen(false);
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
