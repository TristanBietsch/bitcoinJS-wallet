import { usePriceStore } from '@/src/store/priceStore'
import { SATS_PER_BTC } from '@/src/constants/currency'

interface ConvertedAmounts {
  sats: string
  usd: string
}

/**
 * Hook for Bitcoin amount conversion and price fetching
 */
export const useConvertBitcoin = () => {
  // Use the price store
  const btcPrice = usePriceStore(state => state.btcPrice)
  const isLoading = usePriceStore(state => state.isLoading)
  const error = usePriceStore(state => state.error)
  const fetchPrice = usePriceStore(state => state.fetchPrice)

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

  return {
    btcPrice,
    isLoading,
    error,
    getConvertedAmounts,
    refreshPrice : fetchPrice
  }
} 