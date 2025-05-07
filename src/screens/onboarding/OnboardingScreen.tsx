import React, { useState } from 'react'
import { OnboardingScreenProps } from '@/src/types/ui'
import WelcomeScreen from './start/WelcomeScreen'
import WalletChoiceScreen from './start/WalletChoiceScreen'
import SeedPhraseWarningScreen from './create/warning/SeedPhraseWarningScreen'
import PreparePhraseScreen from './create/prepare/PreparePhraseScreen'
import GenerateSeedWords from './create/generate/GenerateSeedWords'
import ConfirmSeedWordsScreen from './create/confirm/ConfirmSeedWordsScreen'
import ImportWalletScreen from './import/input/ImportWalletScreen'
import SuccessScreen from './status/SuccessScreen'
import ErrorScreen from './status/ErrorScreen'

type WalletStep = 'welcome' | 'choice' | 'warning' | 'prepare' | 'generate-seed' | 'confirm-seed' | 'import' | 'success' | 'error';

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [ currentStep, setCurrentStep ] = useState<WalletStep>('welcome')
  const [ error, setError ] = useState<string | null>(null)

  const handleGetStarted = () => {
    setCurrentStep('choice')
  }

  const handleBackToWelcome = () => {
    setCurrentStep('welcome')
  }

  const handleBackToChoice = () => {
    setCurrentStep('choice')
  }

  const handleCreateWallet = () => {
    setCurrentStep('warning')
  }

  const handleImportWallet = () => {
    setCurrentStep('import')
  }

  const handleWarningComplete = () => {
    setCurrentStep('prepare')
  }

  const handlePrepareComplete = () => {
    setCurrentStep('generate-seed')
  }

  const handleGenerateSeedComplete = () => {
    setCurrentStep('confirm-seed')
  }

  const handleBackToWarning = () => {
    setCurrentStep('warning')
  }

  const handleBackToPrepare = () => {
    setCurrentStep('prepare')
  }
  
  const handleBackToGenerateSeed = () => {
    setCurrentStep('generate-seed')
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
      return <SeedPhraseWarningScreen onComplete={handleWarningComplete} onBack={handleBackToChoice} />
    case 'prepare':
      return <PreparePhraseScreen onComplete={handlePrepareComplete} onBack={handleBackToWarning} />
    case 'generate-seed':
      return <GenerateSeedWords onComplete={handleGenerateSeedComplete} onBack={handleBackToPrepare} />
    case 'confirm-seed':
      return <ConfirmSeedWordsScreen onComplete={handleConfirmSeedComplete} onBack={handleBackToGenerateSeed} />
    case 'import':
      return <ImportWalletScreen 
        onComplete={handleImportComplete} 
        onBack={handleBackToChoice} 
      />
    case 'success':
      return <SuccessScreen onComplete={handleSuccess} />
    case 'error':
      return <ErrorScreen onRetry={handleRetry} message={error || undefined} />
    default:
      return null
  }
} 