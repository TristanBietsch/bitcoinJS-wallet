module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  
  // Process JS/TS files with Babel
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript',
          '@babel/preset-react'
        ],
        plugins: [
          ['@babel/plugin-transform-runtime', { regenerator: true }],
          ['@babel/plugin-transform-private-methods', { loose: true }],
          ['@babel/plugin-transform-private-property-in-object', { loose: true }]
        ]
      }
    ]
  },
  
  // Don't transform react-native and other important modules
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-clone-referenced-element|@react-navigation|react-navigation|@expo|expo|@unimodules|unimodules|@?expo-.*|.*expo-.*)'
  ],
  
  // Match test files in the tests directory structure
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/integration/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/e2e/**/*.test.{js,jsx,ts,tsx}'
  ],
  
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  
  // Map module paths to support imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  
  // Setup files for Jest
  setupFiles: ['<rootDir>/jest.setup.js']
}; 