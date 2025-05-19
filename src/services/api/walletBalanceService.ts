/**
 * Service for getting wallet balance data from external Bitcoin APIs
 * Supports both mainnet and testnet
 */
import axios from 'axios'

// API endpoints for different networks
const MEMPOOL_MAINNET_API = 'https://mempool.space/api'
const MEMPOOL_TESTNET_API = 'https://mempool.space/testnet/api'

// Balance response interface
interface AddressBalanceResponse {
  confirmed: number;   // Confirmed balance in satoshis
  unconfirmed: number; // Unconfirmed balance in satoshis
}

// Cache configuration
const CACHE_DURATION_MS = 60 * 1000 // 60 seconds

// Rate limiting configuration
const RATE_LIMIT_DURATION_MS = 10 * 1000 // 10 seconds
let lastRequestTimestamp = 0

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
   */
  getAddressBalance : async (
    address: string,
    isTestnet = true,
    forceRefresh = false
  ): Promise<AddressBalanceResponse> => {
    const now = Date.now()

    // If no address is provided, return zero balance immediately
    if (!address) {
      console.log('No address provided, returning zero balance.')
      return { confirmed: 0, unconfirmed: 0 }
    }

    // Check rate limit first
    if (!forceRefresh && (now - lastRequestTimestamp < RATE_LIMIT_DURATION_MS)) {
      console.log('Rate limit active, using cached or potentially stale data.')
      const cached = walletBalanceServiceImpl.getCachedBalance(address, true) 
      if (cached) return cached
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
    lastRequestTimestamp = now
    
    try {
      // Fetch directly from Mempool API
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
   * Fetch balance from Mempool API
   */
  fetchFromMempool : async (
    address: string,
    isTestnet: boolean
  ): Promise<AddressBalanceResponse> => {
    const baseUrl = isTestnet ? MEMPOOL_TESTNET_API : MEMPOOL_MAINNET_API
    const response = await axios.get(`${baseUrl}/address/${address}`, {
      timeout : 10000
    })
    
    if (response.data && typeof response.data === 'object') {
      const chainStats = response.data.chain_stats || { funded_txo_sum: 0, spent_txo_sum: 0 }
      const mempoolStats = response.data.mempool_stats || { funded_txo_sum: 0, spent_txo_sum: 0 }
      
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
   * @param allowStaleIfRateLimited - If true, returns cached data even if it's slightly past CACHE_DURATION_MS, used when rate limited.
   */
  getCachedBalance : (address: string, allowStaleIfRateLimited = false): AddressBalanceResponse | null => {
    const now = Date.now()
    const cached = balanceCache.find(entry => entry.address === address)
    
    if (cached) {
      const isCacheValid = now - cached.timestamp < CACHE_DURATION_MS
      if (isCacheValid || (allowStaleIfRateLimited && now - cached.timestamp < RATE_LIMIT_DURATION_MS + CACHE_DURATION_MS)) {
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