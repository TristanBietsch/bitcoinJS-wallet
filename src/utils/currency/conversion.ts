/**
 * Currency conversion utilities
 */
import { CurrencyType } from '@/src/types/currency.types'
import { SATS_PER_BTC } from '@/src/constants/currency'

/**
 * Convert amount between different currency types
 */
export const convertAmount = (
  value: string, 
  fromCurrency: CurrencyType, 
  toCurrency: CurrencyType,
  btcPrice: number | null
): string => {
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

/**
 * Format displayed amount based on currency
 */
export const formatAmount = (amount: string, currency: CurrencyType): string => {
  if (currency === 'USD') {
    return amount.includes('.') ? amount : `${amount}.00`
  }
  return amount
} 