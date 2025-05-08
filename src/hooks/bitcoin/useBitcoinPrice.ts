/**
 * Hook for fetching and managing Bitcoin price data
 * This is the consolidated hook for Bitcoin price after removing duplicate implementations
 */
import { useState, useEffect } from 'react'
import { getBTCPrice } from '@/src/services/api/btcPriceService'

/**
 * Interface for Bitcoin price data return
 */
interface UseBitcoinPriceReturn {
  btcPrice : number | null
  isLoading : boolean
  error : string | null
  refreshPrice : () => Promise<void>
}

/**
 * Hook for fetching and managing Bitcoin price data
 * @param refreshInterval - Milliseconds between price refreshes (default: 30000ms)
 */
export const useBitcoinPrice = (refreshInterval = 30000): UseBitcoinPriceReturn => {
  const [ btcPrice, setBtcPrice ] = useState<number | null>(null)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ error, setError ] = useState<string | null>(null)
  
  // Function to fetch Bitcoin price
  const fetchPrice = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const price = await getBTCPrice()
      setBtcPrice(price)
    } catch (err) {
      console.error('Error fetching BTC price:', err)
      setError('Failed to fetch Bitcoin price')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch price on component mount and set up interval
  useEffect(() => {
    fetchPrice()
    
    // Set up refresh interval
    const intervalId = setInterval(fetchPrice, refreshInterval)
    
    // Clean up on unmount
    return () => clearInterval(intervalId)
  }, [ refreshInterval ])
  
  return {
    btcPrice,
    isLoading,
    error,
    refreshPrice : fetchPrice
  }
} 