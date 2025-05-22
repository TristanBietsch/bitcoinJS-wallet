import { z } from 'zod'
import axios from 'axios'
import type {
  EsploraUTXO,
  EsploraTransaction,
  EsploraFeeEstimates,
  FeeRates,
} from '@/src/types/blockchain.types'
import {
  EsploraUTXOSchema,
  EsploraTransactionSchema,
  EsploraFeeEstimatesSchema
} from '@/src/types/blockchain.types'
import { ESPLORA_API_BASE_URL } from '@/src/config/env'

/**
 * Fetches Unspent Transaction Outputs (UTXOs) for a given Bitcoin address.
 * @param address - The Bitcoin address to fetch UTXOs for.
 * @returns A promise that resolves to an array of EsploraUTXO objects.
 * @throws AxiosError if the API request fails, or ZodError if parsing fails.
 */
export async function getUtxos(address: string): Promise<EsploraUTXO[]> {
  if (!address) throw new Error('Address is required to fetch UTXOs')
  const url = `${ESPLORA_API_BASE_URL}/address/${address}/utxo`
  try {
    const response = await axios.get<unknown[]>(url) // Esplora returns an array of UTXOs
    return z.array(EsploraUTXOSchema).parse(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`AxiosError in getUtxos for ${address}:`, error.message, error.response?.data)
    } else {
      console.error(`Error in getUtxos for ${address}:`, error)
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

/**
 * Fetches the balance for a given Bitcoin address.
 * @param address - The Bitcoin address.
 * @returns A promise that resolves to the balance in satoshis.
 * @throws AxiosError or ZodError if fetching UTXOs fails.
 */
export async function getBalance(address: string): Promise<number> {
  if (!address) throw new Error('Address is required to fetch balance')
  const utxos = await getUtxos(address)
  return calculateWalletBalance(utxos)
}

/**
 * Fetches the transaction history for a given Bitcoin address.
 * @param address - The Bitcoin address.
 * @returns A promise that resolves to an array of EsploraTransaction objects.
 * @throws AxiosError or ZodError.
 */
export async function getTxs(address: string): Promise<EsploraTransaction[]> {
  if (!address) throw new Error('Address is required to fetch transaction history')
  const url = `${ESPLORA_API_BASE_URL}/address/${address}/txs`
  try {
    const response = await axios.get<unknown[]>(url) // Esplora returns an array of Txs
    return z.array(EsploraTransactionSchema).parse(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`AxiosError in getTxs for ${address}:`, error.message, error.response?.data)
    } else {
      console.error(`Error in getTxs for ${address}:`, error)
    }
    throw error
  }
}

/**
 * Fetches current Bitcoin fee estimates from the Esplora API.
 * @returns A promise that resolves to a FeeRates object (slow, normal, fast).
 * @throws AxiosError or ZodError.
 */
export async function getFeeEstimates(): Promise<FeeRates> {
  const url = `${ESPLORA_API_BASE_URL}/mempool/fees`
  try {
    const response = await axios.get<EsploraFeeEstimates>(url)
    const parsedEsploraFees = EsploraFeeEstimatesSchema.parse(response.data)

    const feeRates: FeeRates = {
      fast   : parsedEsploraFees['1'] || parsedEsploraFees['2'] || parsedEsploraFees['3'] || 20,
      normal : parsedEsploraFees['6'] || parsedEsploraFees['3'] || parsedEsploraFees['10'] || parsedEsploraFees['12'] || 10,
      slow   : parsedEsploraFees['144'] || parsedEsploraFees['72'] || parsedEsploraFees['200'] || parsedEsploraFees['24'] || 2,
    }
    if (feeRates.fast <= 0 || feeRates.normal <= 0 || feeRates.slow <= 0) {
        console.warn("Invalid fee rates from Esplora, using defaults", feeRates, parsedEsploraFees)
        return { fast: 20, normal: 10, slow: 2 }
    }
    return feeRates
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`AxiosError in getFeeEstimates:`, error.message, error.response?.data)
    } else {
      console.error(`Error in getFeeEstimates:`, error)
    }
    console.warn('Failed to fetch fee estimates, returning default rates.', error)
    return { fast: 20, normal: 10, slow: 2 } // Default fallback
  }
}

/**
 * Broadcasts a raw Bitcoin transaction hex to the network via Esplora.
 * @param txHex - The raw transaction hex string.
 * @returns A promise that resolves to the transaction ID (txid) if successful.
 * @throws AxiosError if the broadcast fails.
 */
export async function broadcastTx(txHex: string): Promise<string> {
  if (!txHex) throw new Error('Transaction hex is required to broadcast')
  const url = `${ESPLORA_API_BASE_URL}/tx`
  try {
    const response = await axios.post<string>(url, txHex, {
      headers : { 'Content-Type': 'text/plain' },
    })
    const txid = response.data
    if (typeof txid !== 'string' || txid.length !== 64) {
        throw new Error ('Invalid txid received from Esplora after broadcasting transaction')
    }
    return txid
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`AxiosError in broadcastTx:`, error.message, error.response?.data)
    } else {
      console.error(`Error in broadcastTx:`, error)
    }
    throw error
  }
}

/**
 * Fetches detailed information for a specific transaction by its ID.
 * @param txid - The transaction ID.
 * @returns A promise that resolves to an EsploraTransaction object.
 * @throws AxiosError or ZodError.
 */
export async function getTransactionDetails(txid: string): Promise<EsploraTransaction> {
  if (!txid) throw new Error('Transaction ID is required to fetch details')
  const url = `${ESPLORA_API_BASE_URL}/tx/${txid}`
  try {
    const response = await axios.get<unknown>(url)
    return EsploraTransactionSchema.parse(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`AxiosError in getTransactionDetails for ${txid}:`, error.message, error.response?.data)
    } else {
      console.error(`Error in getTransactionDetails for ${txid}:`, error)
    }
    throw error
  }
} 