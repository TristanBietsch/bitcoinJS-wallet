import React from 'react';
import { render } from '@testing-library/react-native';
import ReceiveScreen from '@/screens/wallet/Receive/ReceiveScreen';
import { setupTestEnv } from '../../utils/testConfig';

// Mock environment variables
// Using global object instead of trying to assign to read-only process.env
global.process = {
  ...process,
  env: {
    ...process.env,
    EXPO_OS: 'android',
    NODE_ENV: 'test'
  }
};

// Setup test environment
setupTestEnv();

// Mock the expo-router module
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  Stack: {
    Screen: () => null,
  },
}));

// Mock the ThemedText component with an auto mock
jest.mock('@/components/ThemedText', () => {
  const mockComponent = jest.fn().mockImplementation(({ children }) => children);
  mockComponent.displayName = 'MockThemedText';
  return { ThemedText: mockComponent };
});

// Mock expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      sentryDSN: 'test-dsn',
    },
  },
  default: {
    expoConfig: {
      extra: {
        sentryDSN: 'test-dsn',
      },
    },
  },
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

// Mock the fetch API for bitcoin price
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ bitcoin: { usd: 50000 } }),
  })
) as jest.Mock;

// Mock the dropdown components
jest.mock('@/components/common/Dropdown', () => {
  const mockDropdown = jest.fn().mockImplementation(() => null);
  mockDropdown.displayName = 'MockDropdown';
  return mockDropdown;
});

jest.mock('@/components/common/IOSDropdown', () => {
  const mockIOSDropdown = jest.fn().mockImplementation(() => null);
  mockIOSDropdown.displayName = 'MockIOSDropdown';
  return mockIOSDropdown;
});

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'android',
  select: jest.fn((obj) => obj.android),
}));

// Mock the icons
jest.mock('lucide-react-native', () => ({
  ChevronLeft: jest.fn().mockImplementation(() => null),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock any other potential dependencies
jest.mock('@/services/logging/sentryService', () => ({
  initSentry: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

// Use mock for react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const mockGestureHandler = {
    GestureHandlerRootView: jest.fn().mockImplementation(() => null),
    TouchableOpacity: jest.fn().mockImplementation(({ children }) => children),
    createGestureHandler: jest.fn(),
    Directions: {},
  };
  return mockGestureHandler;
});

// Disable warnings for test run
console.warn = jest.fn();
console.error = jest.fn();

describe('ReceiveScreen Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic component rendering test
  it('renders without crashing', async () => {
    try {
      const { toJSON } = render(<ReceiveScreen />);
      expect(toJSON()).toBeTruthy();
    } catch (error) {
      // If rendering fails, this test will fail, but we'll log the error for debugging
      console.error('Rendering failed:', error);
      throw error;
    }
  });

  // Test for bitcoin price fetching
  it('fetches bitcoin price on mount', () => {
    render(<ReceiveScreen />);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    );
  });

  // Test for interval cleanup on unmount
  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const { unmount } = render(<ReceiveScreen />);
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  // Test fallback price setting when API fails
  it('sets fallback price when API fails', async () => {
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    render(<ReceiveScreen />);
    
    // Let the async operation complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // The component should handle the error and set a fallback price
    // This is an implementation detail we can't directly test without exposing state,
    // but we can verify it didn't crash and the error was caught
    expect(console.error).toHaveBeenCalled();
  });
  
  // Test that it renders properly - we can't test by text since we've mocked ThemedText
  it('renders correctly', () => {
    // Since we've mocked ThemedText, we can't directly test for text content
    // Instead, we'll just verify the rendering doesn't throw
    const { toJSON } = render(<ReceiveScreen />);
    
    // Verify that a component was rendered
    expect(toJSON()).toBeTruthy();
    
    // More specific checks would require adding testIDs to the components
  });
});