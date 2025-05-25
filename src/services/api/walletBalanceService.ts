/**
 * Service for getting wallet balance data from external Bitcoin APIs
 * Supports both mainnet and testnet
 * Now uses resilient client with proper retry logic and caching
 */
import { priorityClient } from './resilientClient'

// API endpoints for different networks
const MEMPOOL_MAINNET_API = 'https://mempool.space/api'
const MEMPOOL_TESTNET_API = 'https://mempool.space/testnet/api'

// Balance response interface
interface AddressBalanceResponse {
  confirmed: number;   // Confirmed balance in satoshis
  unconfirmed: number; // Unconfirmed balance in satoshis
}

// Cache configuration - shorter cache since resilient client handles caching better
const CACHE_DURATION_MS = 30 * 1000 // 30 seconds

// Cache structure
interface BalanceCache {
  address: string;
  data: AddressBalanceResponse;
  timestamp: number;
}

// Module-scoped cache
const balanceCache: BalanceCache[] = []

// Create a standalone service object for wallet balance operations
const walletBalanceServiceImpl = {
  /**
   * Get balance for a Bitcoin address
   * Now uses resilient client with automatic retries and circuit breaking
   */
  getAddressBalance : async (
    address: string,
    isTestnet = true,
    forceRefresh = false
  ): Promise<AddressBalanceResponse> => {
    // If no address is provided, return zero balance immediately
    if (!address) {
      console.log('No address provided, returning zero balance.')
      return { confirmed: 0, unconfirmed: 0 }
    }

    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cachedBalance = walletBalanceServiceImpl.getCachedBalance(address)
      if (cachedBalance) {
        console.log('Using cached balance for address:', address)
        return cachedBalance
      }
    }

    console.log(`Fetching balance for ${isTestnet ? 'testnet' : 'mainnet'} address: ${address}`)
    
    try {
      // Fetch from Mempool API with resilient client
      return await walletBalanceServiceImpl.fetchFromMempool(address, isTestnet)
    } catch (error) {
      console.error('Mempool API request failed:', error)
        
      // For development environment, use dummy data rather than failing completely
      if (__DEV__) {
        console.warn('Using dummy balance data for development')
        const dummyBalance = walletBalanceServiceImpl.getDummyBalance(address)
        walletBalanceServiceImpl.updateCache(address, dummyBalance)
        return dummyBalance
      }
      
      throw new Error('Failed to fetch balance from Mempool API')
    }
  },
  
  /**
   * Fetch balance from Mempool API using resilient client
   * Uses HIGH priority with built-in caching for fast response
   */
  fetchFromMempool : async (
    address: string,
    isTestnet: boolean
  ): Promise<AddressBalanceResponse> => {
    const baseUrl = isTestnet ? MEMPOOL_TESTNET_API : MEMPOOL_MAINNET_API
    const url = `${baseUrl}/address/${address}`
    
    // Use high priority with 20 second cache for balance requests
    const data = await priorityClient.high.get(url, {
      timeout : 30000  // Use 30 second timeout as requested
    }, 20000)
    
    if (data && typeof data === 'object') {
      const chainStats = data.chain_stats || { funded_txo_sum: 0, spent_txo_sum: 0 }
      const mempoolStats = data.mempool_stats || { funded_txo_sum: 0, spent_txo_sum: 0 }
      
      const balance: AddressBalanceResponse = {
        confirmed   : chainStats.funded_txo_sum - chainStats.spent_txo_sum,
        unconfirmed : mempoolStats.funded_txo_sum - mempoolStats.spent_txo_sum
      }
      
      walletBalanceServiceImpl.updateCache(address, balance)
      return balance
    }
    
    throw new Error('Invalid response format from Mempool API')
  },
  
  /**
   * Get cached balance if available and not expired
   */
  getCachedBalance : (address: string): AddressBalanceResponse | null => {
    const now = Date.now()
    const cached = balanceCache.find(entry => entry.address === address)
    
    if (cached) {
      const isCacheValid = now - cached.timestamp < CACHE_DURATION_MS
      if (isCacheValid) {
        return cached.data
      }
    }
    
    return null
  },
  
  /**
   * Update the balance cache
   */
  updateCache : (address: string, data: AddressBalanceResponse): void => {
    const existingIndex = balanceCache.findIndex(entry => entry.address === address)
    const newEntry: BalanceCache = {
      address,
      data,
      timestamp : Date.now()
    }
    
    if (existingIndex >= 0) {
      balanceCache[existingIndex] = newEntry
    } else {
      balanceCache.push(newEntry)
    }
  },
  
  /**
   * Get dummy balance data for development
   */
  getDummyBalance : (address: string): AddressBalanceResponse => {
    const addressSum = address
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0) % 1000000
    
    return {
      confirmed   : addressSum * 100, 
      unconfirmed : Math.floor(addressSum / 10) * 10
    }
  }
}

// Export the service as a const for better TypeScript support
export const walletBalanceService = walletBalanceServiceImpl 