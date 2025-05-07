import { Transaction } from '@/src/types/domain/transaction'

// Mock transaction for development - to be replaced with real API calls
const mockTransaction: Transaction = {
  id            : '1',
  type          : 'send',
  amount        : 0.0023,
  currency      : 'BTC',
  date          : new Date('2024-03-10T10:30:00'),
  recipient     : '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  status        : 'completed',
  fee           : 0.00005,
  memo          : 'Test transaction',
  txid          : 'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d',
  confirmations : 6
}

/**
 * Fetch transaction details by ID
 * Currently uses mock data, but would connect to an API in a real app
 */
export const getTransactionById = async (_id: string): Promise<Transaction> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // In a real app, this would call an API or fetch from a local database
  return mockTransaction
}

/**
 * Opens the blockchain explorer for a given transaction
 */
export const openTransactionInExplorer = (txid: string): void => {
  // In a real app, this would open a URL with the transaction explorer
  console.log(`Opening explorer for transaction: ${txid}`)
  
  // Example implementation:
  // Linking.openURL(`https://www.blockchain.com/btc/tx/${txid}`)
} 