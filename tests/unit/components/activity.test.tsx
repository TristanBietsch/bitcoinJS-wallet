import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { ActivityItem } from '@/src/components/domain/Transaction/ActivityItem'
import { ActivityGroup } from '@/src/components/domain/Transaction/ActivityGroup'
import { Transaction } from '@/tests/mockData/transactionData'

// Mock the transaction data for testing
const mockReceiveTransaction: Transaction = {
  id        : 'test-1',
  type      : 'receive',
  amount    : 25.00,
  timestamp : Date.now(),
  address   : 'bc1q7z5qm4ufhwu7gvgmp96hpr3hjzp3uy9cmsc3u6',
  status    : 'confirmed',
  hash      : '63b21a5e8c0a8e214b5e4c089dbe6940d14d2c1f1ca544db42a79e5db131bdc2'
}

const mockSendTransaction: Transaction = {
  id        : 'test-2',
  type      : 'send',
  amount    : 15.75,
  fee       : 0.25,
  timestamp : Date.now(),
  address   : 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  status    : 'confirmed',
  hash      : 'b7312e56e8fb5e7ccb1920c8f9c24b418dd293e0e98ab73afc84b89e8x89fce'
}

describe('ActivityItem', () => {
  it('renders receive transaction correctly', () => {
    const { getByText } = render(
      <ActivityItem transaction={mockReceiveTransaction} />
    )
    
    expect(getByText('Received Bitcoin')).toBeTruthy()
    expect(getByText('bc1q7...c3u6')).toBeTruthy()
    expect(getByText('$25.00')).toBeTruthy()
  })
  
  it('renders send transaction correctly', () => {
    const { getByText } = render(
      <ActivityItem transaction={mockSendTransaction} />
    )
    
    expect(getByText('Sent Bitcoin')).toBeTruthy()
    expect(getByText('bc1qx...0wlh')).toBeTruthy()
    expect(getByText('-$15.75')).toBeTruthy()
  })
  
  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn()
    const { getByText } = render(
      <ActivityItem 
        transaction={mockReceiveTransaction} 
        onPress={onPressMock} 
      />
    )
    
    fireEvent.press(getByText('Received Bitcoin'))
    expect(onPressMock).toHaveBeenCalledTimes(1)
  })
})

describe('ActivityGroup', () => {
  const mockTransactions = [ mockReceiveTransaction, mockSendTransaction ]
  
  it('renders group title correctly', () => {
    const { getByText } = render(
      <ActivityGroup 
        title="Today" 
        transactions={mockTransactions} 
      />
    )
    
    expect(getByText('Today')).toBeTruthy()
  })
  
  it('renders all transactions in the group', () => {
    const { getByText } = render(
      <ActivityGroup 
        title="Today" 
        transactions={mockTransactions} 
      />
    )
    
    expect(getByText('Received Bitcoin')).toBeTruthy()
    expect(getByText('Sent Bitcoin')).toBeTruthy()
  })
  
  it('does not render if there are no transactions', () => {
    const { queryByText } = render(
      <ActivityGroup 
        title="Today" 
        transactions={[]} 
      />
    )
    
    // The component shouldn't render anything when there are no transactions
    expect(queryByText('Today')).toBeNull()
  })
  
  it('calls onPressTransaction when a transaction is pressed', () => {
    const onPressMock = jest.fn()
    const { getByText } = render(
      <ActivityGroup 
        title="Today" 
        transactions={mockTransactions} 
        onPressTransaction={onPressMock}
      />
    )
    
    fireEvent.press(getByText('Received Bitcoin'))
    expect(onPressMock).toHaveBeenCalledTimes(1)
    expect(onPressMock).toHaveBeenCalledWith(mockReceiveTransaction)
  })
}) 