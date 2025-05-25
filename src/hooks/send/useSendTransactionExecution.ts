import { useState, useCallback, useEffect } from 'react'
import { useSendTransactionStore } from '@/src/store/sendTransactionStore'
import { SendTransactionService } from '@/src/services/sendTransactionService'
import type { TransactionResult } from '@/src/services/transactionService'

interface ExecutionState {
  isExecuting: boolean
  error: string | null
  result: TransactionResult | null
}

/**
 * Hook for executing send transactions using the new SendTransactionStore
 * Replaces the old useTransactionExecution hook
 */
export const useSendTransactionExecution = () => {
  const [ executionState, setExecutionState ] = useState<ExecutionState>({
    isExecuting : false,
    error       : null,
    result      : null
  })

  // Get store state and actions
  const sendStore = useSendTransactionStore()

  // Auto-load UTXOs when amount/feeRate changes
  useEffect(() => {
    if (sendStore.derived.amountSats > 0 && sendStore.inputs.feeRate > 0) {
      const loadUtxos = async () => {
        try {
          await SendTransactionService.loadUtxosAndCalculateFees()
        } catch (error) {
          console.error('Failed to load UTXOs:', error)
        }
      }
      
      // Debounce UTXO loading
      const timeoutId = setTimeout(loadUtxos, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [ sendStore.derived.amountSats, sendStore.inputs.feeRate ])

  /**
   * Execute the complete transaction flow
   */
  const executeTransaction = useCallback(async (): Promise<TransactionResult | null> => {
    setExecutionState({ isExecuting: true, error: null, result: null })

    try {
      // Validate before execution
      const validation = SendTransactionService.validateForExecution()
      if (!validation.isValid) {
        throw new Error(`Transaction validation failed: ${validation.errors.join(', ')}`)
      }

      console.log('🚀 Starting transaction execution...')
      
      // Execute transaction using the service
      const result = await SendTransactionService.executeTransaction()
      
      setExecutionState({ isExecuting: false, error: null, result })
      
      // Reset the transaction store after successful execution
      setTimeout(() => {
        SendTransactionService.reset()
      }, 1000) // Small delay to let UI show success
      
      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed'
      
      console.error('Transaction execution failed:', errorMessage)
      
      setExecutionState({ isExecuting: false, error: errorMessage, result: null })
      
      return null
    }
  }, [ ])

  /**
   * Get transaction summary for display
   */
  const getTransactionSummary = useCallback(() => {
    return SendTransactionService.getTransactionSummary()
  }, [ ])

  /**
   * Reset execution state
   */
  const resetExecution = useCallback(() => {
    setExecutionState({ isExecuting: false, error: null, result: null })
  }, [ ])

  /**
   * Get current validation status
   */
  const getValidationStatus = useCallback(() => {
    return SendTransactionService.validateForExecution()
  }, [ sendStore ])

  return {
    // Execution state
    isExecuting    : executionState.isExecuting,
    executionError : executionState.error,
    result         : executionState.result,

    // Store state (pass-through for convenience)
    transaction : sendStore.inputs,
    derivedData : sendStore.derived,
    utxoData    : sendStore.utxos,
    meta        : sendStore.meta,

    // Computed state
    isValidTransaction : sendStore.isValidTransaction(),
    canBroadcast       : sendStore.canBroadcast(),
    
    // Actions
    executeTransaction,
    getTransactionSummary,
    getValidationStatus,
    resetExecution,

    // Store actions (pass-through)
    setRecipientAddress : sendStore.setRecipientAddress,
    setAmount           : sendStore.setAmount,
    setCurrency         : sendStore.setCurrency,
    setFeeRate          : sendStore.setFeeRate,
    validateTransaction : sendStore.validateTransaction,
    reset               : sendStore.reset,
    resetErrors         : sendStore.resetErrors
  }
} 