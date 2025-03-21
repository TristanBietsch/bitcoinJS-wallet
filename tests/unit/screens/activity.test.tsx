import React from 'react'
import { render } from '@testing-library/react-native'
import ActivityScreen from '@/src/screens/main/activity/ActivityScreen'
import { Transaction } from '@/tests/mockData/transactionData'

// Mock the navigation
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation : () => ({
      navigate : jest.fn(),
    }),
  }
})

// Create a mock with specific time periods for testing
const createMockTransactions = (): Transaction[] => {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  
  return [
    // Today transaction
    {
      id        : 'today-1',
      type      : 'receive',
      amount    : 25.00,
      timestamp : now - 3600000, // 1 hour ago
      address   : 'bc1q7z5qm4ufhwu7gvgmp96hpr3hjzp3uy9cmsc3u6',
      status    : 'confirmed',
      hash      : 'hash-today-1'
    },
    // Past week transaction
    {
      id        : 'week-1',
      type      : 'send',
      amount    : 15.75,
      fee       : 0.25,
      timestamp : now - (3 * day), // 3 days ago
      address   : 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      status    : 'confirmed',
      hash      : 'hash-week-1'
    },
    // Last month transaction
    {
      id        : 'month-1',
      type      : 'receive',
      amount    : 42.50,
      timestamp : now - (25 * day), // 25 days ago
      address   : 'bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej',
      status    : 'confirmed',
      hash      : 'hash-month-1'
    }
  ]
}

// Mock the transactionData module
jest.mock('@/tests/mockData/transactionData', () => {
  const mockTransactions = createMockTransactions()
  return {
    Transaction      : jest.requireActual('@/tests/mockData/transactionData').Transaction,
    mockTransactions : mockTransactions
  }
})

describe('ActivityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders the Activity title', () => {
    const { getByText } = render(<ActivityScreen />)
    expect(getByText('Activity')).toBeTruthy()
  })

  it('renders Today group with transactions', () => {
    const { getByText } = render(<ActivityScreen />)
    expect(getByText('Today')).toBeTruthy()
    // Check for the transaction amount that should be in the Today group
    expect(getByText('$25.00')).toBeTruthy()
  })

  it('renders Past Week group with transactions', () => {
    const { getByText } = render(<ActivityScreen />)
    expect(getByText('Past Week')).toBeTruthy()
    // Check for the transaction amount that should be in the Past Week group
    expect(getByText('-$15.75')).toBeTruthy()
  })

  it('renders month groups with transactions', () => {
    const { getByText } = render(<ActivityScreen />)
    
    // Since the month will depend on the current date, we need to get the expected month name
    const date = new Date(Date.now() - (25 * 24 * 60 * 60 * 1000))
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    
    expect(getByText(monthYear)).toBeTruthy()
    // Check for the transaction amount that should be in this month group
    expect(getByText('$42.50')).toBeTruthy()
  })
}) 