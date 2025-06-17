import React, { useEffect } from 'react'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import StatusIcon from '@/src/components/ui/Feedback/StatusIcon'
import MessageDisplay from '@/src/components/ui/Feedback/MessageDisplay'
import { useTransaction } from '@/src/hooks/send/useTransaction'
import { createTransactionError } from '@/src/types/errors.types'

/**
 * Screen that shows while a transaction is processing
 * Uses the same modular layout as SendErrorScreen and SendSuccessScreen
 * Handles transaction validation, execution, and navigation
 */
export default function SendLoadingScreen() {
  const { state, actions } = useTransaction()

  // Start transaction processing when component mounts
  useEffect(() => {
    let hasExecuted = false
    
    const executeTransaction = async () => {
      if (hasExecuted) return // Prevent double execution
      hasExecuted = true
      
      try {
        console.log('🚀 [SendLoadingScreen] Starting transaction execution...')
      const result = await actions.executeTransaction()
      
      if (result) {
          console.log('✅ [SendLoadingScreen] Transaction successful:', result.txid)
        // Success - navigation is handled by the hook
        actions.navigateToSuccess(result.txid)
        } else {
          console.log('❌ [SendLoadingScreen] Transaction failed without error')
          // Check if there's an error in state
          const currentState = state
          if (currentState.error) {
            actions.navigateToError(currentState.error)
                                } else {
             // Create a generic error using the proper error creation function
             const genericError = createTransactionError('TRANSACTION_BUILD_FAILED', 'build')
             actions.navigateToError(genericError)
           }
        }
      } catch (error) {
        console.error('💥 [SendLoadingScreen] Transaction execution error:', error)
        // Let the useTransaction hook handle the error state
      }
    }
    
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
    executeTransaction()
    }, 100)
    
    return () => {
      clearTimeout(timer)
      hasExecuted = true // Prevent execution if component unmounts
    }
  }, []) // Empty dependency array - run only once on mount

  // Get subtitle based on current state
  const getSubtitle = () => {
    if (state.message) {
      return state.message
    }
    
    if (state.progress > 0) {
      return `Processing... ${state.progress}%`
    }
    
    return 'Processing your transaction...'
  }

  return (
    <StatusScreenLayout>
      <StatusIcon 
        type="loading" 
      />
      
      <MessageDisplay
        title="Sending Bitcoin"
        subtitle={getSubtitle()}
      />
    </StatusScreenLayout>
  )
} 