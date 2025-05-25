/**
 * Wallet UTXO Service
 * Handles UTXO fetching, enrichment with derivation paths, and public key derivation
 */

import * as bitcoin from 'bitcoinjs-lib'
import { BIP32Interface } from 'bip32'
import { getUtxos } from '../blockchain'
import { generateRootKeyFromMnemonic, getDerivationPath } from './keyManagementService'
import type { 
  EnhancedUTXO 
} from '../../../types/blockchain.types'
import type { BitcoinWallet } from './bitcoinWalletService'

/**
 * Creates an address-to-derivation-path mapper for a wallet
 */
export function createAddressToPathMapper(wallet: BitcoinWallet, _network: bitcoin.networks.Network): Map<string, { path: string; addressType: 'legacy' | 'segwit' | 'native_segwit'; index: number }> {
  const addressMap = new Map<string, { path: string; addressType: 'legacy' | 'segwit' | 'native_segwit'; index: number }>()
  
  // Map legacy addresses
  wallet.addresses.legacy.forEach((address, index) => {
    const basePath = getDerivationPath('legacy')
    addressMap.set(address, {
      path        : `${basePath}/0/${index}`,
      addressType : 'legacy',
      index
    })
  })
  
  // Map segwit addresses
  wallet.addresses.segwit.forEach((address, index) => {
    const basePath = getDerivationPath('segwit')
    addressMap.set(address, {
      path        : `${basePath}/0/${index}`,
      addressType : 'segwit', 
      index
    })
  })
  
  // Map native segwit addresses
  wallet.addresses.nativeSegwit.forEach((address, index) => {
    const basePath = getDerivationPath('native_segwit')
    addressMap.set(address, {
      path        : `${basePath}/0/${index}`,
      addressType : 'native_segwit',
      index
    })
  })
  
  return addressMap
}

/**
 * Creates a public key deriver function using a root key
 */
export function createPublicKeyDeriver(rootKey: BIP32Interface): (path: string) => Buffer {
  return (path: string): Buffer => {
    try {
      const child = rootKey.derivePath(path)
      return Buffer.from(child.publicKey)
    } catch (error) {
      console.error(`Error deriving public key for path ${path}:`, error)
      throw new Error(`Failed to derive public key for path: ${path}`)
    }
  }
}

/**
 * Fetches UTXOs for all addresses in a wallet and enriches them with derivation information
 */
export async function fetchWalletUtxos(
  wallet: BitcoinWallet,
  mnemonic: string,
  network: bitcoin.networks.Network
): Promise<EnhancedUTXO[]> {
  const allAddresses = [
    ...wallet.addresses.legacy,
    ...wallet.addresses.segwit, 
    ...wallet.addresses.nativeSegwit
  ]
  
  // Create address mapper
  const addressMapper = createAddressToPathMapper(wallet, network)
  
  // Fetch UTXOs for all addresses in parallel
  const utxoPromises = allAddresses.map(async (address) => {
    try {
      const utxos = await getUtxos(address)
      return utxos.map((utxo): EnhancedUTXO => {
        const addressInfo = addressMapper.get(address)
        if (!addressInfo) {
          throw new Error(`Address ${address} not found in wallet mapping`)
        }
        
        return {
          ...utxo,
          address,
          derivationPath : addressInfo.path,
          addressType    : addressInfo.addressType,
          addressIndex   : addressInfo.index
        }
      })
    } catch (error) {
      console.error(`Error fetching UTXOs for address ${address}:`, error)
      return [] // Return empty array for failed addresses
    }
  })
  
  const utxoArrays = await Promise.all(utxoPromises)
  return utxoArrays.flat()
}

/**
 * Enriches UTXOs with public keys for signing
 */
export function enrichUtxosWithPublicKeys(
  utxos: EnhancedUTXO[],
  mnemonic: string,
  network: bitcoin.networks.Network
): Array<EnhancedUTXO & { publicKey: Buffer }> {
  const rootKey = generateRootKeyFromMnemonic(mnemonic, network)
  const derivePublicKey = createPublicKeyDeriver(rootKey)
  
  return utxos.map((utxo) => ({
    ...utxo,
    publicKey : derivePublicKey(utxo.derivationPath)
  }))
}

/**
 * Gets the total balance from enhanced UTXOs
 */
export function calculateBalanceFromEnhancedUtxos(utxos: EnhancedUTXO[]): {
  confirmed: number
  unconfirmed: number 
  total: number
} {
  let confirmed = 0
  let unconfirmed = 0
  
  utxos.forEach((utxo) => {
    if (utxo.status.confirmed) {
      confirmed += utxo.value
    } else {
      unconfirmed += utxo.value
    }
  })
  
  return {
    confirmed,
    unconfirmed,
    total : confirmed + unconfirmed
  }
}

/**
 * Filters UTXOs by confirmation status
 */
export function filterUtxosByConfirmation(
  utxos: EnhancedUTXO[],
  includeUnconfirmed: boolean = true
): EnhancedUTXO[] {
  if (includeUnconfirmed) {
    return utxos
  }
  return utxos.filter(utxo => utxo.status.confirmed)
}

/**
 * Groups UTXOs by address type for analysis
 */
export function groupUtxosByAddressType(utxos: EnhancedUTXO[]): {
  legacy: EnhancedUTXO[]
  segwit: EnhancedUTXO[]
  native_segwit: EnhancedUTXO[]
} {
  const groups = {
    legacy        : [] as EnhancedUTXO[],
    segwit        : [] as EnhancedUTXO[],
    native_segwit : [] as EnhancedUTXO[]
  }
  
  utxos.forEach((utxo) => {
    groups[utxo.addressType].push(utxo)
  })
  
  return groups
} 