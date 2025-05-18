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
  PieChart,
  Pie,
  Cell,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';

export type CustomerDataPoint = {
  name: string;
  acquisition?: number;
  retention?: number;
  churn?: number;
  orders?: number;
  ltv?: number; // Lifetime Value
  [key: string]: any;
};

type ChartVariant = 'line' | 'bar' | 'pie' | 'radar';

interface CustomerChartProps {
  data: CustomerDataPoint[];
  height?: number;
  title?: string;
  variant?: ChartVariant;
  colorScheme?: string[];
  showAcquisition?: boolean;
  showRetention?: boolean;
  showChurn?: boolean;
  showOrders?: boolean;
  showLTV?: boolean;
  additionalSeries?: Array<{
    key: string;
    name: string;
    color: string;
  }>;
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a64d79', '#674ea7', '#3c78d8', '#93c47d'];
const RADIAN = Math.PI / 180;

export default function CustomerChart({
  data,
  height = 400,
  title,
  variant = 'line',
  colorScheme = COLORS,
  showAcquisition = true,
  showRetention = false,
  showChurn = false,
  showOrders = false,
  showLTV = false,
  additionalSeries = [],
  className = ''
}: CustomerChartProps) {
  // Format the tooltip values
  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'ltv' || name === 'LTV') {
      return formatCurrency(value);
    }
    // Format percentages for retention and churn
    if (name === 'retention' || name === 'Retention Rate' || name === 'churn' || name === 'Churn Rate') {
      return `${value}%`;
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

  // Custom label for pie chart
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Prepare data for pie chart if needed
  const preparePieData = () => {
    const pieData = [];
    
    if (showAcquisition) {
      pieData.push({ name: 'New Customers', value: data.reduce((sum, item) => sum + (item.acquisition || 0), 0) });
    }
    
    if (showRetention) {
      pieData.push({ name: 'Retained Customers', value: data.reduce((sum, item) => sum + (item.retention || 0), 0) });
    }
    
    if (showChurn) {
      pieData.push({ name: 'Churned Customers', value: data.reduce((sum, item) => sum + (item.churn || 0), 0) });
    }
    
    additionalSeries.forEach((series) => {
      pieData.push({ 
        name: series.name, 
        value: data.reduce((sum, item) => sum + (item[series.key] || 0), 0)
      });
    });
    
    return pieData;
  };

  const renderChart = () => {
    switch (variant) {
      case 'pie':
        const pieData = preparePieData();
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={height / 2.5}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colorScheme[index % colorScheme.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        );

      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            {showAcquisition && (
              <Radar
                name="New Customers"
                dataKey="acquisition"
                stroke={colorScheme[0]}
                fill={colorScheme[0]}
                fillOpacity={0.2}
              />
            )}
            {showRetention && (
              <Radar
                name="Retention Rate"
                dataKey="retention"
                stroke={colorScheme[1]}
                fill={colorScheme[1]}
                fillOpacity={0.2}
              />
            )}
            {showChurn && (
              <Radar
                name="Churn Rate"
                dataKey="churn"
                stroke={colorScheme[2]}
                fill={colorScheme[2]}
                fillOpacity={0.2}
              />
            )}
            {showOrders && (
              <Radar
                name="Orders"
                dataKey="orders"
                stroke={colorScheme[3]}
                fill={colorScheme[3]}
                fillOpacity={0.2}
              />
            )}
            {showLTV && (
              <Radar
                name="LTV"
                dataKey="ltv"
                stroke={colorScheme[4]}
                fill={colorScheme[4]}
                fillOpacity={0.2}
              />
            )}
            {additionalSeries.map((series, index) => (
              <Radar
                key={series.key}
                name={series.name}
                dataKey={series.key}
                stroke={series.color}
                fill={series.color}
                fillOpacity={0.2}
              />
            ))}
            <Legend />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke={colorScheme[0]} 
              tickFormatter={(value) => (showLTV) ? formatCurrency(value) : `${value}`}
            />
            {(showRetention || showChurn) && (
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke={colorScheme[1]} 
                tickFormatter={(value) => `${value}%`}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {showAcquisition && (
              <Bar
                yAxisId="left"
                dataKey="acquisition"
                name="New Customers"
                fill={colorScheme[0]}
                radius={[4, 4, 0, 0]}
              />
            )}
            {showOrders && (
              <Bar
                yAxisId="left"
                dataKey="orders"
                name="Orders"
                fill={colorScheme[3]}
                radius={[4, 4, 0, 0]}
              />
            )}
            {showRetention && (
              <Bar
                yAxisId="right"
                dataKey="retention"
                name="Retention Rate"
                fill={colorScheme[1]}
                radius={[4, 4, 0, 0]}
              />
            )}
            {showChurn && (
              <Bar
                yAxisId="right"
                dataKey="churn"
                name="Churn Rate"
                fill={colorScheme[2]}
                radius={[4, 4, 0, 0]}
              />
            )}
            {showLTV && (
              <Bar
                yAxisId="left"
                dataKey="ltv"
                name="LTV"
                fill={colorScheme[4]}
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

      case 'line':
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke={colorScheme[0]} 
              tickFormatter={(value) => (showLTV) ? formatCurrency(value) : `${value}`}
            />
            {(showRetention || showChurn) && (
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke={colorScheme[1]} 
                tickFormatter={(value) => `${value}%`}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {showAcquisition && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="acquisition"
                name="New Customers"
                stroke={colorScheme[0]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {showRetention && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="retention"
                name="Retention Rate"
                stroke={colorScheme[1]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {showChurn && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="churn"
                name="Churn Rate"
                stroke={colorScheme[2]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {showOrders && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke={colorScheme[3]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            )}
            {showLTV && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ltv"
                name="LTV"
                stroke={colorScheme[4]}
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
