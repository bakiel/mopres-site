/**
 * Utility functions for formatting various data types
 */

/**
 * Format a number as ZAR currency
 * @param amount - The number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', { 
    style: 'currency', 
    currency: 'ZAR',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a date string to ZA format
 * @param dateString - The date string to format
 * @returns Formatted date string (e.g., 17 May 2025)
 */
export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format a date with time
 * @param dateString - The date string to format
 * @returns Formatted date and time string (e.g., 17 May 2025, 14:30)
 */
export const formatDateTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format a number with a specific number of decimal places
 * @param num - The number to format
 * @param decimals - The number of decimal places (default: 2)
 * @returns Formatted number string
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

/**
 * Format a file size in bytes to a human-readable format
 * @param bytes - The file size in bytes
 * @returns Formatted file size (e.g., 1.5 MB)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format a percentage
 * @param value - The value to format as percentage
 * @param decimals - The number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Slugify a string (convert to URL-friendly format)
 * @param text - The text to slugify
 * @returns Slugified string
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

/**
 * Truncate text with ellipsis if longer than maxLength
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Format a phone number to South African format
 * @param phone - The phone number to format
 * @returns Formatted phone number (e.g., 083 500 5311)
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Handle South African mobile numbers (typically 10 digits, starting with 0)
  if (digitsOnly.length === 10 && digitsOnly.startsWith('0')) {
    return digitsOnly.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  
  // Return as is if it doesn't match the expected format
  return phone;
};

/**
 * Capitalize the first letter of each word in a string
 * @param text - The text to capitalize
 * @returns Text with each word capitalized
 */
export const capitalizeWords = (text: string): string => {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
