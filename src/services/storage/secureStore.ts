import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { 
  encryptData, 
  decryptData, 
  deriveStorageKey, 
  encryptWithWebCrypto, 
  decryptWithWebCrypto,
  generateRandomGarbageData
} from '@/src/utils/security/encryptionUtils'

/**
 * Service for handling secure storage of sensitive data
 * Wraps SecureStore with additional functionality
 */
export const secureStore = {
  /**
   * Store a value securely with app-level encryption
   * 
   * @param key The key to store the value under
   * @param value The value to store
   * @param options Additional options
   * @returns Promise that resolves when the storage is complete
   */
  set : async (key: string, value: string, options: { noEncryption?: boolean } = {}): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        console.warn('SecureStore is not available on web platform')
        // Use Web Crypto API for web
        const encryptedValue = await encryptWithWebCrypto(value)
        localStorage.setItem(key, encryptedValue)
        return
      }
      
      // Check if SecureStore is available
      if (!SecureStore.isAvailableAsync || !(await SecureStore.isAvailableAsync())) {
        throw new Error('SecureStore not available on this device')
      }
      
      // Derive a storage key from the original key for enhanced security
      const derivedKey = deriveStorageKey('nummus_storage', key)
      
      // Encrypt the value before storing (unless explicitly disabled)
      const valueToStore = options.noEncryption ? value : await encryptData(value)
      
      await SecureStore.setItemAsync(derivedKey, valueToStore, {
        // Only accessible when device is unlocked
        keychainAccessible : SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
      })
    } catch (error) {
      console.error('Error in secureStore.set:', error)
      throw new Error(`Failed to securely store data: ${error instanceof Error ? error.message : String(error)}`)
    }
  },
  
  /**
   * Retrieve a securely stored value
   * 
   * @param key The key to retrieve
   * @param options Additional options
   * @returns Promise that resolves to the stored value or null if not found
   */
  get : async (key: string, options: { noDecryption?: boolean } = {}): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        console.warn('SecureStore is not available on web platform')
        // Use Web Crypto API for web
        const encryptedValue = localStorage.getItem(key)
        if (!encryptedValue) return null
        return await decryptWithWebCrypto(encryptedValue)
      }
      
      // Derive the same storage key
      const derivedKey = deriveStorageKey('nummus_storage', key)
      
      const encryptedValue = await SecureStore.getItemAsync(derivedKey)
      if (encryptedValue === null) return null
      
      // Decrypt the value before returning (unless explicitly disabled)
      return options.noDecryption ? encryptedValue : await decryptData(encryptedValue)
    } catch (error) {
      console.error('Error in secureStore.get:', error)
      return null
    }
  },
  
  /**
   * Delete a securely stored value with secure wiping
   * 
   * @param key The key to delete
   * @returns Promise that resolves when deletion is complete
   */
  delete : async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        console.warn('SecureStore is not available on web platform')
        // Overwrite with random data before removing
        const garbageData = await generateRandomGarbageData(1024)
        localStorage.setItem(key, garbageData)
        localStorage.removeItem(key)
        return
      }
      
      // Derive the same storage key
      const derivedKey = deriveStorageKey('nummus_storage', key)
      
      // First overwrite with garbage data to ensure it's not recoverable
      const garbageData = await generateRandomGarbageData(1024)
      await SecureStore.setItemAsync(derivedKey, garbageData)
      
      // Then delete it
      await SecureStore.deleteItemAsync(derivedKey)
    } catch (error) {
      console.error('Error in secureStore.delete:', error)
      throw new Error(`Failed to delete secure data: ${error instanceof Error ? error.message : String(error)}`)
    }
  },
  
  /**
   * Check if a key exists in secure storage
   * 
   * @param key The key to check
   * @returns Promise that resolves to boolean indicating if the key exists
   */
  exists : async (key: string): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        console.warn('SecureStore is not available on web platform')
        return localStorage.getItem(key) !== null
      }
      
      // Derive the same storage key
      const derivedKey = deriveStorageKey('nummus_storage', key)
      
      const value = await SecureStore.getItemAsync(derivedKey)
      return value !== null
    } catch (error) {
      console.error('Error in secureStore.exists:', error)
      return false
    }
  }
} 