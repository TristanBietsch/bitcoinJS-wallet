// Bitcoin address validation patterns
const _BTC_ADDRESS_PATTERNS = {
  legacy : /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // P2PKH addresses
  segwit : /^bc1[ac-hj-np-z02-9]{11,71}$/,      // Native SegWit (bech32) addresses
  nested : /^3[ac-hj-np-z02-9]{33}$/            // Nested SegWit (P2SH-P2WPKH) addresses
}

export interface ValidationResult {
  isValid : boolean
  error   : string | null
}

export const validateAddress = (input: string): ValidationResult => {
  // Remove any whitespace
  const cleanInput = input.trim()
  
  // Check if empty
  if (!cleanInput) {
    return {
      isValid : false,
      error   : 'Please enter a Bitcoin address'
    }
  }

  // Check length (basic validation)
  if (cleanInput.length < 26 || cleanInput.length > 90) {
    return {
      isValid : false,
      error   : 'Invalid Bitcoin address length'
    }
  }

  // Check against known address patterns
  const isValid = Object.values(_BTC_ADDRESS_PATTERNS).some(pattern => pattern.test(cleanInput))
  
  if (!isValid) {
    return {
      isValid : false,
      error   : 'Invalid Bitcoin address format'
    }
  }

  return {
    isValid : true,
    error   : null
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