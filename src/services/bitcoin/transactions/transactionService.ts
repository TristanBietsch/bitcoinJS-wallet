/**
 * Bitcoin Transaction Service
 * 
 * Provides transaction-related functionality and helper methods
 */

import { BitcoinTransaction } from '@/src/types/api'
import { listTransactions } from '../wallet/walletService'

/**
 * Get transaction history
 */
export async function getTransactionHistory(
  count: number = 20,
  skip: number = 0
): Promise<BitcoinTransaction[]> {
  try {
    const transactions = await listTransactions(count, skip)
    
    // Sort transactions by time, most recent first
    return transactions.sort((a, b) => b.time - a.time)
  } catch (error) {
    console.error('Failed to get transaction history:', error)
    return []
  }
}
