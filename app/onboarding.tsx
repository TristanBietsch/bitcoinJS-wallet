import React from 'react'
import OnboardingScreen from '@/src/screens/onboarding/OnboardingScreen'
import { router } from 'expo-router'
import { setOnboardingComplete } from '@/src/utils/storage'
import { useWallet } from '@/src/context/WalletContext'

export default function Onboarding() {
  const { loadWallet } = useWallet()
  
  const handleOnboardingComplete = async () => {
    try {
      console.log('Onboarding complete, loading wallet...')
      
      // Mark onboarding as complete in storage
      await setOnboardingComplete()
      
      // Load the wallet data (seed phrase has already been stored during wallet creation/import)
      await loadWallet()
      
      console.log('Wallet loaded successfully, navigating to home')
      
      // Navigate to home screen
      router.replace('/' as any)
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Still try to navigate even if there was an error
      router.replace('/' as any)
    }
  }

  return <OnboardingScreen onComplete={handleOnboardingComplete} />
} 