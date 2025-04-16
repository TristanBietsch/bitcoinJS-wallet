import React from 'react'
import OnboardingScreen from '@/src/screens/onboarding/OnboardingScreen'
import { router } from 'expo-router'
import { setOnboardingComplete } from '@/src/utils/storage'

export default function Onboarding() {
  const handleOnboardingComplete = async () => {
    // Mark onboarding as complete in storage
    await setOnboardingComplete()
    
    // Navigate to home screen
    router.replace('/' as any)
  }

  return <OnboardingScreen onComplete={handleOnboardingComplete} />
} 