import { useState, useEffect } from 'react'

interface VerificationState {
  isVerifying: boolean
  isVerified: boolean | null
}

/**
 * Hook to handle seed phrase verification logic
 * @param originalSeedPhrase The original seed phrase to verify against
 * @param selectedWords The words selected by the user
 * @param verificationDelay Optional delay in ms to simulate verification process
 * @param onComplete Optional callback when verification completes
 */
export const useSeedPhraseVerification = (
  originalSeedPhrase: string[],
  selectedWords: string[],
  verificationDelay = 2000,
  onComplete?: (success: boolean) => void
): VerificationState => {
  const [ state, setState ] = useState<VerificationState>({
    isVerifying : true,
    isVerified  : null
  })

  useEffect(() => {
    // Reset to verifying state when inputs change
    setState({
      isVerifying : true,
      isVerified  : null
    })

    // Simulate checking process
    const timer = setTimeout(() => {
      // Compare original seed phrase with selected words
      const isCorrect = originalSeedPhrase.every((word, index) => word === selectedWords[index])
      
      setState({
        isVerifying : false,
        isVerified  : isCorrect
      })

      // Call the completion callback if provided
      if (onComplete) {
        onComplete(isCorrect)
      }
    }, verificationDelay)
    
    return () => clearTimeout(timer)
  }, [ originalSeedPhrase, selectedWords, verificationDelay, onComplete ])
  
  return state
} 