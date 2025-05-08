/**
 * Simple test for Bitcoin price service
 */
import { getBTCPrice } from '@/src/services/api/btcPriceService'

// Mock the BTC price service
jest.mock('@/src/services/api/btcPriceService', () => ({
  getBTCPrice : jest.fn()
}))

describe('Bitcoin Price Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should mock Bitcoin price correctly', async () => {
    // Arrange
    const expectedPrice = 45000
    const mockedGetBTCPrice = getBTCPrice as jest.MockedFunction<typeof getBTCPrice>
    mockedGetBTCPrice.mockResolvedValue(expectedPrice)
    
    // Act
    const price = await getBTCPrice()
    
    // Assert
    expect(price).toBe(expectedPrice)
    expect(mockedGetBTCPrice).toHaveBeenCalledTimes(1)
  })
  
  it('should handle errors', async () => {
    // Arrange
    const errorMessage = 'API Error'
    const mockedGetBTCPrice = getBTCPrice as jest.MockedFunction<typeof getBTCPrice>
    mockedGetBTCPrice.mockRejectedValue(new Error(errorMessage))
    
    // Act & Assert
    await expect(getBTCPrice()).rejects.toThrow(errorMessage)
    expect(mockedGetBTCPrice).toHaveBeenCalledTimes(1)
  })
}) 