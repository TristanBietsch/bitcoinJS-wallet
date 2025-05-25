import { useState, useCallback } from 'react'
import { useTransactionStore } from '@/src/store/transactionStore'
import { SendTransactionService } from '@/src/services/sendTransactionService'
import type { TransactionResult } from '@/src/types/transaction.types'

interface ExecutionState {
  isExecuting: boolean
  error: string | null
  result: TransactionResult | null
}

/**
 * Legacy compatibility layer for the old useTransactionExecution hook
 * This provides the same interface but uses the new SendTransactionService underneath
 * @deprecated Use useSendTransactionExecution for new code
 */
export const useTransactionExecution = () => {
  const [ state, setState ] = useState<ExecutionState>({
    isExecuting : false,
    error       : null,
    result      : null
  })
  
  const transactionStore = useTransactionStore()
  
  const executeTransaction = useCallback(async (): Promise<TransactionResult | null> => {
    setState({ isExecuting: true, error: null, result: null })
    
    try {
      const result = await SendTransactionService.executeTransaction()
      
      setState({ isExecuting: false, error: null, result })
      
      // Reset the transaction store after successful execution
      transactionStore.reset()
      
      return result
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed'
      
      setState({ isExecuting: false, error: errorMessage, result: null })
      
      return null
    }
  }, [ transactionStore ])
  
  const getTransactionSummary = useCallback(() => {
    return SendTransactionService.getTransactionSummary()
  }, [])
  
  const estimateFee = useCallback(async () => {
    try {
      // For compatibility, return the estimated fee from the new store
      const sendStore = SendTransactionService.getTransactionSummary()
      return sendStore.fee
    } catch (error) {
      console.error('Fee estimation failed:', error)
      return 0
    }
  }, [])
  
  const reset = useCallback(() => {
    setState({ isExecuting: false, error: null, result: null })
  }, [])
  
  return {
    ...state,
    executeTransaction,
    getTransactionSummary,
    estimateFee,
    reset,
    
    // Transaction store methods
    isValid             : transactionStore.isValid,
    getValidationErrors : transactionStore.getValidationErrors,
    transaction         : transactionStore.transaction,
    feeRates            : transactionStore.feeRates,
    isLoadingFees       : transactionStore.isLoadingFees
  }
} 