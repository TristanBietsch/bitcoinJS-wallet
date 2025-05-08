# Testing Structure for Nummus Wallet

This directory contains the testing setup for the Nummus Wallet application.

## Test Structure

- `unit/` - Unit tests for individual components and functions
- `integration/` - Integration tests for combined functionality 
- `e2e/` - End-to-end tests (when implemented)
- `setup/` - Jest configuration and setup files
- `jestMocks/` - Mock implementations for various modules and files
- `mockData/` - Test fixtures and sample data
- `utils/` - Utility functions for tests

## Running Tests

To run the tests:

```bash
yarn test
```

To run tests with coverage:

```bash
yarn test:coverage
```

To run tests in watch mode:

```bash
yarn test:watch
```

## Test Setup

The Jest configuration is defined in `jest.config.js` at the root of the project. The test environment is set up in the following files:

- `tests/setup/setupTests.js` - Main setup file that runs before tests
- `tests/setup/mocks.js` - Central location for module mocks

## Mock Files

The `jestMocks` directory contains mock implementations for various imports:

- `fileMock.js` - Mock for file imports like images
- `styleMock.js` - Mock for style imports
- `reactNativeMock.js` - Mocks for React Native components
- `modules/@testing-library/react-native.js` - Mock for React Testing Library

## Best Practices

When writing tests:

1. Unit tests should be isolated and not depend on external services
2. Use the provided mock data in `mockData/` for consistent testing
3. Follow the existing patterns for mocking external dependencies
4. For UI components, use `testID` props to make components easily selectable in tests
5. Group related tests with descriptive `describe` blocks
6. Use clear, specific `it` descriptions that explain the expected behavior

## Example Test

```tsx
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { MyComponent } from '../src/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    let component;
    act(() => {
      component = renderer.create(<MyComponent />);
    });
    expect(component.toJSON()).toBeTruthy();
  });
});
```