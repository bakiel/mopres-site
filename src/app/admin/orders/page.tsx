import React from 'react';
import Link from 'next/link';

// Sample orders data to demonstrate the interface
const sampleOrders = [
  {
    id: 'ord_1',
    orderRef: 'MO-2025-0001',
    customerName: 'Lerato Ndlovu',
    customerEmail: 'lerato.n@example.com',
    date: '17 May 2025',
    totalAmount: 4780,
    status: 'Processing',
    paymentStatus: 'Paid',
    items: 3
  },
  {
    id: 'ord_2',
    orderRef: 'MO-2025-0002',
    customerName: 'Thabo Molefe',
    customerEmail: 'thabo.m@example.com',
    date: '16 May 2025',
    totalAmount: 2850,
    status: 'Shipped',
    paymentStatus: 'Paid',
    items: 1
  },
  {
    id: 'ord_3',
    orderRef: 'MO-2025-0003',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@example.com',
    date: '15 May 2025',
    totalAmount: 7650,
    status: 'Delivered',
    paymentStatus: 'Paid',
    items: 2
  },
  {
    id: 'ord_4',
    orderRef: 'MO-2025-0004',
    customerName: 'Khaya Zulu',
    customerEmail: 'khaya.z@example.com',
    date: '14 May 2025',
    totalAmount: 3450,
    status: 'Processing',
    paymentStatus: 'Pending',
    items: 1
  },
  {
    id: 'ord_5',
    orderRef: 'MO-2025-0005',
    customerName: 'Emma Williams',
    customerEmail: 'emma.w@example.com',
    date: '13 May 2025',
    totalAmount: 5600,
    status: 'Cancelled',
    paymentStatus: 'Refunded',
    items: 2
  },
];

// Helper function to get status badge color
const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'Processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'Shipped':
      return 'bg-blue-100 text-blue-800';
    case 'Delivered':
      return 'bg-green-100 text-green-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get payment status badge color
const getPaymentStatusBadgeColor = (status) => {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Refunded':
      return 'bg-purple-100 text-purple-800';
    case 'Failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <div className="flex space-x-4">
            <Link href="/admin" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
              Dashboard
            </Link>
            <Link href="/admin/orders/new" className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
              Create Order
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
                    placeholder="Search orders..." 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                    <option>All Status</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                    <option>All Payment Status</option>
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Refunded</option>
                    <option>Failed</option>
                  </select>
                </div>
              </div>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Ref
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sampleOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">
                        {order.orderRef}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.items} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      R{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/orders/${order.id}`} className="text-green-600 hover:text-green-900 mr-3">
                        View
                      </Link>
                      <button className="text-gray-600 hover:text-gray-900">
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">5</span> of <span className="font-medium">23</span> orders
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-700">
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-green-600 text-white">
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
