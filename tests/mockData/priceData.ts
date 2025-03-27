/**
 * Mock Bitcoin price data
 */

export const MOCK_BTC_PRICE = 106969

// Mock historical price data with some realistic looking variations
export const generateMockHistoricalData = (days: number) => {
  const now = Date.now()
  const data = {
    prices : [] as [ number, number ][]
  }
  
  for (let i = days; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000)
    // Generate a price that varies within 5% of the mock price
    const variation = (Math.random() - 0.5) * 0.05 * MOCK_BTC_PRICE
    const price = MOCK_BTC_PRICE + variation
    data.prices.push([ timestamp, price ])
  }
  
  return data
}

// Mock current price response
export const mockCurrentPriceResponse = {
  bitcoin : {
    usd : MOCK_BTC_PRICE
  }
}

// Mock historical price response
export const mockHistoricalPriceResponse = (timeframe: { days: number | 'max' }) => {
  const days = timeframe.days === 'max' ? 365 : timeframe.days
  return generateMockHistoricalData(days)
}
