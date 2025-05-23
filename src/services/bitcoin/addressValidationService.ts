/**
 * Enhanced Address Validation Service
 * Provides comprehensive Bitcoin address validation with network and type detection
 */

import * as bitcoin from 'bitcoinjs-lib'
import { CURRENT_NETWORK } from '../../config/env'

export interface AddressValidationResult {
  isValid     : boolean
  addressType : 'legacy' | 'segwit' | 'native_segwit' | 'unknown' | null
  network     : 'mainnet' | 'testnet' | 'regtest' | 'unknown' | null
  error       : string | null
}

/**
 * Validates a Bitcoin address and provides detailed information
 */
export function validateBitcoinAddress(address: string): AddressValidationResult {
  if (!address || typeof address !== 'string') {
    return {
      isValid     : false,
      addressType : null,
      network     : null,
      error       : 'Address is required'
    }
  }

  // Trim whitespace
  const trimmedAddress = address.trim()
  
  if (trimmedAddress.length === 0) {
    return {
      isValid     : false,
      addressType : null,
      network     : null,
      error       : 'Address cannot be empty'
    }
  }

  try {
    // Try to decode with different networks
    const networks = [
      { name: 'mainnet' as const, config: bitcoin.networks.bitcoin },
      { name: 'testnet' as const, config: bitcoin.networks.testnet },
      { name: 'regtest' as const, config: bitcoin.networks.regtest }
    ]

    for (const { name: networkName, config: networkConfig } of networks) {
      try {
        // Try P2PKH (Legacy)
        const p2pkh = bitcoin.payments.p2pkh({ 
          address: trimmedAddress, 
          network: networkConfig 
        })
        if (p2pkh.address === trimmedAddress) {
          return {
            isValid     : true,
            addressType : 'legacy',
            network     : networkName,
            error       : null
          }
        }
      } catch {
        // Continue to next type
      }

      try {
        // Try P2SH (SegWit wrapped)
        const p2sh = bitcoin.payments.p2sh({ 
          address: trimmedAddress, 
          network: networkConfig 
        })
        if (p2sh.address === trimmedAddress) {
          return {
            isValid     : true,
            addressType : 'segwit',
            network     : networkName,
            error       : null
          }
        }
      } catch {
        // Continue to next type
      }

      try {
        // Try P2WPKH (Native SegWit)
        const p2wpkh = bitcoin.payments.p2wpkh({ 
          address: trimmedAddress, 
          network: networkConfig 
        })
        if (p2wpkh.address === trimmedAddress) {
          return {
            isValid     : true,
            addressType : 'native_segwit',
            network     : networkName,
            error       : null
          }
        }
      } catch {
        // Continue to next network
      }
    }

    // If we get here, address format is invalid
    return {
      isValid     : false,
      addressType : 'unknown',
      network     : 'unknown',
      error       : 'Invalid address format'
    }

  } catch (error) {
    return {
      isValid     : false,
      addressType : null,
      network     : null,
      error       : `Address validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Validates address is compatible with current network
 */
export function validateAddressForCurrentNetwork(address: string): AddressValidationResult {
  const validation = validateBitcoinAddress(address)
  
  if (!validation.isValid) {
    return validation
  }

  // Check network compatibility
  const expectedNetwork = CURRENT_NETWORK === 'mainnet' ? 'mainnet' : 'testnet'
  
  if (validation.network !== expectedNetwork) {
    return {
      ...validation,
      isValid : false,
      error   : `Address is for ${validation.network} but app is configured for ${expectedNetwork}`
    }
  }

  return validation
}

/**
 * Validates and normalizes an address (trims whitespace, validates format)
 */
export function normalizeAndValidateAddress(address: string): {
  address: string | null
  validation: AddressValidationResult
} {
  if (!address) {
    return {
      address    : null,
      validation : {
        isValid     : false,
        addressType : null,
        network     : null,
        error       : 'Address is required'
      }
    }
  }

  const trimmedAddress = address.trim()
  const validation = validateAddressForCurrentNetwork(trimmedAddress)

  return {
    address    : validation.isValid ? trimmedAddress : null,
    validation
  }
}

/**
 * Checks if address belongs to the current wallet
 */
export function isOwnAddress(
  address: string,
  walletAddresses: {
    legacy: string[]
    segwit: string[]
    nativeSegwit: string[]
  }
): boolean {
  const allAddresses = [
    ...walletAddresses.legacy,
    ...walletAddresses.segwit,
    ...walletAddresses.nativeSegwit
  ]
  
  return allAddresses.includes(address.trim())
}

/**
 * Validates multiple addresses at once
 */
export function validateMultipleAddresses(addresses: string[]): {
  valid: string[]
  invalid: Array<{ address: string; error: string }>
} {
  const valid: string[] = []
  const invalid: Array<{ address: string; error: string }> = []

  addresses.forEach((address) => {
    const validation = validateAddressForCurrentNetwork(address)
    
    if (validation.isValid) {
      valid.push(address.trim())
    } else {
      invalid.push({
        address,
        error: validation.error || 'Invalid address'
      })
    }
  })

  return { valid, invalid }
}

/**
 * Parses BIP21 URI and validates the address
 */
export function parseBIP21URI(uri: string): {
  address: string | null
  amount?: number
  label?: string
  message?: string
  validation: AddressValidationResult
} {
  try {
    // Basic BIP21 parsing
    if (!uri.startsWith('bitcoin:')) {
      return {
        address    : null,
        validation : {
          isValid     : false,
          addressType : null,
          network     : null,
          error       : 'Invalid BIP21 URI format'
        }
      }
    }

    const uriWithoutProtocol = uri.slice(8) // Remove 'bitcoin:'
    const [addressPart, queryPart] = uriWithoutProtocol.split('?')
    
    if (!addressPart) {
      return {
        address    : null,
        validation : {
          isValid     : false,
          addressType : null,
          network     : null,
          error       : 'No address found in BIP21 URI'
        }
      }
    }

    // Validate the address
    const validation = validateAddressForCurrentNetwork(addressPart)
    
    const result: any = {
      address: validation.isValid ? addressPart : null,
      validation
    }

    // Parse query parameters if present
    if (queryPart && validation.isValid) {
      const params = new URLSearchParams(queryPart)
      
      if (params.has('amount')) {
        const amount = parseFloat(params.get('amount')!)
        if (!isNaN(amount) && amount > 0) {
          result.amount = Math.round(amount * 100000000) // Convert BTC to satoshis
        }
      }
      
      if (params.has('label')) {
        result.label = params.get('label')
      }
      
      if (params.has('message')) {
        result.message = params.get('message')
      }
    }

    return result
    
  } catch (error) {
    return {
      address    : null,
      validation : {
        isValid     : false,
        addressType : null,
        network     : null,
        error       : `Failed to parse BIP21 URI: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
} 