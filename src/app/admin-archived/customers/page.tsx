import React from 'react';
import Link from 'next/link';

// Sample customers data to demonstrate the interface
const sampleCustomers = [
  {
    id: 'cus_1',
    firstName: 'Lerato',
    lastName: 'Ndlovu',
    email: 'lerato.n@example.com',
    phone: '+27 83 123 4567',
    totalOrders: 5,
    totalSpent: 15350,
    lastOrder: '17 May 2025',
    status: 'Active'
  },
  {
    id: 'cus_2',
    firstName: 'Thabo',
    lastName: 'Molefe',
    email: 'thabo.m@example.com',
    phone: '+27 71 234 5678',
    totalOrders: 2,
    totalSpent: 8650,
    lastOrder: '16 May 2025',
    status: 'Active'
  },
  {
    id: 'cus_3',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@example.com',
    phone: '+27 82 345 6789',
    totalOrders: 8,
    totalSpent: 32850,
    lastOrder: '15 May 2025',
    status: 'Active'
  },
  {
    id: 'cus_4',
    firstName: 'Khaya',
    lastName: 'Zulu',
    email: 'khaya.z@example.com',
    phone: '+27 73 456 7890',
    totalOrders: 1,
    totalSpent: 3450,
    lastOrder: '14 May 2025',
    status: 'Active'
  },
  {
    id: 'cus_5',
    firstName: 'Emma',
    lastName: 'Williams',
    email: 'emma.w@example.com',
    phone: '+27 84 567 8901',
    totalOrders: 0,
    totalSpent: 0,
    lastOrder: 'Never',
    status: 'Inactive'
  },
];

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <div className="flex space-x-4">
            <Link href="/admin" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
              Dashboard
            </Link>
            <button className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
              Export Data
            </button>
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
                    placeholder="Search customers..." 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500">
                    <option>Sort by Name</option>
                    <option>Sort by Orders</option>
                    <option>Sort by Total Spent</option>
                    <option>Sort by Last Order</option>
                  </select>
                </div>
              </div>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Order
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
                {sampleCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Customer since {customer.lastOrder !== 'Never' ? '2025' : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.totalSpent > 0 ? `R${customer.totalSpent.toFixed(2)}` : 'R0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.lastOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/customers/${customer.id}`} className="text-yellow-600 hover:text-yellow-900 mr-3">
                        View
                      </Link>
                      <Link href={`/admin/customers/${customer.id}/orders`} className="text-blue-600 hover:text-blue-900">
                        Orders
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">5</span> of <span className="font-medium">42</span> customers
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-700">
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-yellow-600 text-white">
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
