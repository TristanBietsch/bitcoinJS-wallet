/**
 * Test suite for useBitcoinPrice hook
 * Tests React hook behavior for Bitcoin price fetching functionality
 */
import React from 'react'
import { renderHook } from '@testing-library/react-native'
import { useBitcoinPrice } from '@/src/hooks/bitcoin/useBitcoinPrice'
import * as btcPriceService from '@/src/services/api/btcPriceService'

// Mock the BTC price service
jest.mock('@/src/services/api/btcPriceService', () => ({
  getBTCPrice : jest.fn()
}))

// Get the mocked getBTCPrice function
const mockedGetBTCPrice = btcPriceService.getBTCPrice as jest.MockedFunction<typeof btcPriceService.getBTCPrice>

describe('useBitcoinPrice Hook', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.useFakeTimers()
    mockedGetBTCPrice.mockReset()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should initialize with default values', () => {
    // Act
    const { result } = renderHook(() => useBitcoinPrice())

    // Assert
    expect(result.current).toEqual({
      btcPrice     : null,
      isLoading    : true,
      error        : null,
      refreshPrice : expect.any(Function)
    })
  })

  it('should fetch price on mount', async () => {
    // Arrange
    const mockPrice = 45000
    mockedGetBTCPrice.mockResolvedValue(mockPrice)

    // Act
    const { result } = renderHook(() => useBitcoinPrice())

    // Manually trigger all timers and async operations
    jest.runAllTimers()
    await Promise.resolve() // Flush promises

    // Assert
    expect(mockedGetBTCPrice).toHaveBeenCalledTimes(1)
    expect(result.current.btcPrice).toBe(mockPrice)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should handle API errors gracefully', async () => {
    // Arrange
    const errorMessage = 'Failed to fetch Bitcoin price'
    mockedGetBTCPrice.mockRejectedValue(new Error(errorMessage))

    // Act
    const { result } = renderHook(() => useBitcoinPrice())

    // Manually trigger all timers and async operations
    jest.runAllTimers()
    await Promise.resolve() // Flush promises
    
    // Assert
    expect(mockedGetBTCPrice).toHaveBeenCalledTimes(1)
    expect(result.current.btcPrice).toBe(null)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe('Failed to fetch Bitcoin price')
  })

  it('should refresh price at specified interval', async () => {
    // Arrange
    const customIntervalMs = 5000 // 5 seconds
    const initialPrice = 45000
    const updatedPrice = 46000
    
    mockedGetBTCPrice
      .mockResolvedValueOnce(initialPrice)
      .mockResolvedValueOnce(updatedPrice)

    // Act - Initial render with custom interval
    const { result } = renderHook(() => useBitcoinPrice(customIntervalMs))
    
    // Manually trigger all timers for initial load
    jest.runAllTimers()
    await Promise.resolve() // Flush promises
    
    // First assert - after initial load
    expect(result.current.btcPrice).toBe(initialPrice)
    
    // Advance timers to trigger the interval update
    jest.advanceTimersByTime(customIntervalMs)
    await Promise.resolve() // Flush promises

    // Second assert - after interval update
    expect(mockedGetBTCPrice).toHaveBeenCalledTimes(2)
    expect(result.current.btcPrice).toBe(updatedPrice)
  })

  it('should clean up interval on unmount', () => {
    // Arrange
    const customIntervalMs = 5000 // 5 seconds
    mockedGetBTCPrice.mockResolvedValue(45000)

    // Act - render and then unmount
    const { unmount } = renderHook(() => useBitcoinPrice(customIntervalMs))
    
    // Spy on clearInterval
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
    
    // Unmount the component
    unmount()

    // Assert that clearInterval was called
    expect(clearIntervalSpy).toHaveBeenCalled()
  })
}) 