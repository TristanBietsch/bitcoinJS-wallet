// Test script for environment variables
console.log('Testing environment variables...');

try {
  // Try to load dotenv from the tests/.env.test file
  try {
    require('dotenv').config({ path: './tests/.env.test' });
    console.log('Dotenv loaded from tests/.env.test');
  } catch (e) {
    console.log('Failed to load from tests/.env.test:', e.message);
  }

  // Check NODE_ENV
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  
  // Check Supabase variables
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 
    `${process.env.SUPABASE_URL.substring(0, 25)}...` : 'not set');
  console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 
    `${process.env.SUPABASE_KEY.substring(0, 15)}...` : 'not set');
  
  // Check Resend variable
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 
    `${process.env.RESEND_API_KEY.substring(0, 15)}...` : 'not set');
  
  // Try to access from expo-constants
  try {
    const Constants = require('expo-constants');
    console.log('\nTrying to access via expo-constants:');
    
    const manifest = Constants.expoConfig || Constants.manifest || {};
    const extra = manifest.extra || {};
    
    console.log('Constants.expoConfig?.extra?.supabaseUrl:', 
      extra.supabaseUrl ? `${extra.supabaseUrl.substring(0, 15)}...` : 'not set');
    console.log('Constants.expoConfig?.extra?.supabaseKey:', 
      extra.supabaseKey ? `${extra.supabaseKey.substring(0, 10)}...` : 'not set');
  } catch (e) {
    console.log('Error accessing expo-constants:', e.message);
  }
  
  // Summary and recommendations
  console.log('\nSummary:');
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.log('❌ Supabase environment variables are missing!');
    console.log('Recommendations:');
    console.log('1. Make sure tests/.env.test file exists with correct variables');
    console.log('2. Try loading the env file explicitly in your services');
  } else {
    console.log('✅ Supabase environment variables are present!');
  }
} catch (error) {
  console.error('Error testing environment variables:', error);
} 