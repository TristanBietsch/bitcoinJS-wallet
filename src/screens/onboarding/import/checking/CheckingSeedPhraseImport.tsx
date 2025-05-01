import React, { useEffect } from 'react'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import VerificationLoader from '@/src/components/ui/Feedback/VerificationLoader'

interface CheckingSeedPhraseImportProps {
  seedPhrase: string
  onComplete: () => void
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
  isTestBypass = false
}: CheckingSeedPhraseImportProps) {
  // Simplified simulation of verification without actual logic
  useEffect(() => {
    // We'll use seedPhrase in future implementation
    console.log('Processing import for phrase length:', seedPhrase.length)
    
    const timer = setTimeout(() => {
      // Just complete after a delay
      onComplete()
    }, isTestBypass ? 500 : 2000) // Shorter delay for test bypass

    return () => clearTimeout(timer)
  }, [ onComplete, isTestBypass ])
  
  return (
    <OnboardingContainer>
      <VerificationLoader 
        title="Importing..." 
        subtitle="Verifying and importing your wallet" 
      />
    </OnboardingContainer>
  )
}
