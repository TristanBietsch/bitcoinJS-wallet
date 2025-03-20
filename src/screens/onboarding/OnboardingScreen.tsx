import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { OnboardingScreenProps } from '@/src/types/onboarding';
import WelcomeScreen from './WelcomeScreen';
import WalletChoiceScreen from './WalletChoiceScreen';
import SeedPhraseWarningScreen from './SeedPhraseWarningScreen';
import ConfirmSeedWordsScreen from './ConfirmSeedWordsScreen';
import ImportWalletScreen from './ImportWalletScreen';
import SuccessScreen from './SuccessScreen';
import ErrorScreen from './ErrorScreen';

type WalletStep = 'welcome' | 'choice' | 'warning' | 'confirm-seed' | 'import' | 'success' | 'error';

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState<WalletStep>('welcome');
  const [error, setError] = useState<string | null>(null);

  const handleGetStarted = () => {
    setCurrentStep('choice');
  };

  const handleCreateWallet = () => {
    setCurrentStep('warning');
  };

  const handleImportWallet = () => {
    setCurrentStep('import');
  };

  const handleWarningComplete = () => {
    setCurrentStep('confirm-seed');
  };

  const handleConfirmSeedComplete = () => {
    setCurrentStep('success');
  };

  const handleImportComplete = () => {
    setCurrentStep('success');
  };

  const handleError = (message: string) => {
    setError(message);
    setCurrentStep('error');
  };

  const handleRetry = () => {
    setCurrentStep('choice');
    setError(null);
  };

  const handleSuccess = () => {
    onComplete();
  };

  // Render wallet setup flow
  switch (currentStep) {
    case 'welcome':
      return <WelcomeScreen onGetStarted={handleGetStarted} />;
    case 'choice':
      return (
        <WalletChoiceScreen
          onCreateWallet={handleCreateWallet}
          onImportWallet={handleImportWallet}
        />
      );
    case 'warning':
      return <SeedPhraseWarningScreen onComplete={handleWarningComplete} />;
    case 'confirm-seed':
      return <ConfirmSeedWordsScreen onComplete={handleConfirmSeedComplete} />;
    case 'import':
      return <ImportWalletScreen onComplete={handleImportComplete} />;
    case 'success':
      return <SuccessScreen onComplete={handleSuccess} />;
    case 'error':
      return <ErrorScreen onRetry={handleRetry} message={error || undefined} />;
    default:
      return null;
  }
} 