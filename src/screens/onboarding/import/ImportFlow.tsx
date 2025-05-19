import React, { useEffect } from 'react'
// import { ImportProvider, useImport } from './ImportContext' // Removed
import { useImportStore } from '@/src/store/importStore' // New store
import ImportWalletScreen from '@/src/screens/onboarding/import/input/ImportWalletScreen'
import CheckingSeedPhraseImport from '@/src/screens/onboarding/import/checking/CheckingSeedPhraseImport'
// import SuccessImport from '@/src/screens/onboarding/import/success/SuccessImport' // No longer used
import ErrorImport from '@/src/screens/onboarding/import/error/ErrorImport'

interface ImportFlowProps {
  onComplete?: () => void
  _onBack?: () => void // Renaming to onBack for clarity if used directly by ImportWalletScreen
}

export default function ImportFlow({ onComplete, _onBack }: ImportFlowProps) {
  // Selectors from useImportStore
  const importFlowState = useImportStore(state => state.importFlowState)
  // const seedPhrase = useImportStore(state => state.seedPhrase) // No longer used
  // const isTestBypass = useImportStore(state => state.isTestBypass) // No longer used
  // Actions from useImportStore (getState() for actions)
  const { returnToInput, resetImportStore } = useImportStore.getState()

  useEffect(() => {
    // Reset store when component unmounts or flow is re-entered, to ensure clean state
    return () => {
      resetImportStore()
    }
  }, [ resetImportStore ])

  // The onComplete for the whole flow, passed from parent (e.g. OnboardingScreen)
  // This is now called directly in the 'success' case via setTimeout
  // const handleImportProcessCompleted = () => { ... } // No longer needed here

  // Render the appropriate screen based on state
  switch (importFlowState) {
    case 'checking':
      return (
        <CheckingSeedPhraseImport
          // seedPhrase={seedPhrase} // Removed
        />
      )
    
    case 'success':
      // Skip the internal success screen and directly call the main completion handler.
      // This prevents the duplicate success screen issue.
      // Use setTimeout to ensure this runs after the current render cycle.
      setTimeout(() => {
        if (onComplete) {
          onComplete()
        }
        resetImportStore() // Clean up store after completion
      }, 0)
      return null // Return null or a minimal loading indicator if preferred
    
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