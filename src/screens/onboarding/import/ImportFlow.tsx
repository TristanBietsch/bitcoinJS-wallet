import React, { useEffect, useState } from 'react'
// import { ImportProvider, useImport } from './ImportContext' // Removed
import { useImportStore } from '@/src/store/importStore' // New store
import ImportWalletScreen from '@/src/screens/onboarding/import/input/ImportWalletScreen'
import CheckingSeedPhraseImport from '@/src/screens/onboarding/import/checking/CheckingSeedPhraseImport'
// import SuccessImport from '@/src/screens/onboarding/import/success/SuccessImport' // No longer used
import ErrorImport from '@/src/screens/onboarding/import/error/ErrorImport'
import { View, ActivityIndicator } from 'react-native'
import { Colors } from '@/src/constants/colors'
import { ThemedText } from '@/src/components/ui/Text'

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
  
  // Local state to track if balance has been loaded
  const [ isWaitingForBalance, setIsWaitingForBalance ] = useState(false)
  
  // Handle success state - wait for balance fetch before completing
  useEffect(() => {
    if (importFlowState === 'success' && !isWaitingForBalance) {
      setIsWaitingForBalance(true)
      
      // Use a timeout to allow the app to render and balance to update
      // The balance fetch is triggered in the importStore.startChecking method
      setTimeout(() => {
        if (onComplete) {
          onComplete()
        }
        resetImportStore() // Clean up store after completion
      }, 1000) // Give a bit of time for the balance to load
    }
  }, [ importFlowState, onComplete, resetImportStore, isWaitingForBalance ])

  useEffect(() => {
    // Reset store when component unmounts or flow is re-entered, to ensure clean state
    return () => {
      resetImportStore()
    }
  }, [ resetImportStore ])

  // Render the appropriate screen based on state
  switch (importFlowState) {
    case 'checking':
      return (
        <CheckingSeedPhraseImport
          // seedPhrase={seedPhrase} // Removed
        />
      )
    
    case 'success':
      // Show a loading indicator while waiting for balance to be fetched
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.light.buttons.primary} />
          <ThemedText style={{ marginTop: 16 }}>Loading wallet balance...</ThemedText>
        </View>
      )
    
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