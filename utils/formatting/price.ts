/**
 * Price formatting utility functions
 */
import { TimeframePeriod } from '@/types/price.types';

/**
 * Formats a timestamp into a readable date string based on timeframe
 */
export const formatDate = (timestamp: number, timeframe: TimeframePeriod): string => {
  const date = new Date(timestamp);
  
  if (timeframe.days === 1) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } else if (timeframe.days === 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else if (timeframe.days === 30) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (timeframe.days === 365) {
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
};

/**
 * Formats price to currency string
 */
export const formatCurrency = (price: number | null): string => {
  if (price === null) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}; 