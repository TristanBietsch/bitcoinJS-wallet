/**
 * seedPhraseProtection.ts
 * 
 * Security utilities for handling seed phrases with proper protection measures.
 * This module implements best practices for handling sensitive mnemonic data.
 * 
 * NOTE: THIS IS TEMPORARY IMPLEMENTATION WITH NO ENCRYPTION - FOR DEVELOPMENT USE ONLY
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ScreenCapture from 'expo-screen-capture'
import { bufferWipe } from './memoryProtection'

// Define BufferLike interface inline to avoid import issues
interface BufferLike {
  length: number;
  fill(value: number): BufferLike;
  set?(array: Uint8Array): void;
}

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
 * Securely store a seed phrase (only temporary storage when absolutely necessary)
 * TEMPORARY IMPLEMENTATION - NO ENCRYPTION
 * 
 * @param id - Unique identifier for retrieval
 * @param seedPhrase - The seed phrase to store 
 */
export async function secureStoreSeedPhrase(id: string, seedPhrase: string): Promise<void> {
  try {
    if (!id || !seedPhrase) {
      throw new SeedPhraseSecurityError('Invalid id or seed phrase', 'INVALID_INPUT')
    }
    
    // TEMPORARY IMPLEMENTATION - STORES UNENCRYPTED
    // TODO: Replace with proper secure storage
    await AsyncStorage.setItem(`temp_${id}`, seedPhrase)
    console.warn('WARNING: Seed phrase stored WITHOUT encryption - FOR DEVELOPMENT USE ONLY')
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
 * Retrieve a stored seed phrase
 * TEMPORARY IMPLEMENTATION - NO ENCRYPTION
 * 
 * @param id - The identifier used during storage
 */
export async function secureRetrieveSeedPhrase(id: string): Promise<string | null> {
  try {
    if (!id) {
      throw new SeedPhraseSecurityError('Invalid id', 'INVALID_INPUT')
    }
    
    // TEMPORARY IMPLEMENTATION - NO ENCRYPTION
    return await AsyncStorage.getItem(`temp_${id}`)
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
 * Delete a stored seed phrase
 * TEMPORARY IMPLEMENTATION - NO ENCRYPTION
 * 
 * @param id - The identifier used during storage
 */
export async function secureDeleteSeedPhrase(id: string): Promise<void> {
  try {
    if (!id) {
      throw new SeedPhraseSecurityError('Invalid id', 'INVALID_INPUT')
    }
    
    // TEMPORARY IMPLEMENTATION - NO ENCRYPTION
    await AsyncStorage.removeItem(`temp_${id}`)
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
export function clearSeedPhraseFromMemory(seedPhraseRef: string | unknown): void {
  try {
    if (typeof seedPhraseRef === 'string') {
      // For strings, we can't truly overwrite memory in JavaScript
      // The best we can do is replace with empty string to allow garbage collection
      seedPhraseRef = ''
    } else if (seedPhraseRef && typeof seedPhraseRef === 'object') {
      // Check if the object has buffer-like properties before wiping
      const bufferCandidate = seedPhraseRef as Record<string, unknown>
      
      if (
        typeof bufferCandidate.length === 'number' &&
        typeof bufferCandidate.fill === 'function'
      ) {
        // For Buffer-like objects, we can actually overwrite memory
        bufferWipe(seedPhraseRef as BufferLike)
      }
    }
  } catch (error) {
    console.error(
      'Failed to clear seed phrase from memory:',
      error instanceof Error ? error.message : String(error)
    )
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