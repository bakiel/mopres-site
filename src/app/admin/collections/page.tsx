import React from 'react';
import Link from 'next/link';

// Sample collections data to demonstrate the interface
const sampleCollections = [
  {
    id: 'col_1',
    name: 'Summer Elegance',
    slug: 'summer-elegance',
    description: 'Luxury footwear for summer occasions, featuring elegant designs with breathable materials.',
    productCount: 12,
    featured: true,
    image: '/collection-images/summer-elegance.jpg'
  },
  {
    id: 'col_2',
    name: 'Urban Luxury',
    slug: 'urban-luxury',
    description: 'Contemporary designs for the modern urban professional, balancing style and comfort.',
    productCount: 8,
    featured: true,
    image: '/collection-images/urban-luxury.jpg'
  },
  {
    id: 'col_3',
    name: 'Winter Collection',
    slug: 'winter-collection',
    description: 'Premium footwear designed for winter weather, featuring insulated materials and elegant styling.',
    productCount: 10,
    featured: false,
    image: '/collection-images/winter-collection.jpg'
  },
  {
    id: 'col_4',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Luxury accessories to complement our footwear, including belts, bags, and more.',
    productCount: 15,
    featured: false,
    image: '/collection-images/accessories.jpg'
  },
  {
    id: 'col_5',
    name: 'Limited Edition',
    slug: 'limited-edition',
    description: 'Exclusive designs available for a limited time only. Premium materials and craftsmanship.',
    productCount: 5,
    featured: true,
    image: '/collection-images/limited-edition.jpg'
  },
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
          <div className="flex space-x-4">
            <Link href="/admin" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
              Dashboard
            </Link>
            <Link href="/admin/collections/new" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Add Collection
            </Link>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
                <div className="w-full md:w-1/3">
                  <input 
                    type="text" 
                    placeholder="Search collections..." 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option>All Status</option>
                    <option>Featured</option>
                    <option>Not Featured</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Sort by Name</option>
                    <option>Sort by Products</option>
                    <option>Sort by Date Created</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {sampleCollections.map((collection) => (
                <div key={collection.id} className="flex bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-1/3 bg-gray-200 flex items-center justify-center">
                    <div className="text-gray-500 text-xs">Collection Image</div>
                  </div>
                  <div className="w-2/3 p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900">{collection.name}</h3>
                      {collection.featured && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{collection.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="font-medium">{collection.productCount}</span> products in this collection
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <Link href={`/admin/collections/${collection.id}`} className="text-sm text-indigo-600 hover:text-indigo-900">
                        Edit
                      </Link>
                      <Link href={`/admin/products?collection=${collection.id}`} className="text-sm text-blue-600 hover:text-blue-900">
                        View Products
                      </Link>
                      <button className="text-sm text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
