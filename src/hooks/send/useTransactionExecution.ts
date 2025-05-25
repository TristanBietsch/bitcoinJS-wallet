import { useState, useCallback } from 'react'
import { useTransactionStore } from '@/src/store/transactionStore'
import { TransactionService, TransactionResult } from '@/src/services/transactionService'

interface ExecutionState {
  isExecuting: boolean
  error: string | null
  result: TransactionResult | null
}

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
      const result = await TransactionService.executeTransaction()
      
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
    return TransactionService.getTransactionSummary()
  }, [])
  
  const estimateFee = useCallback(async () => {
    try {
      return await TransactionService.estimateFee()
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