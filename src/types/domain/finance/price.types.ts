/**
 * Type definitions for Bitcoin price-related components
 */

export interface TimeframePeriod {
  label: string;
  days: number | 'max';
  interval: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

export interface PriceData {
  currentPrice: number | null;
  previousPrice: number | null;
  priceChangePercent: number | null;
  isLoading: boolean;
  error: string | null;
} 