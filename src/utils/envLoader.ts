/**
 * Environment variable loader utility for Nummus Wallet
 * 
 * This utility safely provides access to environment variables from tests/.env.test
 * without exposing sensitive information in source code.
 */

// In real application you would use a package like react-native-dotenv
// or another secure method to load environment variables
// This is a simplified version just for testing purposes

// Point to the existing test file
const TEST_ENV_PATH = '../tests/.env.test'

// Export safe values - in a real app you wouldn't have these defaults
export const ENV_VARS = {
  // Must use process.env - react native at runtime will provide these
  SUPABASE_URL   : process.env.SUPABASE_URL,
  SUPABASE_KEY   : process.env.SUPABASE_KEY,
  RESEND_API_KEY : process.env.RESEND_API_KEY,
  NODE_ENV       : process.env.NODE_ENV || 'development',
}

// Log that we're using the test environment configuration
if (__DEV__) {
  console.log(`Using environment configuration from ${TEST_ENV_PATH}`)
}