import { supabaseService } from '@/services/api/supabaseService';
import { setupTestEnv } from './utils/testConfig';

// Set up the test environment
setupTestEnv();

describe('supabaseService', () => {
  // Generate unique emails for each test case to prevent conflicts
  const generateTestEmail = () => `test.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`;
  const invalidEmail = 'invalid-email';
  
  describe('email validation', () => {
    it('should reject invalid email formats', async () => {
      const { success, error } = await supabaseService.addToWaitlist(invalidEmail);
      expect(success).toBe(false);
      expect(error).toBe('Invalid email format');
    });
    
    it('should accept valid email formats', async () => {
      const email = generateTestEmail();
      const { success } = await supabaseService.addToWaitlist(email);
      expect(success).toBe(true);
    });
  });
  
  describe('waitlist operations', () => {
    it('should add an email to the waitlist', async () => {
      const email = generateTestEmail();
      const { success } = await supabaseService.addToWaitlist(email);
      expect(success).toBe(true);
      
      const { exists } = await supabaseService.checkWaitlist(email);
      expect(exists).toBe(true);
    });
    
    it('should detect duplicate emails', async () => {
      // Generate a unique email for this test
      const email = generateTestEmail();
      
      // First add the email
      await supabaseService.addToWaitlist(email);
      
      // Try adding it again
      const { success, error } = await supabaseService.addToWaitlist(email);
      expect(success).toBe(false);
      expect(error).toBe('Email already registered');
    });
  });
}); 