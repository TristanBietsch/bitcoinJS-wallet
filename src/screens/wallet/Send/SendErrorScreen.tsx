import React from 'react'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import StatusIcon from '@/src/components/ui/Feedback/StatusIcon'
import MessageDisplay from '@/src/components/ui/Feedback/MessageDisplay'
import ActionButtonGroup from '@/src/components/ui/Button/ActionButtonGroup'
import { useTransactionNavigation } from '@/src/hooks/send/useTransactionNavigation'

/**
 * Screen displayed after a failed transaction
 */
export default function SendErrorScreen() {
  const { navigateToHome, navigateToDetails } = useTransactionNavigation()

  return (
    <StatusScreenLayout>
      {/* Error Icon */}
      <StatusIcon type="error" />

      {/* Error Message */}
      <MessageDisplay
        title="Error"
        subtitle="Your transaction failed. Please try again."
      />

      {/* Action Buttons */}
      <ActionButtonGroup
        primaryText="Go Home"
        secondaryText="Error Details"
        onPrimaryPress={navigateToHome}
        onSecondaryPress={navigateToDetails}
      />
    </StatusScreenLayout>
  )
} 