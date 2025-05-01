import React, { useEffect, useState } from 'react'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import VerificationLoader from '@/src/components/ui/Feedback/VerificationLoader'
import SuccessImport from '../success/SuccessImport'
import ErrorImport from '../error/ErrorImport'

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
  // Using seedPhrase in a comment to avoid linting errors
  // The parameter is kept for future implementation
  seedPhrase,
  onComplete,
  onError,
  isTestBypass = false
}: CheckingSeedPhraseImportProps) {
  // Add state to track verification completion
  const [ verificationComplete, setVerificationComplete ] = useState(false)
  // Add state to track verification error
  const [ verificationError, setVerificationError ] = useState(false)

  // Simplified simulation of verification without actual logic
  useEffect(() => {
    // We'll use seedPhrase in future implementation
    console.log('Processing import for phrase length:', seedPhrase.length)
    
    const timer = setTimeout(() => {
      // Check if this is the error test phrase
      if (seedPhrase.trim() === "admin test error") {
        setVerificationError(true)
      } else {
        // Just complete after a delay for success cases
        setVerificationComplete(true)
      }
    }, isTestBypass ? 500 : 2000) // Shorter delay for test bypass

    return () => clearTimeout(timer)
  }, [ seedPhrase, isTestBypass ])
  
  // Handle the success screen completion
  const handleSuccessComplete = () => {
    // Pass the completion back to the parent
    onComplete()
  }

  // Handle the error try again action
  const handleTryAgain = () => {
    // Go back to import screen
    if (onError) {
      onError()
    } else {
      // Fallback to onComplete for backward compatibility
      onComplete()
    }
  }

  // Show error screen if verification failed
  if (verificationError) {
    return <ErrorImport onTryAgain={handleTryAgain} onBack={handleTryAgain} />
  }

  // Show success screen if verification is complete
  if (verificationComplete) {
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
