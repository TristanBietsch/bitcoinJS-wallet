import React from 'react'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import VerificationLoader from '@/src/components/ui/Feedback/VerificationLoader'
import SuccessImport from '../success/SuccessImport'
import ErrorImport from '../error/ErrorImport'
import { useVerification } from '@/src/hooks/wallet/useVerification'

interface CheckingSeedPhraseImportProps {
  seedPhrase: string
  onComplete: () => void
  onError?: () => void
  isTestBypass?: boolean
}

/**
 * Screen component shown during seed phrase import verification
 */
export default function CheckingSeedPhraseImport({ 
  seedPhrase,
  onComplete,
  onError,
  isTestBypass = false
}: CheckingSeedPhraseImportProps) {
  // Use the verification hook to handle the verification logic
  const { isComplete, isError } = useVerification(seedPhrase, isTestBypass)
  
  // Handle the success screen completion
  const handleSuccessComplete = () => {
    // Pass the completion back to the parent
    if (onComplete) onComplete()
  }

  // Handle the error try again action
  const handleTryAgain = () => {
    // Go back to import screen
    if (onError) {
      onError()
    } else if (onComplete) {
      // Fallback to onComplete for backward compatibility
      onComplete()
    }
  }

  // Show error screen if verification failed
  if (isError) {
    return <ErrorImport onTryAgain={handleTryAgain} onBack={handleTryAgain} />
  }

  // Show success screen if verification is complete
  if (isComplete) {
    return <SuccessImport onComplete={handleSuccessComplete} />
  }
  
  // Otherwise show the loading indicator
  return (
    <OnboardingContainer>
      <VerificationLoader 
        title="Importing..." 
        subtitle="Verifying and importing your wallet" 
      />
    </OnboardingContainer>
  )
}
