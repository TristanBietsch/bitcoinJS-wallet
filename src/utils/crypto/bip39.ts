import {
  validateMnemonic,
  mnemonicToSeedSync,
  mnemonicToEntropy,
  entropyToMnemonic
} from '@scure/bip39'
import { randomBytes } from 'crypto'
import { WordlistLanguage, getWordlist } from '@/src/utils/validation/wordlistValidation'

/**
 * Entropy lengths (in bits) for different mnemonic word counts
 */
export const ENTROPY_BITS = {
  12 : 128, // 128 bits = 16 bytes
  15 : 160, // 160 bits = 20 bytes
  18 : 192, // 192 bits = 24 bytes
  21 : 224, // 224 bits = 28 bytes
  24 : 256  // 256 bits = 32 bytes
} as const

/**
 * Generate a random BIP-39 mnemonic phrase
 * 
 * @param wordCount - Number of words (12, 15, 18, 21, or 24)
 * @param language - Language to use for the wordlist
 * @returns A random mnemonic phrase
 */
export function generateRandomMnemonic(
  wordCount: keyof typeof ENTROPY_BITS = 12,
  language: WordlistLanguage = WordlistLanguage.ENGLISH
): string {
  const entropyBits = ENTROPY_BITS[wordCount]
  const entropyBytes = entropyBits / 8
  
  // Generate random entropy
  const entropy = randomBytes(entropyBytes)
  
  // Get wordlist for the selected language
  const wordlist = getWordlist(language)
  
  // Generate mnemonic from entropy
  return entropyToMnemonic(entropy, wordlist)
}

/**
 * Validate a mnemonic phrase
 * 
 * @param mnemonic - The mnemonic phrase to validate
 * @param language - Language of the mnemonic
 * @returns True if the mnemonic is valid
 */
export function isValidMnemonic(
  mnemonic: string,
  language: WordlistLanguage = WordlistLanguage.ENGLISH
): boolean {
  if (!mnemonic) return false
  
  try {
    // Clean the mnemonic (remove extra spaces, normalize case)
    const cleanedMnemonic = normalizeMnemonic(mnemonic)
    
    // Get wordlist for the selected language
    const wordlist = getWordlist(language)
    
    // Validate the mnemonic against the wordlist
    return validateMnemonic(cleanedMnemonic, wordlist)
  } catch (_error) {
    return false
  }
}

/**
 * Convert a mnemonic phrase to a seed
 * 
 * @param mnemonic - The mnemonic phrase to convert
 * @param passphrase - Optional passphrase for additional security
 * @returns The seed as a Uint8Array
 */
export function mnemonicToSeed(
  mnemonic: string,
  passphrase: string = ''
): Uint8Array {
  const cleanedMnemonic = normalizeMnemonic(mnemonic)
  return mnemonicToSeedSync(cleanedMnemonic, passphrase)
}

/**
 * Convert a mnemonic to a hex seed string
 * 
 * @param mnemonic - The mnemonic phrase to convert
 * @param passphrase - Optional passphrase for additional security
 * @returns The seed as a hex string
 */
export function mnemonicToSeedHex(
  mnemonic: string,
  passphrase: string = ''
): string {
  const seed = mnemonicToSeed(mnemonic, passphrase)
  return Buffer.from(seed).toString('hex')
}

/**
 * Convert a mnemonic to entropy
 * 
 * @param mnemonic - The mnemonic phrase to convert
 * @param language - Language of the mnemonic
 * @returns The entropy as a Uint8Array
 */
export function mnemonicToEntropyBytes(
  mnemonic: string,
  language: WordlistLanguage = WordlistLanguage.ENGLISH
): Uint8Array {
  const cleanedMnemonic = normalizeMnemonic(mnemonic)
  const wordlist = getWordlist(language)
  return mnemonicToEntropy(cleanedMnemonic, wordlist)
}

/**
 * Convert entropy to a mnemonic phrase
 * 
 * @param entropy - The entropy as a Uint8Array or Buffer
 * @param language - Language to use for the wordlist
 * @returns A mnemonic phrase
 */
export function entropyBytesToMnemonic(
  entropy: Uint8Array | Buffer,
  language: WordlistLanguage = WordlistLanguage.ENGLISH
): string {
  const wordlist = getWordlist(language)
  return entropyToMnemonic(entropy, wordlist)
}

/**
 * Normalize a mnemonic by removing extra spaces and converting to lowercase
 * 
 * @param mnemonic - The mnemonic to normalize
 * @returns The normalized mnemonic
 */
export function normalizeMnemonic(mnemonic: string): string {
  return mnemonic
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
}

/**
 * Count the number of words in a mnemonic phrase
 * 
 * @param mnemonic - The mnemonic phrase
 * @returns The number of words
 */
export function getWordCount(mnemonic: string): number {
  const cleanedMnemonic = normalizeMnemonic(mnemonic)
  return cleanedMnemonic.split(' ').length
}

/**
 * Get the entropy size (in bits) required for a specific word count
 * 
 * @param wordCount - The number of words (12, 15, 18, 21, or 24)
 * @returns The entropy size in bits or undefined if invalid word count
 */
export function getEntropyBits(wordCount: number): number | undefined {
  return ENTROPY_BITS[wordCount as keyof typeof ENTROPY_BITS]
}

/**
 * Get the word count for a given entropy size
 * 
 * @param entropyBits - The entropy size in bits
 * @returns The word count or undefined if invalid entropy size
 */
export function getWordCountFromEntropyBits(entropyBits: number): number | undefined {
  for (const [ wordCount, bits ] of Object.entries(ENTROPY_BITS)) {
    if (bits === entropyBits) {
      return parseInt(wordCount, 10)
    }
  }
  return undefined
} 