/**
 * Consolidated Send Transaction Flow Hook
 * Coordinates the entire send transaction flow with enhanced processing,
 * error handling, progress tracking, and navigation
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'expo-router'
import { useSendStore } from '../../store/sendStore'
import { useSendBitcoin } from '../bitcoin/useSendBitcoin'
import { useTransactionValidation } from './useTransactionValidation'
import { convertUIToBitcoinParams, validateTransactionParams } from '../../utils/send/transactionParams'
import {
  useTransactionStatus,
  trackProgress,
  trackError,
  trackTxid,
  resetTransactionTracking,
  startTransactionTracking
} from '../../services/bitcoin/transactionStatusService'
import {
  createInsufficientFundsError,
  createAddressValidationError,
  createTransactionError,
  createNetworkError,
  shouldShowRetryButton,
  type SendBTCError
} from '../../types/errors.types'

interface TransactionFlowState {
  isLoading: boolean
  progress: number
  currentStage: string
  error: SendBTCError | null
  canRetry: boolean
  transactionId?: string
}

interface TransactionFlowActions {
  processTransaction: () => Promise<string | undefined>
  retry: () => Promise<void>
  cancel: () => void
  reset: () => void
}

interface UseSendTransactionFlowReturn {
  state: TransactionFlowState
  actions: TransactionFlowActions
}

/**
 * Consolidated hook for managing the entire send transaction flow
 * Combines navigation, processing, error handling, and progress tracking
 */
export function useSendTransactionFlow(): UseSendTransactionFlowReturn {
  const router = useRouter()
  const isProcessingRef = useRef(false)

  // Stores and validation
  const { errorMode, setErrorMode, reset: resetSendStore } = useSendStore()
  const { isValid, error: validationError } = useTransactionValidation()

  // Bitcoin transaction processing
  const { 
    sendBitcoinAsync, 
    isLoading: isSendingBitcoin, 
    error: sendBitcoinError,
    reset: resetSendBitcoin
  } = useSendBitcoin()

  // Transaction status tracking
  const { getStatus } = useTransactionStatus()

  // Flow state
  const [ state, setState ] = useState<TransactionFlowState>({
    isLoading    : false,
    progress     : 0,
    currentStage : '',
    error        : null,
    canRetry     : false
  })

  // Navigation handlers
  const navigateToErrorScreen = useCallback((errorMessage?: string, error?: SendBTCError) => {
    setState(prev => ({
      ...prev,
      isLoading : false,
      error     : error || createTransactionError('TRANSACTION_BUILD_FAILED', 'build'),
      canRetry  : error ? shouldShowRetryButton(error) : true
    }))
    router.replace('/send/error' as any)
  }, [ router ])

  const navigateToSuccessScreen = useCallback((txid: string) => {
    setState(prev => ({
      ...prev,
      transactionId : txid,
      isLoading     : false,
      progress      : 100,
      currentStage  : 'completed'
    }))
    resetSendStore()
    router.replace({
      pathname : '/send/success',
      params   : { transactionId: txid }
    } as any)
  }, [ router, resetSendStore ])

  // Error mapping helper
  const mapErrorToSendBTCError = useCallback((bitcoinError: Error): SendBTCError => {
    const errorMessage = bitcoinError.message.toLowerCase()
    
    if (errorMessage.includes('insufficient funds') || 
        errorMessage.includes('not enough') || 
        errorMessage.includes('balance')) {
      setErrorMode('validation')
      return createInsufficientFundsError(0, 0, { confirmed: 0, unconfirmed: 0 })
    } else if (errorMessage.includes('network') || 
               errorMessage.includes('connection') || 
               errorMessage.includes('timeout') ||
               errorMessage.includes('broadcast failed')) {
      setErrorMode('network')
      return createNetworkError('NETWORK_TIMEOUT', { endpoint: 'unknown' })
    } else if (errorMessage.includes('invalid address') ||
               errorMessage.includes('address')) {
      setErrorMode('validation')
      return createAddressValidationError('unknown', 'INVALID_ADDRESS')
    } else {
      setErrorMode('validation')
      return createTransactionError('TRANSACTION_BUILD_FAILED', 'build')
    }
  }, [ setErrorMode ])

  // Main transaction processing function
  const processTransaction = useCallback(async (): Promise<string | undefined> => {
    if (isProcessingRef.current) {
      console.log('Transaction already in progress')
      return
    }

    isProcessingRef.current = true
    resetTransactionTracking()
    startTransactionTracking()

    setState(prev => ({
      ...prev,
      isLoading    : true,
      progress     : 0,
      currentStage : 'initializing',
      error        : null,
      canRetry     : false
    }))

    try {
      // Handle pre-set error modes for testing
      if (errorMode !== 'none') {
        trackProgress('failed')
        if (errorMode === 'validation') {
          const error = createTransactionError('TRANSACTION_BUILD_FAILED', 'build')
          trackError(new Error(error.message))
          navigateToErrorScreen('Transaction validation failed', error)
          return
        } else if (errorMode === 'network') {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1500))
          const error = createNetworkError('NETWORK_TIMEOUT', { endpoint: 'mempool' })
          trackError(new Error(error.message))
          navigateToErrorScreen('Network error occurred', error)
          return
        }
      }

      // Phase 1: Validation
      trackProgress('validating_inputs')
      setState(prev => ({ ...prev, currentStage: 'validating_inputs', progress: 10 }))

      if (!isValid) {
        const error = createTransactionError('TRANSACTION_BUILD_FAILED', 'build')
        trackError(new Error(validationError || 'Validation failed'))
        navigateToErrorScreen(validationError || 'Transaction validation failed', error)
        return
      }

      // Phase 2: Parameter conversion
      trackProgress('initializing')
      setState(prev => ({ ...prev, currentStage: 'initializing', progress: 30 }))

      const transactionParams = convertUIToBitcoinParams()
      validateTransactionParams(transactionParams)

      // Phase 3: Transaction execution
      trackProgress('building_transaction')
      setState(prev => ({ ...prev, currentStage: 'building_transaction', progress: 50 }))

      console.log('Starting Bitcoin transaction with params:', {
        recipientAddress : transactionParams.recipientAddress,
        amountSat        : transactionParams.amountSat,
        feeRate          : transactionParams.feeRate,
        changeAddress    : transactionParams.changeAddress
      })

      const txid = await sendBitcoinAsync(transactionParams)

      if (txid) {
        trackTxid(txid)
        trackProgress('completed')
        console.log('Bitcoin transaction successful:', txid)
        navigateToSuccessScreen(txid)
        return txid
      }

    } catch (transactionError) {
      console.error('Bitcoin transaction failed:', transactionError)
      
      const sendError = transactionError instanceof Error 
        ? mapErrorToSendBTCError(transactionError)
        : createTransactionError('TRANSACTION_BUILD_FAILED', 'build')

      trackError(transactionError instanceof Error ? transactionError : new Error('Unknown error'))
      navigateToErrorScreen(sendError.message, sendError)
    } finally {
      isProcessingRef.current = false
    }
  }, [
    errorMode,
    isValid,
    validationError,
    sendBitcoinAsync,
    navigateToErrorScreen,
    navigateToSuccessScreen,
    mapErrorToSendBTCError
  ])

  // Retry function
  const retry = useCallback(async (): Promise<void> => {
    resetSendBitcoin()
    await processTransaction()
  }, [ processTransaction, resetSendBitcoin ])

  // Cancel function
  const cancel = useCallback(() => {
    resetTransactionTracking()
    isProcessingRef.current = false
    setState({
      isLoading    : false,
      progress     : 0,
      currentStage : '',
      error        : null,
      canRetry     : false
    })
  }, [])

  // Reset function
  const reset = useCallback(() => {
    cancel()
    resetSendBitcoin()
    resetSendStore()
  }, [ cancel, resetSendBitcoin, resetSendStore ])

  // Update loading state based on Bitcoin transaction status
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading : prev.isLoading || isSendingBitcoin
    }))
  }, [ isSendingBitcoin ])

  // Handle Bitcoin transaction errors
  useEffect(() => {
    if (sendBitcoinError && !state.error) {
      const sendError = mapErrorToSendBTCError(sendBitcoinError)
      navigateToErrorScreen(sendError.message, sendError)
    }
  }, [ sendBitcoinError, state.error, mapErrorToSendBTCError, navigateToErrorScreen ])

  // Update progress based on transaction status
  useEffect(() => {
    const status = getStatus()
    if (status) {
      setState(prev => ({
        ...prev,
        progress     : status.progress || prev.progress,
        currentStage : status.currentMessage || prev.currentStage
      }))
    }
  }, [ getStatus ])

  return {
    state,
    actions : {
      processTransaction,
      retry,
      cancel,
      reset
    }
  }
} 