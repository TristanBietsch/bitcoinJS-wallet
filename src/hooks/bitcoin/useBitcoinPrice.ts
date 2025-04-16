/**
 * Hook for fetching and managing Bitcoin price data
 */
import { useState, useEffect } from 'react'
import { fetchCurrentPrice } from '@/src/services/api/price'

interface UseBitcoinPriceReturn {
  btcPrice: number | null
  isLoading: boolean
  error: string | null
  refreshPrice: () => Promise<void>
}

/**
 * Custom hook to fetch and maintain Bitcoin price
 * @param refreshInterval - Interval in milliseconds to refresh price (default: 60000ms)
 */
export const useBitcoinPrice = (refreshInterval = 60000): UseBitcoinPriceReturn => {
  const [ btcPrice, setBtcPrice ] = useState<number | null>(null)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ error, setError ] = useState<string | null>(null)
  
  const fetchBitcoinPrice = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const price = await fetchCurrentPrice()
      setBtcPrice(price)
      setIsLoading(false)
    } catch (err) {
      setError('Failed to fetch Bitcoin price')
      setBtcPrice(60000) // Fallback price if API fails
      setIsLoading(false)
      console.error('Error fetching Bitcoin price:', err)
    }
  }
  
  useEffect(() => {
    // Fetch price initially
    fetchBitcoinPrice()
    
    // Set up refresh interval
    const intervalId = setInterval(fetchBitcoinPrice, refreshInterval)
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [ refreshInterval ])
  
  return {
    btcPrice,
    isLoading,
    error,
    refreshPrice : fetchBitcoinPrice
  }
} 