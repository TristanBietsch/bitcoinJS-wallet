/**
 * Consolidated Bitcoin Address Service
 * Combines address generation, validation, and derivation functionality
 */
import * as bitcoin from 'bitcoinjs-lib'
import { BIP32Factory } from 'bip32'
import { getEccLib } from './config/eccProvider'
import { CURRENT_NETWORK } from '@/src/config/env'
import { IS_MAINNET, IS_REGTEST, IS_TESTNET, BITCOIN_NETWORK, DEFAULT_DERIVATION_PATH } from '@/src/config/bitcoinNetwork'
import { AddressValidationResult } from '@/src/types/api'
import { BitcoinAddressError } from './errors/rpcErrors'
import { callRpc } from './rpc/rpcClient'

// Initialize libraries
const ecc = getEccLib()
const bip32 = BIP32Factory(ecc)

// Types
export interface ExtendedAddressValidation {
  isValid: boolean
  addressType: 'legacy' | 'segwit' | 'native_segwit' | 'unknown' | null
  network: 'mainnet' | 'testnet' | 'regtest' | 'unknown' | null
  error: string | null
  sanitizedAddress?: string
}

export interface DerivedAddress {
  address: string
  addressType: 'legacy' | 'segwit' | 'native_segwit'
  derivationPath: string
  index: number
}

/**
 * Consolidated Address Service
 */
export class AddressService {

  /**
   * ADDRESS VALIDATION
   */

  /**
   * Enhanced Bitcoin address validation with network and type detection
   */
  static validateBitcoinAddress(address: string): ExtendedAddressValidation {
    if (!address || typeof address !== 'string') {
      return {
        isValid: false,
        addressType: null,
        network: null,
        error: 'Address is required'
      }
    }

    // Trim whitespace
    const trimmedAddress = address.trim()
    
    if (trimmedAddress.length === 0) {
      return {
        isValid: false,
        addressType: null,
        network: null,
        error: 'Address cannot be empty'
      }
    }

    try {
      // Try to decode with different networks
      const networks = [
        { name: 'mainnet' as const, config: bitcoin.networks.bitcoin },
        { name: 'testnet' as const, config: bitcoin.networks.testnet },
        { name: 'regtest' as const, config: {
          ...bitcoin.networks.testnet,
          bech32: 'bcrt'
        }}
      ]

      for (const { name: networkName, config: networkConfig } of networks) {
        try {
          // Try to decode the address
          bitcoin.address.toOutputScript(trimmedAddress, networkConfig)
          
          // Determine address type
          let addressType: 'legacy' | 'segwit' | 'native_segwit' = 'legacy'
          
          if (trimmedAddress.startsWith('bc1') || trimmedAddress.startsWith('tb1') || trimmedAddress.startsWith('bcrt1')) {
            addressType = 'native_segwit'
          } else if (trimmedAddress.startsWith('3') || trimmedAddress.startsWith('2')) {
            addressType = 'segwit'
          } else if (trimmedAddress.startsWith('1') || trimmedAddress.startsWith('m') || trimmedAddress.startsWith('n')) {
            addressType = 'legacy'
          }

          return {
            isValid: true,
            addressType,
            network: networkName,
            error: null,
            sanitizedAddress: trimmedAddress
          }
        } catch {
          // Try next network
          continue
        }
      }

      return {
        isValid: false,
        addressType: null,
        network: null,
        error: 'Invalid address format for any known network'
      }
    } catch (error) {
      return {
        isValid: false,
        addressType: null,
        network: null,
        error: `Address validation error: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }

  /**
   * RPC-based address validation
   */
  static async validateAddress(address: string): Promise<AddressValidationResult> {
    try {
      return await callRpc<AddressValidationResult>('validateaddress', [address])
    } catch (error) {
      console.error('RPC address validation error:', error)
      return {
        isvalid: false,
        address: address,
        error: error instanceof Error ? error.message : String(error)
      } as AddressValidationResult
    }
  }

  /**
   * Check if an address is valid for the current network
   */
  static async isValidAddress(address: string): Promise<boolean> {
    try {
      // First try enhanced validation
      const enhancedResult = this.validateBitcoinAddress(address)
      
      if (!enhancedResult.isValid) {
        return false
      }

      // Check network compatibility
      const currentNetwork = CURRENT_NETWORK === 'mainnet' ? 'mainnet' : 'testnet'
      
      if (enhancedResult.network !== currentNetwork && enhancedResult.network !== 'regtest') {
        console.warn(`Address network mismatch: address is for ${enhancedResult.network}, but current network is ${currentNetwork}`)
        return false
      }

      // Additional network-specific validation for extra safety
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
   * Validate address or throw error
   */
  static async validateAddressOrThrow(address: string): Promise<void> {
    const isValid = await this.isValidAddress(address)
    if (!isValid) {
      throw new BitcoinAddressError(`Invalid Bitcoin address for ${BITCOIN_NETWORK} network`, address)
    }
  }

  /**
   * ADDRESS GENERATION
   */

  /**
   * Generate new address via RPC
   */
  static async getNewAddress(
    label: string = '',
    addressType: 'legacy' | 'p2sh-segwit' | 'bech32' = 'bech32'
  ): Promise<string> {
    try {
      // On mainnet, prefer p2sh-segwit for better compatibility
      const finalAddressType = IS_MAINNET && addressType === 'bech32'
        ? 'p2sh-segwit'
        : addressType
        
      return await callRpc<string>('getnewaddress', [label, finalAddressType])
    } catch (error) {
      console.error('Failed to generate new address:', error)
      throw new Error(`Failed to generate new address: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Get current network configuration
   */
  static getNetwork(): bitcoin.networks.Network {
    switch (BITCOIN_NETWORK) {
      case 'mainnet':
        return bitcoin.networks.bitcoin
      case 'testnet':
        return bitcoin.networks.testnet
      case 'regtest':
        return {
          ...bitcoin.networks.testnet,
          bech32: 'bcrt'
        }
      default:
        return bitcoin.networks.testnet
    }
  }

  /**
   * HIERARCHICAL DETERMINISTIC (HD) ADDRESS DERIVATION
   */

  /**
   * Derive address from HD key
   */
  static deriveAddressFromKey(
    hdKey: any, // BIP32Interface
    addressType: 'legacy' | 'segwit' | 'native_segwit' = 'native_segwit'
  ): string {
    const network = this.getNetwork()
    
    if (!hdKey.publicKey) {
      throw new Error('HD key must have a public key')
    }

    try {
      switch (addressType) {
        case 'legacy':
          return bitcoin.payments.p2pkh({ 
            pubkey: hdKey.publicKey, 
            network 
          }).address!
          
        case 'segwit':
          return bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2wpkh({ 
              pubkey: hdKey.publicKey, 
              network 
            }),
            network
          }).address!
          
        case 'native_segwit':
          return bitcoin.payments.p2wpkh({ 
            pubkey: hdKey.publicKey, 
            network 
          }).address!
          
        default:
          throw new Error(`Unsupported address type: ${addressType}`)
      }
    } catch (error) {
      throw new Error(`Failed to derive ${addressType} address: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Derive multiple addresses from seed
   */
  static deriveAddressesFromSeed(
    seed: Buffer,
    count: number = 10,
    startIndex: number = 0,
    addressType: 'legacy' | 'segwit' | 'native_segwit' = 'native_segwit',
    accountIndex: number = 0
  ): DerivedAddress[] {
    const network = this.getNetwork()
    const root = bip32.fromSeed(seed, network)
    const addresses: DerivedAddress[] = []

    for (let i = startIndex; i < startIndex + count; i++) {
      const path = `m/44'/${BITCOIN_NETWORK === 'mainnet' ? 0 : 1}'/${accountIndex}'/0/${i}`
      const child = root.derivePath(path)
      
      const address = this.deriveAddressFromKey(child, addressType)
      
      addresses.push({
        address,
        addressType,
        derivationPath: path,
        index: i
      })
    }

    return addresses
  }

  /**
   * Derive single address from mnemonic
   */
  static async deriveAddressFromMnemonic(
    mnemonic: string,
    index: number = 0,
    addressType: 'legacy' | 'segwit' | 'native_segwit' = 'native_segwit',
    passphrase: string = ''
  ): Promise<DerivedAddress> {
    const bip39 = require('bip39')
    
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase')
    }

    const seed = await bip39.mnemonicToSeed(mnemonic, passphrase)
    const addresses = this.deriveAddressesFromSeed(seed, 1, index, addressType)
    
    return addresses[0]
  }

  /**
   * UTILITY FUNCTIONS
   */

  /**
   * Get Bitcoin payment URI
   */
  static getBitcoinPaymentURI(address: string, amountBTC?: number, label?: string): string {
    let baseURI = `bitcoin:${address}`
    const params: string[] = []
    
    if (amountBTC) {
      params.push(`amount=${amountBTC}`)
    }
    
    if (label) {
      params.push(`label=${encodeURIComponent(label)}`)
    }
    
    if (params.length > 0) {
      baseURI += `?${params.join('&')}`
    }
    
    return baseURI
  }

  /**
   * Parse Bitcoin URI
   */
  static parseBitcoinURI(uri: string): {
    address: string
    amount?: number
    label?: string
    message?: string
  } {
    if (!uri.startsWith('bitcoin:')) {
      throw new Error('Invalid Bitcoin URI format')
    }

    const withoutScheme = uri.substring(8)
    const [address, queryString] = withoutScheme.split('?')
    
    const result: any = { address }
    
    if (queryString) {
      const params = new URLSearchParams(queryString)
      
      if (params.has('amount')) {
        result.amount = parseFloat(params.get('amount')!)
      }
      
      if (params.has('label')) {
        result.label = params.get('label')
      }
      
      if (params.has('message')) {
        result.message = params.get('message')
      }
    }
    
    return result
  }

  /**
   * Check if string is a valid Bitcoin URI
   */
  static isBitcoinURI(uri: string): boolean {
    try {
      this.parseBitcoinURI(uri)
      return true
    } catch {
      return false
    }
  }

  /**
   * Sanitize and validate address input
   */
  static sanitizeAndValidateAddress(address: string): {
    isValid: boolean
    sanitizedAddress: string
    error: string | null
  } {
    if (!address) {
      return {
        isValid: false,
        sanitizedAddress: '',
        error: 'Address is required'
      }
    }

    // Check if it's a Bitcoin URI
    if (this.isBitcoinURI(address)) {
      try {
        const parsed = this.parseBitcoinURI(address)
        const validation = this.validateBitcoinAddress(parsed.address)
        
        return {
          isValid: validation.isValid,
          sanitizedAddress: parsed.address,
          error: validation.error
        }
      } catch (error) {
        return {
          isValid: false,
          sanitizedAddress: address,
          error: error instanceof Error ? error.message : 'Invalid Bitcoin URI'
        }
      }
    }

    // Regular address validation
    const validation = this.validateBitcoinAddress(address)
    
    return {
      isValid: validation.isValid,
      sanitizedAddress: validation.sanitizedAddress || address,
      error: validation.error
    }
  }
}

// Export singleton-style static methods as default
export default AddressService