import { useState, useEffect } from 'react'
import { fetchCurrentPrice } from '@/src/services/api/price'

// Currency type definition
export type CurrencyType = 'USD' | 'BTC' | 'SATS'

// Constants
const SATS_PER_BTC = 100000000 // 1 BTC = 100,000,000 SATS (this is a fixed value)

export const useBitcoinPriceConverter = () => {
  const [ btcPrice, setBtcPrice ] = useState<number | null>(null)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ error, setError ] = useState<string | null>(null)
  
  // Fetch the current Bitcoin price
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
  
  // Fetch Bitcoin price on component mount
  useEffect(() => {
    fetchBitcoinPrice()
    
    // Refresh price every 60 seconds
    const intervalId = setInterval(fetchBitcoinPrice, 60000)
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [])
  
  // Convert amount between currencies using real rates
  const convertAmount = (value: string, fromCurrency: CurrencyType, toCurrency: CurrencyType): string => {
    // If price hasn't loaded or currencies are the same, return unchanged
    if (!btcPrice || value === '0' || fromCurrency === toCurrency) return value
    
    const numericValue = parseFloat(value)
    if (isNaN(numericValue)) return '0'
    
    // Convert to BTC as intermediate step
    let valueInBTC = numericValue
    if (fromCurrency === 'USD') {
      valueInBTC = numericValue / btcPrice
    } else if (fromCurrency === 'SATS') {
      valueInBTC = numericValue / SATS_PER_BTC
    }
    
    // Convert from BTC to target currency
    let result = valueInBTC
    if (toCurrency === 'USD') {
      result = valueInBTC * btcPrice
    } else if (toCurrency === 'SATS') {
      result = valueInBTC * SATS_PER_BTC
    }
    
    // Format based on currency type
    if (toCurrency === 'BTC') {
      return result.toFixed(8)
    } else if (toCurrency === 'USD') {
      return result.toFixed(2)
    } else {
      // SATS should be whole numbers
      return Math.round(result).toString()
    }
  }
  
  return {
    btcPrice,
    isLoading,
    error,
    convertAmount,
    fetchBitcoinPrice
  }
} 