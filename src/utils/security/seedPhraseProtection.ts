/**
 * seedPhraseProtection.ts
 * 
 * Security utilities for handling seed phrases with proper protection measures.
 * This module implements best practices for handling sensitive mnemonic data.
 */

import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import * as ScreenCapture from 'expo-screen-capture'
import { bufferWipe } from './memoryProtection'

// Custom error class for security operations
export class SeedPhraseSecurityError extends Error {
  constructor(message: string, public readonly code: string) {
    super(`Security Error (${code}): ${message}`)
    this.name = 'SeedPhraseSecurityError'
  }
}

/**
 * Secure options for text input fields containing sensitive data
 */
export const secureSeedPhraseInputOptions = {
  // Prevent auto-correct and suggestions
  autoCorrect       : false,
  // Prevent caching the text
  autoComplete      : 'off' as const,
  // Don't auto-capitalize
  autoCapitalize    : 'none' as const,
  // Special keyboard that won't save input history
  secureTextEntry   : false, // Not true because we need to see the phrase, but other protections apply
  // Prevent spell checking
  spellCheck        : false,
  // Prevent text selection (reducing chance of clipboard access)
  selectTextOnFocus : false,
  // Disable smart punctuation which could alter the seed phrase
  keyboardType      : 'visible-password' as const,
  // Custom style to indicate secure input
  style             : { 
    backgroundColor : '#f5f5f5',
    borderWidth     : 1,
    borderColor     : '#c8c8c8'
  }
}

/**
 * Activate screen capture protection while viewing sensitive information
 */
export async function preventScreenCapture(): Promise<() => Promise<void>> {
  try {
    // Prevent screen recording
    await ScreenCapture.preventScreenCaptureAsync()
    
    // Return function to remove protection when done
    return async () => {
      try {
        await ScreenCapture.allowScreenCaptureAsync()
      } catch (error) {
        console.error('Failed to restore screen capture settings:', error)
        throw new SeedPhraseSecurityError(
          'Failed to restore screen capture settings',
          'SCREEN_RESTORE_FAILED'
        )
      }
    }
  } catch (error) {
    console.error('Failed to prevent screen capture:', error)
    throw new SeedPhraseSecurityError(
      'Failed to enable screen capture protection',
      'SCREEN_PROTECT_FAILED'
    )
  }
}

/**
 * Obfuscates a seed phrase in memory by splitting and encoding it
 * @param seedPhrase - The seed phrase to obfuscate
 * @returns Obfuscated data structure
 */
export function obfuscateSeedPhrase(seedPhrase: string): { parts: string[], checksum: number } {
  if (!seedPhrase) {
    throw new SeedPhraseSecurityError('Cannot obfuscate empty seed phrase', 'EMPTY_SEED')
  }
  
  // Create a simple checksum
  const checksum = seedPhrase.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  // Split the phrase into multiple parts to avoid contiguous storage
  const words = seedPhrase.split(' ')
  const parts: string[] = []
  
  // Store words in reversed chunks of 3, with padding
  for (let i = 0; i < words.length; i += 3) {
    const chunk = words.slice(i, i + 3)
    // Reverse and add random padding
    const reversedChunk = chunk.reverse().join('§')
    const randomPadding = Math.random().toString(36).substring(2, 8)
    parts.push(`${randomPadding}${reversedChunk}${randomPadding}`)
  }
  
  return { parts, checksum }
}

/**
 * Deobfuscates a previously obfuscated seed phrase
 * @param obfuscatedData - The obfuscated data structure
 * @returns The original seed phrase
 */
export function deobfuscateSeedPhrase(obfuscatedData: { parts: string[], checksum: number }): string {
  try {
    const { parts, checksum } = obfuscatedData
    
    // Process each part to extract the original words
    const allWords: string[] = []
    
    parts.forEach(part => {
      // Remove the random padding (first and last 6 characters)
      const contentWithoutPadding = part.substring(6, part.length - 6)
      // Split by the separator and reverse to original order
      const wordsInChunk = contentWithoutPadding.split('§').reverse()
      allWords.push(...wordsInChunk)
    })
    
    const seedPhrase = allWords.join(' ')
    
    // Verify checksum
    const calculatedChecksum = seedPhrase.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    if (calculatedChecksum !== checksum) {
      throw new SeedPhraseSecurityError('Seed phrase integrity check failed', 'CHECKSUM_FAILED')
    }
    
    return seedPhrase
  } catch (error) {
    if (error instanceof SeedPhraseSecurityError) {
      throw error
    }
    throw new SeedPhraseSecurityError('Failed to deobfuscate seed phrase', 'DEOBFUSCATE_FAILED')
  }
}

/**
 * Securely store a seed phrase (only temporary storage when absolutely necessary)
 * @param id - Unique identifier for retrieval
 * @param seedPhrase - The seed phrase to store securely
 */
export async function secureStoreSeedPhrase(id: string, seedPhrase: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      throw new SeedPhraseSecurityError('Secure storage not available on web platform', 'WEB_UNSUPPORTED')
    }
    
    if (!id || !seedPhrase) {
      throw new SeedPhraseSecurityError('Invalid id or seed phrase', 'INVALID_INPUT')
    }
    
    // Obfuscate before storing
    const obfuscatedData = obfuscateSeedPhrase(seedPhrase)
    
    // Store with max security options
    await SecureStore.setItemAsync(id, JSON.stringify(obfuscatedData), {
      // Require authentication for access if available
      requireAuthentication : true,
      // Only accessible when device is unlocked
      keychainAccessible    : SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
    })
  } catch (error) {
    console.error('Failed to store seed phrase:', error instanceof Error ? error.message : String(error))
    
    if (error instanceof SeedPhraseSecurityError) {
      throw error
    }
    
    throw new SeedPhraseSecurityError(
      'Failed to securely store seed phrase',
      'STORE_FAILED'
    )
  }
}

/**
 * Retrieve a securely stored seed phrase
 * @param id - The identifier used during storage
 */
export async function secureRetrieveSeedPhrase(id: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      throw new SeedPhraseSecurityError('Secure storage not available on web platform', 'WEB_UNSUPPORTED')
    }
    
    if (!id) {
      throw new SeedPhraseSecurityError('Invalid id', 'INVALID_INPUT')
    }
    
    const storedData = await SecureStore.getItemAsync(id)
    
    if (!storedData) {
      return null
    }
    
    // Parse and deobfuscate
    const obfuscatedData = JSON.parse(storedData)
    return deobfuscateSeedPhrase(obfuscatedData)
  } catch (error) {
    console.error('Failed to retrieve seed phrase:', error instanceof Error ? error.message : String(error))
    
    if (error instanceof SeedPhraseSecurityError) {
      throw error
    }
    
    throw new SeedPhraseSecurityError(
      'Failed to retrieve seed phrase',
      'RETRIEVE_FAILED'
    )
  }
}

/**
 * Delete a securely stored seed phrase
 * @param id - The identifier used during storage
 */
export async function secureDeleteSeedPhrase(id: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      throw new SeedPhraseSecurityError('Secure storage not available on web platform', 'WEB_UNSUPPORTED')
    }
    
    if (!id) {
      throw new SeedPhraseSecurityError('Invalid id', 'INVALID_INPUT')
    }
    
    await SecureStore.deleteItemAsync(id)
  } catch (error) {
    console.error('Failed to delete seed phrase:', error instanceof Error ? error.message : String(error))
    
    if (error instanceof SeedPhraseSecurityError) {
      throw error
    }
    
    throw new SeedPhraseSecurityError(
      'Failed to delete seed phrase',
      'DELETE_FAILED'
    )
  }
}

/**
 * Securely clear a seed phrase from memory
 * @param seedPhraseRef - Reference to the seed phrase string or buffer
 */
export function clearSeedPhraseFromMemory(seedPhraseRef: string | Buffer): void {
  try {
    if (typeof seedPhraseRef === 'string') {
      // For strings, we can't truly overwrite memory in JavaScript
      // The best we can do is replace with empty string to allow garbage collection
      seedPhraseRef = ''
    } else {
      // For buffers, we can actually overwrite memory
      bufferWipe(seedPhraseRef)
    }
  } catch (error) {
    console.error('Failed to clear seed phrase from memory:', error instanceof Error ? error.message : String(error))
    // Don't throw here as this is usually called in cleanup paths
  }
}

/**
 * Setup protection for a component handling seed phrases
 * @returns cleanup function to restore normal behavior
 */
export async function setupSeedPhraseProtection(): Promise<() => Promise<void>> {
  try {
    // Prevent screen capture while viewing/entering seed phrase
    const removeScreenCaptureProtection = await preventScreenCapture()
    
    // Return cleanup function
    return async () => {
      try {
        await removeScreenCaptureProtection()
      } catch (error) {
        console.error('Error during cleanup:', error instanceof Error ? error.message : String(error))
        // Don't throw from cleanup function
      }
    }
  } catch (error) {
    console.error('Failed to setup seed phrase protection:', error instanceof Error ? error.message : String(error))
    
    if (error instanceof SeedPhraseSecurityError) {
      throw error
    }
    
    throw new SeedPhraseSecurityError(
      'Failed to setup seed phrase protection',
      'PROTECTION_SETUP_FAILED'
    )
  }
} 