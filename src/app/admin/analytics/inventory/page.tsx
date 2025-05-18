'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import InventoryChart from '@/components/admin/charts/InventoryChart';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { 
  TagIcon, 
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ShoppingCartIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// Types
interface InventoryStatusCounts {
  outOfStock: number;
  lowStock: number;
  moderateStock: number;
  goodStock: number;
}

interface TopPerformingProduct {
  id: string;
  name: string;
  sku: string;
  total_sold: number;
  revenue: number;
  current_stock: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  in_stock: boolean;
}

// Status badge component
const StockStatusBadge = ({ status }: { status: string }) => {
  let bgColor, textColor;
  
  switch (status) {
    case 'Out of Stock':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'Low Stock':
      bgColor = 'bg-amber-100';
      textColor = 'text-amber-800';
      break;
    case 'Moderate Stock':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'Good Stock':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};

export default function InventoryAnalyticsPage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatusCounts>({
    outOfStock: 0,
    lowStock: 0,
    moderateStock: 0,
    goodStock: 0
  });
  
  const [topProducts, setTopProducts] = useState<TopPerformingProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [inventoryChartData, setInventoryChartData] = useState<any[]>([]);
  const [turnoverChartData, setTurnoverChartData] = useState<any[]>([]);
  
  // Fetch inventory data
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch inventory status counts
      const { data: statusData, error: statusError } = await supabase
        .from('inventory_status')
        .select('stock_status')
        .in('stock_status', ['Out of Stock', 'Low Stock', 'Moderate Stock', 'Good Stock']);
      
      if (statusError) throw statusError;
      
      // Fetch top performing products
      const { data: performanceData, error: performanceError } = await supabase
        .from('product_performance')
        .select('product_id, product_name, sku, total_sold, revenue, current_stock')
        .order('total_sold', { ascending: false })
        .limit(5);
      
      if (performanceError) throw performanceError;
      
      // Fetch low stock products
      const { data: lowStockData, error: lowStockError } = await supabase
        .from('inventory_status')
        .select('id, name, sku, current_stock, in_stock')
        .eq('stock_status', 'Low Stock')
        .limit(10);
      
      if (lowStockError) throw lowStockError;
      
      // Fetch product categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);
      
      if (categoriesError) throw categoriesError;
      
      // Process inventory status counts
      const statusCounts = {
        outOfStock: 0,
        lowStock: 0,
        moderateStock: 0,
        goodStock: 0
      };
      
      statusData?.forEach(item => {
        switch (item.stock_status) {
          case 'Out of Stock':
            statusCounts.outOfStock++;
            break;
          case 'Low Stock':
            statusCounts.lowStock++;
            break;
          case 'Moderate Stock':
            statusCounts.moderateStock++;
            break;
          case 'Good Stock':
            statusCounts.goodStock++;
            break;
        }
      });
      
      // Get unique categories
      const uniqueCategories = new Set<string>();
      categoriesData?.forEach(item => {
        if (item.category) {
          uniqueCategories.add(item.category);
        }
      });
      
      // Process inventory chart data
      const inventoryData = [
        { name: 'Out of Stock', value: statusCounts.outOfStock },
        { name: 'Low Stock', value: statusCounts.lowStock },
        { name: 'Moderate Stock', value: statusCounts.moderateStock },
        { name: 'Good Stock', value: statusCounts.goodStock }
      ];
      
      // Process turnover rate data (mocked for now)
      const turnoverData = Array.from(uniqueCategories).map(category => ({
        name: category,
        turnover: Math.random() * 5 + 0.5, // Random turnover rate between 0.5 and 5.5
        stock: Math.floor(Math.random() * 50 + 10) // Random stock between 10 and 60
      }));
      
      // Update state with fetched data
      setInventoryStatus(statusCounts);
      setTopProducts(performanceData || []);
      setLowStockProducts(lowStockData || []);
      setProductCategories(Array.from(uniqueCategories));
      setInventoryChartData(inventoryData);
      setTurnoverChartData(turnoverData);
      
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast.error('Failed to load inventory analytics data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchInventoryData();
  }, [supabase]);
  
  // Filter low stock products based on search query and category
  const filteredLowStockProducts = lowStockProducts.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    // We don't have category in the current data structure, so just use search for now
    return matchesSearch;
  });
  
  // Total products count
  const totalProducts = inventoryStatus.outOfStock + inventoryStatus.lowStock + 
    inventoryStatus.moderateStock + inventoryStatus.goodStock;
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Inventory Analytics</h1>
        <p className="text-gray-600">Monitor stock levels and product performance</p>
      </div>
      
      {/* Inventory Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Products</p>
              <p className="text-2xl font-bold mt-2">{totalProducts}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <TagIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Low Stock Items</p>
              <p className="text-2xl font-bold mt-2">{inventoryStatus.lowStock}</p>
              <p className="text-xs text-amber-600 mt-2">
                {formatPercentage((inventoryStatus.lowStock / Math.max(totalProducts, 1)) * 100)} of inventory
              </p>
            </div>
            <div className="p-3 rounded-full bg-amber-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Out of Stock</p>
              <p className="text-2xl font-bold mt-2">{inventoryStatus.outOfStock}</p>
              <p className="text-xs text-red-600 mt-2">
                {formatPercentage((inventoryStatus.outOfStock / Math.max(totalProducts, 1)) * 100)} of inventory
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg. Turnover Rate</p>
              <p className="text-2xl font-bold mt-2">3.2x</p>
              <p className="text-xs text-green-600 mt-2">
                Monthly inventory turnover
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Inventory Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <InventoryChart
          data={inventoryChartData}
          title="Inventory Status Distribution"
          variant="pie"
          showValue={true}
          height={320}
        />
        
        <InventoryChart
          data={turnoverChartData}
          title="Category Turnover Rates"
          variant="bar"
          showTurnover={true}
          showStock={true}
          height={320}
        />
      </div>
      
      {/* Low Stock Products */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Low Stock Products</h2>
          <Link 
            href="/admin/analytics/inventory/stock" 
            className="text-sm text-brand-primary hover:text-brand-primary-dark font-medium"
          >
            View All
          </Link>
        </div>
        
        <div className="p-6">
          <div className="mb-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:ring-brand-primary focus:border-brand-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search low stock products..."
              />
            </div>
            
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="focus:ring-brand-primary focus:border-brand-primary h-full py-2 pl-3 pr-7 border-gray-300 bg-white rounded-md text-gray-500 sm:text-sm"
              >
                <option value="all">All Categories</option>
                {productCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          {filteredLowStockProducts.length === 0 ? (
            <div className="text-center p-6">
              <TagIcon className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No low stock products</h3>
              <p className="mt-1 text-sm text-gray-500">
                No products found with low stock levels matching your search criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLowStockProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.current_stock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StockStatusBadge status="Low Stock" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/admin/products/${product.id}`}
                          className="text-brand-primary hover:text-brand-primary-dark"
                        >
                          Update Stock
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Top Performing Products */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Top Performing Products</h2>
          <Link 
            href="/admin/analytics/inventory/performance" 
            className="text-sm text-brand-primary hover:text-brand-primary-dark font-medium"
          >
            View All
          </Link>
        </div>
        
        <div className="p-6">
          {topProducts.length === 0 ? (
            <div className="text-center p-6">
              <ShoppingCartIcon className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No product data</h3>
              <p className="mt-1 text-sm text-gray-500">
                No sales data available for products.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.total_sold}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(product.revenue)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.current_stock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/admin/products/${product.id}`}
                          className="text-brand-primary hover:text-brand-primary-dark"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <button 
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-gray-500" />
          Export Inventory Report
        </button>
        
        <div className="flex space-x-4">
          <Link href="/admin/analytics/inventory/stock">
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none">
              Stock Level Analysis
            </button>
          </Link>
          <Link href="/admin/analytics/inventory/performance">
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none">
              Product Performance
            </button>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
