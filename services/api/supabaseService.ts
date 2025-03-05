import axios from 'axios';
import { z } from 'zod';

// Schema for validating email
export const EmailSchema = z.string().email('Invalid email format');

// Schema for waitlist entry
export const WaitlistEntrySchema = z.object({
  email: EmailSchema,
  createdAt: z.date().optional(),
});

export type WaitlistEntry = z.infer<typeof WaitlistEntrySchema>;

// Mock Supabase implementation for testing
class MockSupabaseService {
  private waitlistEntries: WaitlistEntry[] = [];

  async addToWaitlist(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate email
      EmailSchema.parse(email);
      
      // Check for duplicates
      const isDuplicate = this.waitlistEntries.some(entry => entry.email === email);
      if (isDuplicate) {
        return { success: false, error: 'Email already registered' };
      }
      
      // Add to waitlist
      this.waitlistEntries.push({
        email,
        createdAt: new Date(),
      });
      
      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: 'Invalid email format' };
      }
      return { success: false, error: 'Failed to add to waitlist' };
    }
  }

  async checkWaitlist(email: string): Promise<{ exists: boolean; error?: string }> {
    try {
      // Validate email
      EmailSchema.parse(email);
      
      // Check if email exists
      const exists = this.waitlistEntries.some(entry => entry.email === email);
      
      return { exists };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { exists: false, error: 'Invalid email format' };
      }
      return { exists: false, error: 'Failed to check waitlist' };
    }
  }
}

// Real Supabase implementation
class SupabaseService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    // In a real app, these would come from environment variables
    this.apiUrl = process.env.SUPABASE_URL || '';
    this.apiKey = process.env.SUPABASE_KEY || '';
  }

  async addToWaitlist(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate email
      EmailSchema.parse(email);
      
      // Check if already in waitlist
      const { exists, error: checkError } = await this.checkWaitlist(email);
      if (checkError) {
        return { success: false, error: checkError };
      }
      
      if (exists) {
        return { success: false, error: 'Email already registered' };
      }
      
      // In a real implementation, this would use the Supabase client
      // For now, we'll use axios to simulate the API call
      await axios.post(
        `${this.apiUrl}/rest/v1/waitlist`,
        { email, created_at: new Date().toISOString() },
        {
          headers: {
            'apikey': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return { success: true };
    } catch (error) {
      console.error('Supabase addToWaitlist error:', error);
      
      if (error instanceof z.ZodError) {
        return { success: false, error: 'Invalid email format' };
      }
      
      return { success: false, error: 'Failed to add to waitlist' };
    }
  }

  async checkWaitlist(email: string): Promise<{ exists: boolean; error?: string }> {
    try {
      // Validate email
      EmailSchema.parse(email);
      
      // In a real implementation, this would use the Supabase client
      // For now, we'll use axios to simulate the API call
      const response = await axios.get(
        `${this.apiUrl}/rest/v1/waitlist?email=eq.${encodeURIComponent(email)}`,
        {
          headers: {
            'apikey': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return { exists: response.data && response.data.length > 0 };
    } catch (error) {
      console.error('Supabase checkWaitlist error:', error);
      
      if (error instanceof z.ZodError) {
        return { exists: false, error: 'Invalid email format' };
      }
      
      return { exists: false, error: 'Failed to check waitlist' };
    }
  }
}

// Export the appropriate service based on environment
const isTestEnvironment = process.env.NODE_ENV === 'test';
export const supabaseService = isTestEnvironment ? new MockSupabaseService() : new SupabaseService(); 