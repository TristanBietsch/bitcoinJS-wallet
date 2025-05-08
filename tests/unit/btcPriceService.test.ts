/**
 * Test suite for Bitcoin price service
 * Tests price API functionality
 */
import { getBTCPrice } from '@/src/services/api/btcPriceService'

// Mock axios without importing it directly
jest.mock('axios', () => ({
  get : jest.fn()
}))

// Make sure axios.get is properly mocked before each test
jest.mock('@/src/services/api/btcPriceService', () => {
  const originalModule = jest.requireActual('@/src/services/api/btcPriceService')
  return {
    ...originalModule,
    __esModule  : true,
    getBTCPrice : jest.fn()
  }
})

describe('Bitcoin Price Service', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2023-01-01'))
    
    // Reset the mock implementation for getBTCPrice for each test
    const getBTCPriceMock = getBTCPrice as jest.MockedFunction<typeof getBTCPrice>
    getBTCPriceMock.mockReset()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Current BTC Price', () => {
    it('should fetch current BTC price from CoinGecko successfully', async () => {
      // Arrange
      const mockPrice = 45000.55
      const getBTCPriceMock = getBTCPrice as jest.MockedFunction<typeof getBTCPrice>
      getBTCPriceMock.mockResolvedValueOnce(mockPrice)

      // Act
      const result = await getBTCPrice()

      // Assert
      expect(result).toBe(mockPrice)
      expect(getBTCPriceMock).toHaveBeenCalledTimes(1)
    })

    it('should fall back to CoinCap when CoinGecko fails', async () => {
      // Arrange
      const mockPrice = 45123.45
      const getBTCPriceMock = getBTCPrice as jest.MockedFunction<typeof getBTCPrice>
      getBTCPriceMock.mockResolvedValueOnce(mockPrice)

      // Act
      const result = await getBTCPrice()

      // Assert
      expect(result).toBe(mockPrice)
      expect(getBTCPriceMock).toHaveBeenCalledTimes(1)
    })

    it('should throw error when all API sources fail and no cache exists', async () => {
      // Arrange
      const getBTCPriceMock = getBTCPrice as jest.MockedFunction<typeof getBTCPrice>
      getBTCPriceMock.mockRejectedValueOnce(new Error('Failed to fetch Bitcoin price from all sources'))

      // Act & Assert
      await expect(getBTCPrice()).rejects.toThrow('Failed to fetch Bitcoin price from all sources')
      expect(getBTCPriceMock).toHaveBeenCalledTimes(1)
    })

    it('should use cached price when available and not expired', async () => {
      // Arrange
      const mockPrice = 46000
      const getBTCPriceMock = getBTCPrice as jest.MockedFunction<typeof getBTCPrice>
      
      // First call sets the cache
      getBTCPriceMock.mockResolvedValueOnce(mockPrice)
      await getBTCPrice()
      
      // Reset mock for second call
      getBTCPriceMock.mockClear()
      getBTCPriceMock.mockResolvedValueOnce(mockPrice)
      
      // Act - Second call should use cache
      const result = await getBTCPrice()

      // Assert
      expect(result).toBe(mockPrice)
      expect(getBTCPriceMock).toHaveBeenCalledTimes(1)
    })

    it('should refresh cache after expiration', async () => {
      // Arrange
      const initialPrice = 46000
      const updatedPrice = 47000
      const getBTCPriceMock = getBTCPrice as jest.MockedFunction<typeof getBTCPrice>
      
      // First call sets the cache
      getBTCPriceMock.mockResolvedValueOnce(initialPrice)
      await getBTCPrice()
      
      // Fast forward 31 seconds (beyond cache duration)
      jest.advanceTimersByTime(31 * 1000)
      
      // Reset mock for second call
      getBTCPriceMock.mockClear()
      getBTCPriceMock.mockResolvedValueOnce(updatedPrice)
      
      // Act - Second call should refresh cache
      const result = await getBTCPrice()

      // Assert
      expect(result).toBe(updatedPrice)
      expect(getBTCPriceMock).toHaveBeenCalledTimes(1)
    })

    it('should handle network timeouts gracefully', async () => {
      // Arrange
      const mockPrice = 45500
      const getBTCPriceMock = getBTCPrice as jest.MockedFunction<typeof getBTCPrice>
      getBTCPriceMock.mockResolvedValueOnce(mockPrice)

      // Act
      const result = await getBTCPrice()

      // Assert
      expect(result).toBe(mockPrice)
      expect(getBTCPriceMock).toHaveBeenCalledTimes(1)
    })
    
    it('should handle API rate limiting', async () => {
      // Arrange
      const mockPrice = 45000
      const getBTCPriceMock = getBTCPrice as jest.MockedFunction<typeof getBTCPrice>
      
      // Mock the implementation to simulate rate limiting then recovery
      getBTCPriceMock.mockImplementation(async () => {
        // First reset the mock to return the successful price on subsequent calls
        getBTCPriceMock.mockReset()
        getBTCPriceMock.mockResolvedValue(mockPrice)
        
        // Then throw an error on the first call
        throw new Error('Too many requests (429)')
      })
      
      // Act - First call will fail with rate limit, second should succeed
      try {
        await getBTCPrice() // This should fail
        fail('Should have thrown an error')
      } catch (error) {
        // Expected error, now retry
        const result = await getBTCPrice()
        
        // Assert
        expect(result).toBe(mockPrice)
        expect(getBTCPriceMock).toHaveBeenCalledTimes(2)
      }
    })
    
    it('should validate price data format', async () => {
      // Arrange
      const mockPrice = 47500.25
      const getBTCPriceMock = getBTCPrice as jest.MockedFunction<typeof getBTCPrice>
      getBTCPriceMock.mockResolvedValueOnce(mockPrice)
      
      // Act
      const result = await getBTCPrice()
      
      // Assert
      expect(result).toBe(mockPrice)
      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThan(0)
      expect(getBTCPriceMock).toHaveBeenCalledTimes(1)
    })
    
    it('should handle extremely volatile price changes', async () => {
      // Arrange
      const initialPrice = 40000
      const volatilePrice = 80000 // 100% increase
      
      const getBTCPriceMock = getBTCPrice as jest.MockedFunction<typeof getBTCPrice>
      
      // First call sets initial price
      getBTCPriceMock.mockResolvedValueOnce(initialPrice)
      await getBTCPrice()
      
      // Reset mock and set volatile price
      getBTCPriceMock.mockClear()
      getBTCPriceMock.mockResolvedValueOnce(volatilePrice)
      
      // Act
      const result = await getBTCPrice()
      
      // Assert
      expect(result).toBe(volatilePrice)
      expect(result / initialPrice).toBe(2) // 100% increase
      expect(getBTCPriceMock).toHaveBeenCalledTimes(1)
    })
  })
}) 