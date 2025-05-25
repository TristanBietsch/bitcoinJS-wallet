import React from 'react'
import { useRouter } from 'expo-router'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import StatusIcon from '@/src/components/ui/Feedback/StatusIcon'
import MessageDisplay from '@/src/components/ui/Feedback/MessageDisplay'
import ActionButtonGroup from '@/src/components/ui/Button/ActionButtonGroup'
import { useTransaction } from '@/src/hooks/send/useTransaction'

/**
 * Screen displayed after a failed transaction
 * Uses the new unified transaction architecture
 */
export default function SendErrorScreen() {
  const router = useRouter()
  const { state, actions } = useTransaction()
  
  // Navigation handlers
  const navigateToHome = () => {
    actions.reset()
    router.replace('/(tabs)/home' as any)
  }
  
  const navigateToErrorDetails = () => {
    router.push('/send/error/details' as any)
  }
  
  // Get error message from transaction state
  const getErrorMessage = () => {
    if (state.error) {
      return state.error.message
    }
    return 'Your transaction failed. Please try again.'
  }

  return (
    <StatusScreenLayout>
      {/* Error Icon */}
      <StatusIcon type="error" />

      {/* Error Message */}
      <MessageDisplay
        title="Transaction Failed"
        subtitle={getErrorMessage()}
      />

      {/* Action Buttons */}
      <ActionButtonGroup
        primaryText="Go Home"
        secondaryText={state.canRetry ? "Try Again" : "Error Details"}
        onPrimaryPress={navigateToHome}
        onSecondaryPress={state.canRetry ? actions.retry : navigateToErrorDetails}
      />
    </StatusScreenLayout>
  )
} 