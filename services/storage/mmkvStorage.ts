import { MMKV } from 'react-native-mmkv';
import { z } from 'zod';

// Create the storage instance
const storage = new MMKV();

/**
 * Typed storage service using MMKV for high-performance persistence
 * Includes validation with Zod schemas to ensure type safety
 */
export const mmkvStorage = {
  /**
   * Set a value in storage with optional schema validation
   */
  set: <T>(key: string, value: T, schema?: z.ZodType<T>): boolean => {
    try {
      // Validate with schema if provided
      if (schema) {
        schema.parse(value);
      }
      
      const jsonValue = JSON.stringify(value);
      storage.set(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`Storage set error for key ${key}:`, error);
      return false;
    }
  },
  
  /**
   * Get a value from storage with optional schema validation
   */
  get: <T>(key: string, schema?: z.ZodType<T>): T | null => {
    try {
      const value = storage.getString(key);
      if (!value) return null;
      
      const parsedValue = JSON.parse(value);
      
      // Validate with schema if provided
      if (schema) {
        return schema.parse(parsedValue);
      }
      
      return parsedValue;
    } catch (error) {
      console.error(`Storage get error for key ${key}:`, error);
      return null;
    }
  },
  
  /**
   * Remove a value from storage
   */
  delete: (key: string): void => {
    storage.delete(key);
  },
  
  /**
   * Clear all storage
   */
  clearAll: (): void => {
    storage.clearAll();
  },
  
  /**
   * Check if a key exists in storage
   */
  contains: (key: string): boolean => {
    return storage.contains(key);
  },
  
  /**
   * Get all keys in storage
   */
  getAllKeys: (): string[] => {
    return storage.getAllKeys();
  }
}; 