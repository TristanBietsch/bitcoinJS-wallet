import { CurrencyType } from '@/src/config/currency'

/**
 * Get the appropriate amount based on selected currency
 * @param currency The currency type to get the amount for
 * @param amounts Object containing different currency amounts
 * @returns The amount for the specified currency
 */
export const getAmountForCurrency = (
  currency: CurrencyType,
  amounts: { 
    usdAmount: number,
    btcAmount: number,
    satsAmount: number 
  }
) => {
  const { usdAmount, btcAmount, satsAmount } = amounts
  
  switch(currency) {
    case 'USD':
      return usdAmount
    case 'BTC':
      return btcAmount
    case 'SATS':
      return satsAmount
    default:
      return usdAmount
  }
}

/**
 * Validates Bitcoin input to ensure it doesn't exceed maximum decimal places
 * @param currentValue The current input value
 * @param newDigit The new digit being added
 * @param currency The currency type (BTC, SATS, USD)
 * @returns boolean indicating if the input is valid
 */
export const validateBitcoinInput = (
  currentValue: string,
  newDigit: string,
  currency: 'BTC' | 'SATS' | 'USD'
): boolean => {
  // For USD, we allow standard decimal input (typically 2 decimal places)
  if (currency === 'USD') {
    return true
  }

  // For SATS, limit to 9 digits total (without decimal places)
  if (currency === 'SATS') {
    // If trying to add a decimal point to SATS, don't allow it
    if (newDigit === '.') {
      return false
    }
    
    // Remove any existing decimal points for the check (shouldn't happen with proper validation)
    const cleanValue = currentValue.replace('.', '')
    
    // Allow up to 9 digits for SATS
    return cleanValue.length < 9 || (cleanValue.length === 9 && newDigit === '')
  }

  // For BTC, enforce 8 decimal places maximum
  const decimalIndex = currentValue.indexOf('.')
  
  // If there's no decimal point or we're adding a decimal point, it's valid
  if (decimalIndex === -1 || newDigit === '.') {
    return true
  }
  
  // Check if adding this digit would exceed 8 decimal places
  const decimalPlaces = currentValue.length - decimalIndex - 1
  
  // If we already have 8 decimal places, don't allow more digits
  return decimalPlaces < 8
} 