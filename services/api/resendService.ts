import axios from 'axios';
import { EmailSchema } from './supabaseService';

// Email template for waitlist confirmation
const waitlistConfirmationTemplate = (email: string) => ({
  from: 'waitlist@nummus.com',
  to: email,
  subject: 'Welcome to the Nummus Bitcoin Card Waitlist',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <img src="https://nummus.com/logo.png" alt="Nummus Logo" style="max-width: 150px; margin: 20px 0;" />
      <h1 style="color: #333;">You're on the Waitlist!</h1>
      <p>Thank you for joining the waitlist for the Nummus Bitcoin Card. We're excited to have you on board!</p>
      <p>We'll notify you as soon as the card becomes available.</p>
      <div style="margin: 30px 0;">
        <img src="https://nummus.com/card.png" alt="Nummus Card" style="max-width: 100%; border-radius: 10px;" />
      </div>
      <p>In the meantime, follow us on social media for updates:</p>
      <div style="margin: 20px 0;">
        <a href="https://twitter.com/nummus" style="margin-right: 15px; text-decoration: none;">Twitter</a>
        <a href="https://instagram.com/nummus" style="margin-right: 15px; text-decoration: none;">Instagram</a>
      </div>
      <p style="font-size: 12px; color: #666; margin-top: 30px;">
        If you didn't sign up for the Nummus Bitcoin Card waitlist, please ignore this email.
      </p>
    </div>
  `,
});

// Mock Resend implementation for testing
class MockResendService {
  async sendWaitlistConfirmation(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate email
      EmailSchema.parse(email);
      
      // Log the email for testing
      console.log(`[MOCK] Sending confirmation email to: ${email}`);
      
      return { success: true };
    } catch (error) {
      console.error('Mock Resend error:', error);
      return { success: false, error: 'Failed to send confirmation email' };
    }
  }
}

// Real Resend implementation
class ResendService {
  private apiKey: string;
  private apiUrl: string = 'https://api.resend.com';

  constructor() {
    // In a real app, this would come from environment variables
    this.apiKey = process.env.RESEND_API_KEY || '';
  }

  async sendWaitlistConfirmation(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate email
      EmailSchema.parse(email);
      
      // Create email payload
      const emailData = waitlistConfirmationTemplate(email);
      
      // Send email via Resend API
      await axios.post(
        `${this.apiUrl}/emails`,
        emailData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return { success: true };
    } catch (error) {
      console.error('Resend API error:', error);
      return { success: false, error: 'Failed to send confirmation email' };
    }
  }
}

// Export the appropriate service based on environment
const isTestEnvironment = process.env.NODE_ENV === 'test';
export const resendService = isTestEnvironment ? new MockResendService() : new ResendService(); 