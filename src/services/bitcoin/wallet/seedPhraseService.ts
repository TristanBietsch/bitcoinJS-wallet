import * as bip39 from 'bip39'
import { Buffer } from 'buffer'
import * as SecureStore from 'expo-secure-store'

const SECURE_SEED_PHRASE_KEY = 'com.nummus.wallet.seed_phrase'

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
    return mnemonic.trim().split(/\s+/g)
  },
  
  /**
   * Store a seed phrase securely.
   * 
   * @param mnemonic The mnemonic seed phrase to store
   * @returns Promise resolving when storage is complete
   */
  storeSeedPhrase : async (mnemonic: string): Promise<void> => {
    await SecureStore.setItemAsync(SECURE_SEED_PHRASE_KEY, mnemonic)
  },
  
  /**
   * Retrieve a stored seed phrase securely.
   * 
   * @returns Promise resolving to the seed phrase or null if not found
   */
  retrieveSeedPhrase : async (): Promise<string | null> => {
    return SecureStore.getItemAsync(SECURE_SEED_PHRASE_KEY)
  },
  
  /**
   * Remove a stored seed phrase securely.
   * 
   * @returns Promise resolving when removal is complete
   */
  removeSeedPhrase : async (): Promise<void> => {
    await SecureStore.deleteItemAsync(SECURE_SEED_PHRASE_KEY)
  }
} 