/**
 * Waitlist Test Runner
 * 
 * Runs all the waitlist tests in a specific order to ensure proper test isolation
 * and avoid test interference.
 */

const { spawn } = require('child_process');
const path = require('path');

// Test files in the order they should be run
const testFiles = [
  'tests/services.test.tsx',
  'tests/mockTests/waitlist.integration.test.ts'
];

// Helper to log with timestamps
function log(message) {
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${timestamp}] ${message}`);
}

// Run tests sequentially
async function runTests() {
  log('Starting waitlist tests...');
  
  for (const testFile of testFiles) {
    log(`Running test: ${testFile}`);
    
    // Run Jest for this specific test file
    const result = await new Promise((resolve) => {
      const jest = spawn('npx', ['jest', testFile], {
        stdio: 'inherit',
        shell: true
      });
      
      jest.on('close', (code) => {
        resolve(code === 0);
      });
    });
    
    if (!result) {
      log(`❌ Test failed: ${testFile}`);
      process.exit(1);
    }
    
    log(`✅ Test passed: ${testFile}`);
  }
  
  log('All waitlist tests completed successfully! 🎉');
}

// Run the tests
runTests().catch((error) => {
  console.error('Test execution error:', error);
  process.exit(1);
}); 