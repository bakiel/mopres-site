/**
 * Brand utility for Mopres admin dashboard
 * Provides consistent brand styling using Tailwind classes
 */

import { BRAND_COLORS } from '@/lib/constants';

// Brand colors for reference
// gold: '#AF8F53',
// goldLight: '#C9B77C',
// goldDark: '#9A7D4A',
// black: '#000000',
// white: '#FFFFFF',
// ivory: '#F5F5F3',

export const BRAND = {
  // Background colors
  bg: {
    primary: 'bg-amber-700', // Darker gold for better contrast
    primaryLight: 'bg-amber-600',
    primaryDark: 'bg-amber-800',
    primaryHover: 'hover:bg-amber-800',
    secondary: 'bg-gray-800',
    secondaryLight: 'bg-gray-700',
    secondaryHover: 'hover:bg-gray-900',
    accent: 'bg-amber-100',
    light: 'bg-amber-50',
    surface: 'bg-white',
    ivory: 'bg-amber-50',
  },
  
  // Text colors
  text: {
    primary: 'text-amber-800', // Darker for better contrast
    primaryLight: 'text-amber-700',
    primaryDark: 'text-amber-900',
    secondary: 'text-gray-900',
    onPrimary: 'text-white',
    onSecondary: 'text-white',
    muted: 'text-gray-600',
  },
  
  // Border colors
  border: {
    primary: 'border-amber-700', // Darker for better contrast
    primaryLight: 'border-amber-600',
    primaryDark: 'border-amber-800',
    accent: 'border-amber-300',
    light: 'border-amber-200',
    secondary: 'border-gray-800',
  },
  
  // Button styles
  button: {
    primary: 'bg-amber-800 hover:bg-amber-900 text-white border border-amber-900 shadow-sm',
    secondary: 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-500 shadow-sm',
    tertiary: 'bg-transparent hover:bg-amber-50 text-amber-900 border border-amber-400',
    accent: 'bg-gray-800 hover:bg-gray-900 text-white border border-gray-900 shadow-sm',
    outline: 'bg-transparent hover:bg-amber-50 text-amber-900 border border-amber-800',
  },
  
  // Card styles
  card: {
    primary: 'bg-white border border-gray-300 shadow-md rounded-lg',
    accent: 'bg-amber-50 border border-amber-300 rounded-lg',
    secondary: 'bg-gray-50 border border-gray-300 rounded-lg',
  },
  
  // Gradient backgrounds
  gradient: {
    primary: 'bg-gradient-to-r from-amber-600 to-amber-700',
    secondary: 'bg-gradient-to-r from-gray-700 to-gray-900',
    accent: 'bg-gradient-to-r from-amber-100 to-amber-200',
    light: 'bg-gradient-to-br from-amber-50 to-amber-100',
  },
  
  // Shadows
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  },
  
  // Additional utilities
  ring: {
    primary: 'ring-2 ring-amber-600 ring-opacity-50',
    focus: 'focus:ring-2 focus:ring-amber-600 focus:ring-opacity-50 focus:outline-none',
  },
  
  // Combined styles for common elements
  navItem: {
    active: 'border-amber-800 text-gray-900 font-medium',
    inactive: 'border-transparent text-gray-700 hover:border-gray-400 hover:text-gray-800',
  },
  
  tableHeader: 'bg-amber-100 text-amber-900 font-medium',
  
  badge: {
    primary: 'bg-amber-100 text-amber-900',
    secondary: 'bg-gray-100 text-gray-900',
    success: 'bg-green-100 text-green-900',
    danger: 'bg-red-100 text-red-900',
    warning: 'bg-yellow-100 text-yellow-900',
    info: 'bg-blue-100 text-blue-900',
  },
};

/**
 * Gets a hex color value from a brand color key
 */
export function getBrandColorHex(colorKey: string): string {
  return BRAND_COLORS[colorKey] || BRAND_COLORS.gold;
}
