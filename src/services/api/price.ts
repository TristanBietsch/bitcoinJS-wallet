/**
 * API functions for Bitcoin price data
 */
import { mockCurrentPriceResponse } from '@/tests/mockData/priceData'

// Configuration for using mock data
export const USE_MOCK_PRICE_DATA = true

/**
 * Fetches current Bitcoin price from CoinGecko
 */
export const fetchCurrentPrice = async (): Promise<number> => {
  if (USE_MOCK_PRICE_DATA) {
    return mockCurrentPriceResponse.bitcoin.usd
  }

  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
  )
  
  if (!response.ok) {
    throw new Error(`API responded with status: ${response.status}`)
  }
  
  const data = await response.json()
  
  if (!data || !data.bitcoin || data.bitcoin.usd === undefined) {
    throw new Error('Invalid price data format from API')
  }
  
  return data.bitcoin.usd
} 