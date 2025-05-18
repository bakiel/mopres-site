'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';

export type ChartDataPoint = {
  name: string;
  revenue?: number;
  orders?: number;
  customers?: number;
  aov?: number; // Average Order Value
  [key: string]: any; // For any other metrics
};

type ChartVariant = 'line' | 'bar' | 'area' | 'composed';

interface SalesChartProps {
  data: ChartDataPoint[];
  height?: number;
  title?: string;
  variant?: ChartVariant;
  showRevenue?: boolean;
  showOrders?: boolean;
  showCustomers?: boolean;
  showAOV?: boolean;
  additionalSeries?: Array<{
    key: string;
    name: string;
    color: string;
  }>;
  className?: string;
}

export default function SalesChart({
  data,
  height = 400,
  title,
  variant = 'line',
  showRevenue = true,
  showOrders = false,
  showCustomers = false,
  showAOV = false,
  additionalSeries = [],
  className = ''
}: SalesChartProps) {
  // Format the tooltip values
  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'revenue' || name === 'Revenue' || name === 'aov' || name === 'AOV') {
      return formatCurrency(value);
    }
    return value;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
          <p className="font-bold text-gray-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`} style={{ color: entry.color }}>
              {entry.name}: {formatTooltipValue(entry.value, entry.name)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (variant) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="#8884d8" 
              tickFormatter={(value) => (showRevenue || showAOV) ? formatCurrency(value) : `${value}`}
            />
            {(showOrders || showCustomers) && (
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {showRevenue && (
              <Bar
                yAxisId="left"
                dataKey="revenue"
                name="Revenue"
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
            )}
            {showOrders && (
              <Bar
                yAxisId="right"
                dataKey="orders"
                name="Orders"
                fill="#82ca9d"
                radius={[4, 4, 0, 0]}
              />
            )}
            {showCustomers && (
              <Bar
                yAxisId="right"
                dataKey="customers"
                name="Customers"
                fill="#ffc658"
                radius={[4, 4, 0, 0]}
              />
            )}
            {showAOV && (
              <Bar
                yAxisId="left"
                dataKey="aov"
                name="Avg. Order Value"
                fill="#ff8042"
                radius={[4, 4, 0, 0]}
              />
            )}
            {additionalSeries.map((series) => (
              <Bar
                key={series.key}
                yAxisId="left"
                dataKey={series.key}
                name={series.name}
                fill={series.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              tickFormatter={(value) => (showRevenue || showAOV) ? formatCurrency(value) : `${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {showRevenue && (
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                fill="#8884d8"
                stroke="#8884d8"
                fillOpacity={0.3}
              />
            )}
            {showOrders && (
              <Area
                type="monotone"
                dataKey="orders"
                name="Orders"
                fill="#82ca9d"
                stroke="#82ca9d"
                fillOpacity={0.3}
              />
            )}
            {showCustomers && (
              <Area
                type="monotone"
                dataKey="customers"
                name="Customers"
                fill="#ffc658"
                stroke="#ffc658"
                fillOpacity={0.3}
              />
            )}
            {showAOV && (
              <Area
                type="monotone"
                dataKey="aov"
                name="Avg. Order Value"
                fill="#ff8042"
                stroke="#ff8042"
                fillOpacity={0.3}
              />
            )}
            {additionalSeries.map((series) => (
              <Area
                key={series.key}
                type="monotone"
                dataKey={series.key}
                name={series.name}
                fill={series.color}
                stroke={series.color}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        );

      case 'composed':
        return (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="#8884d8" 
              tickFormatter={(value) => (showRevenue || showAOV) ? formatCurrency(value) : `${value}`}
            />
            {(showOrders || showCustomers) && (
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {showRevenue && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                fill="#8884d8"
                stroke="#8884d8"
                fillOpacity={0.3}
              />
            )}
            {showOrders && (
              <Bar
                yAxisId="right"
                dataKey="orders"
                name="Orders"
                fill="#82ca9d"
                radius={[4, 4, 0, 0]}
              />
            )}
            {showCustomers && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="customers"
                name="Customers"
                stroke="#ffc658"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {showAOV && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="aov"
                name="Avg. Order Value"
                stroke="#ff8042"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {additionalSeries.map((series) => (
              <Line
                key={series.key}
                yAxisId="left"
                type="monotone"
                dataKey={series.key}
                name={series.name}
                stroke={series.color}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </ComposedChart>
        );

      case 'line':
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="#8884d8" 
              tickFormatter={(value) => (showRevenue || showAOV) ? formatCurrency(value) : `${value}`}
            />
            {(showOrders || showCustomers) && (
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {showRevenue && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {showOrders && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {showCustomers && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="customers"
                name="Customers"
                stroke="#ffc658"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {showAOV && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="aov"
                name="Avg. Order Value"
                stroke="#ff8042"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {additionalSeries.map((series) => (
              <Line
                key={series.key}
                yAxisId="left"
                type="monotone"
                dataKey={series.key}
                name={series.name}
                stroke={series.color}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
