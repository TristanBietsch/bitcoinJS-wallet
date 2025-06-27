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
  
  // Check Resend variable
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 
    `${process.env.RESEND_API_KEY.substring(0, 15)}...` : 'not set');
  
  // Try to access from expo-constants
  try {
    const Constants = require('expo-constants');
    console.log('\nTrying to access via expo-constants:');
    
    const manifest = Constants.expoConfig || Constants.manifest || {};
    const extra = manifest.extra || {};
    
    console.log('expo-constants loaded successfully');
  } catch (e) {
    console.log('Error accessing expo-constants:', e.message);
  }
  
  // Summary and recommendations
  console.log('\nSummary:');
  console.log('✅ Environment variables test completed!');
} catch (error) {
  console.error('Error testing environment variables:', error);
} 