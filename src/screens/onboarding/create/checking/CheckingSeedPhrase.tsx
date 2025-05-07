import React from 'react'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import VerificationLoader from '@/src/components/ui/Feedback/VerificationLoader'
import { useSeedPhraseVerification } from '@/src/hooks/wallet/useSeedPhraseVerification'

interface CheckingSeedPhraseProps {
  originalSeedPhrase: string[]
  selectedWords: string[]
  onVerificationComplete: (success: boolean) => void
}

/**
 * Screen component shown during seed phrase verification
 */
export default function CheckingSeedPhrase({ 
  originalSeedPhrase,
  selectedWords,
  onVerificationComplete
}: CheckingSeedPhraseProps) {
  // Use our extracted verification hook
  useSeedPhraseVerification(
    originalSeedPhrase,
    selectedWords,
    2000, // 2 second delay for verification effect
    onVerificationComplete
  )
  
  return (
    <OnboardingContainer>
      <VerificationLoader 
        title="Verifying..." 
        subtitle="Checking your seed phrase sequence" 
      />
    </OnboardingContainer>
  )
}
