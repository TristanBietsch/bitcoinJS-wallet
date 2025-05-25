module.exports = {
  preset: 'react-native',
  
  // For React Native component tests, jsdom works better
  testEnvironment: 'jsdom',
  
  // Specify the directories where Jest should look for tests
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/integration/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/e2e/**/*.test.{js,jsx,ts,tsx}'
  ],
  
  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  
  // Important: Tell Jest which packages should not be transformed
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|react-native.*|@react-native.*|@?expo.*|expo.*|@react-navigation.*|@?rneui.*|lucide-react-native.*|nativewind.*|react-native-.*|@sentry\/.*|lottie-react-native.*|@bitcoin-design\/.*|@tanstack\/.*)/)'
  ],
  
  // File extensions Jest will look for
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  
  // Module name mappings
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/jestMocks/fileMock.js',
    '\\.(css|less)$': '<rootDir>/tests/jestMocks/styleMock.js',
    // Add mappings for any CSS processed by NativeWind
    '\\.css$': '<rootDir>/tests/jestMocks/styleMock.js'
  },
  
  // Configure where to look for modules
  moduleDirectories: ['node_modules', 'tests/jestMocks', 'tests'],
  
  // Setup files
  setupFiles: ['<rootDir>/tests/setup/mocks.js'],
  
  // For testing-library/react-native
  setupFilesAfterEnv: ['<rootDir>/tests/setup/setupTests.js'],
  
  // For coverage reporting
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**'
  ],
  
  // Properly handle files with the same name in different directories
  watchPathIgnorePatterns: [
    'node_modules'
  ],
  
  // Set test timeout to accommodate for tests that might take longer
  testTimeout: 15000
};