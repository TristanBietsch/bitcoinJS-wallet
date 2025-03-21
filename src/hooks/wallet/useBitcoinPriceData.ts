/**
 * Custom hook for fetching and managing Bitcoin price data
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { PriceData, TimeframePeriod } from '@/src/types/price.types'
import { fetchCurrentPrice, fetchHistoricalPrices } from '@/src/services/api/price'
import { formatChartData, calculatePriceChange } from '@/src/utils/helpers/price'
import { MIN_FETCH_INTERVAL, AUTO_REFRESH_INTERVAL } from '@/src/config/price'

/**
 * Hook for fetching and processing Bitcoin price data
 * Handles rate limiting, caching, and periodic updates
 */
export const useBitcoinPriceData = (timeframe: TimeframePeriod): PriceData => {
  const [ priceData, setPriceData ] = useState<PriceData>({
    currentPrice       : null,
    previousPrice      : null,
    priceChangePercent : null,
    chartData          : [],
    timestamps         : [],
    labels             : [],
    isLoading          : true,
    error              : null
  })
  
  // Track API request status to prevent too many calls
  const isFetchingRef = useRef(false)
  const lastFetchTimeRef = useRef(0)
  
  // Fetch data from CoinGecko API
  const fetchBitcoinData = useCallback(async () => {
    // Prevent multiple concurrent fetches and respect rate limiting
    const now = Date.now()
    if (isFetchingRef.current || (now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL)) {
      return
    }
    
    isFetchingRef.current = true
    lastFetchTimeRef.current = now
    
    setPriceData(prevData => ({ ...prevData, isLoading: true, error: null }))
    
    try {
      // Fetch current price and historical data in parallel
      const [ currentPrice, historyData ] = await Promise.all([
        fetchCurrentPrice(),
        fetchHistoricalPrices(timeframe)
      ])
      
      // Format and store the data
      const { prices, timestamps, labels } = formatChartData(historyData, timeframe)
      
      // Calculate price change percentage
      const priceChangePercent = calculatePriceChange(currentPrice, prices)
      
      setPriceData(prevData => ({
        previousPrice : prevData.currentPrice,
        currentPrice,
        priceChangePercent,
        chartData     : prices,
        timestamps,
        labels,
        isLoading     : false,
        error         : null
      }))
    } catch (error) {
      console.error('Error fetching Bitcoin data:', error)
      
      // Keep previous data if available, just update error state
      setPriceData(prevData => ({
        ...prevData,
        isLoading : false,
        error     : 'Failed to fetch Bitcoin data. Please try again.'
      }))
    } finally {
      // Reset fetching flag after a short delay to prevent excessive retries
      setTimeout(() => {
        isFetchingRef.current = false
      }, MIN_FETCH_INTERVAL)
    }
  }, [ timeframe ])

  // Fetch data when timeframe changes with debounce
  useEffect(() => {
    // Clear any pending timers
    const timerId = setTimeout(() => {
      fetchBitcoinData()
    }, 100) // Small delay to debounce rapid changes
    
    return () => clearTimeout(timerId)
  }, [ timeframe, fetchBitcoinData ])
  
  // Set up polling for data refresh
  useEffect(() => {
    // Refresh every minute
    const intervalId = setInterval(fetchBitcoinData, AUTO_REFRESH_INTERVAL)
    
    return () => clearInterval(intervalId)
  }, [ fetchBitcoinData ])

  return priceData
} 