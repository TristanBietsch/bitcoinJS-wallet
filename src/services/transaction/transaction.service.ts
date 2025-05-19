import { Transaction } from '@/src/types/domain/transaction'
import { Platform, Linking } from 'react-native'

// Mock transactions for development - to be removed in production
const mockTransactions: Record<string, Transaction> = {
  '1' : {
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
  },
  '2' : {
    id            : '2',
    type          : 'receive',
    amount        : 0.005,
    currency      : 'BTC',
    date          : new Date('2024-03-09T14:22:00'),
    sender        : 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    status        : 'completed',
    fee           : 0,
    memo          : 'Payment received',
    txid          : 'b7053db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf512ac',
    confirmations : 12
  }
}

// Different block explorers based on network
const blockExplorers = {
  mainnet : 'https://mempool.space/tx/',
  testnet : 'https://mempool.space/testnet/tx/',
  regtest : 'http://localhost:8080/tx/'
}

/**
 * Transaction service for Bitcoin transactions
 */
export const transactionService = {
  /**
   * Fetch a transaction by ID
   * Currently uses mock data, to be replaced with API calls in production
   */
  getById : async (id: string): Promise<Transaction | null> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return mockTransactions[id] || null
  },
  
  /**
   * List recent transactions
   * Currently returns mock data
   */
  listRecent : async (limit: number = 10): Promise<Transaction[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return Object.values(mockTransactions).slice(0, limit)
  },
  
  /**
   * Opens the transaction in a blockchain explorer
   * @param txid Transaction ID to view
   * @param network Network to use (defaults to mainnet)
   */
  openInExplorer : (txid: string, network: 'mainnet' | 'testnet' | 'regtest' = 'mainnet'): Promise<boolean> => {
    const baseUrl = blockExplorers[network]
    const url = `${baseUrl}${txid}`
    
    if (Platform.OS === 'web') {
      window.open(url, '_blank')
      return Promise.resolve(true)
    }
    
    return Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url)
            .then(() => true)
            .catch(() => false)
        }
        console.error(`Cannot open URL: ${url}`)
        return false
      })
  }
} 