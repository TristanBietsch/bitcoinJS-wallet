import { CurrencyType } from '@/src/types/domain/finance'

/**
 * Get the appropriate amount based on selected currency (BTC or SATS)
 * 
 * This function simply returns the raw amount for the requested currency type.
 * The formatting functions will handle any necessary conversion and display formatting.
 * 
 * @param currency The currency type to get the amount for
 * @param amounts Object containing different currency amounts
 * @returns The amount for the specified currency
 */
export const getAmountForCurrency = (
  currency: CurrencyType,
  amounts: { 
    btcAmount: number,
    satsAmount: number 
  }
) => {
  const { btcAmount, satsAmount } = amounts
  
  switch(currency) {
    case 'BTC':
      return btcAmount
    case 'SATS':
      return satsAmount
    default: // Should not happen with CurrencyType
      return satsAmount // Default to SATS if type is somehow invalid
  }
}

/**
 * Validates Bitcoin input to ensure it doesn't exceed maximum decimal places for BTC or length for SATS
 * @param currentValue The current input value
 * @param newDigit The new digit being added
 * @param currency The currency type (BTC or SATS)
 * @returns boolean indicating if the input is valid
 */
export const validateBitcoinInput = (
  currentValue: string,
  newDigit: string,
  currency: CurrencyType // Updated to use imported CurrencyType
): boolean => {
  if (currency === 'SATS') {
    if (newDigit === '.') {
      return false // SATS are whole numbers
    }
    // SATS can be up to 15 digits - reasonable limit for large amounts
    // Check if adding the new digit would exceed the limit
    const newValue = currentValue + newDigit
    return newValue.length <= 15
  }

  // For BTC, enforce 8 decimal places maximum
  if (newDigit === '.' && currentValue.includes('.')) {
    return false // Already has a decimal point
  }

  const parts = (currentValue + newDigit).split('.')
  if (parts.length > 1) {
    // Check decimal part length
    if (parts[1].length > 8) {
      return false
    }
  }
  // Further validation for overall length or max value can be added if needed
  return true
} 