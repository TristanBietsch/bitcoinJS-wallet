// Debug Supabase connection
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

// Load environment variables from tests/.env.test
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

// Log environment variables for debugging
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.substring(0, 10) + '...' : 'undefined');

// Test waitlist table existence
async function testConnection() {
  try {
    console.log('\nTesting connection to Supabase...');
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      throw new Error('Missing Supabase credentials. Make sure SUPABASE_URL and SUPABASE_KEY are defined in tests/.env.test');
    }
    
    // Create headers with the API key
    const headers = {
      'apikey': process.env.SUPABASE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    };
    
    // First, test a simple connection
    console.log('1. Testing basic connection to Supabase...');
    const healthResponse = await axios.get(`${process.env.SUPABASE_URL}/rest/v1/`, { headers });
    console.log('✅ Connection successful!');
    
    // Check if waitlist table exists
    console.log('\n2. Checking if waitlist table exists...');
    try {
      // Try to get schema information
      const tableInfoResponse = await axios.get(
        `${process.env.SUPABASE_URL}/rest/v1/waitlist?select=email&limit=1`, 
        { headers }
      );
      console.log('✅ Waitlist table exists!');
      console.log('Sample response:', tableInfoResponse.status, JSON.stringify(tableInfoResponse.data).substring(0, 100));
    } catch (error) {
      console.log('❌ Error checking waitlist table:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 404) {
        console.log('\n🔍 The waitlist table does not exist. You might need to create it.');
        console.log('Suggested SQL to create the table:');
        console.log(`
CREATE TABLE public.waitlist (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add row level security policies
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts
CREATE POLICY "Allow public inserts to waitlist" ON public.waitlist 
  FOR INSERT WITH CHECK (true);

-- Create policy to allow selecting own submissions
CREATE POLICY "Allow public reads of waitlist" ON public.waitlist 
  FOR SELECT USING (true);
        `);
      }
    }
    
    // Try to add a test email to waitlist
    console.log('\n3. Testing adding an email to waitlist...');
    const testEmail = `debug.${Date.now()}@example.com`;
    
    try {
      const addResponse = await axios.post(
        `${process.env.SUPABASE_URL}/rest/v1/waitlist`, 
        { email: testEmail },
        { headers }
      );
      console.log(`✅ Successfully added ${testEmail} to waitlist!`);
      console.log('Response:', addResponse.status);
    } catch (error) {
      console.log(`❌ Error adding ${testEmail} to waitlist:`, error.response?.status, error.response?.data);
    }
    
    // Try to check if the email exists
    console.log('\n4. Testing checking if an email exists in waitlist...');
    try {
      const checkResponse = await axios.get(
        `${process.env.SUPABASE_URL}/rest/v1/waitlist?email=eq.${encodeURIComponent(testEmail)}&select=email`, 
        { headers }
      );
      const exists = checkResponse.data.length > 0;
      console.log(`${exists ? '✅' : '❌'} Email ${testEmail} ${exists ? 'exists' : 'does not exist'} in waitlist.`);
      console.log('Response:', checkResponse.status, JSON.stringify(checkResponse.data));
    } catch (error) {
      console.log('❌ Error checking waitlist:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      console.log('Request was made but no response received');
      console.log(error.request);
    } else {
      console.log('Error setting up request:', error.message);
    }
    console.log('\nStack trace:', error.stack);
  }
}

testConnection(); 