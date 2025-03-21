/**
 * Waitlist Testing Module
 * 
 * This module exports all the testing utilities and setup functions for the waitlist feature.
 * It allows for easy importing of test tools and consistent test configuration.
 */

// Configuration and environment setup
export * from './utils/testConfig'

// Testing utilities
export * from './utils/testUtils'

// Test suites
// These don't export anything but are mentioned here for documentation
// - services.test.tsx: Tests for supabaseService and resendService
// - useWaitlist.test.tsx: Tests for the useWaitlist hook
// - waitlist.test.tsx: Tests for the CardWaitlistScreen component

/**
 * To run all tests:
 * npx jest
 * 
 * To run a specific test file:
 * npx jest tests/services.test.tsx
 * npx jest tests/useWaitlist.test.tsx
 * npx jest tests/waitlist.test.tsx
 */ 