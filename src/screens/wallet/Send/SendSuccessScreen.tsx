import React from 'react'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import StatusIcon from '@/src/components/ui/Feedback/StatusIcon'
import MessageDisplay from '@/src/components/ui/Feedback/MessageDisplay'
import ActionButtonGroup from '@/src/components/ui/Button/ActionButtonGroup'
import { useTransactionNavigation } from '@/src/hooks/send/useTransactionNavigation'

/**
 * Screen displayed after a successful transaction
 */
export default function SendSuccessScreen() {
  const { navigateToHome, navigateToDetails } = useTransactionNavigation()

  return (
    <StatusScreenLayout>
      {/* Success Icon */}
      <StatusIcon type="success" />

      {/* Success Message */}
      <MessageDisplay
        title="Success!"
        subtitle="Your transaction is now awaiting network confirmation."
      />

      {/* Action Buttons */}
      <ActionButtonGroup
        primaryText="Go Home"
        secondaryText="Details"
        onPrimaryPress={navigateToHome}
        onSecondaryPress={navigateToDetails}
      />
    </StatusScreenLayout>
  )
} 