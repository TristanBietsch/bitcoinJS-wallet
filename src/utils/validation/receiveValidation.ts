/**
 * Validation utilities for the receive screen
 */

/**
 * Checks if the amount is valid for generating an invoice
 * @param amount - The amount string to validate
 * @returns True if the amount is valid (not empty and not zero)
 */
export const isValidReceiveAmount = (amount: string): boolean => {
  if (!amount || amount.trim() === '') return false
  
  // Convert to number and check if it's greater than 0
  const numericAmount = parseFloat(amount)
  return !isNaN(numericAmount) && numericAmount > 0
} 