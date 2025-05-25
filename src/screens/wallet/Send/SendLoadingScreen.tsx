import React, { useEffect } from 'react'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import StatusIcon from '@/src/components/ui/Feedback/StatusIcon'
import MessageDisplay from '@/src/components/ui/Feedback/MessageDisplay'
import { useTransaction } from '@/src/hooks/send/useTransaction'

/**
 * Screen that shows while a transaction is processing
 * Uses the same modular layout as SendErrorScreen and SendSuccessScreen
 * Handles transaction validation, execution, and navigation
 */
export default function SendLoadingScreen() {
  const { state, actions } = useTransaction()

  // Start transaction processing when component mounts
  useEffect(() => {
    const executeTransaction = async () => {
      const result = await actions.executeTransaction()
      
      if (result) {
        // Success - navigation is handled by the hook
        actions.navigateToSuccess(result.txid)
      } else if (state.error) {
        // Error - navigation is handled by the hook
        actions.navigateToError(state.error)
      }
    }
    
    executeTransaction()
  }, []) // Only run once on mount

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