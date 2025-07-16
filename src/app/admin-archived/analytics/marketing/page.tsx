'use client';

import React from 'react';
import Link from 'next/link';
import AdminNavigation from '@/components/admin/navigation/AdminNavigation';
import { BRAND } from '@/utils/brand';

// Sample marketing analytics data
const marketingData = {
  channelPerformance: [
    { channel: 'Direct', visitors: 3250, conversions: 98, conversionRate: 3.02, revenue: 30576 },
    { channel: 'Social Media', visitors: 2140, conversions: 53, conversionRate: 2.48, revenue: 15876 },
    { channel: 'Email', visitors: 1430, conversions: 62, conversionRate: 4.34, revenue: 19840 },
    { channel: 'Search', visitors: 2785, conversions: 81, conversionRate: 2.91, revenue: 26325 },
    { channel: 'Referral', visitors: 980, conversions: 37, conversionRate: 3.78, revenue: 11988 },
  ],
  campaignPerformance: [
    { campaign: 'Summer Sale', spend: 5200, impressions: 87500, clicks: 3450, conversions: 75, roi: 3.24 },
    { campaign: 'New Collection Launch', spend: 4800, impressions: 73200, clicks: 2980, conversions: 68, roi: 2.98 },
    { campaign: 'Winter Essentials', spend: 3700, impressions: 62400, clicks: 2150, conversions: 48, roi: 2.43 },
    { campaign: 'Loyalty Program', spend: 2100, impressions: 35600, clicks: 1870, conversions: 53, roi: 5.29 },
  ],
  socialMediaStats: {
    followers: {
      instagram: 12450,
      facebook: 8700,
      twitter: 5300,
      pinterest: 3800
    },
    engagement: {
      instagram: 3.2,
      facebook: 1.8,
      twitter: 2.1,
      pinterest: 4.5
    }
  },
};

export default function MarketingAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Marketing Analytics</h1>
          <Link href="/admin/analytics-hub" className={`${BRAND.button.secondary} px-3 py-1.5 text-sm`}>
            Back to Analytics Hub
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`${BRAND.bg.light} p-4 rounded-lg shadow-sm border ${BRAND.border.light}`}>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Total Website Visitors</h3>
            <p className="text-2xl font-bold text-gray-900">10,585</p>
            <div className="text-sm text-green-700">+12.3% from last month</div>
          </div>
          <div className={`${BRAND.bg.light} p-4 rounded-lg shadow-sm border ${BRAND.border.light}`}>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Conversion Rate</h3>
            <p className="text-2xl font-bold text-gray-900">3.12%</p>
            <div className="text-sm text-green-700">+0.4% from last month</div>
          </div>
          <div className={`${BRAND.bg.light} p-4 rounded-lg shadow-sm border ${BRAND.border.light}`}>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Avg. Cost per Acquisition</h3>
            <p className="text-2xl font-bold text-gray-900">R645</p>
            <div className="text-sm text-red-700">+4.8% from last month</div>
          </div>
          <div className={`${BRAND.bg.light} p-4 rounded-lg shadow-sm border ${BRAND.border.light}`}>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Marketing ROI</h3>
            <p className="text-2xl font-bold text-gray-900">3.4x</p>
            <div className="text-sm text-green-700">+0.2x from last month</div>
          </div>
        </div>

        {/* Channel Performance */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Channel Performance</h2>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitors
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conv. Rate
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {marketingData.channelPerformance.map((channel, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {channel.channel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {channel.visitors.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {channel.conversions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {channel.conversionRate.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      R{channel.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campaign Performance */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Campaign Performance</h2>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spend
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impressions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conv.
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROI
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {marketingData.campaignPerformance.map((campaign, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {campaign.campaign}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      R{campaign.spend.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {campaign.impressions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {campaign.clicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {campaign.conversions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {campaign.roi.toFixed(2)}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Social Media Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Social Media Followers</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white mr-3">
                      IG
                    </div>
                    <div>Instagram</div>
                  </div>
                  <div className="font-semibold text-gray-900">{marketingData.socialMediaStats.followers.instagram.toLocaleString()}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white mr-3">
                      FB
                    </div>
                    <div>Facebook</div>
                  </div>
                  <div className="font-semibold text-gray-900">{marketingData.socialMediaStats.followers.facebook.toLocaleString()}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white mr-3">
                      TW
                    </div>
                    <div>Twitter</div>
                  </div>
                  <div className="font-semibold text-gray-900">{marketingData.socialMediaStats.followers.twitter.toLocaleString()}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white mr-3">
                      PI
                    </div>
                    <div>Pinterest</div>
                  </div>
                  <div className="font-semibold text-gray-900">{marketingData.socialMediaStats.followers.pinterest.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Engagement Rate (%)</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Instagram</span>
                    <span className="text-sm font-medium text-gray-700">{marketingData.socialMediaStats.engagement.instagram}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-pink-500 h-2.5 rounded-full" style={{ width: `${marketingData.socialMediaStats.engagement.instagram * 10}%` }}></div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Facebook</span>
                    <span className="text-sm font-medium text-gray-700">{marketingData.socialMediaStats.engagement.facebook}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${marketingData.socialMediaStats.engagement.facebook * 10}%` }}></div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Twitter</span>
                    <span className="text-sm font-medium text-gray-700">{marketingData.socialMediaStats.engagement.twitter}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-400 h-2.5 rounded-full" style={{ width: `${marketingData.socialMediaStats.engagement.twitter * 10}%` }}></div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Pinterest</span>
                    <span className="text-sm font-medium text-gray-700">{marketingData.socialMediaStats.engagement.pinterest}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${marketingData.socialMediaStats.engagement.pinterest * 10}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
