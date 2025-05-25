/**
 * Global Jest setup file for React Native tests
 * This file is imported by Jest before running tests
 */

// Add testing-library jest-native matchers
require('@testing-library/jest-native/extend-expect');

// Set up global environment for React Native
global.window = {};
global.__DEV__ = true;

// Fix for timer-related issues in testing env
// Don't mock setTimeout and clearTimeout completely as they're needed by testing library
if (!global.setTimeout) {
  global.setTimeout = function(callback, timeout) {
    return setTimeout(callback, timeout);
  };
}
if (!global.clearTimeout) {
  global.clearTimeout = function(id) {
    return clearTimeout(id);
  };
}

global.setInterval = jest.fn();
global.clearInterval = jest.fn();

global.requestAnimationFrame = function(callback) {
  return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function(id) {
  clearTimeout(id);
};

// Use fake timers for reliable test behavior but keep setTimeout and clearTimeout real
jest.useFakeTimers({doNotFake: ['setTimeout', 'clearTimeout']});

// Load all the centralized mock configurations
require('./mocks');