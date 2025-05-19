import * as bip39 from 'bip39'
import { Buffer } from 'buffer'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Seed phrase word length options
 */
export type WordCount = 12 | 24

/**
 * Service for managing BIP39 seed phrases
 * Handles generation, validation, and conversion to seeds
 * NOTE: This implementation has NO encryption - FOR DEVELOPMENT USE ONLY
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
   * Store a seed phrase (temporarily with NO encryption)
   * 
   * @param mnemonic The mnemonic seed phrase to store
   * @param id Optional identifier (defaults to 'primary_seed')
   * @returns Promise resolving when storage is complete
   */
  storeSeedPhrase : async (mnemonic: string, id: string = 'primary_seed'): Promise<void> => {
    // TEMPORARY IMPLEMENTATION - STORES UNENCRYPTED
    // TODO: Replace with proper secure storage
    await AsyncStorage.setItem(`temp_seedphrase_${id}`, mnemonic)
    console.warn('WARNING: Seed phrase stored WITHOUT encryption - FOR DEVELOPMENT USE ONLY')
  },
  
  /**
   * Retrieve a stored seed phrase
   * 
   * @param id Optional identifier (defaults to 'primary_seed')
   * @returns Promise resolving to the seed phrase or null if not found
   */
  retrieveSeedPhrase : async (id: string = 'primary_seed'): Promise<string | null> => {
    // TEMPORARY IMPLEMENTATION - NO ENCRYPTION
    // TODO: Replace with proper secure storage retrieval
    return AsyncStorage.getItem(`temp_seedphrase_${id}`)
  },
  
  /**
   * Remove a stored seed phrase
   * 
   * @param id Optional identifier (defaults to 'primary_seed')
   * @returns Promise resolving when removal is complete
   */
  removeSeedPhrase : async (id: string = 'primary_seed'): Promise<void> => {
    // TEMPORARY IMPLEMENTATION - NO ENCRYPTION
    // TODO: Replace with proper secure deletion
    await AsyncStorage.removeItem(`temp_seedphrase_${id}`)
  }
} 