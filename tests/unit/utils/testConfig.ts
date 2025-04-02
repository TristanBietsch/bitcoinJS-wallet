import { jest } from '@jest/globals'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const setupTestEnv = () => {
  // Clear all mocks before each test
  jest.clearAllMocks()
  
  // Clear AsyncStorage before each test
  AsyncStorage.clear()
  
  // Reset any global state
  global.console = {
    ...console,
    error : jest.fn(),
    warn  : jest.fn(),
    log   : jest.fn(),
  }
}

// Export any other test utilities that might be needed
export const mockConsole = {
  log   : jest.fn(),
  error : jest.fn(),
  warn  : jest.fn(),
}

// Reset console mocks
export const resetConsoleMocks = () => {
  mockConsole.log.mockClear()
  mockConsole.error.mockClear()
  mockConsole.warn.mockClear()
}

// Clean up after tests
export const cleanupTestEnv = async () => {
  // Clear AsyncStorage
  await AsyncStorage.clear()
  
  // Reset all mocks
  jest.resetAllMocks()
  
  // Reset console mocks
  resetConsoleMocks()
} 