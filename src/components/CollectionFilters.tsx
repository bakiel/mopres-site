'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { debounce } from 'lodash'; // Using lodash for debouncing price/heel height

// Define filter options (can be fetched dynamically later if needed)
const heelHeightOptions = [
  { label: 'Any', value: '' },
  { label: 'Low (Under 5cm)', value: '0-5' },
  { label: 'Mid (5cm - 8cm)', value: '5-8' },
  { label: 'High (Over 8cm)', value: '8-100' },
];

// Define sort options
const sortOptions = [
  { label: 'Newest', value: 'created_at-desc' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  // { label: 'Bestselling', value: 'bestselling-desc' }, // Add later if sales data is available
];


const CollectionFilters: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- State for Filters ---
  // Availability
  const [showInStockOnly, setShowInStockOnly] = useState(searchParams.get('inStock') === 'true');
  // Price Range
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  // Heel Height Range
  const [heelHeight, setHeelHeight] = useState(searchParams.get('heelHeight') || '');
  // Sort Order
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created_at-desc'); // Default to Newest

  // --- Function to update URL Search Params ---
  const updateSearchParams = useCallback((newParams: Record<string, string>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    // Update or remove parameters
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    // Reset page to 1 when filters change
    current.delete('page');

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`, { scroll: false }); // Use scroll: false to prevent jumping
  }, [searchParams, pathname, router]);

  // --- Debounced Handlers for Range Inputs ---
  const debouncedUpdatePrice = useCallback(
    debounce((min: string, max: string) => {
      updateSearchParams({ minPrice: min, maxPrice: max });
    }, 500), // 500ms debounce
    [updateSearchParams]
  );

  // --- Event Handlers ---
  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setShowInStockOnly(checked);
    updateSearchParams({ inStock: checked ? 'true' : '' });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinPrice(value);
    debouncedUpdatePrice(value, maxPrice);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxPrice(value);
    debouncedUpdatePrice(minPrice, value);
  };

  const handleHeelHeightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setHeelHeight(value);
    updateSearchParams({ heelHeight: value });
  };

  // --- Effect to sync state with URL on initial load/navigation ---
  useEffect(() => {
    setShowInStockOnly(searchParams.get('inStock') === 'true');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setHeelHeight(searchParams.get('heelHeight') || '');
    setSortBy(searchParams.get('sortBy') || 'created_at-desc');
  }, [searchParams]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSortBy(value);
    updateSearchParams({ sortBy: value });
  };


  return (
    <div className="filters bg-white p-6 border border-border-light rounded-md shadow-sm mb-8">
      {/* Sort By Dropdown */}
       <div className="mb-6">
          <label htmlFor="sort-by" className="block font-medium mb-2 font-poppins text-sm text-text-dark">Sort By</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={handleSortChange}
            className="w-full p-2 border border-border-light rounded text-sm font-poppins focus:ring-brand-gold focus:border-brand-gold bg-white"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

      <h3 className="text-lg font-semibold mb-4 font-montserrat text-text-dark border-t border-border-light pt-6">Filter By</h3>
      <div className="space-y-6">
        {/* Availability Filter */}
        <div>
          <label className="flex items-center space-x-2 cursor-pointer font-poppins text-sm text-text-dark">
            <input
              type="checkbox"
              checked={showInStockOnly}
              onChange={handleAvailabilityChange}
              className="form-checkbox h-4 w-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold"
            />
            <span>Show In Stock Only</span>
          </label>
        </div>

        {/* Price Filter */}
        <div>
          <h4 className="font-medium mb-2 font-poppins text-sm text-text-dark">Price Range (ZAR)</h4>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={minPrice}
              onChange={handleMinPriceChange}
              placeholder="Min"
              min="0"
              className="w-full p-2 border border-border-light rounded text-sm font-poppins focus:ring-brand-gold focus:border-brand-gold"
              aria-label="Minimum price"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              placeholder="Max"
              min="0"
              className="w-full p-2 border border-border-light rounded text-sm font-poppins focus:ring-brand-gold focus:border-brand-gold"
              aria-label="Maximum price"
            />
          </div>
        </div>

        {/* Heel Height Filter */}
        <div>
          <label htmlFor="heel-height-filter" className="block font-medium mb-2 font-poppins text-sm text-text-dark">Heel Height</label>
          <select
            id="heel-height-filter"
            value={heelHeight}
            onChange={handleHeelHeightChange}
            className="w-full p-2 border border-border-light rounded text-sm font-poppins focus:ring-brand-gold focus:border-brand-gold bg-white"
          >
            {heelHeightOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Add more filters here (e.g., Color, Size) if needed later */}

      </div>
    </div>
  );
};

export default CollectionFilters;
