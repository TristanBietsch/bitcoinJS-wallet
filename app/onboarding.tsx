import React from 'react'
import OnboardingScreen from '@/src/screens/onboarding/OnboardingScreen'
import { router } from 'expo-router'
import { setOnboardingComplete } from '@/src/utils/storage'
// import { useWallet } from '@/src/context/WalletContext' // Removed

export default function Onboarding() {
  // const { loadWallet } = useWallet() // Removed
  
  const handleOnboardingComplete = async () => {
    try {
      console.log('Onboarding complete, setting flag and navigating...')
      
      // Mark onboarding as complete in storage
      await setOnboardingComplete()
      
      // Wallet loading is handled by useWalletStore via _layout.tsx and app/index.tsx
      // No need to explicitly call a loadWallet function here.
      // await loadWallet() // Removed
      
      console.log('Navigating to home screen')
      
      // Navigate to home screen
      router.replace('/' as any)
    } catch (error) {
      console.error('Error completing onboarding step:', error)
      // Still try to navigate even if there was an error setting the flag,
      // as the user might have completed wallet setup anyway.
      router.replace('/' as any)
    }
  }

  return <OnboardingScreen onComplete={handleOnboardingComplete} />
} 