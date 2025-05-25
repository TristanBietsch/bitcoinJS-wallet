import React from 'react'

export interface OnboardingStepProps {
  title: string;
  description: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
}

export interface OnboardingScreenProps {
  onComplete: () => void;
}

export interface StepConfig {
  id: string;
  Component: React.ComponentType<{ onNext: () => void }>;
} 