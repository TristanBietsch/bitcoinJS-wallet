import * as bitcoin from 'bitcoinjs-lib'

/**
 * Sanitizes an address by removing common problematic characters
 */
function sanitizeAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    return ''
  }
  
  // Remove whitespace, zero-width characters, and other invisible characters
  return address
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
    .replace(/[^\x20-\x7E]/g, '') // Remove non-printable ASCII characters
    .replace(/\s+/g, '') // Remove all whitespace
}

/**
 * Validates a Bitcoin address against a specific network
 */
export function isValidBitcoinAddress(address: string, network?: bitcoin.Network): boolean {
  try {
    const sanitized = sanitizeAddress(address)
    
    if (!sanitized) {
      console.warn('Address is empty or invalid after sanitization')
      return false
    }
    
    // Use testnet as default if no network specified
    const targetNetwork = network || bitcoin.networks.testnet
    
    // Try to decode the address
    bitcoin.address.toOutputScript(sanitized, targetNetwork)
    return true
    
  } catch (error) {
    console.warn(`Address validation failed for "${address}":`, error)
    return false
  }
}

/**
 * Validates and sanitizes a Bitcoin address with detailed error reporting
 */
export function validateAndSanitizeAddress(address: string, network?: bitcoin.Network): {
  isValid: boolean
  sanitizedAddress: string
  error?: string
  addressType?: string
} {
  try {
    const sanitized = sanitizeAddress(address)
    
    if (!sanitized) {
      return {
        isValid          : false,
        sanitizedAddress : '',
        error            : 'Address is empty or contains only invalid characters'
      }
    }
    
    // Use testnet as default if no network specified  
    const targetNetwork = network || bitcoin.networks.testnet
    
    // Try to decode and determine address type
    bitcoin.address.toOutputScript(sanitized, targetNetwork)
    
    let addressType = 'unknown'
    if (sanitized.startsWith('tb1') || sanitized.startsWith('bc1')) {
      addressType = sanitized.length === 42 ? 'P2WPKH' : 'P2WSH'
    } else if (sanitized.startsWith('2') || sanitized.startsWith('3')) {
      addressType = 'P2SH'
    } else if (sanitized.startsWith('1') || sanitized.startsWith('m') || sanitized.startsWith('n')) {
      addressType = 'P2PKH'
    }
    
    console.log(`Address validation success: ${sanitized} (${addressType})`)
    
    return {
      isValid          : true,
      sanitizedAddress : sanitized,
      addressType
    }
    
  } catch (error) {
    console.error(`Address validation failed for "${address}":`, error)
    
    let errorMessage = 'Invalid address format'
    if (error instanceof Error) {
      if (error.message.includes('Invalid character')) {
        errorMessage = 'Address contains invalid characters'
      } else if (error.message.includes('Invalid checksum')) {
        errorMessage = 'Address has invalid checksum'
      } else if (error.message.includes('Invalid prefix')) {
        errorMessage = 'Address has invalid network prefix'
      }
    }
    
    return {
      isValid          : false,
      sanitizedAddress : sanitizeAddress(address),
      error            : errorMessage
    }
  }
}

/**
 * Detects the network type from an address
 */
export function detectAddressNetwork(address: string): 'mainnet' | 'testnet' | 'unknown' {
  const sanitized = sanitizeAddress(address)
  
  if (sanitized.startsWith('bc1') || sanitized.startsWith('1') || sanitized.startsWith('3')) {
    return 'mainnet'
  } else if (sanitized.startsWith('tb1') || sanitized.startsWith('m') || sanitized.startsWith('n') || sanitized.startsWith('2')) {
    return 'testnet'
  }
  
  return 'unknown'
} 