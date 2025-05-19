/**
 * Bitcoin Address Service
 * 
 * Provides address-related functionality like generation, validation, etc.
 */

import { IS_MAINNET, IS_REGTEST, IS_TESTNET, BITCOIN_NETWORK } from '../../../config/bitcoinNetwork'
import { AddressValidationResult } from '@/src/types/api'
import { BitcoinAddressError } from '../errors/rpcErrors'
import { callRpc } from '../rpc/rpcClient'

/**
 * Validates a Bitcoin address
 * @returns Promise with validation result
 */
export async function validateAddress(address: string): Promise<AddressValidationResult> {
  return callRpc<AddressValidationResult>('validateaddress', [ address ])
}

/**
 * Check if an address is valid for the current network
 */
export async function isValidAddress(address: string): Promise<boolean> {
  try {
    // Validate address format
    const result = await validateAddress(address)
    
    if (!result.isvalid) {
      return false
    }
    
    // Additional network-specific validation
    if (IS_MAINNET && (address.startsWith('m') || address.startsWith('n') || address.startsWith('2') || address.startsWith('tb1'))) {
      return false // Prevent sending to testnet addresses on mainnet
    }
    
    if ((IS_TESTNET || IS_REGTEST) && (address.startsWith('1') || address.startsWith('3') || address.startsWith('bc1'))) {
      return false // Prevent sending to mainnet addresses on testnet/regtest
    }
    
    return true
  } catch (error) {
    console.error('Address validation error:', error)
    return false
  }
}

/**
 * Ensures address is valid for the current network
 * @throws BitcoinAddressError if address is invalid
 */
export function validateAddressOrThrow(address: string, validationResult?: boolean): void {
  if (validationResult === false || !address) {
    throw new BitcoinAddressError(`Invalid Bitcoin address for ${BITCOIN_NETWORK} network`, address)
  }
}

/**
 * Generate a new Bitcoin address
 */
export async function getNewAddress(
  label: string = '', 
  addressType: 'legacy' | 'p2sh-segwit' | 'bech32' = 'bech32'
): Promise<string> {
  return callRpc<string>('getnewaddress', [ label, addressType ])
}

/**
 * Get payment URI for a Bitcoin amount and address
 * @param address Bitcoin address
 * @param amountBTC Optional Bitcoin amount
 * @returns Bitcoin payment URI
 */
export function getBitcoinPaymentURI(address: string, amountBTC?: number): string {
  const baseURI = `bitcoin:${address}`
  return amountBTC ? `${baseURI}?amount=${amountBTC}` : baseURI
} 