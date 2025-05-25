import React, { useEffect } from 'react'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import StatusIcon from '@/src/components/ui/Feedback/StatusIcon'
import MessageDisplay from '@/src/components/ui/Feedback/MessageDisplay'
import { useSendTransactionFlow } from '@/src/hooks/send/useSendTransactionFlow'

/**
 * Screen that shows while a transaction is processing
 * Uses the same modular layout as SendErrorScreen and SendSuccessScreen
 * Handles transaction validation, execution, and navigation
 */
export default function SendLoadingScreen() {
  const { state, actions } = useSendTransactionFlow()

  // Start transaction processing when component mounts
  useEffect(() => {
    actions.processTransaction()
    
    // Cleanup on unmount
    return () => {
      actions.cancel()
    }
  }, [])

  // Get loading message based on current stage
  const getLoadingMessage = () => {
    switch (state.currentStage) {
      case 'validating_inputs':
        return 'Validating transaction details...'
      case 'initializing':
        return 'Preparing transaction...'
      case 'building_transaction':
        return 'Building transaction...'
      case 'signing_transaction':
        return 'Signing transaction...'
      case 'broadcasting':
        return 'Broadcasting to network...'
      case 'completed':
        return 'Transaction completed!'
      default:
        return 'Processing your transaction...'
    }
  }

  // Get subtitle with progress information
  const getSubtitle = () => {
    const baseMessage = getLoadingMessage()
    if (state.progress > 0) {
      return `${baseMessage} (${Math.round(state.progress)}% complete)`
    }
    return `${baseMessage} This may take a few moments.`
  }

  return (
    <StatusScreenLayout>
      {/* Loading Icon */}
      <StatusIcon type="loading" />

      {/* Loading Message */}
      <MessageDisplay
        title="Sending Bitcoin"
        subtitle={getSubtitle()}
      />
    </StatusScreenLayout>
  )
} 