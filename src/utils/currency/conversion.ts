/**
 * Currency conversion utilities
 */
import { CurrencyType } from '@/src/types/domain/finance'
import { SATS_PER_BTC } from '@/src/constants/currency'

/**
 * Convert amount between BTC and SATS
 */
export const convertAmount = (
  value: string,
  fromCurrency: CurrencyType,
  toCurrency: CurrencyType
): string => {
  if (value === '0' || fromCurrency === toCurrency) return value

  const numericValue = parseFloat(value)
  if (isNaN(numericValue)) return '0'

  let valueInSATS: number

  if (fromCurrency === 'BTC') {
    valueInSATS = Math.round(numericValue * SATS_PER_BTC)
  } else { // fromCurrency is SATS
    valueInSATS = numericValue
  }

  if (toCurrency === 'BTC') {
    return (valueInSATS / SATS_PER_BTC).toFixed(8) // BTC can have 8 decimal places
  } else { // toCurrency is SATS
    return String(Math.round(valueInSATS)) // SATS are whole numbers
  }
}

/**
 * Basic formatting for displayed amount (currently just returns the amount)
 * More specific formatting is handled by formatBitcoinAmount in formatCurrencyValue.tsx
 */
export const formatAmount = (amount: string, _currency: CurrencyType): string => {
  // Removed USD specific formatting, further formatting can be specialized elsewhere
  return amount
} 