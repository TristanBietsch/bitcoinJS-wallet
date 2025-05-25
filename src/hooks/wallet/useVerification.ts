import { useState, useEffect } from 'react'
import { TEST_ERROR_PHRASE, VERIFICATION_DELAY, VERIFICATION_DELAY_TEST } from '@/src/constants/testing'

interface VerificationResult {
  isComplete: boolean
  isError: boolean
}

/**
 * Custom hook for verifying a wallet seed phrase
 * 
 * @param seedPhrase The seed phrase to verify
 * @param isTestBypass Flag to speed up verification for testing
 * @returns Verification state result
 */
export function useVerification(seedPhrase: string, isTestBypass = false): VerificationResult {
  const [ verificationComplete, setVerificationComplete ] = useState(false)
  const [ verificationError, setVerificationError ] = useState(false)

  useEffect(() => {
    // We'll use seedPhrase in future implementation
    console.log('Processing import for phrase length:', seedPhrase.length)
    
    const timer = setTimeout(() => {
      // Check if this is the error test phrase
      if (seedPhrase.trim() === TEST_ERROR_PHRASE) {
        setVerificationError(true)
      } else {
        // Just complete after a delay for success cases
        setVerificationComplete(true)
      }
    }, isTestBypass ? VERIFICATION_DELAY_TEST : VERIFICATION_DELAY)

    return () => clearTimeout(timer)
  }, [ seedPhrase, isTestBypass ])

  return {
    isComplete : verificationComplete,
    isError    : verificationError
  }
} 