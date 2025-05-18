import React from 'react';
import Link from 'next/link';

// Sample data for sales analytics
const salesData = {
  overview: {
    currentPeriod: {
      totalSales: 84350,
      unitsSold: 112,
      transactions: 27
    },
    previousPeriod: {
      totalSales: 78200,
      unitsSold: 98,
      transactions: 25
    },
    percentageChange: {
      totalSales: 7.9,
      unitsSold: 14.3,
      transactions: 8.0
    }
  },
  byCollection: [
    { name: 'Summer Elegance', sales: 36500, percentage: 43.3 },
    { name: 'Urban Luxury', sales: 27250, percentage: 32.3 },
    { name: 'Winter Collection', sales: 15400, percentage: 18.3 },
    { name: 'Accessories', sales: 5200, percentage: 6.1 },
  ],
  byPaymentMethod: [
    { method: 'Credit Card', sales: 48350, percentage: 57.3 },
    { method: 'Bank Transfer', sales: 21800, percentage: 25.8 },
    { method: 'Mobile Payment', sales: 14200, percentage: 16.9 },
  ],
  byTimeOfDay: [
    { time: 'Morning (6AM-12PM)', sales: 18550, percentage: 22 },
    { time: 'Afternoon (12PM-6PM)', sales: 33750, percentage: 40 },
    { time: 'Evening (6PM-12AM)', sales: 27850, percentage: 33 },
    { time: 'Night (12AM-6AM)', sales: 4200, percentage: 5 },
  ],
  monthlyTrend: [
    { month: 'Jan', revenue: 54200 },
    { month: 'Feb', revenue: 62350 },
    { month: 'Mar', revenue: 73100 },
    { month: 'Apr', revenue: 78200 },
    { month: 'May', revenue: 84350 },
  ]
};

export default function SalesAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <div className="flex items-center">
              <Link href="/admin/analytics" className="text-blue-600 hover:text-blue-900">
                Analytics
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              In-depth analysis of sales data for the last 30 days (18 Apr - 17 May 2025)
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/admin" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
              Dashboard
            </Link>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Download Report
            </button>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Sales */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
                <h3 className="text-sm font-medium text-blue-800">Total Sales Revenue</h3>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-baseline">
                  <div className="text-3xl font-bold text-gray-900">
                    R{salesData.overview.currentPeriod.totalSales.toLocaleString()}
                  </div>
                  <div className={`ml-3 text-sm font-medium ${salesData.overview.percentageChange.totalSales >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {salesData.overview.percentageChange.totalSales >= 0 ? '+' : ''}{salesData.overview.percentageChange.totalSales}%
                  </div>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  vs. R{salesData.overview.previousPeriod.totalSales.toLocaleString()} previous period
                </div>
              </div>
            </div>
            
            {/* Units Sold */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-5 py-3 bg-green-50 border-b border-green-100">
                <h3 className="text-sm font-medium text-green-800">Total Units Sold</h3>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-baseline">
                  <div className="text-3xl font-bold text-gray-900">
                    {salesData.overview.currentPeriod.unitsSold.toLocaleString()}
                  </div>
                  <div className={`ml-3 text-sm font-medium ${salesData.overview.percentageChange.unitsSold >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {salesData.overview.percentageChange.unitsSold >= 0 ? '+' : ''}{salesData.overview.percentageChange.unitsSold}%
                  </div>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  vs. {salesData.overview.previousPeriod.unitsSold.toLocaleString()} previous period
                </div>
              </div>
            </div>
            
            {/* Transactions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-5 py-3 bg-purple-50 border-b border-purple-100">
                <h3 className="text-sm font-medium text-purple-800">Completed Transactions</h3>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-baseline">
                  <div className="text-3xl font-bold text-gray-900">
                    {salesData.overview.currentPeriod.transactions.toLocaleString()}
                  </div>
                  <div className={`ml-3 text-sm font-medium ${salesData.overview.percentageChange.transactions >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {salesData.overview.percentageChange.transactions >= 0 ? '+' : ''}{salesData.overview.percentageChange.transactions}%
                  </div>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  vs. {salesData.overview.previousPeriod.transactions.toLocaleString()} previous period
                </div>
              </div>
            </div>
          </div>
          
          {/* Sales Monthly Trend */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Monthly Sales Trend</h3>
            </div>
            <div className="p-5">
              <div className="h-80 w-full">
                {/* Simplified chart display */}
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
                    
                    {/* Chart content */}
                    <div className="absolute left-16 right-4 bottom-8 h-[calc(100%-64px)]">
                      {/* Line representation */}
                      <svg className="w-full h-full">
                        <polyline
                          points={salesData.monthlyTrend.map((item, index) => {
                            const x = (index / (salesData.monthlyTrend.length - 1)) * 100 + '%';
                            const y = (1 - (item.revenue / 90000)) * 100 + '%';
                            return `${x},${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="3"
                        />
                        {salesData.monthlyTrend.map((item, index) => {
                          const x = (index / (salesData.monthlyTrend.length - 1)) * 100 + '%';
                          const y = (1 - (item.revenue / 90000)) * 100 + '%';
                          return (
                            <circle
                              key={index}
                              cx={x}
                              cy={y}
                              r="4"
                              fill="#3B82F6"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                            />
                          );
                        })}
                      </svg>
                    </div>
                    
                    {/* X-axis labels */}
                    <div className="absolute left-16 right-4 bottom-0 flex justify-between text-xs text-gray-500">
                      {salesData.monthlyTrend.map((item, index) => (
                        <div key={index}>{item.month}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sales by Various Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Sales by Collection */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Sales by Collection</h3>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {salesData.byCollection.map((collection, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{collection.name}</span>
                        <span className="text-gray-500">R{collection.sales.toLocaleString()} ({collection.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full" 
                          style={{ 
                            width: `${collection.percentage}%`,
                            backgroundColor: index === 0 ? '#3B82F6' : 
                                             index === 1 ? '#10B981' : 
                                             index === 2 ? '#8B5CF6' :
                                             '#F59E0B' 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sales by Payment Method */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Sales by Payment Method</h3>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {salesData.byPaymentMethod.map((payment, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{payment.method}</span>
                        <span className="text-gray-500">R{payment.sales.toLocaleString()} ({payment.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full" 
                          style={{ 
                            width: `${payment.percentage}%`,
                            backgroundColor: index === 0 ? '#EC4899' : 
                                             index === 1 ? '#14B8A6' : 
                                             '#F97316'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sales by Time of Day */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Sales by Time of Day</h3>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {salesData.byTimeOfDay.map((timeData, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{timeData.time}</span>
                        <span className="text-gray-500">R{timeData.sales.toLocaleString()} ({timeData.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full" 
                          style={{ 
                            width: `${timeData.percentage}%`,
                            backgroundColor: index === 0 ? '#60A5FA' : 
                                             index === 1 ? '#34D399' : 
                                             index === 2 ? '#818CF8' :
                                             '#A78BFA' 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Additional Insights */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Key Insights</h3>
              </div>
              <div className="p-5">
                <ul className="space-y-4">
                  <li className="flex">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Sales Growth:</span> Sales have increased 7.9% compared to the previous period, driven primarily by the Summer Elegance collection.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Customer Behavior:</span> Afternoon purchases (12PM-6PM) account for 40% of sales, suggesting optimal timing for promotional campaigns.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Payment Preference:</span> Credit card remains the preferred payment method (57.3%). Consider promoting alternative payment options with incentives.
                      </p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Opportunity:</span> Accessories category (6.1% of sales) represents untapped potential. Consider cross-selling strategies and bundle promotions.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Report Controls */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Report generated on May 17, 2025 at 15:30
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded shadow-sm bg-white hover:bg-gray-50">
                Print Report
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded shadow-sm bg-white hover:bg-gray-50">
                Export CSV
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded shadow-sm bg-white hover:bg-gray-50">
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
