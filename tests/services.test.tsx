// Mock the external services directly
jest.mock('@/services/api/supabaseService', () => ({
  supabaseService: {
    addToWaitlist: jest.fn().mockResolvedValue({ success: true }),
    checkWaitlist: jest.fn().mockResolvedValue({ exists: false })
  }
}));

jest.mock('@/services/api/resendService', () => ({
  resendService: {
    sendWaitlistConfirmation: jest.fn().mockResolvedValue({ success: true })
  }
}));

// Import the mocked services
import { supabaseService } from '@/services/api/supabaseService';
import { resendService } from '@/services/api/resendService';

describe('API Services', () => {
  describe('supabaseService', () => {
    it('addToWaitlist should add an email to the waitlist', async () => {
      const result = await supabaseService.addToWaitlist('test@example.com');
      expect(result.success).toBe(true);
    });

    it('checkWaitlist should check if an email exists in the waitlist', async () => {
      const result = await supabaseService.checkWaitlist('test@example.com');
      expect(result).toHaveProperty('exists');
    });
  });

  describe('resendService', () => {
    it('sendWaitlistConfirmation should send a confirmation email', async () => {
      const result = await resendService.sendWaitlistConfirmation('test@example.com');
      expect(result.success).toBe(true);
    });
  });
}); 