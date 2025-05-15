import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

/**
 * Service for handling secure storage of sensitive data
 * Wraps SecureStore with additional functionality
 */
export const secureStore = {
  /**
   * Store a value securely
   * 
   * @param key The key to store the value under
   * @param value The value to store
   * @returns Promise that resolves when the storage is complete
   */
  set : async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        console.warn('SecureStore is not available on web platform')
        // Use localStorage as fallback for web (not secure, but better than crashing)
        localStorage.setItem(key, value)
        return
      }
      
      // Check if SecureStore is available
      if (!SecureStore.isAvailableAsync || !(await SecureStore.isAvailableAsync())) {
        throw new Error('SecureStore not available on this device')
      }
      
      await SecureStore.setItemAsync(key, value, {
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
   * @returns Promise that resolves to the stored value or null if not found
   */
  get : async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        console.warn('SecureStore is not available on web platform')
        // Use localStorage as fallback for web (not secure, but better than crashing)
        return localStorage.getItem(key)
      }
      
      return await SecureStore.getItemAsync(key)
    } catch (error) {
      console.error('Error in secureStore.get:', error)
      return null
    }
  },
  
  /**
   * Delete a securely stored value
   * 
   * @param key The key to delete
   * @returns Promise that resolves when deletion is complete
   */
  delete : async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        console.warn('SecureStore is not available on web platform')
        // Use localStorage as fallback for web
        localStorage.removeItem(key)
        return
      }
      
    await SecureStore.deleteItemAsync(key)
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
        // Use localStorage as fallback for web
        return localStorage.getItem(key) !== null
      }
      
    const value = await SecureStore.getItemAsync(key)
    return value !== null
    } catch (error) {
      console.error('Error in secureStore.exists:', error)
      return false
    }
  }
} 