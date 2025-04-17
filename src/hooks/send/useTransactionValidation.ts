/**
 * Hook to validate transaction data before processing
 */
import { useSendStore } from '@/src/store/sendStore'
import { isValidBitcoinAddress } from '@/src/utils/validation/validateAddress'

interface ValidationResult {
  isValid : boolean
  error   : string | null
}

/**
 * Hook to validate a transaction before sending
 * This performs validation checks on the transaction data
 */
export const useTransactionValidation = (): ValidationResult => {
  const { address, amount, currency, errorMode } = useSendStore()
  
  // Check if error mode is set to validation
  if (errorMode === 'validation') {
    return {
      isValid : false,
      error   : 'Transaction validation failed. This is a simulated validation error for testing purposes.'
    }
  }
  
  // Check if address is valid
  const isAddressValid = isValidBitcoinAddress(address)
  
  // Check if amount is valid
  const parsedAmount = parseFloat(amount)
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0
  
  let error: string | null = null
  
  if (!isAddressValid) {
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