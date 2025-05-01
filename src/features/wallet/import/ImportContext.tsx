import React, { createContext, useContext, ReactNode, useState } from 'react'
import { TEST_ERROR_PHRASE, TEST_BYPASS_PHRASE } from '@/src/constants/testing'

// Define the possible states of the import flow
type ImportState = 'input' | 'checking' | 'success' | 'error'

// Define the context values and actions
interface ImportContextValue {
  // State values
  state: ImportState
  seedPhrase: string
  
  // Actions
  setSeedPhrase: (phrase: string) => void
  startChecking: (phrase: string) => void
  completeImport: () => void
  failImport: () => void
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
  
  // Utility functions
  const isTestBypass = () => seedPhrase.trim() === TEST_BYPASS_PHRASE
  const isTestError = () => seedPhrase.trim() === TEST_ERROR_PHRASE
  
  // Action functions
  const startChecking = (phrase: string) => {
    setSeedPhrase(phrase)
    setState('checking')
  }
  
  const completeImport = () => {
    setState('success')
    if (onComplete) onComplete()
  }
  
  const failImport = () => {
    setState('error')
  }
  
  const returnToInput = () => {
    setState('input')
  }
  
  // Create the context value
  const value: ImportContextValue = {
    state,
    seedPhrase,
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