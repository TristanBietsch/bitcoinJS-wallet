/**
 * Hook for handling transaction processing logic
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { mockTransactions } from '@/tests/mockData/transactionData'
import { useTransactionValidation } from '@/src/hooks/send/useTransactionValidation'
import { useSendStore } from '@/src/store/sendStore'

// Find an existing "send" transaction to use as reference
const getExistingSendTransaction = () => {
  const sendTransaction = mockTransactions.find(tx => tx.type === 'send')
  return sendTransaction?.id || '2' // ID 2 is a send transaction in mock data
}

interface TransactionProcessingResult {
  error     : string | null
  isLoading : boolean
}

/**
 * Hook to handle transaction processing and navigation after completion
 */
export const useTransactionProcessing = (): TransactionProcessingResult => {
  const router = useRouter()
  const [ error, setError ] = useState<string | null>(null)
  const [ isLoading, setIsLoading ] = useState(true)
  
  // Get store with initial error mode
  const { errorMode, setErrorMode } = useSendStore()
  
  // Store the initial error mode when the component mounts
  const initialErrorModeRef = useRef(errorMode)
  
  // Get validation result
  const { isValid, error: validationError } = useTransactionValidation()
  
  // Track processing completion
  const completedRef = useRef(false)
  
  // Wrap navigateToErrorScreen in useCallback
  const navigateToErrorScreen = useCallback(() => {
    // Still set the error state in case component is still mounted
    setIsLoading(false)
    setError("Error occurred during transaction")
    
    // Navigate to the error screen
    router.replace('/send/error' as any)
  }, [ router, setIsLoading, setError ])
  
  useEffect(() => {
    // Store the initial error mode when the effect runs
    initialErrorModeRef.current = errorMode
    
    // Flag to prevent state updates after unmounting
    let isMounted = true
    
    const processTransaction = async () => {
      // If we've already completed processing, don't do it again
      if (completedRef.current) {
        return
      }
      
      try {
        // Skip normal processing if we're testing errors
        if (initialErrorModeRef.current !== 'none') {
          // For validation errors, show immediately
          if (initialErrorModeRef.current === 'validation') {
            if (isMounted) {
              // No need to set local error state, we'll navigate to error screen
              completedRef.current = true
              navigateToErrorScreen()
            }
          } 
          // For network errors, wait then show
          else if (initialErrorModeRef.current === 'network') {
            await new Promise(resolve => setTimeout(resolve, 1500))
            if (isMounted) {
              completedRef.current = true
              navigateToErrorScreen()
            }
          }
          
          // Keep error mode set until user explicitly resets it
          return
        }
        
        // First check validation - this code will only run if errorMode is 'none'
        if (!isValid) {
          if (isMounted) {
            completedRef.current = true
            navigateToErrorScreen()
          }
          return
        }
        
        // Simulate processing time (only for normal flow)
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // If we're still mounted and no error mode was set, navigate to success
        if (isMounted && initialErrorModeRef.current === 'none') {
          const transactionId = getExistingSendTransaction()
          completedRef.current = true
          
          // Make sure error mode is still 'none' before navigating to success
          if (initialErrorModeRef.current === 'none') {
            router.replace({
              pathname : '/send/success',
              params   : { transactionId }
            } as any)
          }
        }
      } catch (_err) {
        // If we're still mounted, navigate to error screen
        if (isMounted) {
          completedRef.current = true
          navigateToErrorScreen()
        }
      }
    }
    
    // Start processing
    processTransaction()
    
    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [ router, isValid, validationError, errorMode, setErrorMode, navigateToErrorScreen ])
  
  return { error, isLoading }
} 