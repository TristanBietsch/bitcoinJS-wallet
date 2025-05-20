import { z } from 'zod'
import {
  EsploraUTXO,
  EsploraUTXOSchema,
  EsploraTransaction,
  EsploraTransactionSchema,
  EsploraFeeEstimates,
  EsploraFeeEstimatesSchema,
  FeeRates,
} from '../../types/blockchain.types'
import { ESPLORA_API_BASE_URL } from '../../config/env'
import { fetchWithRetry, FetchRetryError } from '../../utils/network/fetchWithRetry'

/**
 * Fetches Unspent Transaction Outputs (UTXOs) for a given Bitcoin address.
 * @param address - The Bitcoin address to fetch UTXOs for.
 * @returns A promise that resolves to an array of EsploraUTXO objects.
 * @throws FetchRetryError if the API request fails after multiple retries, or ZodError if parsing fails.
 */
export async function getUTXOs(address: string): Promise<EsploraUTXO[]> {
  if (!address) throw new Error('Address is required to fetch UTXOs')
  const url = `${ESPLORA_API_BASE_URL}/address/${address}/utxo`
  try {
    const response = await fetchWithRetry<unknown[]>(url) // Esplora returns an array of UTXOs
    return z.array(EsploraUTXOSchema).parse(response)
  } catch (error) {
    if (error instanceof FetchRetryError) {
      console.error(`FetchRetryError in getUTXOs for ${address}:`, error.message, error.data)
    }
    throw error
  }
}

/**
 * Fetches the transaction history for a given Bitcoin address.
 * @param address - The Bitcoin address.
 * @returns A promise that resolves to an array of EsploraTransaction objects.
 * @throws FetchRetryError or ZodError.
 */
export async function getTransactionHistory(address: string): Promise<EsploraTransaction[]> {
  if (!address) throw new Error('Address is required to fetch transaction history')
  const url = `${ESPLORA_API_BASE_URL}/address/${address}/txs`
  try {
    const response = await fetchWithRetry<unknown[]>(url) // Esplora returns an array of Txs
    return z.array(EsploraTransactionSchema).parse(response)
  } catch (error) {
     if (error instanceof FetchRetryError) {
      console.error(`FetchRetryError in getTransactionHistory for ${address}:`, error.message, error.data)
    }
    throw error
  }
}

/**
 * Fetches current Bitcoin fee estimates from the Esplora API.
 * @returns A promise that resolves to a FeeRates object (slow, normal, fast).
 * @throws FetchRetryError or ZodError.
 */
export async function getFeeEstimates(): Promise<FeeRates> {
  const url = `${ESPLORA_API_BASE_URL}/mempool/fees`
  try {
    const esploraFees = await fetchWithRetry<EsploraFeeEstimates>(url)
    const parsedEsploraFees = EsploraFeeEstimatesSchema.parse(esploraFees)

    const feeRates: FeeRates = {
      fast   : parsedEsploraFees['1'] || parsedEsploraFees['2'] || parsedEsploraFees['3'] || 20,
      normal : parsedEsploraFees['6'] || parsedEsploraFees['3'] || parsedEsploraFees['12'] || 10,
      slow   : parsedEsploraFees['144'] || parsedEsploraFees['72'] || parsedEsploraFees['24'] || 2,
    }
    if (feeRates.fast <= 0 || feeRates.normal <= 0 || feeRates.slow <= 0) {
        console.warn("Invalid fee rates from Esplora, using defaults", feeRates, parsedEsploraFees)
        return { fast: 20, normal: 10, slow: 2 }
    }
    return feeRates
  } catch (error) {
    if (error instanceof FetchRetryError) {
      console.error(`FetchRetryError in getFeeEstimates:`, error.message, error.data)
    }
    console.warn('Failed to fetch fee estimates, returning default rates.', error)
    return { fast: 20, normal: 10, slow: 2 } // Default fallback
  }
}

/**
 * Broadcasts a raw Bitcoin transaction hex to the network via Esplora.
 * @param txHex - The raw transaction hex string.
 * @returns A promise that resolves to the transaction ID (txid) if successful.
 * @throws FetchRetryError if the broadcast fails.
 */
export async function broadcastTransaction(txHex: string): Promise<string> {
  if (!txHex) throw new Error('Transaction hex is required to broadcast')
  const url = `${ESPLORA_API_BASE_URL}/tx`
  try {
    const txid = await fetchWithRetry<string>(url, {
      method            : 'POST',
      headers           : { 'Content-Type': 'text/plain' },
      data              : txHex,
      transformResponse : [ (data) => data ], // Prevent Axios from trying to parse JSON
    })
    if (typeof txid !== 'string' || txid.length !== 64) {
        throw new Error ('Invalid txid received from Esplora after broadcasting transaction')
    }
    return txid
  } catch (error) {
    if (error instanceof FetchRetryError) {
      console.error(`FetchRetryError in broadcastTransaction:`, error.message, error.data)
    }
    throw error
  }
}

/**
 * Fetches detailed information for a specific transaction by its ID.
 * @param txid - The transaction ID.
 * @returns A promise that resolves to an EsploraTransaction object.
 * @throws FetchRetryError or ZodError.
 */
export async function getTransactionDetails(txid: string): Promise<EsploraTransaction> {
  if (!txid) throw new Error('Transaction ID is required to fetch details')
  const url = `${ESPLORA_API_BASE_URL}/tx/${txid}`
  try {
    const response = await fetchWithRetry<unknown>(url)
    return EsploraTransactionSchema.parse(response)
  } catch (error) {
     if (error instanceof FetchRetryError) {
      console.error(`FetchRetryError in getTransactionDetails for ${txid}:`, error.message, error.data)
    }
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