import React from 'react'
import OnboardingScreen from '@/src/screens/onboarding/OnboardingScreen'
import { router } from 'expo-router'
import { setOnboardingComplete } from '@/src/utils/storage'

export default function Onboarding() {
  const handleOnboardingComplete = async () => {
    try {
      // Mark onboarding as complete in storage
      await setOnboardingComplete()
      
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