import { useState, useEffect } from 'react'
import { 
  setupSeedPhraseProtection, 
  secureStoreSeedPhrase,
  clearSeedPhraseFromMemory
} from '@/src/utils/security/seedPhraseProtection'
import { createSecureDataContainer } from '@/src/utils/security/memoryProtection'
import { seedPhraseService } from '@/src/services/bitcoin/wallet/seedPhraseService'

/**
 * Custom hook to handle seed phrase security features
 */
export const useSeedPhraseSecurity = (seedPhrase: string) => {
  // Create secure container for seed phrase
  const [ secureContainer ] = useState(() => createSecureDataContainer<string>(''))
  const [ error, setError ] = useState<string | null>(null)
  
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
  }, [ ]) // Only run on mount/unmount
  
  // Update secure container when seedPhrase changes and is valid
  useEffect(() => {
    if (seedPhrase && seedPhrase.trim()) {
      secureContainer.setValue(seedPhrase.trim())
    }
  }, [ seedPhrase ])
  
  /**
   * Securely store the seed phrase and handle cleanup
   */
  const securelyStoreSeedPhrase = async (): Promise<boolean> => {
    try {
      console.log('Attempting to securely store seed phrase...')
      
      // Get the seed phrase from the secure container
      const securePhrase = secureContainer.getValue()
      
      if (!securePhrase) {
        setError('No seed phrase to store')
        return false
      }
      
      // First try using the simple seedPhraseService
      try {
        console.log('Storing with seedPhraseService...')
        await seedPhraseService.storeSeedPhrase(securePhrase, 'primary_seed')
        console.log('Successfully stored seed phrase with seedPhraseService')
        return true
      } catch (serviceError) {
        console.error('Failed to store with seedPhraseService, trying alternative:', serviceError)
        
        // Fall back to direct secure storage
        const seedPhraseId = `wallet_seed_${Date.now()}`
        await secureStoreSeedPhrase(seedPhraseId, securePhrase)
        console.log('Successfully stored seed phrase with direct method')
      }
        
        // Clear it from memory
        clearSeedPhraseFromMemory(seedPhrase)
        secureContainer.clear()
        
        return true
    } catch (error) {
      console.error('Failed to securely store seed phrase:', error)
      setError('Failed to securely store seed phrase. Please try again.')
      return false
    }
  }
  
  return {
    securelyStoreSeedPhrase,
    error,
    clearError : () => setError(null)
  }
} 