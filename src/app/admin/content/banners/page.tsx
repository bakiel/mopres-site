import React from 'react';
import Link from 'next/link';

// Sample banner data to demonstrate the interface
const sampleBanners = [
  {
    id: 'bnr_1',
    title: 'Summer Sale - 20% Off',
    subtitle: 'Limited Time Only!',
    buttonText: 'Shop Now',
    buttonLink: '/collections/summer-elegance',
    textColor: 'white',
    bgColor: '#AF8F53',
    position: 'Top',
    active: true,
    startDate: '2025-05-01',
    endDate: '2025-06-30',
  },
  {
    id: 'bnr_2',
    title: 'New Winter Collection',
    subtitle: 'Discover premium handcrafted boots',
    buttonText: 'View Collection',
    buttonLink: '/collections/winter-collection',
    textColor: 'white',
    bgColor: '#333333',
    position: 'Top',
    active: true,
    startDate: '2025-05-15',
    endDate: '2025-07-15',
  },
  {
    id: 'bnr_3',
    title: 'Free Shipping on Orders Over R2000',
    subtitle: 'Standard shipping R150',
    buttonText: null,
    buttonLink: null,
    textColor: 'white',
    bgColor: '#AF8F53',
    position: 'Top',
    active: true,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  },
];

export default function BannersPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
          <div className="flex space-x-4">
            <Link href="/admin" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
              Dashboard
            </Link>
            <Link href="/admin/content/banners/new" className="px-4 py-2 text-sm bg-brand-gold text-white rounded-md hover:bg-opacity-90" style={{ backgroundColor: '#AF8F53' }}>
              Add Banner
            </Link>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {sampleBanners.length > 0 ? (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-700">Active Banners</h2>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-gold focus:border-brand-gold text-sm" style={{ outlineColor: '#AF8F53', borderColor: '#AF8F53' }}>
                    <option>All Positions</option>
                    <option>Top</option>
                    <option>Homepage</option>
                    <option>Sidebar</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-gold focus:border-brand-gold text-sm" style={{ outlineColor: '#AF8F53', borderColor: '#AF8F53' }}>
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Scheduled</option>
                  </select>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {sampleBanners.map((banner) => (
                  <div key={banner.id} className="p-6 hover:bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="mb-4 lg:mb-0">
                        <div className="flex items-center">
                          <div className="w-10 h-10 flex-shrink-0 rounded flex items-center justify-center text-white" style={{ backgroundColor: banner.bgColor }}>
                            <span className="text-xl">B</span>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">{banner.title}</h3>
                            <p className="text-sm text-gray-500">{banner.subtitle}</p>
                          </div>
                        </div>
                        
                        <div className="mt-2 ml-14 flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Position: {banner.position}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {banner.startDate} to {banner.endDate}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          Preview
                        </button>
                        <Link href={`/admin/content/banners/${banner.id}`} className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          Edit
                        </Link>
                        <button className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 border rounded-md overflow-hidden">
                      <div className="p-4 flex items-center justify-between" style={{ backgroundColor: banner.bgColor, color: banner.textColor }}>
                        <div>
                          <div className="font-medium">{banner.title}</div>
                          <div className="text-sm opacity-90">{banner.subtitle}</div>
                        </div>
                        {banner.buttonText && (
                          <div className="rounded-md px-3 py-1 text-sm font-medium border" style={{ borderColor: banner.textColor }}>
                            {banner.buttonText}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100">
                <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">No banners found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Get started by creating a new banner.
              </p>
              <div className="mt-6">
                <Link href="/admin/content/banners/new" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white" style={{ backgroundColor: '#AF8F53' }}>
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Banner
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
