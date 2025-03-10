/**
 * Test utilities for React Native components
 */

// Avoid JSX in this file since it's causing parsing issues

/**
 * Creates a mock component for testing
 * @param displayName Name of the component
 */
export const createMockComponent = (displayName: string) => {
  const component = (props: any) => {
    return props.children || null;
  };
  component.displayName = displayName;
  return component;
};

/**
 * Mock error handler for testing error boundaries
 */
export const mockErrorHandler = () => {
  const originalConsoleError = console.error;
  console.error = jest.fn();
  
  return () => {
    console.error = originalConsoleError;
  };
};

/**
 * Helper to wait for all animations and timers to complete
 */
export const flushMicroTasks = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Helper to set up component test with standard mocks
 */
export const setupComponentTest = () => {
  // Use fake timers
  jest.useFakeTimers();
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Restore real timers after tests
  afterAll(() => {
    jest.useRealTimers();
  });
};

/**
 * Format currency values for display in tests
 */
export const formatTestCurrency = (amount: number, currency: string): string => {
  if (currency === 'USD') {
    return `$${amount.toLocaleString()}`;
  } else if (currency === 'BTC') {
    return `₿${amount.toLocaleString()}`;
  } else {
    return amount.toLocaleString();
  }
};