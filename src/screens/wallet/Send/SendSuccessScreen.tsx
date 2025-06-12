import React from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import StatusIcon from '@/src/components/ui/Feedback/StatusIcon'
import MessageDisplay from '@/src/components/ui/Feedback/MessageDisplay'
import ActionButtonGroup from '@/src/components/ui/Button/ActionButtonGroup'
import { useTransaction } from '@/src/hooks/send/useTransaction'

/**
 * Screen displayed after a successful transaction
 * Uses the new unified transaction architecture
 */
export default function SendSuccessScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { actions } = useTransaction()
  
  // Get transaction ID from params or state
  const transactionId = params.transactionId as string
  
  const navigateToHome = () => {
    actions.reset()
    router.replace('/(tabs)/home' as any)
  }
  
  const navigateToDetails = () => {
    if (transactionId) {
      router.push({
        pathname : '/transaction/[id]',
        params   : { id: transactionId }
      } as any)
    }
  }

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