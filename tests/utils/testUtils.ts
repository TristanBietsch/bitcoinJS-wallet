import { supabaseService } from '@/services/api/supabaseService';

// Clear test data before/after tests
export const clearWaitlistTestData = async (email: string): Promise<void> => {
  try {
    // Remove test email from waitlist if it exists
    const checkResult = await supabaseService.checkWaitlist(email);
    if (checkResult.exists) {
      // For testing purposes only - this would be a direct API call in a real implementation
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/waitlist?email=eq.${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: {
          'apikey': process.env.SUPABASE_KEY || '',
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Error clearing test data:', error);
  }
};

// Generate a unique test email to avoid conflicts
export const generateTestEmail = (prefix = 'test'): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}.${timestamp}.${random}@example.com`;
};

// Wait for a specified time (useful for async operations)
export const wait = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms)); 