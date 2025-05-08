// Mock React Native components and modules for testing
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Create standard component mocks
  RN.Animated = {
    ...RN.Animated,
    Value: jest.fn(() => ({
      interpolate: jest.fn(),
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeAllListeners: jest.fn(),
    })),
    View: jest.fn(() => 'Animated.View'),
    Text: jest.fn(() => 'Animated.Text'),
    Image: jest.fn(() => 'Animated.Image'),
    createAnimatedComponent: jest.fn(component => component),
    timing: jest.fn(() => ({ start: jest.fn(cb => cb && cb()) })),
    spring: jest.fn(() => ({ start: jest.fn(cb => cb && cb()) })),
  };

  // Mock NativeModules for testing
  RN.NativeModules = {
    ...RN.NativeModules,
    StatusBarManager: {
      getHeight: jest.fn(() => Promise.resolve(44)),
      setStyle: jest.fn(),
      setHidden: jest.fn(),
    },
    UIManager: {
      measureInWindow: jest.fn((node, callback) => callback(0, 0, 0, 0)),
      measure: jest.fn((node, callback) => callback(0, 0, 0, 0)),
    },
    RNGestureHandlerModule: {
      attachGestureHandler: jest.fn(),
      createGestureHandler: jest.fn(),
      dropGestureHandler: jest.fn(),
      updateGestureHandler: jest.fn(),
      State: {},
      Directions: {},
    },
  };

  // Add any specific component mocks here
  RN.Dimensions = {
    ...RN.Dimensions,
    get: jest.fn(() => ({
      width: 375,
      height: 812,
      scale: 1,
      fontScale: 1,
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  RN.Keyboard = {
    ...RN.Keyboard,
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    dismiss: jest.fn(),
  };

  return RN;
});

// Mock timer functions
jest.useFakeTimers();

// Set up timers that work with testing-library
global.requestAnimationFrame = function(callback) {
  return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function(id) {
  clearTimeout(id);
};