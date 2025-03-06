import axios from 'axios';
import { z } from 'zod';
import ENV from '../../config/env';

// Schema for validating email
export const EmailSchema = z.string().email('Invalid email format');

// Schema for email testing entry
export const WaitlistEntrySchema = z.object({
  email: EmailSchema,
  createdAt: z.date().optional(),
});

export type WaitlistEntry = z.infer<typeof WaitlistEntrySchema>;

// Common types
interface WaitlistResponse {
  success: boolean;
  error?: string;
}

interface CheckWaitlistResponse {
  exists: boolean;
  error?: string;
}

/**
 * Mock Supabase Service for testing
 * This implementation stores waitlist emails in memory for testing
 */
class MockSupabaseService {
  private waitlistEmails: Set<string> = new Set();

  constructor() {
    console.log('[MOCK] Initializing Mock Supabase Service for testing');
  }

  /**
   * Validate email format using a simple regex
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Add an email to the waitlist
   */
  async addToWaitlist(email: string): Promise<WaitlistResponse> {
    // Validate email format
    if (!this.isValidEmail(email)) {
      console.log(`[MOCK] Invalid email format: ${email}`);
      return { success: false, error: 'Invalid email format' };
    }

    // Check if email already exists
    if (this.waitlistEmails.has(email)) {
      console.log(`[MOCK] Email already registered: ${email}`);
      return { success: false, error: 'Email already registered' };
    }

    // Add email to waitlist
    this.waitlistEmails.add(email);
    console.log(`[MOCK] Added email to waitlist: ${email}`);
    return { success: true };
  }

  /**
   * Check if an email is in the waitlist
   */
  async checkWaitlist(email: string): Promise<CheckWaitlistResponse> {
    // Validate email format
    if (!this.isValidEmail(email)) {
      return { exists: false, error: 'Invalid email format' };
    }

    // Check if email exists
    const exists = this.waitlistEmails.has(email);
    console.log(`[MOCK] Checked waitlist for email: ${email} Exists: ${exists}`);
    return { exists };
  }
}

/**
 * Real Supabase Service for production
 */
class SupabaseService {
  private apiUrl: string;
  private apiKey: string;
  private tableName: string = 'waitlist';
  private mockService: MockSupabaseService;
  private useRealService: boolean;

  constructor() {
    this.apiUrl = ENV.SUPABASE_URL || '';
    this.apiKey = ENV.SUPABASE_KEY || '';
    this.mockService = new MockSupabaseService();
    
    // Determine if we should use the real service
    this.useRealService = !!(this.apiUrl && this.apiKey);
    
    console.log(`Initializing Supabase Service with:`);
    console.log(`- API URL: ${this.apiUrl ? this.apiUrl.substring(0, 20) + '...' : 'Not set'}`);
    console.log(`- API Key: ${this.apiKey ? 'Set (hidden)' : 'Not set'}`);
    console.log(`- Table: ${this.tableName}`);
    console.log(`- Environment: ${ENV.NODE_ENV}`);
    console.log(`- Using: ${this.useRealService ? 'Real Supabase API' : 'Mock Service'}`);
  }

  /**
   * Add an email to the waitlist
   */
  async addToWaitlist(email: string): Promise<WaitlistResponse> {
    // Validate email format using a simple regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`Invalid email format: ${email}`);
      return { success: false, error: 'Invalid email format' };
    }

    // Use mock service if we don't have API credentials
    if (!this.useRealService) {
      return this.mockService.addToWaitlist(email);
    }

    console.log(`Attempting to add email to waitlist: ${email}`);
    try {
      // First check if the email already exists
      const checkResult = await this.checkWaitlist(email);
      if (checkResult.exists) {
        console.log(`Email already registered: ${email}`);
        return { success: false, error: 'Email already registered' };
      }

      // Add email to waitlist
      console.log(`Making API call to add email to waitlist: ${email}`);
      const response = await axios.post(
        `${this.apiUrl}/rest/v1/${this.tableName}`,
        { email },
        {
          headers: {
            'apikey': this.apiKey,
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log(`Successfully added email to waitlist: ${email}`);
      return { success: true };
    } catch (error: any) {
      // Handle different types of errors
      console.error(`Error adding email to waitlist: ${error.message}`);
      
      if (error.response) {
        console.error(`API Error: ${error.response.status}`, error.response.data);
        
        // Handle specific error cases
        if (error.response.status === 404) {
          console.log('Falling back to mock service due to 404 error (table might not exist)');
          return this.mockService.addToWaitlist(email);
        }
        
        if (error.response.status === 409) {
          return { success: false, error: 'Email already registered' };
        }
      }
      
      // Handle network errors by falling back to mock service
      console.log('Falling back to mock service due to API error');
      return this.mockService.addToWaitlist(email);
    }
  }

  /**
   * Check if an email is in the waitlist
   */
  async checkWaitlist(email: string): Promise<CheckWaitlistResponse> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { exists: false, error: 'Invalid email format' };
    }

    // Use mock service if we don't have API credentials
    if (!this.useRealService) {
      return this.mockService.checkWaitlist(email);
    }

    console.log(`Checking if email exists in waitlist: ${email}`);
    try {
      // Query the waitlist table
      console.log(`Making API call to check waitlist for email: ${email}`);
      const response = await axios.get(
        `${this.apiUrl}/rest/v1/${this.tableName}`,
        {
          headers: {
            'apikey': this.apiKey,
            'Authorization': `Bearer ${this.apiKey}`
          },
          params: {
            email: `eq.${email}`,
            select: 'email'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      const exists = response.data.length > 0;
      console.log(`Email check result for ${email}: ${exists ? 'Exists' : 'Does not exist'}`);
      return { exists };
    } catch (error: any) {
      console.error(`Error checking waitlist: ${error.message}`);
      
      if (error.response) {
        console.error(`API Error: ${error.response.status}`, error.response.data);
        
        // Handle specific error cases
        if (error.response.status === 404) {
          console.log('Falling back to mock service due to 404 error (table might not exist)');
          return this.mockService.checkWaitlist(email);
        }
      }
      
      // Handle network errors by falling back to mock service
      console.log('Falling back to mock service due to API error');
      return this.mockService.checkWaitlist(email);
    }
  }
}

// Export as singleton
export const supabaseService = new SupabaseService(); 