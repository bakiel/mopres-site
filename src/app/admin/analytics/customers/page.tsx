'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import DateRangePicker from '@/components/admin/DateRangePicker';
import CustomerChart from '@/components/admin/charts/CustomerChart';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { 
  UsersIcon, 
  UserPlusIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

// Types
interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  activeCustomers: number;
  churnRate: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
}

interface CustomersByRegion {
  region: string;
  count: number;
  percentage: number;
}

interface TopCustomer {
  id: string;
  name: string;
  email: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  percentChange?: number;
  icon: React.ReactNode;
  color: string;
  helperText?: string;
}

const MetricCard = ({ 
  title, 
  value, 
  previousValue, 
  percentChange, 
  icon, 
  color,
  helperText 
}: MetricCardProps) => (
  <div className={`bg-white rounded-lg shadow p-6 border-l-4 border-${color}-500`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
        
        {percentChange !== undefined && (
          <div className="flex items-center mt-2">
            {percentChange > 0 ? (
              <ArrowUpIcon className="h-4 w-4 text-green-600 mr-1" />
            ) : percentChange < 0 ? (
              <ArrowDownIcon className="h-4 w-4 text-red-600 mr-1" />
            ) : null}
            
            <p className={`text-xs ${
              percentChange > 0 ? 'text-green-600' : 
              percentChange < 0 ? 'text-red-600' : 
              'text-gray-500'
            }`}>
              {Math.abs(percentChange).toFixed(1)}% from previous period
            </p>
          </div>
        )}
        
        {helperText && (
          <p className="text-xs text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
      <div className={`p-3 rounded-full bg-${color}-100`}>
        {icon}
      </div>
    </div>
  </div>
);

export default function CustomerAnalyticsPage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [periodLabel, setPeriodLabel] = useState('Last 30 Days');
  
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics>({
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    activeCustomers: 0,
    churnRate: 0,
    averageOrderValue: 0,
    customerLifetimeValue: 0
  });
  
  const [previousCustomerMetrics, setPreviousCustomerMetrics] = useState<CustomerMetrics>({
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    activeCustomers: 0,
    churnRate: 0,
    averageOrderValue: 0,
    customerLifetimeValue: 0
  });
  
  const [customersByRegion, setCustomersByRegion] = useState<CustomersByRegion[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [acquisitionChartData, setAcquisitionChartData] = useState<any[]>([]);
  const [retentionChartData, setRetentionChartData] = useState<any[]>([]);
  
  // Handle date range change
  const handleDateRangeChange = (start: Date, end: Date, label: string) => {
    setStartDate(start);
    setEndDate(end);
    setPeriodLabel(label);
    fetchCustomerData(start, end);
  };
  
  // Calculate previous period dates
  const getPreviousPeriodDates = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setTime(prevEnd.getTime() - diff);
    
    return { prevStart, prevEnd };
  };
  
  // Calculate percentage change
  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  
  // Format date for SQL queries
  const formatDateForSQL = (date: Date) => {
    return date.toISOString();
  };
  
  // Fetch customer data
  const fetchCustomerData = async (start: Date, end: Date) => {
    try {
      setLoading(true);
      
      // Get previous period dates
      const { prevStart, prevEnd } = getPreviousPeriodDates(start, end);
      
      // Fetch customer metrics from customer_metrics view
      const { data: metricsData, error: metricsError } = await supabase
        .from('customer_metrics')
        .select('*');
      
      if (metricsError) throw metricsError;
      
      // Fetch orders for the period
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, customer_id, total_amount, created_at')
        .gte('created_at', formatDateForSQL(start))
        .lte('created_at', formatDateForSQL(end));
      
      if (ordersError) throw ordersError;
      
      // Fetch orders for the previous period
      const { data: prevOrdersData, error: prevOrdersError } = await supabase
        .from('orders')
        .select('id, customer_id, total_amount, created_at')
        .gte('created_at', formatDateForSQL(prevStart))
        .lte('created_at', formatDateForSQL(prevEnd));
      
      if (prevOrdersError) throw prevOrdersError;
      
      // Fetch customer addresses for regional analysis
      const { data: addressData, error: addressError } = await supabase
        .from('customer_addresses')
        .select('customer_id, province, city')
        .eq('is_default', true);
      
      if (addressError) throw addressError;
      
      // Process metrics data
      const currentMetrics = processCustomerMetrics(metricsData || [], ordersData || []);
      const previousMetrics = processCustomerMetrics(metricsData || [], prevOrdersData || []);
      
      // Process regional data (with mock data if needed)
      const regionData = processRegionalData(addressData || []);
      
      // Process top customers
      const topCustomersData = processTopCustomers(metricsData || []);
      
      // Generate acquisition chart data (monthly)
      const acquisitionData = generateAcquisitionChartData(metricsData || []);
      
      // Generate retention chart data (mock data for now)
      const retentionData = generateRetentionChartData();
      
      // Update state
      setCustomerMetrics(currentMetrics);
      setPreviousCustomerMetrics(previousMetrics);
      setCustomersByRegion(regionData);
      setTopCustomers(topCustomersData);
      setAcquisitionChartData(acquisitionData);
      setRetentionChartData(retentionData);
      
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to load customer analytics data');
    } finally {
      setLoading(false);
    }
  };
  
  // Process customer metrics from data
  const processCustomerMetrics = (customersData: any[], ordersData: any[]): CustomerMetrics => {
    // Get unique customer IDs from orders in the period
    const activeCustomerIds = new Set(ordersData.map(order => order.customer_id));
    
    // Count returning customers (customers with >1 order)
    const returningCustomers = customersData.filter(c => c.total_orders > 1).length;
    
    // Calculate average order value
    const totalOrderAmount = ordersData.reduce((sum, order) => sum + order.total_amount, 0);
    const aov = ordersData.length > 0 ? totalOrderAmount / ordersData.length : 0;
    
    // Calculate estimated customer lifetime value (simplified)
    const totalRevenue = customersData.reduce((sum, c) => sum + c.total_spent, 0);
    const clv = customersData.length > 0 ? totalRevenue / customersData.length : 0;
    
    // Count new customers (those with first order date in the period)
    const newCustomers = customersData.filter(c => {
      const firstOrderDate = new Date(c.first_order_date);
      return firstOrderDate >= startDate && firstOrderDate <= endDate;
    }).length;
    
    // Calculate churn rate (mock for now)
    // In a real implementation, this would be more sophisticated
    const churnRate = Math.random() * 5 + 2; // Random 2-7%
    
    return {
      totalCustomers: customersData.length,
      newCustomers,
      returningCustomers,
      activeCustomers: activeCustomerIds.size,
      churnRate,
      averageOrderValue: aov,
      customerLifetimeValue: clv
    };
  };
  
  // Process regional data from addresses
  const processRegionalData = (addressData: any[]): CustomersByRegion[] => {
    const regionCounts: { [key: string]: number } = {};
    const totalAddresses = addressData.length;
    
    // Count customers by region
    addressData.forEach(address => {
      const region = address.province || 'Unknown';
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });
    
    // If no real data, add some mock data
    if (Object.keys(regionCounts).length === 0) {
      return [
        { region: 'Gauteng', count: 125, percentage: 42 },
        { region: 'Western Cape', count: 78, percentage: 26 },
        { region: 'KwaZulu-Natal', count: 45, percentage: 15 },
        { region: 'Eastern Cape', count: 25, percentage: 8 },
        { region: 'Other', count: 27, percentage: 9 }
      ];
    }
    
    // Format the data
    return Object.entries(regionCounts)
      .map(([region, count]) => ({
        region,
        count,
        percentage: totalAddresses > 0 ? (count / totalAddresses) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  };
  
  // Process top customers
  const processTopCustomers = (customersData: any[]): TopCustomer[] => {
    return customersData
      .filter(c => c.total_spent > 0)
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 5)
      .map(c => ({
        id: c.customer_id,
        name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unknown',
        email: c.email || 'No email',
        total_orders: c.total_orders,
        total_spent: c.total_spent,
        last_order_date: c.last_order_date
      }));
  };
  
  // Generate acquisition chart data
  const generateAcquisitionChartData = (customersData: any[]): any[] => {
    // Group customers by month of first order
    const months: { [key: string]: number } = {};
    
    customersData.forEach(customer => {
      if (!customer.first_order_date) return;
      
      const date = new Date(customer.first_order_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      months[monthKey] = (months[monthKey] || 0) + 1;
    });
    
    // Convert to chart data format
    return Object.entries(months)
      .map(([monthKey, count]) => {
        const [year, month] = monthKey.split('-').map(Number);
        const date = new Date(year, month - 1, 1);
        
        return {
          name: date.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }),
          acquisition: count
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  };
  
  // Generate retention chart data (mocked for now)
  const generateRetentionChartData = (): any[] => {
    const months = [];
    const date = new Date();
    date.setMonth(date.getMonth() - 6); // Start from 6 months ago
    
    for (let i = 0; i < 6; i++) {
      months.push({
        name: date.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }),
        retention: Math.floor(Math.random() * 20 + 70), // Random 70-90%
        churn: Math.floor(Math.random() * 10 + 5) // Random 5-15%
      });
      date.setMonth(date.getMonth() + 1);
    }
    
    return months;
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchCustomerData(startDate, endDate);
  }, [supabase]);
  
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Customer Analytics</h1>
          <p className="text-gray-600">Analyze customer acquisition, retention, and value</p>
        </div>
        <DateRangePicker 
          onDateRangeChange={handleDateRangeChange} 
          className="z-10"
        />
      </div>
      
      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Customers"
          value={customerMetrics.totalCustomers}
          percentChange={calculatePercentChange(
            customerMetrics.totalCustomers, 
            previousCustomerMetrics.totalCustomers
          )}
          icon={<UsersIcon className="h-6 w-6 text-blue-600" />}
          color="blue"
        />
        <MetricCard
          title="New Customers"
          value={customerMetrics.newCustomers}
          percentChange={calculatePercentChange(
            customerMetrics.newCustomers, 
            previousCustomerMetrics.newCustomers
          )}
          icon={<UserPlusIcon className="h-6 w-6 text-green-600" />}
          color="green"
          helperText={`${formatPercentage((customerMetrics.newCustomers / Math.max(customerMetrics.totalCustomers, 1)) * 100)} of total`}
        />
        <MetricCard
          title="Customer Lifetime Value"
          value={formatCurrency(customerMetrics.customerLifetimeValue)}
          percentChange={calculatePercentChange(
            customerMetrics.customerLifetimeValue, 
            previousCustomerMetrics.customerLifetimeValue
          )}
          icon={<BanknotesIcon className="h-6 w-6 text-purple-600" />}
          color="purple"
        />
        <MetricCard
          title="Churn Rate"
          value={formatPercentage(customerMetrics.churnRate)}
          percentChange={calculatePercentChange(
            previousCustomerMetrics.churnRate,
            customerMetrics.churnRate
          ) * -1} // Invert since lower churn is better
          icon={<ArrowPathIcon className="h-6 w-6 text-amber-600" />}
          color="amber"
        />
      </div>
      
      {/* Customer Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CustomerChart
          data={acquisitionChartData}
          title="Customer Acquisition"
          variant="bar"
          showAcquisition={true}
          height={320}
        />
        
        <CustomerChart
          data={retentionChartData}
          title="Customer Retention & Churn"
          variant="line"
          showRetention={true}
          showChurn={true}
          height={320}
        />
      </div>
      
      {/* Top Customers & Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Top Customers</h2>
            <Link 
              href="/admin/customers" 
              className="text-sm text-brand-primary hover:text-brand-primary-dark font-medium"
            >
              View All Customers
            </Link>
          </div>
          
          <div className="p-6">
            {topCustomers.length === 0 ? (
              <div className="text-center p-6">
                <UsersIcon className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No customer data available or no customers have placed orders yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div 
                    key={customer.id} 
                    className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full mr-3 bg-blue-100 text-blue-800">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{formatCurrency(customer.total_spent)}</p>
                      <p className="text-sm text-gray-500">{customer.total_orders} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Customers by Region</h2>
          </div>
          
          <div className="p-6">
            {customersByRegion.length === 0 ? (
              <div className="text-center p-6">
                <MapPinIcon className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No location data</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No customer location data is available.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {customersByRegion.map((region) => (
                  <div key={region.region} className="flex items-center">
                    <span className="w-32 text-sm text-gray-700">{region.region}</span>
                    <div className="flex-1 mx-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${region.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 w-24 text-right">
                      {region.count} ({formatPercentage(region.percentage)})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Customer Segments & Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Customer Segments</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-gray-500">One-Time Customers</span>
              <span className="font-medium">
                {customerMetrics.totalCustomers - customerMetrics.returningCustomers} 
                ({formatPercentage(((customerMetrics.totalCustomers - customerMetrics.returningCustomers) / Math.max(customerMetrics.totalCustomers, 1)) * 100)})
              </span>
            </div>
            
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-gray-500">Returning Customers</span>
              <span className="font-medium">
                {customerMetrics.returningCustomers} 
                ({formatPercentage((customerMetrics.returningCustomers / Math.max(customerMetrics.totalCustomers, 1)) * 100)})
              </span>
            </div>
            
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-gray-500">Active in Last 30 Days</span>
              <span className="font-medium">
                {customerMetrics.activeCustomers} 
                ({formatPercentage((customerMetrics.activeCustomers / Math.max(customerMetrics.totalCustomers, 1)) * 100)})
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Average Orders per Customer</span>
              <span className="font-medium">
                {(customerMetrics.totalCustomers > 0 
                  ? customerMetrics.totalCustomers / customerMetrics.activeCustomers 
                  : 0).toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="mt-6">
            <Link href="/admin/analytics/customers/acquisition">
              <button className="text-brand-primary hover:text-brand-primary-dark text-sm font-medium flex items-center">
                View customer acquisition details
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Retention Analysis</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-gray-500">Repeat Purchase Rate</span>
              <span className="font-medium">
                {formatPercentage((customerMetrics.returningCustomers / Math.max(customerMetrics.totalCustomers, 1)) * 100)}
              </span>
            </div>
            
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-gray-500">Average Time Between Orders</span>
              <span className="font-medium">37 days</span>
            </div>
            
            <div className="flex justify-between pb-2 border-b border-gray-100">
              <span className="text-gray-500">Customer Churn Rate</span>
              <span className="font-medium">{formatPercentage(customerMetrics.churnRate)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Customer Retention Cost</span>
              <span className="font-medium">{formatCurrency(customerMetrics.customerLifetimeValue * 0.15)}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <Link href="/admin/analytics/customers/retention">
              <button className="text-brand-primary hover:text-brand-primary-dark text-sm font-medium flex items-center">
                View retention details
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Export and Actions */}
      <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <button 
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-gray-500" />
          Export Customer Report
        </button>
        
        <div className="flex space-x-4">
          <Link href="/admin/analytics/customers/acquisition">
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none">
              Acquisition Analysis
            </button>
          </Link>
          <Link href="/admin/analytics/customers/retention">
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none">
              Retention Analysis
            </button>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
