import React from 'react'
import { useRouter } from 'expo-router'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import LoadingState from '@/src/components/ui/Feedback/LoadingState'
import ErrorState from '@/src/components/ui/Feedback/ErrorState'
import { useTransactionProcessing } from '@/src/hooks/send/useTransactionProcessing'

/**
 * Screen that shows while a transaction is processing
 */
export default function SendLoadingScreen() {
  const router = useRouter()
  const { error, isLoading } = useTransactionProcessing()
  
  // Handle retry
  const handleRetry = () => {
    router.back()
  }
  
  return (
    <StatusScreenLayout>
      {isLoading ? (
        <LoadingState />
      ) : (
        <ErrorState
          message={error || 'Transaction failed'}
          onRetry={handleRetry}
        />
      )}
    </StatusScreenLayout>
  )
} 