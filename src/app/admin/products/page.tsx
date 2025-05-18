import React from 'react';
import Link from 'next/link';

// Sample product data to demonstrate the interface
const sampleProducts = [
  {
    id: 'prod_1',
    name: 'Elegance Stiletto Heels',
    sku: 'EL-STL-BLK-39',
    price: 3450,
    salePrice: 3150,
    inventoryQuantity: 24,
    inStock: true,
    featured: true,
    collection: 'Summer Elegance',
    images: ['/product-images/stiletto-black.jpg']
  },
  {
    id: 'prod_2',
    name: 'Classic Leather Loafers',
    sku: 'CL-LOF-BRN-42',
    price: 2850,
    salePrice: null,
    inventoryQuantity: 18,
    inStock: true,
    featured: false,
    collection: 'Urban Luxury',
    images: ['/product-images/loafers-brown.jpg']
  },
  {
    id: 'prod_3',
    name: 'Suede Chelsea Boots',
    sku: 'SD-CHL-BLK-40',
    price: 4250,
    salePrice: null,
    inventoryQuantity: 2,
    inStock: false,
    featured: true,
    collection: 'Winter Collection',
    images: ['/product-images/chelsea-boots.jpg']
  },
  {
    id: 'prod_4',
    name: 'Signature Leather Belt',
    sku: 'SG-BLT-BRN-M',
    price: 1250,
    salePrice: 950,
    inventoryQuantity: 35,
    inStock: true,
    featured: false,
    collection: 'Accessories',
    images: ['/product-images/leather-belt.jpg']
  },
  {
    id: 'prod_5',
    name: 'Urban Sneakers',
    sku: 'UR-SNK-WHT-41',
    price: 1850,
    salePrice: null,
    inventoryQuantity: 12,
    inStock: true,
    featured: true,
    collection: 'Urban Luxury',
    images: ['/product-images/sneakers-white.jpg']
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <div className="flex space-x-4">
            <Link href="/admin" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
              Dashboard
            </Link>
            <Link href="/admin/products/new" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Add Product
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
                    placeholder="Search products..." 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option>All Collections</option>
                    <option>Summer Elegance</option>
                    <option>Urban Luxury</option>
                    <option>Winter Collection</option>
                    <option>Accessories</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option>All Status</option>
                    <option>In Stock</option>
                    <option>Out of Stock</option>
                    <option>Featured</option>
                  </select>
                </div>
              </div>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inventory
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
                {sampleProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded">
                          {/* Placeholder for product image */}
                          <div className="h-10 w-10 flex items-center justify-center text-xs text-gray-500">
                            Image
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.collection}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.salePrice ? (
                        <div>
                          <span className="text-sm line-through text-gray-400">R{product.price.toFixed(2)}</span>
                          <span className="ml-2 text-sm font-medium text-red-600">R{product.salePrice.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-900">R{product.price.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.inventoryQuantity} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                        {product.featured && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/products/${product.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                        Edit
                      </Link>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">5</span> of <span className="font-medium">25</span> products
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-700">
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-blue-600 text-white">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
