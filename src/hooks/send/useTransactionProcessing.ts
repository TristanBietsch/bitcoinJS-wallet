/**
 * Hook for handling transaction processing logic
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useTransactionValidation } from '@/src/hooks/send/useTransactionValidation'
import { useSendStore } from '@/src/store/sendStore'
import { useSendBitcoin } from '@/src/hooks/bitcoin/useSendBitcoin'
import { convertUIToBitcoinParams, validateTransactionParams } from '@/src/utils/send/transactionParams'

interface TransactionProcessingResult {
  error     : string | null
  isLoading : boolean
}

/**
 * Hook to handle transaction processing and navigation after completion
 * Now uses real Bitcoin transaction processing via useSendBitcoin
 */
export const useTransactionProcessing = (): TransactionProcessingResult => {
  const router = useRouter()
  const [ error, setError ] = useState<string | null>(null)
  const [ isLoading, setIsLoading ] = useState(true)
  
  // Get store and error mode handling
  const { errorMode, setErrorMode, reset: resetSendStore } = useSendStore()
  
  // Bitcoin transaction processing hook
  const { 
    sendBitcoinAsync, 
    isLoading: isSendingBitcoin, 
    error: sendBitcoinError
  } = useSendBitcoin()
  
  // Get validation result
  const { isValid, error: validationError } = useTransactionValidation()
  
  // Track processing completion
  const completedRef = useRef(false)
  
  // Navigation handlers
  const navigateToErrorScreen = useCallback((errorMessage?: string) => {
    setIsLoading(false)
    setError(errorMessage || "Transaction failed")
    router.replace('/send/error' as any)
  }, [ router ])
  
  const navigateToSuccessScreen = useCallback((txid: string) => {
    setIsLoading(false)
    resetSendStore() // Clear send state on success
    router.replace({
      pathname : '/send/success',
      params   : { transactionId: txid }
    } as any)
  }, [ router, resetSendStore ])
  
  // Map Bitcoin errors to UI error modes
  const mapErrorToErrorMode = useCallback((bitcoinError: Error): void => {
    const errorMessage = bitcoinError.message.toLowerCase()
    
    if (errorMessage.includes('insufficient funds') || 
        errorMessage.includes('not enough') || 
        errorMessage.includes('balance')) {
      setErrorMode('validation')
    } else if (errorMessage.includes('network') || 
               errorMessage.includes('connection') || 
               errorMessage.includes('timeout') ||
               errorMessage.includes('broadcast failed')) {
      setErrorMode('network')
    } else {
      setErrorMode('validation') // Default to validation error
    }
  }, [ setErrorMode ])
  
  useEffect(() => {
    // Prevent multiple processing attempts
    if (completedRef.current) return
    
    let isMounted = true
    
    const processTransaction = async () => {
      try {
        // Handle pre-set error modes for testing
        if (errorMode !== 'none') {
          if (errorMode === 'validation') {
            if (isMounted) {
              completedRef.current = true
              navigateToErrorScreen('Transaction validation failed')
            }
          } else if (errorMode === 'network') {
            // Simulate network delay for network errors
            await new Promise(resolve => setTimeout(resolve, 1500))
            if (isMounted) {
              completedRef.current = true
              navigateToErrorScreen('Network error occurred')
            }
          }
          return
        }
        
        // Validate transaction data
        if (!isValid) {
          if (isMounted) {
            completedRef.current = true
            navigateToErrorScreen(validationError || 'Transaction validation failed')
          }
          return
        }
        
        // Convert UI state to Bitcoin transaction parameters
        const transactionParams = convertUIToBitcoinParams()
        validateTransactionParams(transactionParams)
        
        console.log('Starting Bitcoin transaction with params:', {
          recipientAddress : transactionParams.recipientAddress,
          amountSat        : transactionParams.amountSat,
          feeRate          : transactionParams.feeRate,
          changeAddress    : transactionParams.changeAddress
        })
        
        // Execute real Bitcoin transaction
        const txid = await sendBitcoinAsync(transactionParams)
        
        if (isMounted && txid) {
          completedRef.current = true
          console.log('Bitcoin transaction successful:', txid)
          navigateToSuccessScreen(txid)
        }
        
      } catch (transactionError) {
        console.error('Bitcoin transaction failed:', transactionError)
        
        if (isMounted) {
          completedRef.current = true
          
          // Map error to appropriate error mode
          if (transactionError instanceof Error) {
            mapErrorToErrorMode(transactionError)
            navigateToErrorScreen(transactionError.message)
          } else {
            setErrorMode('validation')
            navigateToErrorScreen('Unknown transaction error')
          }
        }
      }
    }
    
    // Start processing
    processTransaction()
    
    // Cleanup
    return () => {
      isMounted = false
    }
  }, [ 
    errorMode, 
    isValid, 
    validationError, 
    sendBitcoinAsync, 
    navigateToErrorScreen, 
    navigateToSuccessScreen,
    mapErrorToErrorMode,
    setErrorMode
  ])
  
  // Update loading state based on Bitcoin transaction status
  useEffect(() => {
    setIsLoading(isSendingBitcoin)
  }, [ isSendingBitcoin ])
  
  // Handle Bitcoin transaction errors
  useEffect(() => {
    if (sendBitcoinError && !completedRef.current) {
      completedRef.current = true
      mapErrorToErrorMode(sendBitcoinError)
      navigateToErrorScreen(sendBitcoinError.message)
    }
  }, [ sendBitcoinError, mapErrorToErrorMode, navigateToErrorScreen ])
  
  return { 
    error : error || sendBitcoinError?.message || null, 
    isLoading 
  }
} 