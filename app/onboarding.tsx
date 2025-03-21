import React from 'react'
import OnboardingScreen from '@/src/screens/onboarding/OnboardingScreen'

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  return <OnboardingScreen onComplete={onComplete} />
} 