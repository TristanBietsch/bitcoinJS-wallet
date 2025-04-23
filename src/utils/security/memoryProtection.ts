/**
 * memoryProtection.ts
 * 
 * Utilities for secure memory handling, particularly focused on
 * wiping sensitive data from memory when no longer needed.
 */

// Import shared type definitions
import type { BufferLike } from './memoryTypes'

// Custom error class for memory security operations
export class MemorySecurityError extends Error {
  constructor(message: string, public readonly code: string) {
    super(`Memory Security Error (${code}): ${message}`)
    this.name = 'MemorySecurityError'
  }
}

/**
 * Check if we're in an environment with Node.js Buffer
 */
const hasBuffer = (): boolean => {
  try {
    return typeof Buffer !== 'undefined'
  } catch (error) {
    // Log the error in development environments
    if (process.env.NODE_ENV === 'development') {
      console.debug('Buffer check failed:', error)
    }
    return false
  }
}

/**
 * Safely determine if an object is Buffer-like (can be wiped)
 */
function isWipeableBuffer(value: unknown): value is BufferLike {
  if (!value) return false
  
  // Check if it's a Node.js Buffer
  if (hasBuffer() && typeof Buffer !== 'undefined') {
    try {
      if (value instanceof Buffer) return true
    } catch (error) {
      // Log the error in development environments
      if (process.env.NODE_ENV === 'development') {
        console.debug('Buffer instance check failed:', error)
      }
    }
  }
  
  // Check if it's a typed array or has buffer-like capabilities
  const obj = value as Record<string, unknown>
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.length === 'number' && 
    typeof obj.fill === 'function'
  )
}

/**
 * Wipe a buffer by overwriting its contents
 * This helps ensure sensitive data doesn't remain in memory
 * 
 * @param buffer - The buffer containing sensitive data to be wiped
 */
export function bufferWipe(buffer: BufferLike): void {
  try {
    if (!buffer || !isWipeableBuffer(buffer)) {
      return
    }
    
    // Multiple-pass overwrite with different patterns
    // First pass: zeroes
    buffer.fill(0)
    
    // Second pass: ones
    buffer.fill(255)
    
    // Third pass: random data
    if (typeof buffer.set === 'function') {
      const randomBytes = new Uint8Array(buffer.length)
      for (let i = 0; i < buffer.length; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256)
      }
      buffer.set(randomBytes)
    } else {
      // Fallback if set is not available
      for (let i = 0; i < buffer.length; i++) {
        // @ts-ignore - We can't type this perfectly across all buffer types
        buffer[i] = Math.floor(Math.random() * 256)
      }
    }
    
    // Final pass: zeroes again
    buffer.fill(0)
  } catch (error) {
    console.error('Buffer wipe failed:', error instanceof Error ? error.message : String(error))
  }
}

/**
 * Create a secure object that can hold sensitive data temporarily
 * and provide methods to securely dispose of it
 * 
 * @param initialValue - The sensitive data to store
 * @returns An object with the value and methods to securely handle it
 */
export function createSecureDataContainer<T>(initialValue: T) {
  // For string values, use obfuscation
  let value: T | null = initialValue
  let obfuscationKey: number[] | null = null
  
  // If the value is a string, obfuscate it immediately
  if (typeof initialValue === 'string') {
    try {
      const result = obfuscateStringInMemory(initialValue)
      value = result.obfuscatedValue as unknown as T
      obfuscationKey = result.key
    } catch (error) {
      console.error('Failed to initialize secure container:', 
        error instanceof Error ? error.message : String(error))
    }
  }
  
  return {
    /**
     * Get the stored value
     */
    getValue : (): T | null => {
      try {
        // If the value is obfuscated, deobfuscate it
        if (obfuscationKey && typeof value === 'string') {
          return deobfuscateStringInMemory(value, obfuscationKey) as unknown as T
        }
        return value
      } catch (error) {
        console.error('Failed to get value:', error instanceof Error ? error.message : String(error))
        throw new MemorySecurityError('Failed to retrieve secure value', 'GET_VALUE_FAILED')
      }
    },
    
    /**
     * Clear the value from memory
     */
    clear : (): void => {
      try {
        // For Buffer objects, we can actively wipe
        if (isWipeableBuffer(value)) {
          bufferWipe(value as unknown as BufferLike)
        } else if (typeof value === 'string') {
          // Clear any obfuscated string by replacing with empty string
          value = '' as unknown as T
        }
        
        // Clear the obfuscation key
        if (obfuscationKey) {
          try {
            // Try to use a typed array for secure wiping
            const keyArray = new Uint8Array(obfuscationKey)
            keyArray.fill(0)
          } catch (error) {
            // Log issue with typed arrays in development
            if (process.env.NODE_ENV === 'development') {
              console.debug('TypedArray wiping failed, using fallback:', error)
            }
            // Fallback to manual clearing if typed arrays not supported
            for (let i = 0; i < obfuscationKey.length; i++) {
              obfuscationKey[i] = 0
            }
          }
          
          obfuscationKey = null
        }
        
        // For all types, set to null to allow garbage collection
        value = null
      } catch (error) {
        console.error('Failed to clear value:', error instanceof Error ? error.message : String(error))
        // Don't throw on cleanup paths
      }
    },
    
    /**
     * Replace the current value with a new value
     */
    setValue : (newValue: T): void => {
      try {
        // If current value is a buffer-like object, wipe it first
        if (isWipeableBuffer(value)) {
          bufferWipe(value as unknown as BufferLike)
        }
        
        // Clear any existing obfuscation key
        if (obfuscationKey) {
          try {
            // Try to use a typed array for secure wiping
            const keyArray = new Uint8Array(obfuscationKey)
            keyArray.fill(0)
          } catch (error) {
            // Log issue with typed arrays in development
            if (process.env.NODE_ENV === 'development') {
              console.debug('TypedArray wiping failed, using fallback:', error)
            }
            // Fallback to manual clearing if typed arrays not supported
            for (let i = 0; i < obfuscationKey.length; i++) {
              obfuscationKey[i] = 0
            }
          }
          
          obfuscationKey = null
        }
        
        // If new value is a string, obfuscate it
        if (typeof newValue === 'string') {
          const result = obfuscateStringInMemory(newValue)
          value = result.obfuscatedValue as unknown as T
          obfuscationKey = result.key
        } else {
          value = newValue
        }
      } catch (error) {
        console.error('Failed to set value:', error instanceof Error ? error.message : String(error))
        throw new MemorySecurityError('Failed to securely set value', 'SET_VALUE_FAILED')
      }
    }
  }
}

/**
 * Obfuscate a string in memory using XOR encryption with a random key
 * @param input - The sensitive string to obfuscate
 * @returns Object containing the obfuscated value and the key
 */
export function obfuscateStringInMemory(input: string): { obfuscatedValue: string, key: number[] } {
  try {
    if (!input) {
      return { obfuscatedValue: '', key: [] }
    }
    
    // Generate a random key
    const key: number[] = []
    const chars = input.split('')
    
    // Convert to obfuscated form using XOR with random key
    const obfuscated = chars.map(char => {
      const charCode = char.charCodeAt(0)
      const randomKey = Math.floor(Math.random() * 256)
      key.push(randomKey)
      
      // XOR the char code with random key and convert back to character
      return String.fromCharCode(charCode ^ randomKey)
    })
    
    return {
      obfuscatedValue : obfuscated.join(''),
      key
    }
  } catch (error) {
    console.error('String obfuscation failed:', error instanceof Error ? error.message : String(error))
    throw new MemorySecurityError('Failed to obfuscate string', 'OBFUSCATE_FAILED')
  }
}

/**
 * Deobfuscate a previously obfuscated string using its key
 * @param obfuscatedValue - The obfuscated string
 * @param key - The key used for obfuscation
 * @returns The original string
 */
export function deobfuscateStringInMemory(obfuscatedValue: string, key: number[]): string {
  try {
    if (!obfuscatedValue || !key.length) {
      return ''
    }
    
    if (obfuscatedValue.length !== key.length) {
      throw new MemorySecurityError('Key length mismatch', 'KEY_LENGTH_MISMATCH')
    }
    
    // Convert back using XOR with the same key
    const chars = obfuscatedValue.split('')
    const deobfuscated = chars.map((char, index) => {
      const charCode = char.charCodeAt(0)
      // XOR with the same key value to get original
      return String.fromCharCode(charCode ^ key[index])
    })
    
    return deobfuscated.join('')
  } catch (error) {
    console.error('String deobfuscation failed:', error instanceof Error ? error.message : String(error))
    throw new MemorySecurityError('Failed to deobfuscate string', 'DEOBFUSCATE_FAILED')
  }
}

/**
 * Helper method to safely run a function with sensitive data
 * and ensure cleanup happens properly even if an error occurs
 * 
 * @param sensitiveData - The sensitive data to use
 * @param operation - Function that uses the sensitive data
 * @returns The result of the operation
 */
export async function withSecureOperation<T, R>(
  sensitiveData: T,
  operation: (data: T) => Promise<R>
): Promise<R> {
  try {
    // Run the operation with the sensitive data
    return await operation(sensitiveData)
  } catch (error) {
    console.error('Secure operation failed:', error instanceof Error ? error.message : String(error))
    throw error
  } finally {
    // Always try to clean up, regardless of success/failure
    try {
      if (isWipeableBuffer(sensitiveData)) {
        bufferWipe(sensitiveData as unknown as BufferLike)
      } else if (typeof sensitiveData === 'string' && sensitiveData.length > 0) {
        // For strings, we can't truly wipe memory in JavaScript
        // But we can try to help GC by removing references
         
        sensitiveData = '' as unknown as T
      }
    } catch (cleanupError) {
      console.error('Cleanup during secure operation failed:', 
        cleanupError instanceof Error ? cleanupError.message : String(cleanupError))
    }
  }
} 