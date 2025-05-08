/**
 * Bitcoin price service with caching and rate limiting
 * Fetches BTC price from CoinGecko with fallback to CoinCap
 */
import axios, { AxiosRequestConfig } from 'axios'

// API endpoints
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
const COINCAP_API_URL = 'https://api.coincap.io/v2/assets/bitcoin'

// Cache configuration
const CACHE_DURATION_MS = 30 * 1000 // 30 seconds

// Request configuration
const API_TIMEOUT_MS = 5000 // 5 seconds timeout for API requests
const API_REQUEST_CONFIG: AxiosRequestConfig = {
  timeout : API_TIMEOUT_MS,
  headers : {
    'Accept'       : 'application/json',
    'Content-Type' : 'application/json',
  }
}

// Custom error class for price fetching errors
export class BitcoinPriceError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message)
    this.name = 'BitcoinPriceError'
  }
}

// Cache storage
interface PriceCache {
  price: number | null
  timestamp: number | null
}

// Module-scoped cache
let cache: PriceCache = {
  price     : null,
  timestamp : null
}

/**
 * Reset the cache - useful for testing and error recovery
 */
export const resetPriceCache = (): void => {
  cache = {
    price     : null,
    timestamp : null
  }
}

/**
 * Helper to validate and parse price data from API responses
 */
const validateAndExtractPrice = (
  data: any, 
  source: 'coingecko' | 'coincap'
): number => {
  if (source === 'coingecko') {
    if (!data?.bitcoin?.usd) {
      throw new Error('Invalid or missing price data from CoinGecko')
    }
    const price = Number(data.bitcoin.usd)
    if (isNaN(price) || price <= 0) {
      throw new Error('Invalid price value from CoinGecko')
    }
    return price
  } else {
    if (!data?.data?.priceUsd) {
      throw new Error('Invalid or missing price data from CoinCap')
    }
    const price = parseFloat(data.data.priceUsd)
    if (isNaN(price) || price <= 0) {
      throw new Error('Invalid price value from CoinCap')
    }
    return price
  }
}

/**
 * Fetches current Bitcoin price in USD with caching
 * Will try CoinGecko first, then fall back to CoinCap if needed
 * @throws {BitcoinPriceError} If unable to fetch price from any source
 */
export const getBTCPrice = async (): Promise<number> => {
  // Check if we have a valid cached price
  const now = Date.now()
  if (cache.price !== null && cache.timestamp !== null) {
    const cacheAge = now - cache.timestamp
    if (cacheAge < CACHE_DURATION_MS) {
      return cache.price
    }
  }

  try {
    // Try fetching from CoinGecko first
    try {
      const response = await axios.get(COINGECKO_API_URL, API_REQUEST_CONFIG)
      const price = validateAndExtractPrice(response.data, 'coingecko')
      
      // Update cache
      cache = {
        price     : price,
        timestamp : now
      }
      return price
    } catch (error) {
      console.warn('CoinGecko API request failed, trying CoinCap fallback:', error)
      
      // Fall back to CoinCap
      const response = await axios.get(COINCAP_API_URL, API_REQUEST_CONFIG)
      const price = validateAndExtractPrice(response.data, 'coincap')
      
      // Update cache
      cache = {
        price     : price,
        timestamp : now
      }
      return price
    }
  } catch (error) {
    // Both APIs failed
    console.error('All price API requests failed:', error)
    
    // If we have any cached price, return it as last resort, even if expired
    if (cache.price !== null) {
      console.warn('Returning stale cached price as last resort')
      return cache.price
    }
    
    // Reset cache to ensure we don't keep invalid data
    resetPriceCache()
    
    // Throw a custom error with the cause
    throw new BitcoinPriceError(
      'Failed to fetch Bitcoin price from all sources',
      error instanceof Error ? error : undefined
    )
  }
} 