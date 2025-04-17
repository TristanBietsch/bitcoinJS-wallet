import React, { useEffect, useRef } from 'react'
import { useRouter } from 'expo-router'
import StatusScreenLayout from '@/src/components/layout/StatusScreenLayout'
import LoadingState from '@/src/components/ui/Feedback/LoadingState'
import ErrorState from '@/src/components/ui/Feedback/ErrorState'
import { useTransactionProcessing } from '@/src/hooks/send/useTransactionProcessing'
import { useSendStore } from '@/src/store/sendStore'

/**
 * Screen that shows while a transaction is processing
 */
export default function SendLoadingScreen() {
  const router = useRouter()
  const { setErrorMode } = useSendStore()
  const { error, isLoading } = useTransactionProcessing()
  
  // Track if we're unmounting due to navigation
  const isNavigatingAwayRef = useRef(false)
  
  // Handle cleanup on component unmount
  useEffect(() => {
    return () => {
      // Only reset error mode if we're not navigating because of an error
      // This prevents error mode from being cleared during navigation flickers
      if (!error && !isNavigatingAwayRef.current) {
        setErrorMode('none')
      }
    }
  }, [ setErrorMode, error ])
  
  // Handle retry - reset error mode and go back
  const handleRetry = () => {
    isNavigatingAwayRef.current = true
    setErrorMode('none')
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