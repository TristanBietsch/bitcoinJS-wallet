/**
 * Service for getting wallet balance data from external Bitcoin APIs
 * Supports both mainnet and testnet
 */
import axios from 'axios'

// API endpoints for different networks
const BLOCKSTREAM_MAINNET_API = 'https://blockstream.info/api'
const BLOCKSTREAM_TESTNET_API = 'https://blockstream.info/testnet/api'
const MEMPOOL_MAINNET_API = 'https://mempool.space/api'
const MEMPOOL_TESTNET_API = 'https://mempool.space/testnet/api'

// Balance response interface
interface AddressBalanceResponse {
  confirmed: number;   // Confirmed balance in satoshis
  unconfirmed: number; // Unconfirmed balance in satoshis
}

// Cache configuration
const CACHE_DURATION_MS = 60 * 1000 // 60 seconds

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
      // Try Blockstream API first
      return await walletBalanceServiceImpl.fetchFromBlockstream(address, isTestnet)
    } catch (blockstreamError) {
      console.warn('Blockstream API failed, falling back to Mempool:', blockstreamError)
      
      try {
        // Fall back to Mempool API
        return await walletBalanceServiceImpl.fetchFromMempool(address, isTestnet)
      } catch (_mempoolError) {
        console.error('All balance API requests failed')
        
        // For development environment, use dummy data rather than failing completely
        if (__DEV__) {
          console.warn('Using dummy balance data for development')
          const dummyBalance = walletBalanceServiceImpl.getDummyBalance(address)
          walletBalanceServiceImpl.updateCache(address, dummyBalance)
          return dummyBalance
        }
        
        throw new Error('Failed to fetch balance from all available services')
      }
    }
  },
  
  /**
   * Fetch balance from Blockstream API
   */
  fetchFromBlockstream : async (
    address: string,
    isTestnet: boolean
  ): Promise<AddressBalanceResponse> => {
    const baseUrl = isTestnet ? BLOCKSTREAM_TESTNET_API : BLOCKSTREAM_MAINNET_API
    const response = await axios.get(`${baseUrl}/address/${address}`, {
      timeout : 10000
    })
    
    // Validate and transform response
    if (
      response.data &&
      typeof response.data.chain_stats === 'object' &&
      typeof response.data.mempool_stats === 'object'
    ) {
      // Blockstream format has chain_stats (confirmed) and mempool_stats (unconfirmed)
      const balance: AddressBalanceResponse = {
        confirmed   : response.data.chain_stats.funded_txo_sum - response.data.chain_stats.spent_txo_sum,
        unconfirmed : response.data.mempool_stats.funded_txo_sum - response.data.mempool_stats.spent_txo_sum
      }
      
      // Update cache
      walletBalanceServiceImpl.updateCache(address, balance)
      return balance
    }
    
    throw new Error('Invalid response format from Blockstream API')
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
    
    // Validate and transform response
    if (response.data && typeof response.data === 'object') {
      // Mempool format is different from Blockstream
      const chainStats = response.data.chain_stats || { funded_txo_sum: 0, spent_txo_sum: 0 }
      const mempoolStats = response.data.mempool_stats || { funded_txo_sum: 0, spent_txo_sum: 0 }
      
      const balance: AddressBalanceResponse = {
        confirmed   : chainStats.funded_txo_sum - chainStats.spent_txo_sum,
        unconfirmed : mempoolStats.funded_txo_sum - mempoolStats.spent_txo_sum
      }
      
      // Update cache
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
    
    if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
      return cached.data
    }
    
    return null
  },
  
  /**
   * Update the balance cache
   */
  updateCache : (address: string, data: AddressBalanceResponse): void => {
    // Find existing cache entry
    const existingIndex = balanceCache.findIndex(entry => entry.address === address)
    
    // Update or add new entry
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
    // Use the address string to generate a consistent but random-looking balance
    // This helps with testing different scenarios
    const addressSum = address
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0) % 1000000
    
    return {
      confirmed   : addressSum * 100, // 0 to 100,000,000 sats (0-1 BTC)
      unconfirmed : Math.floor(addressSum / 10) * 10 // Smaller unconfirmed amount
    }
  }
}

// Export the service as a const for better TypeScript support
export const walletBalanceService = walletBalanceServiceImpl 