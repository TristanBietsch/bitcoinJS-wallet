import { validateAddressForCurrentNetwork } from '../../services/bitcoin/addressValidationService'

export interface ValidationResult {
  isValid : boolean
  error   : string | null
}

export const validateAddress = (input: string): ValidationResult => {
  if (!input || typeof input !== 'string') {
    return {
      isValid : false,
      error   : 'Please enter a Bitcoin address'
    }
  }

  // Use enhanced validation service
  const validation = validateAddressForCurrentNetwork(input)
  
  return {
    isValid : validation.isValid,
    error   : validation.error
  }
}

/**
 * Checks if a string is a valid Bitcoin address
 * @param address The address to validate
 * @returns True if the address is valid, false otherwise
 */
export const isValidBitcoinAddress = (address: string): boolean => {
  return validateAddress(address).isValid
} 