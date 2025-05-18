'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowserClient'; // Updated import
import { getProductImageUrl } from '@/lib/supabaseClient'; // getProductImageUrl remains here for now
import type { User } from '@supabase/supabase-js'; // Import User type

// Type for search results
type SearchResult = {
  id: string;
  name: string;
  slug: string;
  images: string[];
};

// Type for Collections
type Collection = {
  id: string;
  name: string;
};

// SVG Icon (copied from Header)
const SearchIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );

const PredictiveSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]); // State for collections
  const [selectedCollection, setSelectedCollection] = useState<string>(''); // State for selected collection ID
  const supabase = createSupabaseBrowserClient();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Get user session on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    // Fetch collections on mount
    const getCollections = async () => {
        const { data, error } = await supabase.from('collections').select('id, name').order('name');
        if (error) {
            console.error("Error fetching collections for search:", error);
        } else {
            setCollections(data || []);
        }
    };
    getUser();
    getCollections();
  }, []);


  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) { // Only search if query is long enough
        setResults([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      // Log the search term
      const logSearchTerm = async (term: string) => {
        try {
          const { error: logError } = await supabase
            .from('search_queries')
            .insert({ search_term: term, user_id: user?.id ?? null }); // Insert term and user_id if available
          if (logError) {
            console.error('Error logging search term:', logError);
          }
        } catch (e) {
            console.error('Exception logging search term:', e);
        }
      };
      logSearchTerm(query); // Log the term asynchronously

      // Fetch results
      try {
        let productQuery = supabase
           .from('products')
           .select('id, name, slug, images')
           .ilike('name', `%${query}%`); // Case-insensitive search for name containing query

        // Add collection filter if selected
        if (selectedCollection) {
            productQuery = productQuery.eq('collection_id', selectedCollection);
        }

         const { data, error } = await productQuery.limit(5); // Limit results

        if (error) throw error;
        setResults(data || []);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setResults([]); // Clear results on error
      } finally {
        setIsLoading(false);
      }
    }, 300), // 300ms debounce
    [selectedCollection] // Re-run debounce if selectedCollection changes
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  };

  const handleFocus = () => setIsFocused(true);
  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        // Optionally clear search term and results on blur
        // setSearchTerm('');
        // setResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeResults = () => {
    setIsFocused(false);
    // Optionally clear search term and results
    // setSearchTerm('');
    // setResults([]);
  }

  const handleCollectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const collectionId = event.target.value;
      setSelectedCollection(collectionId);
      // Trigger search immediately when collection changes, even if search term is short
      debouncedSearch.cancel(); // Cancel any pending search
      if (searchTerm.length >= 2 || collectionId) { // Search if term is valid OR a collection is selected
          debouncedSearch(searchTerm);
      } else {
          setResults([]); // Clear results if no term and no collection
      }
  }

  return (
    <div className="relative w-full max-w-md" ref={searchContainerRef}> {/* Keep ref, remove flex items-center from outer div */}
      {/* Search wrapper with better spacing */}
      <div className="w-full flex items-center bg-gray-800/80 rounded-full border border-gray-700 overflow-hidden focus-within:border-brand-gold"> {/* Added focus-within */}
        {/* Dropdown with fixed width and ellipsis */}
        <div className="relative min-w-[90px] max-w-[90px] flex-shrink-0"> {/* Added flex-shrink-0 */}
          <select
            value={selectedCollection} // Connect state
            onChange={handleCollectionChange} // Connect handler
            onFocus={handleFocus} // Connect handler
            className="w-full appearance-none bg-transparent text-gray-300 pl-4 pr-7 py-2 focus:outline-none cursor-pointer truncate text-sm" // Added text-sm
          >
            <option value="">All</option>
            {/* Map existing collections state */}
            {collections.map(col => (
              <option key={col.id} value={col.id}>{col.name}</option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"> {/* Added text color */}
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-600 mx-1 flex-shrink-0"></div> {/* Added flex-shrink-0 */}

        {/* Input field */}
        <input
          type="search" // Keep type="search"
          placeholder="Search products..."
          value={searchTerm} // Connect state
          onChange={handleInputChange} // Connect handler
          onFocus={handleFocus} // Connect handler
          className="flex-grow bg-transparent border-none text-white py-2 pl-2 pr-2 focus:outline-none placeholder-gray-400 text-sm" // Adjusted padding, added text-sm
        />

        {/* Search button */}
        <button
          type="button" // Add type="button"
          className="flex-shrink-0 text-gray-400 hover:text-white mr-3 p-1" // Added padding for better click area
          aria-label="Search"
          // No onClick needed as search is predictive
        >
          {/* Use existing SearchIcon component */}
          <SearchIcon />
        </button>
      </div>
      {/* Results Dropdown - Keep this part as is, adjust width/positioning if needed */}
      {isFocused && (searchTerm.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 mt-2 w-64 md:w-80 bg-white border border-border-light rounded-md shadow-lg z-[1002] max-h-80 overflow-y-auto">
          {isLoading && <div className="p-4 text-sm text-text-light text-center">Searching...</div>}
          {!isLoading && results.length === 0 && searchTerm.length >= 2 && (
            <div className="p-4 text-sm text-text-light text-center">No products found for "{searchTerm}".</div>
          )}
          {!isLoading && results.length > 0 && (
            <ul>
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/shop/products/${product.slug}`}
                    className="flex items-center p-3 hover:bg-background-light transition-colors duration-150"
                    // Keep closeResults handler
                    // Remove legacyBehavior as it's deprecated and handled by codemod later
                    onClick={closeResults}>
                    {/* Wrap multiple children in a Fragment */}
                    <>
                      <Image
                        src={getProductImageUrl(supabase, product.images?.[0])} // Pass supabase instance
                        alt={product.name}
                      width={40}
                      height={40}
                        className="w-10 h-10 object-cover rounded mr-3 flex-shrink-0"
                      />
                      <span className="text-sm text-text-dark font-poppins truncate">{product.name}</span>
                    </>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictiveSearch;
