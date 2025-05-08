/**
 * Bitcoin price service with caching and rate limiting
 * Fetches BTC price from CoinGecko with fallback to CoinCap
 */
import axios from 'axios'

// API endpoints
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
const COINCAP_API_URL = 'https://api.coincap.io/v2/assets/bitcoin'

// Cache configuration
const CACHE_DURATION_MS = 30 * 1000 // 30 seconds

// Cache storage
interface PriceCache {
  price : number | null
  timestamp : number | null
}

// Module-scoped cache
let cache: PriceCache = {
  price : null,
  timestamp : null
}

/**
 * Fetches current Bitcoin price in USD with caching
 * Will try CoinGecko first, then fall back to CoinCap if needed
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

  // Try fetching from CoinGecko first
  try {
    const response = await axios.get(COINGECKO_API_URL, { timeout: 5000 })
    
    if (response.data?.bitcoin?.usd) {
      const price = response.data.bitcoin.usd
      // Update cache
      cache = {
        price : price,
        timestamp : now
      }
      return price
    }
    
    throw new Error('Invalid response format from CoinGecko')
  } catch (error) {
    console.warn('CoinGecko API request failed, trying CoinCap fallback:', error)
    
    // Fall back to CoinCap
    try {
      const response = await axios.get(COINCAP_API_URL, { timeout: 5000 })
      
      if (response.data?.data?.priceUsd) {
        const price = parseFloat(response.data.data.priceUsd)
        // Update cache
        cache = {
          price : price,
          timestamp : now
        }
        return price
      }
      
      throw new Error('Invalid response format from CoinCap')
    } catch (fallbackError) {
      console.error('All price API requests failed:', fallbackError)
      
      // If we have any cached price, return it as last resort, even if expired
      if (cache.price !== null) {
        console.warn('Returning stale cached price as last resort')
        return cache.price
      }
      
      throw new Error('Failed to fetch Bitcoin price from all sources')
    }
  }
} 