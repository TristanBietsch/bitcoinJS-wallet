import { broadcastTx as broadcastViaBlockchainService } from './blockchain' // Assuming blockchain.ts is in the same directory
// import type { FetchRetryError } from '../../utils/network/fetchWithRetry' // Removed as not currently used for specific instance checking

/**
 * Broadcasts a signed Bitcoin transaction hex to the network via the Esplora API.
 * This service acts as a dedicated wrapper for broadcasting functionality.
 *
 * @param txHex - The raw signed transaction hex string.
 * @returns A promise that resolves to the transaction ID (txid) if successful.
 * @throws Errors if the broadcast fails (propagated from blockchainService).
 */
export async function broadcastTx(txHex: string): Promise<string> {
  if (!txHex || typeof txHex !== 'string' || txHex.length === 0) {
    throw new Error('Transaction hex is required to broadcast and must be a non-empty string.')
  }

  try {
    // Delegate to the existing broadcastTransaction function in blockchain.ts
    const txid = await broadcastViaBlockchainService(txHex)
    return txid
  } catch (error) {
    // Log or handle specific broadcast errors if needed, otherwise re-throw
    console.error('Error in broadcast.ts while broadcasting tx:', error instanceof Error ? error.message : String(error))
    // Example of more specific error handling if FetchRetryError is caught:
    // if (error instanceof FetchRetryError) {
    //   // Handle FetchRetryError specifically
    // }
    throw error // Re-throw the original error to be handled by the caller
  }
} 