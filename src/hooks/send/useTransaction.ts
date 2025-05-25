/**
 * Unified Transaction Hook
 * Single source of truth for all transaction operations
 * Consolidates functionality from multiple hooks into a clean, modular interface
 */

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'expo-router'
import { useSendStore } from '@/src/store/sendStore'
import { useSendTransactionStore } from '@/src/store/sendTransactionStore'
import { SendTransactionService } from '@/src/services/sendTransactionService'
import { validateBitcoinAddress } from '@/src/services/bitcoin/addressValidationService'
import { convertUIToBitcoinParams } from '@/src/utils/send/transactionParams'
import type { TransactionResult } from '@/src/types/transaction.types'
import type { SendBTCError } from '@/src/types/errors.types'
import {
  createInsufficientFundsError,
  createAddressValidationError,
  createTransactionError,
  createNetworkError,
  shouldShowRetryButton
} from '@/src/types/errors.types'

// Transaction states
export type TransactionState = 'idle' | 'validating' | 'building' | 'signing' | 'broadcasting' | 'success' | 'error'

// Transaction stages for progress tracking
export type TransactionStage = {
  stage: TransactionState
  progress: number
  message: string
}

// Main transaction hook interface
export interface UseTransactionReturn {
  // State
  state: {
    status: TransactionState
    progress: number
    message: string
    error: SendBTCError | null
    canRetry: boolean
    isLoading: boolean
    transactionId?: string
  }
  
  // Core actions
  actions: {
    // Transaction lifecycle
    validateTransaction: () => Promise<boolean>
    buildTransaction: () => Promise<void>
    executeTransaction: () => Promise<TransactionResult | null>
    
    // Navigation
    navigateToError: (error: SendBTCError) => void
    navigateToSuccess: (txid: string) => void
    
    // State management
    reset: () => void
    retry: () => Promise<void>
  }
  
  // Validation utilities
  validation: {
    validateAddress: (address: string) => { isValid: boolean; error?: string }
    validateAmount: (amount: number) => { isValid: boolean; error?: string }
    validateFeeRate: (feeRate: number) => { isValid: boolean; error?: string }
    isTransactionReady: () => boolean
  }
  
  // Fee utilities
  fees: {
    loadUtxosAndCalculateFees: () => Promise<void>
    getEstimatedFee: () => number
    getFeeRate: () => number
  }
}

/**
 * Unified transaction hook - single source of truth for all transaction operations
 */
export function useTransaction(): UseTransactionReturn {
  const router = useRouter()
  const sendStore = useSendStore()
  const sendTransactionStore = useSendTransactionStore()
  
  // Processing lock to prevent double execution
  const isProcessingRef = useRef(false)
  
  // Transaction state
  const [ state, setState ] = useState<UseTransactionReturn['state']>({
    status        : 'idle',
    progress      : 0,
    message       : '',
    error         : null,
    canRetry      : false,
    isLoading     : false,
    transactionId : undefined
  })
  
  // Update state helper
  const updateState = useCallback((updates: Partial<UseTransactionReturn['state']>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])
  
  // Map errors to SendBTCError types
  const mapErrorToSendBTCError = useCallback((error: Error): SendBTCError => {
    const errorMessage = error.message.toLowerCase()
    
    if (errorMessage.includes('insufficient funds') || 
        errorMessage.includes('not enough') || 
        errorMessage.includes('balance')) {
      return createInsufficientFundsError(0, 0, { confirmed: 0, unconfirmed: 0 })
    } else if (errorMessage.includes('network') || 
               errorMessage.includes('connection') || 
               errorMessage.includes('timeout') ||
               errorMessage.includes('broadcast failed')) {
      return createNetworkError('NETWORK_TIMEOUT', { endpoint: 'unknown' })
    } else if (errorMessage.includes('invalid address') ||
               errorMessage.includes('address')) {
      return createAddressValidationError('unknown', 'INVALID_ADDRESS')
    } else {
      return createTransactionError('TRANSACTION_BUILD_FAILED', 'build')
    }
  }, [])
  
  // Validation utilities
  const validation: UseTransactionReturn['validation'] = {
    validateAddress : useCallback((address: string) => {
      if (!address) {
        return { isValid: false, error: 'Address is required' }
      }
      
      const validation = validateBitcoinAddress(address)
      if (!validation.isValid) {
        return { isValid: false, error: validation.error || 'Invalid address' }
      }
      
      return { isValid: true }
    }, []),
    
    validateAmount : useCallback((amount: number) => {
      if (!amount || amount <= 0) {
        return { isValid: false, error: 'Amount must be greater than 0' }
      }
      
      if (amount < 546) { // Dust limit
        return { isValid: false, error: 'Amount is below dust limit (546 sats)' }
      }
      
      return { isValid: true }
    }, []),
    
    validateFeeRate : useCallback((feeRate: number) => {
      if (!feeRate || feeRate <= 0) {
        return { isValid: false, error: 'Fee rate must be greater than 0' }
      }
      
      if (feeRate > 1000) { // Sanity check
        return { isValid: false, error: 'Fee rate is unusually high' }
      }
      
      return { isValid: true }
    }, []),
    
    isTransactionReady : useCallback(() => {
      const storeState = sendStore
      const txStore = sendTransactionStore
      
      // Check basic requirements
      if (!storeState.address || !storeState.amount) return false
      
      // Validate using store's validation
      return txStore.isValidTransaction()
    }, [])
  }
  
  // Fee utilities
  const fees: UseTransactionReturn['fees'] = {
    loadUtxosAndCalculateFees : useCallback(async () => {
      updateState({ isLoading: true, message: 'Loading wallet data...' })
      
      try {
        await SendTransactionService.loadUtxosAndCalculateFees()
        updateState({ isLoading: false, message: '' })
      } catch (error) {
        const sendError = error instanceof Error ? mapErrorToSendBTCError(error) : createTransactionError('TRANSACTION_BUILD_FAILED', 'build')
        updateState({ 
          isLoading : false, 
          error     : sendError,
          status    : 'error',
          canRetry  : true
        })
        throw error
      }
    }, [ updateState, mapErrorToSendBTCError ]),
    
    getEstimatedFee : useCallback(() => {
      return sendTransactionStore.derived.estimatedFee
    }, []),
    
    getFeeRate : useCallback(() => {
      const params = convertUIToBitcoinParams()
      return params.feeRate
    }, [])
  }
  
  // Core actions
  const validateTransaction = useCallback(async (): Promise<boolean> => {
    updateState({ 
      status    : 'validating', 
      progress  : 10, 
      message   : 'Validating transaction...',
      isLoading : true 
    })
    
    try {
      const validation = SendTransactionService.validateForExecution()
      
      if (!validation.isValid) {
        const error = createTransactionError('TRANSACTION_BUILD_FAILED', 'build')
        updateState({ 
          status    : 'error', 
          error, 
          message   : validation.errors.join(', '),
          isLoading : false,
          canRetry  : true
        })
        return false
      }
      
      updateState({ 
        status    : 'idle', 
        progress  : 20, 
        message   : 'Validation complete',
        isLoading : false 
      })
      return true
    } catch (error) {
      const sendError = error instanceof Error ? mapErrorToSendBTCError(error) : createTransactionError('TRANSACTION_BUILD_FAILED', 'build')
      updateState({ 
        status    : 'error', 
        error     : sendError,
        isLoading : false,
        canRetry  : true
      })
      return false
    }
  }, [ updateState, mapErrorToSendBTCError ])
  
  const buildTransaction = useCallback(async (): Promise<void> => {
    updateState({ 
      status    : 'building', 
      progress  : 40, 
      message   : 'Building transaction...',
      isLoading : true 
    })
    
    try {
      // Transaction building is handled internally by executeTransaction
      updateState({ 
        status    : 'idle', 
        progress  : 60, 
        message   : 'Transaction ready',
        isLoading : false 
      })
    } catch (error) {
      const sendError = error instanceof Error ? mapErrorToSendBTCError(error) : createTransactionError('TRANSACTION_BUILD_FAILED', 'build')
      updateState({ 
        status    : 'error', 
        error     : sendError,
        isLoading : false,
        canRetry  : true
      })
      throw error
    }
  }, [ updateState, mapErrorToSendBTCError ])
  
  const executeTransaction = useCallback(async (): Promise<TransactionResult | null> => {
    if (isProcessingRef.current) {
      console.log('Transaction already in progress')
      return null
    }
    
    isProcessingRef.current = true
    
    try {
      // Validate first
      const isValid = await validateTransaction()
      if (!isValid) return null
      
      // Update state for signing
      updateState({ 
        status    : 'signing', 
        progress  : 70, 
        message   : 'Signing transaction...',
        isLoading : true 
      })
      
      // Execute transaction
      const result = await SendTransactionService.executeTransaction()
      
      // Update state for broadcasting
      updateState({ 
        status        : 'broadcasting', 
        progress      : 90, 
        message       : 'Broadcasting transaction...',
        transactionId : result.txid
      })
      
      // Success
      updateState({ 
        status        : 'success', 
        progress      : 100, 
        message       : 'Transaction sent!',
        isLoading     : false,
        transactionId : result.txid
      })
      
      return result
    } catch (error) {
      console.error('Transaction execution failed:', error)
      const sendError = error instanceof Error ? mapErrorToSendBTCError(error) : createTransactionError('TRANSACTION_BUILD_FAILED', 'broadcast')
      updateState({ 
        status    : 'error', 
        error     : sendError,
        isLoading : false,
        canRetry  : shouldShowRetryButton(sendError)
      })
      return null
    } finally {
      isProcessingRef.current = false
    }
  }, [ validateTransaction, updateState, mapErrorToSendBTCError ])
  
  const navigateToError = useCallback((error: SendBTCError) => {
    updateState({ 
      status   : 'error', 
      error,
      canRetry : shouldShowRetryButton(error)
    })
    router.replace('/send/error' as any)
  }, [ router, updateState ])
  
  const navigateToSuccess = useCallback((txid: string) => {
    updateState({ 
      status        : 'success',
      transactionId : txid
    })
    router.replace({
      pathname : '/send/success',
      params   : { transactionId: txid }
    } as any)
  }, [ router, updateState ])
  
  const reset = useCallback(() => {
    isProcessingRef.current = false
    setState({
      status        : 'idle',
      progress      : 0,
      message       : '',
      error         : null,
      canRetry      : false,
      isLoading     : false,
      transactionId : undefined
    })
    SendTransactionService.reset()
  }, [])
  
  const retry = useCallback(async () => {
    reset()
    await executeTransaction()
  }, [ reset, executeTransaction ])
  
  return {
    state,
    actions : {
      validateTransaction,
      buildTransaction,
      executeTransaction,
      navigateToError,
      navigateToSuccess,
      reset,
      retry
    },
    validation,
    fees
  }
} 