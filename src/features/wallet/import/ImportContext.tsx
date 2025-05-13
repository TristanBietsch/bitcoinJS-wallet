import React, { createContext, useContext, ReactNode, useState } from 'react'
import { TEST_ERROR_PHRASE, TEST_BYPASS_PHRASE } from '@/src/constants/testing'
import { bitcoinWalletService, BitcoinWallet } from '@/src/services/bitcoin/wallet/bitcoinWalletService'

// Define the possible states of the import flow
type ImportState = 'input' | 'checking' | 'success' | 'error'

// Define the context values and actions
interface ImportContextValue {
  // State values
  state: ImportState
  seedPhrase: string
  wallet: BitcoinWallet | null
  error: string | null
  
  // Actions
  setSeedPhrase: (phrase: string) => void
  startChecking: (phrase: string) => void
  completeImport: () => void
  failImport: (error?: string) => void
  returnToInput: () => void
  
  // Utility functions
  isTestBypass: () => boolean
  isTestError: () => boolean
}

// Create the context
const ImportContext = createContext<ImportContextValue | undefined>(undefined)

// Props for the provider
interface ImportProviderProps {
  children: ReactNode
  onComplete?: () => void
}

/**
 * Provider component that wraps the import flow and provides state management
 */
export function ImportProvider({ children, onComplete }: ImportProviderProps) {
  // State for the import flow
  const [ state, setState ] = useState<ImportState>('input')
  const [ seedPhrase, setSeedPhrase ] = useState('')
  const [ wallet, setWallet ] = useState<BitcoinWallet | null>(null)
  const [ error, setError ] = useState<string | null>(null)
  
  // Utility functions
  const isTestBypass = () => seedPhrase.trim() === TEST_BYPASS_PHRASE
  const isTestError = () => seedPhrase.trim() === TEST_ERROR_PHRASE
  
  // Action functions
  const startChecking = async (phrase: string) => {
    setSeedPhrase(phrase)
    setState('checking')
    
    try {
      // Test error phrase check
      if (phrase.trim() === TEST_ERROR_PHRASE) {
        setTimeout(() => {
          failImport('This is a test error')
        }, 2000)
        return
      }
      
      // Test bypass check
      if (phrase.trim() === TEST_BYPASS_PHRASE) {
        setTimeout(() => {
          completeImport()
        }, 2000)
        return
      }
      
      // Real import logic
      const importedWallet = await bitcoinWalletService.importFromMnemonic(phrase)
      setWallet(importedWallet)
      completeImport()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred during import'
      failImport(errorMessage)
    }
  }
  
  const completeImport = () => {
    setState('success')
    if (onComplete) onComplete()
  }
  
  const failImport = (errorMessage?: string) => {
    if (errorMessage) {
      setError(errorMessage)
    }
    setState('error')
  }
  
  const returnToInput = () => {
    setError(null)
    setState('input')
  }
  
  // Create the context value
  const value: ImportContextValue = {
    state,
    seedPhrase,
    wallet,
    error,
    setSeedPhrase,
    startChecking,
    completeImport,
    failImport,
    returnToInput,
    isTestBypass,
    isTestError
  }
  
  return (
    <ImportContext.Provider value={value}>
      {children}
    </ImportContext.Provider>
  )
}

/**
 * Hook for accessing the import context
 */
export function useImport() {
  const context = useContext(ImportContext)
  if (context === undefined) {
    throw new Error('useImport must be used within an ImportProvider')
  }
  return context
} 