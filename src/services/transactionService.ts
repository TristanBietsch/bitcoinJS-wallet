import { SendTransactionService } from '@/src/services/sendTransactionService'
import type { TransactionResult } from '@/src/types/transaction.types'

// Re-export the TransactionResult type for backward compatibility
export type { TransactionResult }

/**
 * Legacy compatibility layer for the old TransactionService
 * This provides the same interface but uses the new SendTransactionService underneath
 * @deprecated Use SendTransactionService directly for new code
 */
export class TransactionService {
  
  /**
   * Execute a complete transaction from current store state
   */
  static async executeTransaction(): Promise<TransactionResult> {
    return SendTransactionService.executeTransaction()
  }
  
  /**
   * Estimate fee for current transaction
   */
  static async estimateFee(): Promise<number> {
    try {
      const summary = SendTransactionService.getTransactionSummary()
      return summary.fee
    } catch (error) {
      console.error('Fee estimation failed:', error)
      return 0
    }
  }
  
  /**
   * Prepare transaction data for display
   */
  static getTransactionSummary() {
    const summary = SendTransactionService.getTransactionSummary()
    
    // Convert to legacy format
    return {
      recipientAddress : summary.recipient,
      amount           : summary.amount,
      fee              : summary.fee,
      feeRate          : 10, // Default fee rate for compatibility
      total            : summary.total,
      currency         : summary.currency,
      speed            : 'standard' as const // Default speed for compatibility
    }
  }
} 