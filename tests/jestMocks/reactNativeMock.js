// Mock React Native components and modules for testing
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Add any specific component mocks here
  RN.NativeModules.StatusBarManager = {
    getHeight: jest.fn(),
    setStyle: jest.fn(),
    setHidden: jest.fn(),
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