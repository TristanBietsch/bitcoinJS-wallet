import React from 'react'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import StatusIcon from '@/src/components/ui/Feedback/StatusIcon'
import MessageDisplay from '@/src/components/ui/Feedback/MessageDisplay'
import ActionButtonGroup from '@/src/components/ui/Button/ActionButtonGroup'
import { useTransactionNavigation } from '@/src/hooks/send/useTransactionNavigation'
import { useSendStore } from '@/src/store/sendStore'

/**
 * Screen displayed after a failed transaction
 */
export default function SendErrorScreen() {
  const { navigateToHome, navigateToErrorDetails } = useTransactionNavigation()
  const { errorMode } = useSendStore()
  
  // Get the appropriate error message based on error mode
  const getErrorMessage = () => {
    switch (errorMode) {
      case 'validation':
        return 'Transaction validation failed. Please check your input and try again.'
      case 'network':
        return 'Network error occurred. Please check your connection and try again.'
      default:
        return 'Your transaction failed. Please try again.'
    }
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
        secondaryText="Error Details"
        onPrimaryPress={navigateToHome}
        onSecondaryPress={navigateToErrorDetails}
      />
    </StatusScreenLayout>
  )
} 