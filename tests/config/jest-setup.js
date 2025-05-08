// This file is required by Jest configuration but can be empty for now
// Add any global test setup code here if needed in the future

// Import Jest globals to make afterAll available
const { afterAll } = require('@jest/globals');

// Mock implementation of console methods to avoid cluttering test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// Silence console output during tests unless explicitly enabled for debugging
console.error = (...args) => {
  if (process.env.DEBUG) {
    originalConsoleError(...args);
  }
};

console.warn = (...args) => {
  if (process.env.DEBUG) {
    originalConsoleWarn(...args);
  }
};

console.log = (...args) => {
  if (process.env.DEBUG) {
    originalConsoleLog(...args);
  }
};

// Clean up mocks after tests
afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Mock implementation for any React Native specific APIs if needed
// For example:
/*
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
*/ 