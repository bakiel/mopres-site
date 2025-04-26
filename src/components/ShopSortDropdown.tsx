'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ShopSortDropdownProps {
  currentSort: string; // Pass the current sort value from the parent
}

export default function ShopSortDropdown({ currentSort }: ShopSortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const current = new URLSearchParams(Array.from(searchParams.entries())); // Create mutable copy

    // Update the 'sort' parameter, keeping other params like 'page' if they exist
    current.set('sort', newSort);
    // Reset page to 1 when sort changes
    current.set('page', '1');

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`/shop${query}`);
  };

  return (
    <div className="flex justify-end mb-8">
        <label htmlFor="sort-by" className="mr-3 text-text-dark font-poppins self-center">Sort by:</label>
        <select
            id="sort-by"
            className="border border-border-light rounded px-3 py-1.5 text-text-dark font-poppins bg-white focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
            value={currentSort} // Control the selected value
            onChange={handleSortChange} // Use the client-side handler
        >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
        </select>
    </div>
  );
}
