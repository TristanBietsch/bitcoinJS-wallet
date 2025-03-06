/**
 * Environment configuration for the application
 * This centralizes environment variable management to avoid issues with Node.js built-in modules
 */

// Default values for development - replace with your actual defaults or leave empty for production
const ENV = {
  // Supabase configuration
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_KEY || '',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Add other environment variables as needed
};

export default ENV;