/**
 * Custom hook for fetching and managing Bitcoin price data
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchCurrentPrice, fetchHistoricalPrices } from '@/services/api/price';
import { formatChartData } from '@/utils/helpers/price';
import { calculatePriceChange } from '@/utils/helpers/price';
import { TimeframePeriod, PriceData } from '@/types/price.types';
import { TIME_PERIODS, AUTO_REFRESH_INTERVAL } from '@/config/price';

export const useBitcoinPrice = () => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframePeriod>('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);

  const fetchPriceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch current price
      const price = await fetchCurrentPrice();
      setCurrentPrice(price);
      
      // Fetch historical prices based on selected timeframe
      const historicalData = await fetchHistoricalPrices(timeframe);
      
      // Format chart data
      const formattedData = formatChartData(historicalData);
      setPriceData(formattedData);
      
      // Calculate price change
      const change = calculatePriceChange(historicalData);
      setPriceChange(change);
      
    } catch (err) {
      setError('Failed to fetch Bitcoin price data');
      console.error('Error fetching price data:', err);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  // Initial fetch
  useEffect(() => {
    fetchPriceData();
  }, [fetchPriceData]);

  // Auto-refresh
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchPriceData();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, [fetchPriceData]);

  return {
    currentPrice,
    priceData,
    timeframe,
    setTimeframe,
    loading,
    error,
    priceChange,
    refresh: fetchPriceData,
    availableTimeframes: TIME_PERIODS
  };
}; 