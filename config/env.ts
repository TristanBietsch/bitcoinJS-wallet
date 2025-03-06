/**
 * Environment configuration for the application
 * This centralizes environment variables for the app.
 * 
 * IMPORTANT: No sensitive keys or secrets should be stored in this file!
 * Those values should be loaded from .env.test using react-native-dotenv.
 */

// NOTE: These will be dynamically replaced with values from .env.test at runtime
// through the babel plugin configuration in babel.config.js
const ENV = {
  // Supabase configuration - DO NOT hardcode credentials here!
  // Values should come from .env.test
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_KEY || '',
  
  // Environment flag
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // For development purposes
  IS_DEV: __DEV__
};

// In development, print environment configuration status
if (__DEV__) {
  console.log('Environment configuration loaded');
  console.log(`- Supabase URL: ${ENV.SUPABASE_URL ? 'Set' : 'Not set'}`);
  console.log(`- Supabase Key: ${ENV.SUPABASE_KEY ? 'Set (hidden)' : 'Not set'}`);
  console.log(`- Is Dev: ${ENV.IS_DEV}`);
}

export default ENV;