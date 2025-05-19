// This file is referenced in jest.config.js and runs before each test

// Import React Native mocks
require('./tests/jestMocks/reactNativeMock');

// Basic mocks for React Native environment
global.window = {};
global.__DEV__ = true;

// Fix for @testing-library/react-native timer issues
global.setTimeout = jest.fn((cb) => cb());
global.clearTimeout = jest.fn();
global.setInterval = jest.fn();
global.clearInterval = jest.fn();
global.requestAnimationFrame = jest.fn(cb => cb());
global.cancelAnimationFrame = jest.fn();

// Mock the modules without importing them directly
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), { virtual: true });
jest.mock('react-native-gesture-handler', () => ({}), { virtual: true });

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}), { virtual: true });

// Mock Expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: jest.fn(() => 'StatusBar')
}), { virtual: true });

// Set up timers for animations
jest.useFakeTimers();

// Suppress console errors/warnings in test output if needed
// Uncomment if test output is too noisy
/*
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};
*/ 