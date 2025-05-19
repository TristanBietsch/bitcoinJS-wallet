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
const API_CALL_COOLDOWN_MS = 60 * 1000 // 1 minute cooldown after a direct API call failure

// Cache storage
interface PriceCache {
  price : number | null
  timestamp : number | null
}

// Module-scoped cache
let cache: PriceCache = {
  price     : null,
  timestamp : null
}

// Cooldown state (in-memory)
const apiCooldowns = {
  coinGecko : 0,
  coinCap   : 0,
}

const canCallApi = (apiName: 'coinGecko' | 'coinCap'): boolean => {
  const now = Date.now()
  if (now < apiCooldowns[apiName]) {
    console.warn(`${apiName} API is on cooldown. Next attempt possible in ${Math.ceil((apiCooldowns[apiName] - now) / 1000)}s`)
    return false
  }
  return true
}

const setApiCooldown = (apiName: 'coinGecko' | 'coinCap') => {
  apiCooldowns[apiName] = Date.now() + API_CALL_COOLDOWN_MS
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

  // Try CoinGecko
  if (canCallApi('coinGecko')) {
    try {
      const response = await axios.get(COINGECKO_API_URL, { timeout: 5000 })
      
      if (response.data?.bitcoin?.usd) {
        const price = response.data.bitcoin.usd
        // Update cache
        cache = {
          price     : price,
          timestamp : now
        }
        apiCooldowns.coinGecko = 0 // Reset cooldown on success
        return price
      }
      
      throw new Error('Invalid response format from CoinGecko')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.warn('CoinGecko API request failed, setting cooldown. Error:', errorMessage)
      setApiCooldown('coinGecko') 
      // Fall through to CoinCap or further error handling
    }
  } else {
    console.warn('Skipping CoinGecko due to active cooldown.')
  }

  // Fall back to CoinCap
  if (canCallApi('coinCap')) {
    try {
      const response = await axios.get(COINCAP_API_URL, { timeout: 5000 })
      
      if (response.data?.data?.priceUsd) {
        const price = parseFloat(response.data.data.priceUsd)
        // Update cache
        cache = {
          price     : price,
          timestamp : now
        }
        apiCooldowns.coinCap = 0 // Reset cooldown on success
        return price
      }
      
      throw new Error('Invalid response format from CoinCap')
    } catch (fallbackError) {
      const errorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
      console.warn('CoinCap API request failed, setting cooldown. Error:', errorMessage)
      setApiCooldown('coinCap')
      // Fall through to final error handling
    }
  } else {
    console.warn('Skipping CoinCap due to active cooldown.')
  }

  console.error('All price API requests failed or are on cooldown.')
  if (cache.price !== null) {
    console.warn('Returning stale cached price as last resort.')
    return cache.price
  }
  throw new Error('Failed to fetch Bitcoin price from all sources (possibly due to cooldowns or API issues).')
} 