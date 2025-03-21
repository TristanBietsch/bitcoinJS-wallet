/**
 * Waitlist Integration Test
 * 
 * This test focuses on testing the waitlist feature without relying on React Native components.
 * It directly tests the supabaseService interactions.
 */

import { supabaseService } from '@/src/services/api/supabaseService'
import { setupTestEnv } from '@/tests/utils/testConfig'

// Set up test environment
setupTestEnv()

describe('Waitlist Integration Test', () => {
  // Generate a unique test email to avoid conflicts between test runs
  const validEmail = `integration.${Date.now()}.${Math.floor(Math.random() * 1000)}@example.com`
  const invalidEmail = 'not-an-email'
  
  // Clean up test data before and after tests
  beforeAll(async () => {
    // Make sure the valid email isn't in the waitlist already
    const { exists } = await supabaseService.checkWaitlist(validEmail)
    if (exists) {
      console.log('Cleaning up test email that already exists:', validEmail)
      // Here you would add code to remove the email if needed
    }
  })
  
  afterAll(async () => {
    // Clean up any test data if needed
  })
  
  describe('Waitlist Submission Flow', () => {
    it('should validate email format before submission', async () => {
      const { success, error } = await supabaseService.addToWaitlist(invalidEmail)
      expect(success).toBe(false)
      expect(error).toBe('Invalid email format')
    })
    
    it('should add valid email to waitlist', async () => {
      const { success, error } = await supabaseService.addToWaitlist(validEmail)
      expect(success).toBe(true)
      expect(error).toBeUndefined()
      
      // Verify the email was added by checking if it exists
      const { exists } = await supabaseService.checkWaitlist(validEmail)
      expect(exists).toBe(true)
    })
    
    it('should prevent duplicate submissions', async () => {
      // Try to add the same email again
      const { success, error } = await supabaseService.addToWaitlist(validEmail)
      expect(success).toBe(false)
      expect(error).toBe('Email already registered')
    })
  })
}) 