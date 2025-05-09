import * as SecureStore from 'expo-secure-store'

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
    await SecureStore.setItemAsync(key, value)
  },
  
  /**
   * Retrieve a securely stored value
   * 
   * @param key The key to retrieve
   * @returns Promise that resolves to the stored value or null if not found
   */
  get : async (key: string): Promise<string | null> => {
    return SecureStore.getItemAsync(key)
  },
  
  /**
   * Delete a securely stored value
   * 
   * @param key The key to delete
   * @returns Promise that resolves when deletion is complete
   */
  delete : async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key)
  },
  
  /**
   * Check if a key exists in secure storage
   * 
   * @param key The key to check
   * @returns Promise that resolves to boolean indicating if the key exists
   */
  exists : async (key: string): Promise<boolean> => {
    const value = await SecureStore.getItemAsync(key)
    return value !== null
  }
} 