import React from 'react'
import { setOnboardingComplete } from '@/src/utils/storage'
import StatusScreen from '@/src/components/ui/Feedback/StatusScreen'
import { router } from 'expo-router'
import { useWalletStore } from '@/src/store/walletStore'

interface SuccessSeedPhraseProps {
  onComplete?: () => void;
}

/**
 * Screen displayed when seed phrase verification succeeds
 */
export default function SuccessSeedPhrase({ onComplete }: SuccessSeedPhraseProps) {
  // Get wallet store methods
  const initializeWallet = useWalletStore(state => state.initializeWallet)
  
  const handleGoHome = async () => {
    try {
      // First, mark onboarding as complete in storage
      await setOnboardingComplete()
      
      // Initialize wallet (the seed phrase should already be stored)
      await initializeWallet()
      
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
      title="Success!"
      subtitle="Your wallet is ready to go."
      primaryButtonLabel="Go Home"
      onPrimaryAction={handleGoHome}
      showAnimation={true}
    />
  )
}
