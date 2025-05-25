// Mock for @testing-library/react-native
const React = require('react');

// Create a comprehensive screen implementation
const screen = {
  getByTestId: jest.fn((id) => ({ testID: id, props: {}, type: 'component' })),
  getByText: jest.fn((text) => ({ children: text, props: {}, type: 'text' })),
  queryByTestId: jest.fn((id) => ({ testID: id, props: {}, type: 'component' })),
  queryByText: jest.fn((text) => ({ children: text, props: {}, type: 'text' })),
  getAllByTestId: jest.fn((id) => [{ testID: id, props: {}, type: 'component' }]),
  getAllByText: jest.fn((text) => [{ children: text, props: {}, type: 'text' }]),
  queryAllByTestId: jest.fn((id) => [{ testID: id, props: {}, type: 'component' }]),
  queryAllByText: jest.fn((text) => [{ children: text, props: {}, type: 'text' }]),
  getByRole: jest.fn(() => ({})),
  queryByRole: jest.fn(() => ({})),
  getAllByRole: jest.fn(() => []),
  queryAllByRole: jest.fn(() => []),
  getByLabelText: jest.fn(() => ({})),
  queryByLabelText: jest.fn(() => ({})),
  getAllByLabelText: jest.fn(() => []),
  queryAllByLabelText: jest.fn(() => []),
  getByPlaceholderText: jest.fn(() => ({})),
  queryByPlaceholderText: jest.fn(() => ({})),
  getAllByPlaceholderText: jest.fn(() => []),
  queryAllByPlaceholderText: jest.fn(() => []),
  UNSAFE_getAllByType: jest.fn(() => []),
  UNSAFE_queryAllByType: jest.fn(() => []),
  UNSAFE_getByType: jest.fn(() => ({})),
  UNSAFE_queryByType: jest.fn(() => ({})),
  debug: jest.fn(),
  logTestingPlaygroundURL: jest.fn()
};

// Create comprehensive fireEvent mock
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
  }),
  scroll: jest.fn((element, scrollEvent) => {
    if (element && element.props.onScroll) {
      element.props.onScroll(scrollEvent);
    }
    return { type: 'scroll' };
  }),
  focus: jest.fn((element) => {
    if (element && element.props.onFocus) {
      element.props.onFocus();
    }
    return { type: 'focus' };
  }),
  blur: jest.fn((element) => {
    if (element && element.props.onBlur) {
      element.props.onBlur();
    }
    return { type: 'blur' };
  }),
  // Add other event types as needed
};

// Create enhanced render function
const render = jest.fn((component) => {
  return {
    ...screen,
    toJSON: jest.fn(() => ({})),
    update: jest.fn(),
    unmount: jest.fn(),
    asJSON: jest.fn(() => ({})),
    rerender: jest.fn(),
    container: {
      children: []
    }
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
  waitForElementToBeRemoved: jest.fn(() => Promise.resolve()),
  act: jest.fn((cb) => cb()),
};