import { usePriceStore } from '@/src/store/priceStore'
import { SATS_PER_BTC } from '@/src/constants/currency'

// Currency type definition
export type CurrencyType = 'USD' | 'BTC' | 'SATS'

export const useBitcoinPriceConverter = () => {
  // Use the price store
  const btcPrice = usePriceStore(state => state.btcPrice)
  const isLoading = usePriceStore(state => state.isLoading)
  const error = usePriceStore(state => state.error)
  const fetchPrice = usePriceStore(state => state.fetchPrice)
  
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
    refreshPrice : fetchPrice
  }
} 