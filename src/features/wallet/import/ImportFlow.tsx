import React from 'react'
import { ImportProvider, useImport } from './ImportContext'
import ImportWalletScreen from '@/src/screens/onboarding/import/input/ImportWalletScreen'
import CheckingSeedPhraseImport from '@/src/screens/onboarding/import/checking/CheckingSeedPhraseImport'
import SuccessImport from '@/src/screens/onboarding/import/success/SuccessImport'
import ErrorImport from '@/src/screens/onboarding/import/error/ErrorImport'

interface ImportFlowProps {
  onComplete?: () => void
  _onBack?: () => void
}

/**
 * Component that handles the internal flow of the import process
 */
function ImportFlowInternal({ onBack }: { onBack?: () => void }) {
  const { 
    state, 
    seedPhrase, 
    completeImport, 
    returnToInput,
    isTestBypass
  } = useImport()
  
  // Render the appropriate screen based on state
  switch (state) {
    case 'checking':
      return (
        <CheckingSeedPhraseImport
          seedPhrase={seedPhrase}
          onComplete={completeImport}
          onError={returnToInput}
          isTestBypass={isTestBypass()}
        />
      )
    
    case 'success':
      return <SuccessImport onComplete={completeImport} />
    
    case 'error':
      return <ErrorImport onTryAgain={returnToInput} onBack={returnToInput} />
    
    case 'input':
    default:
      return <ImportWalletScreen onBack={onBack} />
  }
}

/**
 * Main component for the wallet import flow
 * Wraps the internal flow with the provider
 */
export default function ImportFlow({ onComplete, _onBack }: ImportFlowProps) {
  return (
    <ImportProvider onComplete={onComplete}>
      <ImportFlowInternal onBack={_onBack} />
    </ImportProvider>
  )
} 