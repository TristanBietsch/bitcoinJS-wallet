/**
 * Price helper functions
 */
import { TimeframePeriod, ChartDataResponse } from '@/types/price.types';

/**
 * Formats chart data from API response
 */
export const formatChartData = (data: ChartDataResponse, timeframe: TimeframePeriod) => {
  if (!data || !data.prices || data.prices.length === 0) {
    return { prices: [], timestamps: [], labels: [] };
  }

  // Get appropriate number of data points based on timeframe
  let interval = 1;
  if (data.prices.length > 24) {
    interval = Math.floor(data.prices.length / 24);
  }

  const filteredPrices = data.prices.filter((_, i: number) => i % interval === 0);
  
  const prices = filteredPrices.map(price => price[1]);
  const timestamps = filteredPrices.map(price => price[0]);
  
  // Generate appropriate labels based on timeframe
  const labels = filteredPrices.map(price => {
    const date = new Date(price[0]);
    
    if (timeframe.days === 1) {
      return `${date.getHours()}:00`;
    } else if (timeframe.days === 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (timeframe.days === 30) {
      return date.toLocaleDateString('en-US', { day: 'numeric' });
    } else if (timeframe.days === 365) {
      return date.toLocaleDateString('en-US', { month: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric' });
    }
  });
  
  // Only show a subset of labels to avoid overcrowding
  const visibleLabels = labels.map((label: string, i: number) => 
    i % Math.ceil(labels.length / 5) === 0 ? label : ''
  );
  
  return { prices, timestamps, labels: visibleLabels };
};

/**
 * Calculates price change percentage
 */
export const calculatePriceChange = (currentPrice: number, data: number[]): number | null => {
  if (data.length < 2) return null;
  
  const startPrice = data[0];
  const change = ((currentPrice - startPrice) / startPrice) * 100;
  return Number(change.toFixed(2));
}; 