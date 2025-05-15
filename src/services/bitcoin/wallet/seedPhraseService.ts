import * as bip39 from 'bip39'
import { Buffer } from 'buffer'
import { secureStore } from '@/src/services/storage/secureStore'
import { rotateEncryptionKey, generateRandomGarbageData } from '@/src/utils/security/encryptionUtils'

/**
 * Seed phrase word length options
 */
export type WordCount = 12 | 24

/**
 * Service for managing BIP39 seed phrases
 * Handles generation, validation, and conversion to seeds
 */
export const seedPhraseService = {
  /**
   * Generate a new BIP39 mnemonic seed phrase
   * 
   * @param wordCount Number of words in the seed phrase (12 or 24)
   * @returns A string containing the generated mnemonic
   */
  generateSeedPhrase : (wordCount: WordCount = 12): string => {
    // Determine entropy bits based on word count (128 for 12 words, 256 for 24 words)
    const entropyBits = wordCount === 24 ? 256 : 128
    
    // Generate a random mnemonic with the specified entropy
    return bip39.generateMnemonic(entropyBits)
  },
  
  /**
   * Validate if a string is a valid BIP39 mnemonic seed phrase
   * 
   * @param mnemonic The mnemonic phrase to validate
   * @returns Boolean indicating validity
   */
  validateMnemonic : (mnemonic: string): boolean => {
    return bip39.validateMnemonic(mnemonic)
  },
  
  /**
   * Convert a mnemonic seed phrase to a seed buffer
   * (Used for key derivation)
   * 
   * @param mnemonic The mnemonic seed phrase
   * @param passphrase Optional passphrase for additional security (BIP39 passphrase)
   * @returns Promise resolving to a Buffer containing the seed
   */
  mnemonicToSeed : async (mnemonic: string, passphrase: string = ''): Promise<Buffer> => {
    const seed = await bip39.mnemonicToSeed(mnemonic, passphrase)
    return Buffer.from(seed)
  },
  
  /**
   * Get the individual words from a seed phrase
   * 
   * @param mnemonic The mnemonic seed phrase
   * @returns Array of individual words
   */
  getWords : (mnemonic: string): string[] => {
    return mnemonic.trim().split(/\s+/)
  },
  
  /**
   * Securely store a seed phrase with app-level encryption
   * 
   * @param mnemonic The mnemonic seed phrase to store
   * @param id Optional identifier (defaults to 'primary_seed')
   * @returns Promise resolving when storage is complete
   */
  storeSeedPhrase : async (mnemonic: string, id: string = 'primary_seed'): Promise<void> => {
    // Use a more secure storage key derived from the ID
    await secureStore.set(`seed_phrase_${id}`, mnemonic)
    
    // If this is a new wallet, rotate the encryption key
    // This ensures each seed phrase is encrypted with a fresh key
    await rotateEncryptionKey()
  },
  
  /**
   * Retrieve a stored seed phrase
   * 
   * @param id Optional identifier (defaults to 'primary_seed')
   * @returns Promise resolving to the seed phrase or null if not found
   */
  retrieveSeedPhrase : async (id: string = 'primary_seed'): Promise<string | null> => {
    return secureStore.get(`seed_phrase_${id}`)
  },
  
  /**
   * Remove a stored seed phrase from secure storage with secure deletion
   * 
   * @param id Optional identifier (defaults to 'primary_seed')
   * @returns Promise resolving when removal is complete
   */
  removeSeedPhrase : async (id: string = 'primary_seed'): Promise<void> => {
    const key = `seed_phrase_${id}`
    
    try {
      // First overwrite with garbage data to ensure it's not recoverable
      const garbageData = await generateRandomGarbageData(1024)
      await secureStore.set(key, garbageData)
      
      // Then delete it
      await secureStore.delete(key)
    } catch (error) {
      console.error('Error securely removing seed phrase:', error)
      // Still try regular deletion as fallback
      await secureStore.delete(key)
    }
  }
} 