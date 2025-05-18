import React from 'react';
import Link from 'next/link';

// Sample pages data to demonstrate the interface
const samplePages = [
  {
    id: 'page_1',
    title: 'About Us',
    slug: 'about-us',
    lastUpdated: '17 May 2025',
    status: 'Published',
    section: 'Company',
  },
  {
    id: 'page_2',
    title: 'Shipping & Delivery',
    slug: 'shipping-delivery',
    lastUpdated: '15 May 2025',
    status: 'Published',
    section: 'Policies',
  },
  {
    id: 'page_3',
    title: 'Returns & Refunds',
    slug: 'returns-refunds',
    lastUpdated: '15 May 2025',
    status: 'Published',
    section: 'Policies',
  },
  {
    id: 'page_4',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    lastUpdated: '12 May 2025',
    status: 'Published',
    section: 'Legal',
  },
  {
    id: 'page_5',
    title: 'Terms & Conditions',
    slug: 'terms-conditions',
    lastUpdated: '12 May 2025',
    status: 'Published',
    section: 'Legal',
  },
  {
    id: 'page_6',
    title: 'Sizing Guide',
    slug: 'sizing-guide',
    lastUpdated: '10 May 2025',
    status: 'Draft',
    section: 'Help',
  },
];

export default function PagesPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
          <div className="flex space-x-4">
            <Link href="/admin" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
              Dashboard
            </Link>
            <Link href="/admin/content/pages/new" className="px-4 py-2 text-sm bg-brand-gold text-white rounded-md hover:bg-opacity-90" style={{ backgroundColor: '#AF8F53' }}>
              Add Page
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
                    placeholder="Search pages..." 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-gold focus:border-brand-gold" 
                    style={{ outlineColor: '#AF8F53', borderColor: '#AF8F53' }}
                  />
                </div>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-gold focus:border-brand-gold" style={{ outlineColor: '#AF8F53', borderColor: '#AF8F53' }}>
                    <option>All Sections</option>
                    <option>Company</option>
                    <option>Policies</option>
                    <option>Legal</option>
                    <option>Help</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-gold focus:border-brand-gold" style={{ outlineColor: '#AF8F53', borderColor: '#AF8F53' }}>
                    <option>All Status</option>
                    <option>Published</option>
                    <option>Draft</option>
                  </select>
                </div>
              </div>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL Slug
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {samplePages.map((page) => (
                  <tr key={page.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{page.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">/{page.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{page.section}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {page.lastUpdated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${page.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/content/pages/${page.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                        Edit
                      </Link>
                      <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-900 mr-4">
                        View
                      </a>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
