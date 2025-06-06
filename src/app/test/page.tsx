'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAnalytics() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-white shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">123</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">5</p>
            <p className="text-sm text-gray-500">4.1% of inventory</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2</p>
            <p className="text-sm text-gray-500">1.6% of inventory</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Turnover Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3.2x</p>
            <p className="text-sm text-gray-500">Monthly inventory turnover</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white shadow">
          <CardHeader>
            <CardTitle className="text-lg">Inventory Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Inventory status chart would appear here</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow">
          <CardHeader>
            <CardTitle className="text-lg">Product Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Category breakdown chart would appear here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
