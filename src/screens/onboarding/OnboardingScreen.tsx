import React, { useState } from 'react'
import { OnboardingScreenProps } from '@/src/types/onboarding.types'
import WelcomeScreen from './start/WelcomeScreen'
import WalletChoiceScreen from './start/WalletChoiceScreen'
import SeedPhraseWarningScreen from './create/warning/SeedPhraseWarningScreen'
import ConfirmSeedWordsScreen from './create/confirm/ConfirmSeedWordsScreen'
import ImportWalletScreen from './import/ImportWalletScreen'
import SuccessScreen from './status/SuccessScreen'
import ErrorScreen from './status/ErrorScreen'

type WalletStep = 'welcome' | 'choice' | 'warning' | 'confirm-seed' | 'import' | 'success' | 'error';

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [ currentStep, setCurrentStep ] = useState<WalletStep>('welcome')
  const [ error, setError ] = useState<string | null>(null)

  const handleGetStarted = () => {
    setCurrentStep('choice')
  }

  const handleBackToWelcome = () => {
    setCurrentStep('welcome')
  }

  const handleCreateWallet = () => {
    setCurrentStep('warning')
  }

  const handleImportWallet = () => {
    setCurrentStep('import')
  }

  const handleWarningComplete = () => {
    setCurrentStep('confirm-seed')
  }

  const handleConfirmSeedComplete = () => {
    setCurrentStep('success')
  }

  const handleImportComplete = () => {
    setCurrentStep('success')
  }

  const _handleError = (message: string) => {
    setError(message)
    setCurrentStep('error')
  }

  const handleRetry = () => {
    setCurrentStep('choice')
    setError(null)
  }

  const handleSuccess = () => {
    onComplete()
  }

  // Render wallet setup flow
  switch (currentStep) {
    case 'welcome':
      return <WelcomeScreen onGetStarted={handleGetStarted} />
    case 'choice':
      return (
        <WalletChoiceScreen
          onCreateWallet={handleCreateWallet}
          onImportWallet={handleImportWallet}
          onBack={handleBackToWelcome}
        />
      )
    case 'warning':
      return <SeedPhraseWarningScreen onComplete={handleWarningComplete} />
    case 'confirm-seed':
      return <ConfirmSeedWordsScreen onComplete={handleConfirmSeedComplete} />
    case 'import':
      return <ImportWalletScreen onComplete={handleImportComplete} />
    case 'success':
      return <SuccessScreen onComplete={handleSuccess} />
    case 'error':
      return <ErrorScreen onRetry={handleRetry} message={error || undefined} />
    default:
      return null
  }
} 