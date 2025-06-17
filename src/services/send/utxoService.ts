import { BitcoinWallet } from '@/src/services/bitcoin/wallet/bitcoinWalletService'
import { EnhancedUTXO } from '@/src/types/blockchain.types'
import { getUtxos } from '@/src/services/bitcoin/blockchain'
import { selectUtxosEnhanced } from '@/src/utils/bitcoin/utxo'
import { estimateTransactionSize } from '@/src/services/bitcoin/feeEstimationService'
import { generateRootKeyFromMnemonic } from '@/src/services/bitcoin/wallet/keyManagementService'
import { bitcoinjsNetwork } from '@/src/config/env'
import { UTXOSelection } from './types'

// Extended UTXO type with public key
interface UTXOWithKey extends EnhancedUTXO {
  publicKey: Buffer
}

/**
 * Unified UTXO Service - Single source of truth for UTXO operations
 * Replaces scattered UTXO logic across multiple files
 */
export class UTXOService {
  
  /**
   * Fetch and enrich UTXOs for a wallet
   */
  static async fetchWalletUTXOs(
    wallet: BitcoinWallet,
    mnemonic: string
  ): Promise<UTXOWithKey[]> {
    const allAddresses = [
      ...wallet.addresses.legacy,
      ...wallet.addresses.segwit,
      ...wallet.addresses.nativeSegwit
    ]

    // Create address to derivation path mapping
    const addressMapper = this.createAddressMapper(wallet)
    
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
        return []
      }
    })

    const utxoArrays = await Promise.all(utxoPromises)
    const allUtxos = utxoArrays.flat()

    // Enrich with public keys and derivation info
    return this.enrichWithKeys(allUtxos, mnemonic)
  }

  /**
   * Select UTXOs for a transaction
   */
  static selectUTXOs(
    utxos: UTXOWithKey[],
    targetAmount: number,
    feeRate: number
  ): UTXOSelection | null {
    // Filter confirmed UTXOs only
    const confirmedUtxos = utxos.filter(utxo => utxo.status.confirmed)
    
    if (confirmedUtxos.length === 0) {
      return null
    }

    // Use existing selection algorithm
    const selection = selectUtxosEnhanced(
      confirmedUtxos,
      targetAmount,
      feeRate,
      {
        preferAddressType  : 'native_segwit',
        includeUnconfirmed : false,
        minimizeInputs     : true
      }
    )

    if (!selection) {
      return null
    }

    // Calculate transaction size
    const inputTypes = selection.selectedUtxos.map(utxo => utxo.addressType)
    const estimatedSize = estimateTransactionSize(
      selection.selectedUtxos.length,
      1, // recipient output
      inputTypes,
      selection.changeAmount > 0 // has change
    )

    return {
      selectedUtxos : selection.selectedUtxos,
      totalInput    : selection.selectedUtxos.reduce((sum, utxo) => sum + utxo.value, 0),
      changeAmount  : selection.changeAmount,
      totalFee      : selection.totalFee,
      estimatedSize
    }
  }

  /**
   * Create address to derivation path mapper
   */
  private static createAddressMapper(wallet: BitcoinWallet): Map<string, {
    path: string
    addressType: 'legacy' | 'segwit' | 'native_segwit'
    index: number
  }> {
    const mapper = new Map()
    
    // Map legacy addresses
    wallet.addresses.legacy.forEach((address, index) => {
      mapper.set(address, {
        path        : `m/44'/0'/0'/0/${index}`,
        addressType : 'legacy' as const,
        index
      })
    })
    
    // Map segwit addresses
    wallet.addresses.segwit.forEach((address, index) => {
      mapper.set(address, {
        path        : `m/49'/0'/0'/0/${index}`,
        addressType : 'segwit' as const,
        index
      })
    })
    
    // Map native segwit addresses
    wallet.addresses.nativeSegwit.forEach((address, index) => {
      mapper.set(address, {
        path        : `m/84'/0'/0'/0/${index}`,
        addressType : 'native_segwit' as const,
        index
      })
    })
    
    return mapper
  }

  /**
   * Enrich UTXOs with public keys and derivation paths
   */
  private static enrichWithKeys(
    utxos: EnhancedUTXO[],
    mnemonic: string
  ): UTXOWithKey[] {
    const rootKey = generateRootKeyFromMnemonic(mnemonic, bitcoinjsNetwork)
    
    return utxos.map(utxo => {
      if (!utxo.derivationPath) {
        console.warn(`UTXO ${utxo.txid}:${utxo.vout} missing derivation path`)
        // Return with empty public key for failed derivations
        return {
          ...utxo,
          publicKey : Buffer.alloc(33)
        }
      }

      try {
        // Derive the key for this UTXO
        const child = rootKey.derivePath(utxo.derivationPath)
        
        return {
          ...utxo,
          publicKey : Buffer.from(child.publicKey)
        }
      } catch (error) {
        console.error(`Error deriving key for UTXO ${utxo.txid}:${utxo.vout}:`, error)
        // Return with empty public key for failed derivations
        return {
          ...utxo,
          publicKey : Buffer.alloc(33)
        }
      }
    })
  }
} 