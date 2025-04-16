import { useState, useEffect } from 'react'
import { fetchCurrentPrice } from '@/src/services/api/price'
import { SATS_PER_BTC } from '@/src/constants/currency'

interface ConvertedAmounts {
  sats: string
  usd: string
}

/**
 * Hook for Bitcoin amount conversion and price fetching
 */
export const useConvertBitcoin = () => {
  const [ btcPrice, setBtcPrice ] = useState<number | null>(null)
  const [ isLoading, setIsLoading ] = useState(false)
  const [ error, setError ] = useState<string | null>(null)

  // Fetch Bitcoin price
  const fetchBitcoinPrice = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const price = await fetchCurrentPrice()
      setBtcPrice(price)
    } catch (err) {
      console.error('Error fetching price:', err)
      setError('Failed to fetch Bitcoin price')
      setBtcPrice(60000) // Fallback price
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBitcoinPrice()
  }, [])

  // Convert amount to SATS and USD
  const getConvertedAmounts = (amount: string, currency: string): ConvertedAmounts => {
    if (!btcPrice || !amount) return { sats: '0', usd: '0' }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) return { sats: '0', usd: '0' }

    let satsAmount: number
    let usdAmount: number

    if (currency === 'SATS') {
      satsAmount = numAmount
      usdAmount = (numAmount / SATS_PER_BTC) * btcPrice
    } else if (currency === 'USD') {
      usdAmount = numAmount
      satsAmount = (numAmount / btcPrice) * SATS_PER_BTC
    } else { // BTC
      satsAmount = numAmount * SATS_PER_BTC
      usdAmount = numAmount * btcPrice
    }

    return {
      sats : Math.round(satsAmount).toString(),
      usd  : usdAmount.toFixed(2)
    }
  }

  const refreshPrice = () => {
    fetchBitcoinPrice()
  }

  return {
    btcPrice,
    isLoading,
    error,
    getConvertedAmounts,
    refreshPrice
  }
} 