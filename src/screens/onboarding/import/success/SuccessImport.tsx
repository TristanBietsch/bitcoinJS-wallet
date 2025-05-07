import React from 'react'
import { router } from 'expo-router'
import StatusScreen from '@/src/components/ui/Feedback/StatusScreen'
import { setOnboardingComplete } from '@/src/utils/storage'
import { BaseCallbacks } from '@/src/types/ui'

type SuccessImportProps = Pick<BaseCallbacks, 'onComplete'>

/**
 * Screen displayed when wallet import succeeds
 */
export default function SuccessImport({ onComplete }: SuccessImportProps) {
  const handleGoHome = async () => {
    try {
      // First, mark onboarding as complete in storage
      await setOnboardingComplete()
      
      // Then navigate to home screen
      router.replace('/' as any)
      
      // Also call onComplete if provided (for backward compatibility)
      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Still try to navigate even if there was an error
      router.replace('/' as any)
    }
  }
  
  return (
    <StatusScreen
      type="success"
      title="Import Successful!"
      subtitle="Your wallet has been imported successfully."
      primaryButtonLabel="Go to Wallet"
      onPrimaryAction={handleGoHome}
      showAnimation={true}
    />
  )
}
