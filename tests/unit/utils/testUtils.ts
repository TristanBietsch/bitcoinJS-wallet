import { supabaseService } from '@/src/services/api/supabaseService'
import AsyncStorage from '@react-native-async-storage/async-storage'

const WAITLIST_STORAGE_KEY = 'nummus_card_waitlist_status'

/**
 * Generates a unique test email with prefix and timestamp
 * @param prefix Optional prefix for the email
 * @returns A unique test email address
 */
export const generateTestEmail = (prefix: string = 'test'): string => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `${prefix}.${timestamp}.${random}@example.com`
}

/**
 * Clears any test data from the waitlist
 * This ensures a clean state before and after tests
 */
export const clearWaitlistTestData = async (email?: string): Promise<void> => {
  try {
    // Clear AsyncStorage
    await AsyncStorage.removeItem(WAITLIST_STORAGE_KEY)
    
    // If email is provided, attempt to remove from waitlist
    if (email) {
      await supabaseService.addToWaitlist(email)
    }
  } catch (error) {
    console.error('Error clearing waitlist test data:', error)
    // Don't throw the error to prevent test failures
  }
}

/**
 * Helper function to wait for a condition to be true
 * @param condition Function that returns a boolean
 * @param timeout Maximum time to wait in milliseconds
 * @returns Promise that resolves when condition is true or rejects on timeout
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout: number = 5000
): Promise<void> => {
  const startTime = Date.now()
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition')
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
} 