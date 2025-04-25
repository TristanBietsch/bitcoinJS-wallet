import { useState, useCallback } from 'react'

export type VerificationState = 'selection' | 'checking' | 'error' | 'success'

interface VerificationFlowReturn {
  verificationState: VerificationState
  startVerification: () => void
  handleVerificationComplete: (success: boolean) => void
  handleTryAgain: () => void
  handleComplete: () => void
}

/**
 * Hook to manage the flow state for seed phrase verification
 * @param onComplete Callback to execute when the entire flow is completed
 * @param onReset Optional callback to reset the selection when trying again
 */
export const useSeedPhraseVerificationFlow = (
  onComplete: () => void,
  onReset?: () => void
): VerificationFlowReturn => {
  const [ verificationState, setVerificationState ] = useState<VerificationState>('selection')
  
  const startVerification = useCallback(() => {
    setVerificationState('checking')
  }, [])
  
  const handleVerificationComplete = useCallback((success: boolean) => {
    if (success) {
      setVerificationState('success')
    } else {
      setVerificationState('error')
    }
  }, [])
  
  const handleTryAgain = useCallback(() => {
    if (onReset) {
      onReset()
    }
    setVerificationState('selection')
  }, [ onReset ])
  
  const handleComplete = useCallback(() => {
    if (onComplete) {
      onComplete()
    }
  }, [ onComplete ])
  
  return {
    verificationState,
    startVerification,
    handleVerificationComplete,
    handleTryAgain,
    handleComplete
  }
} 