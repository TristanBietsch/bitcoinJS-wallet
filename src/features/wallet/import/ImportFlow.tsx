import React, { useEffect } from 'react'
// import { ImportProvider, useImport } from './ImportContext' // Removed
import { useImportStore } from '@/src/store/importStore' // New store
import ImportWalletScreen from '@/src/screens/onboarding/import/input/ImportWalletScreen'
import CheckingSeedPhraseImport from '@/src/screens/onboarding/import/checking/CheckingSeedPhraseImport'
import SuccessImport from '@/src/screens/onboarding/import/success/SuccessImport'
import ErrorImport from '@/src/screens/onboarding/import/error/ErrorImport'

interface ImportFlowProps {
  onComplete?: () => void
  _onBack?: () => void // Renaming to onBack for clarity if used directly by ImportWalletScreen
}

export default function ImportFlow({ onComplete, _onBack }: ImportFlowProps) {
  // Selectors from useImportStore
  const importFlowState = useImportStore(state => state.importFlowState)
  const seedPhrase = useImportStore(state => state.seedPhrase)
  const isTestBypass = useImportStore(state => state.isTestBypass)
  // Actions from useImportStore (getState() for actions)
  const { returnToInput, resetImportStore } = useImportStore.getState()

  useEffect(() => {
    // Reset store when component unmounts or flow is re-entered, to ensure clean state
    return () => {
      resetImportStore()
    }
  }, [ resetImportStore ])

  // The onComplete for the whole flow, passed from parent (e.g. OnboardingScreen)
  const handleImportProcessCompleted = () => {
    if (onComplete) {
      onComplete()
    }
    resetImportStore() // Clean up store after completion
  }

  // Render the appropriate screen based on state
  switch (importFlowState) {
    case 'checking':
      return (
        <CheckingSeedPhraseImport
          // seedPhrase={seedPhrase} // Removed
        />
      )
    
    case 'success':
      return <SuccessImport onComplete={handleImportProcessCompleted} /> // Pass the main onComplete
    
    case 'error':
      // _onBack for ErrorImport could also be returnToInput if that's the desired flow
      return <ErrorImport onTryAgain={returnToInput} onBack={_onBack || returnToInput} />
    
    case 'input':
    default:
      // ImportWalletScreen will call useImportStore.getState().startChecking(...)
      // The onImportLogicComplete callback in startChecking will transition state.
      return <ImportWalletScreen onBack={_onBack} />
  }
} 