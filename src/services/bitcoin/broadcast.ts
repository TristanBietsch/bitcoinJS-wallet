import { broadcastTx as broadcastViaBlockchainService } from './blockchain' // Assuming blockchain.ts is in the same directory
import { validateTransactionHex, logTransactionAnalysis } from '@/src/utils/bitcoin/transactionValidator'
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

  // Validate transaction before attempting broadcast
  console.log('🔍 [Broadcast] Validating transaction before broadcast...')
  const validation = validateTransactionHex(txHex)
  
  if (!validation.isValid) {
    console.error('❌ [Broadcast] Transaction validation failed:', validation.errors)
    logTransactionAnalysis(txHex)
    throw new Error(`Transaction validation failed: ${validation.errors.join(', ')}`)
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ [Broadcast] Transaction warnings:', validation.warnings)
  }

  logTransactionAnalysis(txHex)

  try {
    // Delegate to the existing broadcastTransaction function in blockchain.ts
    console.log('📡 [Broadcast] Attempting to broadcast transaction...')
    const txid = await broadcastViaBlockchainService(txHex)
    console.log('✅ [Broadcast] Transaction broadcast successful:', txid)
    return txid
  } catch (error) {
    // Log or handle specific broadcast errors if needed, otherwise re-throw
    console.error('❌ [Broadcast] Error while broadcasting transaction:', error instanceof Error ? error.message : String(error))
    
    // Provide more context about the transaction that failed
    console.error('❌ [Broadcast] Failed transaction details:')
    console.error(`   - Hex: ${txHex.substring(0, 40)}...`)
    console.error(`   - Length: ${txHex.length} chars (${txHex.length / 2} bytes)`)
    
    // Example of more specific error handling if FetchRetryError is caught:
    // if (error instanceof FetchRetryError) {
    //   // Handle FetchRetryError specifically
    // }
    throw error // Re-throw the original error to be handled by the caller
  }
} 