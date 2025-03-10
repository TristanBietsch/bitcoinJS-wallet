import dotenv from 'dotenv';
import path from 'path';

// Configure test environment
export const setupTestEnv = (): void => {
  // Load test environment variables
  dotenv.config({ path: path.resolve(process.cwd(), 'tests/.env.test') });
  
  // Ensure we're running in test mode
  if (process.env.NODE_ENV !== 'test') {
    console.warn('Tests should be run with NODE_ENV=test');
  }
};

// Test database configuration
export const getTestDbConfig = () => ({
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_KEY || '',
});

// Test email configuration
export const getTestEmailConfig = () => ({
  resendApiKey: process.env.RESEND_API_KEY || '',
}); 