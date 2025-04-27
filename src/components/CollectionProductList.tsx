'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';
import { getProductImageUrl } from '@/lib/supabaseClient'; // Assuming this helper exists
import ClientPriceFormat from './ClientPriceFormat'; // Import the new component

// Define Product type (should match the one in page.tsx or a shared types file)
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  description?: string; // Add description for list view if available
};

interface CollectionProductListProps {
  products: Product[];
  basePath: string; // e.g., /shop or /shop/collections/[slug]
  currentPage: number;
  totalPages: number;
  currentSearchParams: string; // Pass the current search string
}

const CollectionProductList: React.FC<CollectionProductListProps> = ({
  products,
  basePath, // Use basePath instead of collectionSlug
  currentPage,
  totalPages,
  currentSearchParams, // Receive current search params
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Default to grid view

  return (
    <div>
      {/* View Toggle Buttons */}
      <div className="flex justify-end items-center mb-8">
        <span className="mr-4 text-sm text-text-light font-poppins">View as:</span>
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded transition-colors duration-200 ${
            viewMode === 'grid' ? 'bg-brand-gold text-black' : 'bg-gray-200 text-text-dark hover:bg-gray-300'
          }`}
          aria-label="Grid view"
          disabled={viewMode === 'grid'}
        >
          {/* Grid Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 ml-2 rounded transition-colors duration-200 ${
            viewMode === 'list' ? 'bg-brand-gold text-black' : 'bg-gray-200 text-text-dark hover:bg-gray-300'
          }`}
          aria-label="List view"
          disabled={viewMode === 'list'}
        >
          {/* List Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </button>
      </div>
      {/* Product Display Area */}
      {products.length > 0 ? (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product.id} className="product-card bg-white p-4 pb-8 border border-border-light transition-transform duration-std ease-in-out hover:-translate-y-1 hover:shadow-xl flex flex-col group">
                  <Link
                    href={`/shop/products/${product.slug}`}
                    className="relative block mb-6 aspect-square overflow-hidden"> {/* Added relative, removed legacyBehavior */}
                    <Image
                      src={getProductImageUrl(product.images?.[0])}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 25vw"
                      className="transition-transform duration-std ease-in-out group-hover:scale-105"
                    />
                  </Link>
                  <div className="flex-grow flex flex-col">
                    <h3 className="font-montserrat text-base font-medium text-text-dark mb-3 truncate flex-grow">{product.name}</h3>
                    {/* Use ClientPriceFormat */}
                    <ClientPriceFormat price={product.price} className="price text-base text-brand-gold mb-5 font-poppins" />
                    <Button href={`/shop/products/${product.slug}`} variant="secondary" className="text-xs px-5 py-2.5 mt-auto font-poppins">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-6">
              {products.map((product) => (
                <div key={product.id} className="product-list-item bg-white p-4 border border-border-light flex flex-col sm:flex-row gap-6 items-center hover:shadow-md transition-shadow duration-std">
                  <Link
                    href={`/shop/products/${product.slug}`}
                    className="relative block w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden group"> {/* Added relative, removed legacyBehavior */}
                    <Image
                      src={getProductImageUrl(product.images?.[0])}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 640px) 100vw, 128px"
                      className="transition-transform duration-std ease-in-out group-hover:scale-105"
                    />
                  </Link>
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="font-montserrat text-lg font-medium text-text-dark mb-2">
                      <Link
                        href={`/shop/products/${product.slug}`}
                        className="hover:text-brand-gold"> {/* Removed legacyBehavior */}
                        {product.name}
                      </Link>
                    </h3>
                    {/* Optional: Add short description if available */}
                    {/* {product.description && <p className="text-sm text-text-light mb-3 font-poppins line-clamp-2">{product.description}</p>} */}
                    {/* Use ClientPriceFormat */}
                    <ClientPriceFormat price={product.price} className="price text-lg text-brand-gold mb-4 font-poppins" />
                  </div>
                  <div className="flex-shrink-0 mt-4 sm:mt-0 sm:ml-auto">
                    <Button href={`/shop/products/${product.slug}`} variant="secondary" className="text-sm px-6 py-2 font-poppins">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-12">
              <Link
                // Construct href preserving existing search params, only changing page
                href={`${basePath}?${new URLSearchParams(currentSearchParams ? currentSearchParams.replace(/^\?/, '') : '').toString()}&page=${currentPage - 1}`}
                className={`px-4 py-2 border rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-brand-gold border-brand-gold hover:bg-brand-gold hover:text-black'}`}
                aria-disabled={currentPage === 1}
                tabIndex={currentPage === 1 ? -1 : undefined}
              >
                Previous
              </Link>
              <span className="text-text-dark font-poppins">
                Page {currentPage} of {totalPages}
              </span>
              <Link
                 // Construct href preserving existing search params, only changing page
                href={`${basePath}?${new URLSearchParams(currentSearchParams ? currentSearchParams.replace(/^\?/, '') : '').toString()}&page=${currentPage + 1}`}
                className={`px-4 py-2 border rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-brand-gold border-brand-gold hover:bg-brand-gold hover:text-black'}`}
                aria-disabled={currentPage === totalPages}
                tabIndex={currentPage === totalPages ? -1 : undefined}
              >
                Next
              </Link>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-text-light font-poppins">No products found in this collection.</p>
      )}
    </div>
  );
};

export default CollectionProductList;
