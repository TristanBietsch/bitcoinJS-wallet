/**
 * Custom hook for fetching and managing Bitcoin price data
 */
import { useState, useEffect, useCallback } from 'react'
import { fetchCurrentPrice, fetchHistoricalPrices } from '@/src/services/api/price'
import { formatChartData } from '@/src/utils/helpers/price'
import { calculatePriceChange } from '@/src/utils/helpers/price'
import { TimeframePeriod, PriceData } from '@/src/types/price.types'
import { TIME_PERIODS, AUTO_REFRESH_INTERVAL } from '@/src/config/price'

export const useBitcoinPrice = () => {
  const [ currentPrice, setCurrentPrice ] = useState<number | null>(null)
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
  const [ timeframe, setTimeframe ] = useState<TimeframePeriod>(TIME_PERIODS[0])
  const [ loading, setLoading ] = useState(true)
  const [ error, setError ] = useState<string | null>(null)
  const [ priceChange, setPriceChange ] = useState<number | null>(null)

  const fetchPriceData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch current price
      const price = await fetchCurrentPrice()
      setCurrentPrice(price)
      
      // Fetch historical prices based on selected timeframe
      const historicalData = await fetchHistoricalPrices(timeframe)
      
      // Format chart data
      const formattedData = formatChartData(historicalData, timeframe)
      
      // Calculate price change
      const change = calculatePriceChange(price, formattedData.prices)
      
      // Update price data state
      setPriceData({
        currentPrice       : price,
        previousPrice      : priceData.currentPrice,
        priceChangePercent : change,
        chartData          : formattedData.prices,
        timestamps         : formattedData.timestamps,
        labels             : formattedData.labels,
        isLoading          : false,
        error              : null
      })
      
      setPriceChange(change)
      
    } catch (err) {
      setError('Failed to fetch Bitcoin price data')
      console.error('Error fetching price data:', err)
    } finally {
      setLoading(false)
    }
  }, [ timeframe, priceData.currentPrice ])

  // Initial fetch
  useEffect(() => {
    fetchPriceData()
  }, [ fetchPriceData ])

  // Auto-refresh
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchPriceData()
    }, AUTO_REFRESH_INTERVAL)

    return () => clearInterval(refreshInterval)
  }, [ fetchPriceData ])

  return {
    currentPrice,
    priceData,
    timeframe,
    setTimeframe,
    loading,
    error,
    priceChange,
    refresh             : fetchPriceData,
    availableTimeframes : TIME_PERIODS
  }
} 