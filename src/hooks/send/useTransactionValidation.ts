/**
 * Hook to validate transaction data before processing
 */
import { useSendStore } from '@/src/store/sendStore'
import { isValidBitcoinAddress } from '@/src/utils/validation/validateAddress'

interface ValidationResult {
  isValid: boolean
  error: string | null
}

/**
 * Hook to validate a transaction before sending
 * This performs validation checks on the transaction data
 */
export const useTransactionValidation = (): ValidationResult => {
  const { address, amount, currency, forceError } = useSendStore()
  
  // Check if address is valid
  const isAddressValid = isValidBitcoinAddress(address)
  
  // Check if amount is valid
  const parsedAmount = parseFloat(amount)
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0
  
  // Check if there's a force error flag set in the store
  const hasForcedError = forceError === true
  
  let error: string | null = null
  
  if (hasForcedError) {
    error = 'Transaction validation failed. This is a simulated error for testing purposes.'
  } else if (!isAddressValid) {
    error = 'Invalid recipient address. Please check and try again.'
  } else if (!isAmountValid) {
    error = 'Invalid amount. Please enter a valid amount greater than zero.'
  } else if (parsedAmount > 1000 && currency === 'BTC') {
    // Example of a business logic validation rule
    error = 'Amount exceeds maximum allowed for a single transaction.'
  }
  
  return {
    isValid : !error,
    error
  }
} 