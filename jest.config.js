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
    'node_modules/(?!(react-native|react-native.*|@react-native.*|@?expo.*|expo.*)/)'
  ],
  
  // File extensions Jest will look for
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  
  // Module name mappings
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/tests/__mocks__/styleMock.js'
  },
  
  // Configure where to look for modules
  moduleDirectories: ['node_modules', 'tests'],
  
  // Setup files
  setupFiles: ['<rootDir>/jest.setup.js'],
  
  // For testing-library/react-native
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  
  // For coverage reporting
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!**/node_modules/**'
  ]
}; 