// Setup Test Database for testing-playground
require('dotenv').config({ path: './tests/.env.test' });
const axios = require('axios');

console.log('Setting up test database for testing-playground...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? `${process.env.SUPABASE_KEY.substring(0, 10)}...` : 'not set');

// Create email-testing table
async function createEmailTestingTable() {
  try {
    console.log('\nCreating email-testing table...');
    
    // SQL for creating the email-testing table
    const sql = `
      CREATE TABLE IF NOT EXISTS "email-testing" (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Run the SQL query using the Supabase API
    const response = await axios.post(
      `${process.env.SUPABASE_URL}/rest/v1/rpc/execute_sql`,
      { query: sql },
      {
        headers: {
          'apikey': process.env.SUPABASE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
      }
    );
    
    console.log('email-testing table created successfully!');
    return true;
  } catch (error) {
    console.error('Failed to create email-testing table:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Run the setup
createEmailTestingTable()
  .then(result => {
    if (result) {
      console.log('\nTest database setup for testing-playground completed successfully!');
    } else {
      console.error('\nTest database setup for testing-playground failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 