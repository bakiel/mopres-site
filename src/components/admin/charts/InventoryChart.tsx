'use client';

import React from 'react';
import {
  ResponsiveContainer,
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
  Treemap
} from 'recharts';

export type InventoryDataPoint = {
  name: string;
  value?: number;
  stock?: number;
  sold?: number;
  turnover?: number;
  revenue?: number;
  threshold?: number;
  [key: string]: any;
};

type ChartVariant = 'bar' | 'pie' | 'treemap';

interface InventoryChartProps {
  data: InventoryDataPoint[];
  height?: number;
  title?: string;
  variant?: ChartVariant;
  colorScheme?: string[];
  showValue?: boolean;
  showStock?: boolean;
  showSold?: boolean;
  showTurnover?: boolean;
  showThreshold?: boolean;
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a64d79', '#674ea7', '#3c78d8', '#93c47d'];
const RADIAN = Math.PI / 180;

export default function InventoryChart({
  data,
  height = 400,
  title,
  variant = 'bar',
  colorScheme = COLORS,
  showValue = true,
  showStock = true,
  showSold = false,
  showTurnover = false,
  showThreshold = false,
  className = ''
}: InventoryChartProps) {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
          <p className="font-bold text-gray-800">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
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

  // Custom content for treemap
  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, value } = props;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: colorScheme[index % colorScheme.length],
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {depth === 1 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 7}
              textAnchor="middle"
              fill="#fff"
              fontSize={14}
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 7}
              textAnchor="middle"
              fill="#fff"
              fontSize={12}
            >
              {value}
            </text>
          </>
        )}
      </g>
    );
  };

  const renderChart = () => {
    switch (variant) {
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={height / 2.5}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colorScheme[index % colorScheme.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        );

      case 'treemap':
        return (
          <Treemap
            data={data}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
            content={<CustomizedContent />}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        );

      case 'bar':
      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {showValue && (
              <Bar dataKey="value" name="Value" fill={colorScheme[0]} radius={[4, 4, 0, 0]} />
            )}
            {showStock && (
              <Bar dataKey="stock" name="Current Stock" fill={colorScheme[1]} radius={[4, 4, 0, 0]} />
            )}
            {showSold && (
              <Bar dataKey="sold" name="Units Sold" fill={colorScheme[2]} radius={[4, 4, 0, 0]} />
            )}
            {showTurnover && (
              <Bar dataKey="turnover" name="Turnover Rate" fill={colorScheme[3]} radius={[4, 4, 0, 0]} />
            )}
            {showThreshold && (
              <Bar dataKey="threshold" name="Restock Threshold" fill={colorScheme[4]} radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
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
