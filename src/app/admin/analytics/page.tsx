'use client';

import React from 'react';
import Link from 'next/link';
import AdminNavigation from '@/components/admin/navigation/AdminNavigation';
import { BRAND } from '@/utils/brand';

// Sample data for analytics
const analyticsData = {
  salesOverview: {
    currentPeriod: {
      revenue: 84350,
      orders: 27,
      averageOrderValue: 3124
    },
    previousPeriod: {
      revenue: 78200,
      orders: 25,
      averageOrderValue: 3128
    },
    percentageChange: {
      revenue: 7.9,
      orders: 8.0,
      averageOrderValue: -0.1
    }
  },
  topProducts: [
    { id: 'prod_1', name: 'Elegance Stiletto Heels', sales: 12, revenue: 37800 },
    { id: 'prod_2', name: 'Classic Leather Loafers', sales: 8, revenue: 22800 },
    { id: 'prod_3', name: 'Suede Chelsea Boots', sales: 5, revenue: 21250 },
    { id: 'prod_4', name: 'Urban Sneakers', sales: 7, revenue: 12950 },
    { id: 'prod_5', name: 'Signature Leather Belt', sales: 6, revenue: 7500 },
  ],
  recentActivity: [
    { type: 'order', date: '17 May 2025, 14:32', details: 'New order #12345 for R3,450.00' },
    { type: 'customer', date: '17 May 2025, 12:15', details: 'New customer registration: Thabo Molefe' },
    { type: 'product', date: '16 May 2025, 16:47', details: 'Low stock alert: Classic Leather Loafers (2 units remaining)' },
    { type: 'order', date: '16 May 2025, 10:23', details: 'Order #12344 status changed to Shipped' },
    { type: 'customer', date: '15 May 2025, 09:11', details: 'Customer feedback received from Sarah Johnson (5★)' },
  ],
  monthlySales: [
    { month: 'Jan', revenue: 54200 },
    { month: 'Feb', revenue: 62350 },
    { month: 'Mar', revenue: 73100 },
    { month: 'Apr', revenue: 78200 },
    { month: 'May', revenue: 84350 },
  ]
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="flex space-x-4">
            <Link href="/admin" className={`px-4 py-2 text-sm font-medium bg-white hover:bg-amber-50 text-amber-900 border border-amber-500 rounded-md shadow-sm`}>
              Dashboard
            </Link>
            <div className="relative">
              <button className={`px-4 py-2 text-sm font-medium bg-amber-800 hover:bg-amber-900 text-white border border-amber-900 rounded-md shadow-sm`}>
                Export Reports
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Add Admin Navigation */}
          <AdminNavigation />
          
          <div className="flex items-center justify-between mb-6 bg-amber-50 p-4 rounded-lg border border-amber-300">
            <h2 className="text-xl font-bold text-amber-900">Analytics Dashboard</h2>
            <div className="flex space-x-2">
              <Link href="/admin/analytics-hub" className={`px-3 py-1.5 bg-white text-amber-900 font-medium rounded-md text-sm border border-amber-500 hover:bg-amber-50`}>
                Go to Analytics Hub
              </Link>
              <Link href="/admin" className={`px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white border border-amber-900 rounded-md text-sm font-medium`}>
                Back to Admin Dashboard
              </Link>
            </div>
          </div>
          {/* Date Filter */}
          <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center border border-gray-300">
            <div className="font-medium text-gray-700">
              Showing data for: Last 30 days (18 Apr - 17 May 2025)
            </div>
            <div className="flex space-x-2">
              <select className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>This month</option>
                <option>Last month</option>
                <option>This year</option>
                <option>Custom range</option>
              </select>
              <button className={`px-3 py-2 text-sm font-medium bg-amber-800 hover:bg-amber-900 text-white border border-amber-900 shadow-sm rounded-md font-semibold`}>
                Apply
              </button>
            </div>
          </div>
          
          {/* Sales Overview Cards */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Revenue Card */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Total Revenue</div>
                      <div className="mt-1 text-3xl font-semibold text-gray-900">
                        R{analyticsData.salesOverview.currentPeriod.revenue.toLocaleString()}
                      </div>
                    </div>
                    <div className={`px-2.5 py-1.5 rounded-full text-sm font-medium ${analyticsData.salesOverview.percentageChange.revenue >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {analyticsData.salesOverview.percentageChange.revenue >= 0 ? '+' : ''}{analyticsData.salesOverview.percentageChange.revenue}%
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-16 w-full bg-gray-100 rounded-md overflow-hidden">
                      {/* Simple bar chart visualization */}
                      <div className="h-full w-full flex items-end">
                        {analyticsData.monthlySales.map((month, index) => (
                          <div key={index} className="h-full flex-1 flex items-end justify-center">
                            <div 
                              className="w-4/5 bg-amber-700 rounded-t-sm" 
                              style={{ 
                                height: `${Math.max((month.revenue / 90000) * 100, 10)}%`,
                              }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    vs. R{analyticsData.salesOverview.previousPeriod.revenue.toLocaleString()} previous period
                  </div>
                </div>
              </div>
              
              {/* Orders Card */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Total Orders</div>
                      <div className="mt-1 text-3xl font-semibold text-gray-900">
                        {analyticsData.salesOverview.currentPeriod.orders}
                      </div>
                    </div>
                    <div className={`px-2.5 py-1.5 rounded-full text-sm font-medium ${analyticsData.salesOverview.percentageChange.orders >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {analyticsData.salesOverview.percentageChange.orders >= 0 ? '+' : ''}{analyticsData.salesOverview.percentageChange.orders}%
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-16 w-full bg-gray-100 rounded-md overflow-hidden">
                      {/* Simple bar chart visualization */}
                      <div className="h-full w-full flex items-end">
                        {[15, 18, 20, 25, 27].map((value, index) => (
                          <div key={index} className="h-full flex-1 flex items-end justify-center">
                            <div 
                              className="w-4/5 bg-amber-700 rounded-t-sm" 
                              style={{ 
                                height: `${Math.max((value / 30) * 100, 10)}%`
                              }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    vs. {analyticsData.salesOverview.previousPeriod.orders} previous period
                  </div>
                </div>
              </div>
              
              {/* Average Order Value Card */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Average Order Value</div>
                      <div className="mt-1 text-3xl font-semibold text-gray-900">
                        R{analyticsData.salesOverview.currentPeriod.averageOrderValue.toLocaleString()}
                      </div>
                    </div>
                    <div className={`px-2.5 py-1.5 rounded-full text-sm font-medium ${analyticsData.salesOverview.percentageChange.averageOrderValue >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {analyticsData.salesOverview.percentageChange.averageOrderValue >= 0 ? '+' : ''}{analyticsData.salesOverview.percentageChange.averageOrderValue}%
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-16 w-full bg-gray-100 rounded-md overflow-hidden">
                      {/* Simple bar chart visualization */}
                      <div className="h-full w-full flex items-end">
                        {[2950, 3050, 3125, 3128, 3124].map((value, index) => (
                          <div key={index} className="h-full flex-1 flex items-end justify-center">
                            <div 
                              className="w-4/5 bg-amber-700 rounded-t-sm" 
                              style={{ 
                                height: `${Math.max((value / 3500) * 100, 10)}%`
                              }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    vs. R{analyticsData.salesOverview.previousPeriod.averageOrderValue.toLocaleString()} previous period
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Top Products & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Products */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Top Selling Products</h3>
              </div>
              <div className="p-5">
                <table className="min-w-full">
                  <thead>
                    <tr className={BRAND.tableHeader}>
                      <th className="text-left text-xs font-medium uppercase tracking-wider py-3 px-3 rounded-tl-md">Product</th>
                      <th className="text-left text-xs font-medium uppercase tracking-wider py-3 px-3">Units Sold</th>
                      <th className="text-left text-xs font-medium uppercase tracking-wider py-3 px-3 rounded-tr-md">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analyticsData.topProducts.map(product => (
                      <tr key={product.id}>
                        <td className="py-3 text-sm text-gray-900">{product.name}</td>
                        <td className="py-3 text-sm text-gray-500">{product.sales}</td>
                        <td className="py-3 text-sm font-medium text-gray-900">R{product.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4">
                  <Link href="/admin/analytics/products" className={`text-sm font-medium ${BRAND.text.primary} hover:underline`}>
                    View all product analytics →
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-5">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {analyticsData.recentActivity.map((activity, index) => (
                      <li key={index}>
                        <div className="relative pb-8">
                          {index !== analyticsData.recentActivity.length - 1 ? (
                            <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                          ) : null}
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                activity.type === 'order' ? `${BRAND.bg.accent}` :
                                activity.type === 'customer' ? `${BRAND.bg.accent}` : `${BRAND.bg.accent}`
                              }`}>
                                <span className={`${
                                  activity.type === 'order' ? `${BRAND.text.primary}` :
                                  activity.type === 'customer' ? `${BRAND.text.primary}` : `${BRAND.text.primary}`
                                }`}>
                                  {activity.type === 'order' ? 'O' : 
                                  activity.type === 'customer' ? 'C' : 'P'}
                                </span>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <p className="text-sm text-gray-900">{activity.details}</p>
                                <p className="mt-1 text-xs text-gray-500">{activity.date}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <Link href="/admin/analytics/activity" className={`text-sm font-medium ${BRAND.text.primary} hover:underline`}>
                    View all activity →
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sales By Period */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Sales by Period</h3>
              <div>
                <select className="px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none">
                  <option>By Month</option>
                  <option>By Week</option>
                  <option>By Day</option>
                </select>
              </div>
            </div>
            <div className="p-5">
              <div className="h-80 w-full">
                {/* Main Sales Chart */}
                <div className="h-full w-full bg-gray-50 rounded-md overflow-hidden">
                  <div className="h-full w-full p-4 relative">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-4">
                      <span>R90,000</span>
                      <span>R75,000</span>
                      <span>R60,000</span>
                      <span>R45,000</span>
                      <span>R30,000</span>
                      <span>R15,000</span>
                      <span>R0</span>
                    </div>
                    
                    {/* Horizontal grid lines */}
                    <div className="absolute left-12 right-0 top-0 h-full flex flex-col justify-between py-4">
                      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="w-full h-px bg-gray-200"></div>
                      ))}
                    </div>
                    
                    {/* Chart bars */}
                    <div className="absolute left-16 right-4 bottom-8 h-[calc(100%-64px)] flex items-end justify-around">
                      {analyticsData.monthlySales.map((month, index) => {
                        // Calculate height percentage - ensure it's at least 5% for visibility
                        const heightPercentage = Math.max((month.revenue / 90000) * 100, 5);
                        
                        return (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className="w-16 bg-amber-700 rounded-t-sm shadow-sm"
                              style={{ 
                                height: `${heightPercentage}%`,
                                minHeight: '15px'
                              }}
                            ></div>
                            <div className="mt-2 text-xs font-medium text-gray-700">{month.month}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Link href="/admin/analytics/sales" className={`text-sm font-medium ${BRAND.text.primary} hover:underline`}>
                  View detailed sales reports →
                </Link>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin/analytics/sales" className={`${BRAND.card.accent} hover:bg-amber-100 rounded-lg shadow p-6 transition-all duration-200`}>
              <div className="text-lg font-medium text-gray-900 mb-2">Sales Analytics</div>
              <p className="text-sm text-gray-600 mb-4">Detailed sales data by product, collection, region, and time period.</p>
              <span className={`text-sm font-medium ${BRAND.text.primary}`}>View Report →</span>
            </Link>
            
            <Link href="/admin/analytics/customers" className={`${BRAND.card.accent} hover:bg-amber-100 rounded-lg shadow p-6 transition-all duration-200`}>
              <div className="text-lg font-medium text-gray-900 mb-2">Customer Analytics</div>
              <p className="text-sm text-gray-600 mb-4">Customer acquisition, retention, average value, and demographics.</p>
              <span className={`text-sm font-medium ${BRAND.text.primary}`}>View Report →</span>
            </Link>
            
            <Link href="/admin/analytics/inventory" className={`${BRAND.card.accent} hover:bg-amber-100 rounded-lg shadow p-6 transition-all duration-200`}>
              <div className="text-lg font-medium text-gray-900 mb-2">Inventory Analytics</div>
              <p className="text-sm text-gray-600 mb-4">Stock levels, turnover rates, bestsellers, and restock predictions.</p>
              <span className={`text-sm font-medium ${BRAND.text.primary}`}>View Report →</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
