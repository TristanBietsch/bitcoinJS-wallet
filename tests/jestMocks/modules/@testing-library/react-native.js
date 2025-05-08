// Mock for @testing-library/react-native
const React = require('react');

// Create a basic screen implementation
const screen = {
  getByTestId: jest.fn((id) => ({ testID: id, props: {}, type: 'component' })),
  getByText: jest.fn((text) => ({ children: text, props: {}, type: 'text' })),
  queryByTestId: jest.fn((id) => ({ testID: id, props: {}, type: 'component' })),
  UNSAFE_getAllByType: jest.fn(() => []),
  UNSAFE_getByType: jest.fn(() => ({}))
};

// Create fireEvent mock
const fireEvent = {
  press: jest.fn((element) => {
    if (element && !element.props.disabled && element.props.onPress) {
      element.props.onPress();
    }
    return { type: 'press' };
  }),
  changeText: jest.fn((element, text) => {
    if (element && element.props.onChangeText) {
      element.props.onChangeText(text);
    }
    return { type: 'changeText' };
  })
};

// Create render function
const render = jest.fn((component) => {
  return {
    toJSON: jest.fn(() => ({})),
    update: jest.fn(),
    unmount: jest.fn(),
    asJSON: jest.fn(() => ({})),
    debug: jest.fn(),
    queryByTestId: screen.queryByTestId,
    getByTestId: screen.getByTestId,
    getByText: screen.getByText,
    UNSAFE_getAllByType: screen.UNSAFE_getAllByType,
    UNSAFE_getByType: screen.UNSAFE_getByType
  };
});

// Export the mock
module.exports = {
  render,
  fireEvent,
  screen,
  cleanup: jest.fn(),
  within: jest.fn(() => screen),
  waitFor: jest.fn((cb) => Promise.resolve(cb())),
  act: jest.fn((cb) => cb()),
}; 