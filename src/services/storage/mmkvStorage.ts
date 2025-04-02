import AsyncStorage from '@react-native-async-storage/async-storage'
import { z } from 'zod'

/**
 * Typed storage service using AsyncStorage for persistence
 * Includes validation with Zod schemas to ensure type safety
 */
export const mmkvStorage = {
  /**
   * Set a value in storage with optional schema validation
   */
  set : async <T>(key: string, value: T, schema?: z.ZodType<T>): Promise<boolean> => {
    try {
      // Validate with schema if provided
      if (schema) {
        schema.parse(value)
      }
      
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(key, jsonValue)
      return true
    } catch (error) {
      console.error(`Storage set error for key ${key}:`, error)
      return false
    }
  },
  
  /**
   * Get a value from storage with optional schema validation
   */
  get : async <T>(key: string, schema?: z.ZodType<T>): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(key)
      if (!value) return null
      
      const parsedValue = JSON.parse(value)
      
      // Validate with schema if provided
      if (schema) {
        return schema.parse(parsedValue)
      }
      
      return parsedValue
    } catch (error) {
      console.error(`Storage get error for key ${key}:`, error)
      return null
    }
  },
  
  /**
   * Remove a value from storage
   */
  delete : async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      console.error(`Storage delete error for key ${key}:`, error)
    }
  },
  
  /**
   * Clear all storage
   */
  clearAll : async (): Promise<void> => {
    try {
      await AsyncStorage.clear()
    } catch (error) {
      console.error('Storage clearAll error:', error)
    }
  },
  
  /**
   * Check if a key exists in storage
   */
  contains : async (key: string): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(key)
      return value !== null
    } catch (error) {
      console.error(`Storage contains error for key ${key}:`, error)
      return false
    }
  },
  
  /**
   * Get all keys in storage
   */
  getAllKeys : async (): Promise<string[]> => {
    try {
      return Array.from(await AsyncStorage.getAllKeys())
    } catch (error) {
      console.error('Storage getAllKeys error:', error)
      return []
    }
  }
}