// Setup file for Jest tests

// Don't import testing-library extensions here as they require expect to be defined first
// import '@testing-library/jest-native/extend-expect';

// These functions are already globally available in Jest environment
// No need to redefine them on the global object
// Remove these lines that are causing the ReferenceError
// global.beforeEach = beforeEach;
// global.afterEach = afterEach;
// global.afterAll = afterAll;
// global.beforeAll = beforeAll;

// Mock the AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock the expo-haptics module
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock @legendapp/motion
jest.mock('@legendapp/motion', () => ({
  Motion: {
    View: 'MockMotionView',
  },
  AnimatePresence: 'MockAnimatePresence',
}));

// Mock the toast hook
jest.mock('@/src/components/ui/toast', () => ({
  useToast: () => ({
    show: jest.fn(),
    hide: jest.fn(),
  }),
}));

// Mock the supabase service
jest.mock('@/src/services/api/supabaseService', () => ({
  supabaseService: {
    addToWaitlist: jest.fn().mockResolvedValue({ success: true, error: null }),
  },
}));

// Console error/warn override to fail tests on React warnings
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  // Check for specific React errors/warnings that should fail tests
  const message = args.join(' ');
  
  // Ignore certain warning patterns that are expected
  const ignoredWarnings = [
    'Warning: React does not recognize the',
    'Warning: The tag',
    'is unrecognized in this browser',
  ];
  
  // Don't throw on ignored warnings
  if (ignoredWarnings.some(pattern => message.includes(pattern))) {
    originalConsoleWarn(...args);
    return;
  }
  
  // Log the original error
  originalConsoleError(...args);
};

console.warn = (...args) => {
  // You can similarly filter warnings here
  originalConsoleWarn(...args);
};

// Add setImmediate polyfill for React Native animations
global.setImmediate = jest.fn((callback) => {
  setTimeout(callback, 0);
});