import { supabaseService as _supabaseService } from '@/src/services/api/supabaseService'

/**
 * Generates a unique test email with timestamp
 * @returns A unique test email address
 */
export const generateTestEmail = (): string => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `integration.${timestamp}.${random}@example.com`
}

/**
 * Clears any test data from the waitlist
 * This is useful for ensuring a clean state before tests
 */
export const clearWaitlistTestData = async (): Promise<void> => {
  try {
    // In a real implementation, this would clear test data from the database
    // For now, we'll just log that we're clearing the data
    console.log('Clearing waitlist test data')
  } catch (error) {
    console.error('Error clearing waitlist test data:', error)
    throw error
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