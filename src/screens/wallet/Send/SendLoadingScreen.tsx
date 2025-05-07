import React from 'react'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import LoadingState from '@/src/components/ui/Feedback/LoadingState'
import { useTransactionProcessing } from '@/src/hooks/send/useTransactionProcessing'

/**
 * Screen that shows while a transaction is processing
 * Errors are now handled by redirecting to the SendErrorScreen
 */
export default function SendLoadingScreen() {
  // This will trigger the navigation to error screen if needed
  useTransactionProcessing()
  
  return (
    <StatusScreenLayout>
      <LoadingState />
    </StatusScreenLayout>
  )
} 