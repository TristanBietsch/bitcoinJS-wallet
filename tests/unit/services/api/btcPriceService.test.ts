import axios from 'axios'
import { getBTCPrice, resetPriceCache, BitcoinPriceError } from '@/src/services/api/btcPriceService'

// Mock axios module
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Bitcoin Price Service', () => {
  // Reset cache and mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
    resetPriceCache()
  })

  // Valid response mocks
  const validCoinGeckoResponse = {
    data: {
      bitcoin: {
        usd: 50000
      }
    }
  }

  const validCoinCapResponse = {
    data: {
      data: {
        priceUsd: '48000.50'
      }
    }
  }

  // Invalid response mocks
  const invalidCoinGeckoResponse = {
    data: {
      bitcoin: {} // Missing usd field
    }
  }

  const invalidCoinCapResponse = {
    data: {
      data: {} // Missing priceUsd field
    }
  }

  describe('successful price fetching', () => {
    test('should fetch price from CoinGecko successfully', async () => {
      // Setup: Mock successful CoinGecko API response
      mockedAxios.get.mockResolvedValueOnce(validCoinGeckoResponse)
      
      // Execute
      const price = await getBTCPrice()
      
      // Verify
      expect(price).toBe(50000)
      expect(mockedAxios.get).toHaveBeenCalledTimes(1)
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('coingecko'),
        expect.any(Object)
      )
    })

    test('should fall back to CoinCap when CoinGecko fails', async () => {
      // Setup: Mock failed CoinGecko API and successful CoinCap API
      mockedAxios.get.mockRejectedValueOnce(new Error('CoinGecko unavailable'))
      mockedAxios.get.mockResolvedValueOnce(validCoinCapResponse)
      
      // Execute
      const price = await getBTCPrice()
      
      // Verify: Price should be from CoinCap
      expect(price).toBe(48000.50)
      expect(mockedAxios.get).toHaveBeenCalledTimes(2)
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('coingecko'),
        expect.any(Object)
      )
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('coincap'),
        expect.any(Object)
      )
    })

    test('should fall back to CoinCap when CoinGecko returns invalid data', async () => {
      // Setup: Mock invalid CoinGecko response format and valid CoinCap
      mockedAxios.get.mockResolvedValueOnce(invalidCoinGeckoResponse)
      mockedAxios.get.mockResolvedValueOnce(validCoinCapResponse)
      
      // Execute
      const price = await getBTCPrice()
      
      // Verify: Price should be from CoinCap
      expect(price).toBe(48000.50)
      expect(mockedAxios.get).toHaveBeenCalledTimes(2)
    })
  })

  describe('cache behavior', () => {
    test('should return cached price within cache duration', async () => {
      // Setup: Mock successful API call
      mockedAxios.get.mockResolvedValueOnce(validCoinGeckoResponse)
      
      // First call should fetch from API
      const firstPrice = await getBTCPrice()
      
      // Second call should use cache
      const secondPrice = await getBTCPrice()
      
      // Verify
      expect(firstPrice).toBe(50000)
      expect(secondPrice).toBe(50000)
      // API should only be called once
      expect(mockedAxios.get).toHaveBeenCalledTimes(1)
    })

    test('should fetch fresh price after cache expires', async () => {
      // Setup: Mock successful API calls with different prices
      mockedAxios.get.mockResolvedValueOnce(validCoinGeckoResponse) // First call: $50,000
      
      // First call
      const firstPrice = await getBTCPrice()
      
      // Mock cache expiration
      jest.spyOn(Date, 'now').mockImplementation(() => Date.now() + 31000) // 31 seconds later
      
      // Mock second API call with updated price
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          bitcoin: {
            usd: 51000 // Price changed
          }
        }
      })
      
      // Second call after cache expired
      const secondPrice = await getBTCPrice()
      
      // Verify
      expect(firstPrice).toBe(50000)
      expect(secondPrice).toBe(51000) // Should get updated price
      expect(mockedAxios.get).toHaveBeenCalledTimes(2) // API called twice
      
      // Restore original Date.now
      jest.spyOn(Date, 'now').mockRestore()
    })
  })

  describe('error handling', () => {
    test('should throw BitcoinPriceError when both APIs fail and no cache exists', async () => {
      // Setup: Both APIs fail
      mockedAxios.get.mockRejectedValueOnce(new Error('CoinGecko failed'))
      mockedAxios.get.mockRejectedValueOnce(new Error('CoinCap failed'))
      
      // Execute & Verify: Should throw custom error
      await expect(getBTCPrice()).rejects.toThrow(BitcoinPriceError)
      await expect(getBTCPrice()).rejects.toThrow('Failed to fetch Bitcoin price from all sources')
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(2)
    })

    test('should return stale cached price as last resort when APIs fail', async () => {
      // Setup: First call succeeds to populate cache
      mockedAxios.get.mockResolvedValueOnce(validCoinGeckoResponse)
      await getBTCPrice() // Cache the price
      
      // Mock cache expiration
      jest.spyOn(Date, 'now').mockImplementation(() => Date.now() + 31000)
      
      // Now both APIs fail
      mockedAxios.get.mockRejectedValueOnce(new Error('CoinGecko failed'))
      mockedAxios.get.mockRejectedValueOnce(new Error('CoinCap failed'))
      
      // Execute: Second call should use stale cache as fallback
      const price = await getBTCPrice()
      
      // Verify: Should get the stale cached price
      expect(price).toBe(50000)
      expect(mockedAxios.get).toHaveBeenCalledTimes(3) // 1 success, then 2 failures
      
      // Restore original Date.now
      jest.spyOn(Date, 'now').mockRestore()
    })

    test('should throw when APIs return invalid data and no cache exists', async () => {
      // Setup: Both APIs return invalid data
      mockedAxios.get.mockResolvedValueOnce(invalidCoinGeckoResponse)
      mockedAxios.get.mockResolvedValueOnce(invalidCoinCapResponse)
      
      // Execute & Verify
      await expect(getBTCPrice()).rejects.toThrow()
      expect(mockedAxios.get).toHaveBeenCalledTimes(2)
    })
  })

  describe('data validation', () => {
    test('should handle invalid CoinGecko price values', async () => {
      // Setup: CoinGecko returns invalid price (negative number)
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          bitcoin: {
            usd: -100 // Invalid price
          }
        }
      })
      // CoinCap works fine
      mockedAxios.get.mockResolvedValueOnce(validCoinCapResponse)
      
      // Execute
      const price = await getBTCPrice()
      
      // Verify: Should fall back to CoinCap
      expect(price).toBe(48000.50)
      expect(mockedAxios.get).toHaveBeenCalledTimes(2)
    })

    test('should handle non-numeric price values', async () => {
      // Setup: CoinGecko returns non-numeric price
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          bitcoin: {
            usd: 'not-a-number'
          }
        }
      })
      // CoinCap works fine
      mockedAxios.get.mockResolvedValueOnce(validCoinCapResponse)
      
      // Execute
      const price = await getBTCPrice()
      
      // Verify: Should fall back to CoinCap
      expect(price).toBe(48000.50)
      expect(mockedAxios.get).toHaveBeenCalledTimes(2)
    })
  })
}) 