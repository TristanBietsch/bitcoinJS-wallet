import { useState, useEffect } from 'react'
import { 
  setupSeedPhraseProtection,
  clearSeedPhraseFromMemory
} from '@/src/utils/security/seedPhraseProtection'
import { createSecureDataContainer } from '@/src/utils/security/memoryProtection'
import { seedPhraseService } from '@/src/services/bitcoin/wallet/seedPhraseService'

/**
 * Custom hook to handle seed phrase security features
 * NOTE: THIS IS TEMPORARY IMPLEMENTATION WITH NO ENCRYPTION - FOR DEVELOPMENT USE ONLY
 */
export const useSeedPhraseSecurity = (seedPhrase: string) => {
  // Create secure container for seed phrase
  const [ secureContainer ] = useState(() => createSecureDataContainer<string>(''))
  const [ error, setError ] = useState<string | null>(null)
  const [ loading, setLoading ] = useState(false)
  
  // Set up security protections when hook mounts
  useEffect(() => {
    let cleanup: (() => Promise<void>) | null = null
    
    // Set up security protections
    const setupProtection = async () => {
      try {
        cleanup = await setupSeedPhraseProtection()
      } catch (error) {
        console.error('Failed to set up screen protection:', error)
        setError('Failed to enable screen protection')
      }
    }
    
    setupProtection()
    
    // Clean up security protections when unmounting
    return () => {
      if (cleanup) {
        cleanup().catch(err => console.error('Error during cleanup:', err))
      }
      
      // Clear seed phrase from memory
      if (seedPhrase) {
        clearSeedPhraseFromMemory(seedPhrase)
        secureContainer.clear()
      }
    }
  }, [ secureContainer, seedPhrase ])
  
  // Update secure container when seedPhrase changes and is valid
  useEffect(() => {
    if (seedPhrase && seedPhrase.trim()) {
      secureContainer.setValue(seedPhrase.trim())
    }
  }, [ seedPhrase, secureContainer ])
  
  /**
   * Store the seed phrase
   * TEMPORARY IMPLEMENTATION WITH NO ENCRYPTION - FOR DEVELOPMENT USE ONLY
   */
  const securelyStoreSeedPhrase = async (): Promise<boolean> => {
    try {
      console.log('Attempting to store seed phrase...')
      console.warn('WARNING: Seed phrase will be stored WITHOUT encryption - FOR DEVELOPMENT USE ONLY')
      
      // Get the seed phrase from the secure container
      const securePhrase = secureContainer.getValue()
      
      if (!securePhrase) {
        setError('No seed phrase to store')
        return false
      }
      
      // Store with the seedPhraseService
      setLoading(true)
      setError(null)
      
      try {
        await seedPhraseService.storeSeedPhrase(securePhrase)
        console.log('Successfully stored seed phrase with seedPhraseService')
        
        // Clear it from memory
        clearSeedPhraseFromMemory(seedPhrase)
        secureContainer.clear()
        
        setLoading(false)
        return true
      } catch (error) {
        console.error('Failed to store seed phrase:', error)
        setError('Failed to store seed phrase. Please try again.')
        setLoading(false)
        return false
      }
    } catch (error) {
      console.error('Failed to store seed phrase:', error)
      setError('Failed to store seed phrase. Please try again.')
      setLoading(false)
      return false
    }
  }
  
  return {
    securelyStoreSeedPhrase,
    error,
    loading,
    clearError : () => setError(null)
  }
} 