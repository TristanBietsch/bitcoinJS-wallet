/**
 * Bitcoin price data service
 */
import { mockCurrentPriceResponse } from '@/tests/mockData/priceData'
import { apiClient } from './apiClient'

// Configuration for environment
const USE_MOCK_PRICE_DATA = process.env.NODE_ENV === 'development'
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

// Price response type definition
interface PriceResponse {
  bitcoin: {
    usd: number;
  };
}

/**
 * Fetches current Bitcoin price from CoinGecko
 */
export const fetchCurrentPrice = async (): Promise<number> => {
  if (USE_MOCK_PRICE_DATA) {
    return mockCurrentPriceResponse.bitcoin.usd
  }

  try {
    const data = await apiClient.get<PriceResponse>(
      `${COINGECKO_API_URL}/simple/price?ids=bitcoin&vs_currencies=usd`
    )
    
    if (!data || !data.bitcoin || data.bitcoin.usd === undefined) {
      throw new Error('Invalid price data format from API')
    }
    
    return data.bitcoin.usd
  } catch (error) {
    console.error('Failed to fetch Bitcoin price:', error)
    throw error
  }
}

/**
 * Fetches historical Bitcoin price data
 * @param days Number of days of historical data to fetch
 */
export const fetchHistoricalPrice = async (days: number = 30): Promise<any> => {
  if (USE_MOCK_PRICE_DATA) {
    // Return mock historical data (would be defined in mockData)
    return { prices: [ [ Date.now(), mockCurrentPriceResponse.bitcoin.usd ] ] }
  }

  try {
    return await apiClient.get(
      `${COINGECKO_API_URL}/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`
    )
  } catch (error) {
    console.error(`Failed to fetch historical price data for ${days} days:`, error)
    throw error
  }
} 