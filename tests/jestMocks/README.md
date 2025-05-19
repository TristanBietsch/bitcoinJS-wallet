# Jest Mocks

This directory contains mock implementations for various modules and assets used in testing.

## Mock files

- `fileMock.js` - Mock for file imports like images and other media files
- `styleMock.js` - Mock for style imports (CSS, LESS, etc.)
- `reactNativeMock.js` - Mock for React Native components and modules

## Module mocks

The `node_modules` directory contains mocks for npm modules, allowing us to override their behavior in tests:

- `@testing-library/react-native.js` - Mock for React Testing Library for React Native

## Usage

These mocks are configured in the Jest configuration file (`jest.config.js`) and are automatically used when running tests. They help handle imports and dependencies that aren't compatible with the Node.js environment where Jest runs.

Do not confuse this with `mockData` folder, which contains test fixtures and sample data. 