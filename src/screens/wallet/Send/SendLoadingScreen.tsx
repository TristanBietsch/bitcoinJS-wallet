import React, { useEffect } from 'react'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import LoadingState from '@/src/components/ui/Feedback/LoadingState'
import { useSendTransactionFlow } from '@/src/hooks/send/useSendTransactionFlow'

/**
 * Screen that shows while a transaction is processing
 * Now uses the consolidated transaction flow hook with enhanced error handling
 */
export default function SendLoadingScreen() {
  const { state, actions } = useSendTransactionFlow()
  
  // Start processing when component mounts
  useEffect(() => {
    actions.processTransaction()
  }, [ actions ])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't cancel if transaction completed successfully
      if (!state.transactionId && state.isLoading) {
        actions.cancel()
      }
    }
  }, [ actions, state.transactionId, state.isLoading ])
  
      return (
      <StatusScreenLayout>
        <LoadingState 
          message={state.currentStage || 'Processing transaction...'}
          subText={state.progress > 0 ? `${state.progress}% complete` : 'This may take a few moments'}
        />
      </StatusScreenLayout>
    )
} 