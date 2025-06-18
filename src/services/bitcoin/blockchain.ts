import { z } from 'zod'
import { BitcoinAPIClient } from '@/src/services/api/bitcoinClient'
import type {
  EsploraUTXO,
  EsploraTransaction,
  FeeRates,
} from '@/src/types/blockchain.types'
import {
  EsploraUTXOSchema,
  EsploraTransactionSchema
} from '@/src/types/blockchain.types'

/**
 * Fetches Unspent Transaction Outputs (UTXOs) for a given Bitcoin address.
 * Uses optimized client with predictive loading and aggressive caching.
 * Will return stale data if all endpoints fail.
 * @param address - The Bitcoin address to fetch UTXOs for.
 * @returns A promise that resolves to an array of EsploraUTXO objects.
 */
export async function getUtxos(address: string): Promise<EsploraUTXO[]> {
  if (!address) throw new Error('Address is required to fetch UTXOs')
  try {
    // Use simplified Bitcoin API client
    const data = await BitcoinAPIClient.getUtxos(address)
    return z.array(EsploraUTXOSchema).parse(data)
  } catch (error) {
    console.error(`Error in getUtxos for ${address}:`, error)
    throw error
  }
}

/**
 * Calculates the total wallet balance from an array of UTXOs.
 * @param utxos - An array of EsploraUTXO objects.
 * @returns The total balance in satoshis.
 */
export function calculateWalletBalance(utxos: EsploraUTXO[]): number {
  if (!utxos) return 0
  return utxos.reduce((acc, utxo) => acc + utxo.value, 0)
}

/**
 * Fetches the balance for a given Bitcoin address.
 * Uses cached UTXO data for instant response.
 * @param address - The Bitcoin address.
 * @returns A promise that resolves to the balance in satoshis.
 */
export async function getBalance(address: string): Promise<number> {
  if (!address) throw new Error('Address is required to fetch balance')
  const utxos = await getUtxos(address)
  return calculateWalletBalance(utxos)
}

/**
 * Fetches the transaction history for a given Bitcoin address.
 * Uses optimized client with 10-minute cache and stale fallback.
 * @param address - The Bitcoin address.
 * @returns A promise that resolves to an array of EsploraTransaction objects.
 */
export async function getTxs(address: string): Promise<EsploraTransaction[]> {
  if (!address) throw new Error('Address is required to fetch transaction history')
  try {
    // Use simplified Bitcoin API client
    const data = await BitcoinAPIClient.getTransactions(address)
    return z.array(EsploraTransactionSchema).parse(data)
  } catch (error) {
    console.error(`Error in getTxs for ${address}:`, error)
    throw error
  }
}

/**
 * Fetches current Bitcoin fee estimates from the Mempool API.
 * Uses optimized client with fallback to safe defaults.
 * @returns A promise that resolves to a FeeRates object (slow, normal, fast).
 */
export async function getFeeEstimates(): Promise<FeeRates> {
  // Debug network configuration
  const { BITCOIN_NETWORK, IS_TESTNET } = require('@/src/config/bitcoinNetwork')
  console.log(`🌐 [BlockchainService] getFeeEstimates for ${BITCOIN_NETWORK} (testnet: ${IS_TESTNET})`)
  
  try {
    // Use simplified Bitcoin API client
    console.log('🔗 [BlockchainService] Requesting fee estimates from BitcoinAPIClient...')
    const data = await BitcoinAPIClient.getFeeEstimates()
    console.log('📡 [BlockchainService] Raw API response:', data)
    
    // BitcoinAPIClient now returns normalized Mempool format
    console.log('✅ [BlockchainService] Received normalized fee data:', data)

    const feeRates: FeeRates = {
      fast   : data.fastestFee || data.halfHourFee || 20,
      normal : data.halfHourFee || data.hourFee || 10, 
      slow   : data.hourFee || data.economyFee || 2,
    }
    
    console.log('📊 [BlockchainService] Final fee rates:', feeRates)
    
    if (feeRates.fast <= 0 || feeRates.normal <= 0 || feeRates.slow <= 0) {
        console.warn("Invalid fee rates from Bitcoin API, using defaults", feeRates, data)
        return { fast: 20, normal: 10, slow: 2 }
    }
    return feeRates
  } catch (error) {
    console.error(`Error in getFeeEstimates:`, error)
    console.warn('Failed to fetch fee estimates, returning network-specific defaults.', error)
    
    // Import network config for appropriate fallbacks
    const { IS_TESTNET } = require('@/src/config/bitcoinNetwork')
    
    if (IS_TESTNET) {
      return { fast: 2, normal: 1, slow: 1 } // Testnet fallback rates
    } else {
      return { fast: 20, normal: 10, slow: 2 } // Mainnet fallback rates  
    }
  }
}

/**
 * Broadcasts a raw Bitcoin transaction hex to the network via Esplora.
 * Tries all available endpoints for maximum reliability.
 * @param txHex - The raw transaction hex string.
 * @returns A promise that resolves to the transaction ID (txid) if successful.
 */
export async function broadcastTx(txHex: string): Promise<string> {
  if (!txHex) throw new Error('Transaction hex is required to broadcast')
  try {
    // Use simplified Bitcoin API client
    const txid = await BitcoinAPIClient.broadcastTransaction(txHex)
    if (typeof txid !== 'string' || txid.length !== 64) {
        throw new Error ('Invalid txid received from broadcast')
    }
    console.log(`Transaction broadcast successful: ${txid}`)
    return txid
  } catch (error) {
    console.error(`Transaction broadcast failed:`, error)
    throw error
  }
}

/**
 * Fetches detailed information for a specific transaction by its ID.
 * Uses 1-hour cache since transaction details are immutable.
 * @param txid - The transaction ID.
 * @returns A promise that resolves to an EsploraTransaction object.
 */
export async function getTransactionDetails(txid: string): Promise<EsploraTransaction> {
  if (!txid) throw new Error('Transaction ID is required to fetch details')
  try {
    // Use simplified Bitcoin API client
    const data = await BitcoinAPIClient.getTransactionDetails(txid)
    return EsploraTransactionSchema.parse(data)
  } catch (error) {
    console.error(`Error in getTransactionDetails for ${txid}:`, error)
    throw error
  }
}

/**
 * Note: Cache management is now handled by React Query
 * These functions were removed as they're no longer needed with BitcoinAPIClient
 * 
 * For cache warming, use React Query's prefetchQuery
 * For cache clearing, use React Query's invalidateQueries
 * For health monitoring, check individual endpoint responses
 */ 