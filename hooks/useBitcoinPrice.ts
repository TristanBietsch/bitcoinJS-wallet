/**
 * Hook for fetching and managing Bitcoin price data
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchCurrentPrice, fetchHistoricalPrices } from '@/services/api/price';
import { formatChartData } from '@/utils/helpers/price';
import { calculatePriceChange } from '@/utils/helpers/price';
import { TimeframePeriod, PriceData } from '@/types/price.types';
import { TIME_PERIODS, AUTO_REFRESH_INTERVAL } from '@/config/price';

const initialPriceData: PriceData = {
  currentPrice: null,
  previousPrice: null,
  priceChangePercent: null,
  chartData: [],
  timestamps: [],
  labels: [],
  isLoading: true,
  error: null
};

export const useBitcoinPrice = () => {
  const [priceData, setPriceData] = useState<PriceData>(initialPriceData);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframePeriod>(TIME_PERIODS[0]);

  const fetchPriceData = useCallback(async () => {
    try {
      setPriceData(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Fetch current price
      const currentPrice = await fetchCurrentPrice();
      
      // Fetch historical data
      const historicalData = await fetchHistoricalPrices(selectedTimeframe);
      const { prices, timestamps, labels } = formatChartData(historicalData, selectedTimeframe);
      
      // Calculate price change
      const priceChangePercent = calculatePriceChange(currentPrice, prices);
      
      setPriceData(prev => ({
        currentPrice,
        previousPrice: prev.currentPrice,
        priceChangePercent,
        chartData: prices,
        timestamps,
        labels,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      setPriceData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch price data'
      }));
    }
  }, [selectedTimeframe]);

  // Initial data fetch
  useEffect(() => {
    fetchPriceData();
  }, [fetchPriceData]);

  // Auto-refresh price data
  useEffect(() => {
    const intervalId = setInterval(fetchPriceData, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchPriceData]);

  return {
    ...priceData,
    refresh: fetchPriceData,
    timeframe: selectedTimeframe,
    setTimeframe: setSelectedTimeframe,
    timeframes: TIME_PERIODS
  };
}; 