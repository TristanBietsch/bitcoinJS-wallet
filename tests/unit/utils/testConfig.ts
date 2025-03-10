import { jest } from '@jest/globals';

export const setupTestEnv = () => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Add any global test setup here
  // For example, setting up environment variables, mocking global objects, etc.
};

// Export any other test utilities that might be needed
export const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Reset console mocks
export const resetConsoleMocks = () => {
  mockConsole.log.mockClear();
  mockConsole.error.mockClear();
  mockConsole.warn.mockClear();
}; 