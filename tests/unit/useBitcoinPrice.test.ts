/**
 * Test suite for useBitcoinPrice hook
 * Tests React hook behavior for Bitcoin price fetching functionality
 */
import { renderHook, act } from '@testing-library/react-hooks'
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
    mockedGetBTCPrice.mockResolvedValueOnce(mockPrice)

    // Act
    const { result, waitForNextUpdate } = renderHook(() => useBitcoinPrice())
    
    // Wait for the async operation to complete
    await waitForNextUpdate()

    // Assert
    expect(mockedGetBTCPrice).toHaveBeenCalledTimes(1)
    expect(result.current).toEqual({
      btcPrice     : mockPrice,
      isLoading    : false,
      error        : null,
      refreshPrice : expect.any(Function)
    })
  })

  it('should handle API errors gracefully', async () => {
    // Arrange
    const errorMessage = 'Failed to fetch Bitcoin price'
    mockedGetBTCPrice.mockRejectedValueOnce(new Error(errorMessage))

    // Act
    const { result, waitForNextUpdate } = renderHook(() => useBitcoinPrice())
    
    // Wait for the async operation to complete
    await waitForNextUpdate()

    // Assert
    expect(mockedGetBTCPrice).toHaveBeenCalledTimes(1)
    expect(result.current).toEqual({
      btcPrice     : null,
      isLoading    : false,
      error        : 'Failed to fetch Bitcoin price',
      refreshPrice : expect.any(Function)
    })
  })

  it('should refresh price when refreshPrice function is called', async () => {
    // Arrange
    const initialPrice = 45000
    const updatedPrice = 46000
    mockedGetBTCPrice.mockResolvedValueOnce(initialPrice)

    // Act - Initial render
    const { result, waitForNextUpdate } = renderHook(() => useBitcoinPrice())
    
    // Wait for the first async operation to complete
    await waitForNextUpdate()

    // Setup for refresh call
    mockedGetBTCPrice.mockResolvedValueOnce(updatedPrice)

    // Act - Call refreshPrice
    await act(async () => {
      await result.current.refreshPrice()
    })

    // Assert
    expect(mockedGetBTCPrice).toHaveBeenCalledTimes(2)
    expect(result.current).toEqual({
      btcPrice     : updatedPrice,
      isLoading    : false,
      error        : null,
      refreshPrice : expect.any(Function)
    })
  })

  it('should refresh price at specified interval', async () => {
    // Arrange
    const customIntervalMs = 5000 // 5 seconds
    const initialPrice = 45000
    const updatedPrice = 46000
    mockedGetBTCPrice.mockResolvedValueOnce(initialPrice)

    // Act - Initial render with custom interval
    const { result, waitForNextUpdate } = renderHook(() => useBitcoinPrice(customIntervalMs))
    
    // Wait for the first async operation to complete
    await waitForNextUpdate()

    // Setup for automatic refresh
    mockedGetBTCPrice.mockResolvedValueOnce(updatedPrice)

    // Advance timers to trigger interval
    act(() => {
      jest.advanceTimersByTime(customIntervalMs)
    })

    // Wait for the interval-triggered update
    await waitForNextUpdate()

    // Assert
    expect(mockedGetBTCPrice).toHaveBeenCalledTimes(2)
    expect(result.current).toEqual({
      btcPrice     : updatedPrice,
      isLoading    : false,
      error        : null,
      refreshPrice : expect.any(Function)
    })
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

  it('should handle state transitions correctly during loading', async () => {
    // Arrange
    const mockPrice = 45000
    
    // Set up a delayed resolution to observe loading state
    mockedGetBTCPrice.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve(mockPrice), 100)
      })
    })

    // Act
    const { result } = renderHook(() => useBitcoinPrice())
    
    // Assert - Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.btcPrice).toBe(null)
    
    // Advance timers to complete the delayed promise
    act(() => {
      jest.advanceTimersByTime(100)
    })
    
    // Need to wait for state updates
    await act(async () => {
      await Promise.resolve()
    })
    
    // Assert - After loading completed
    expect(result.current.isLoading).toBe(false)
    expect(result.current.btcPrice).toBe(mockPrice)
  })

  it('should handle back-to-back refreshes correctly', async () => {
    // Arrange
    const firstPrice = 45000
    const secondPrice = 46000
    
    mockedGetBTCPrice.mockResolvedValueOnce(firstPrice)

    // Act - Initial render
    const { result, waitForNextUpdate } = renderHook(() => useBitcoinPrice())
    
    // Wait for the first async operation to complete
    await waitForNextUpdate()
    
    // Setup for first manual refresh
    mockedGetBTCPrice.mockResolvedValueOnce(secondPrice)
    
    // Act - Call refreshPrice twice in succession
    await act(async () => {
      const refreshPromise1 = result.current.refreshPrice()
      const refreshPromise2 = result.current.refreshPrice() // This should be handled gracefully
      await Promise.all([ refreshPromise1, refreshPromise2 ])
    })

    // Assert
    // getBTCPrice should be called once for initial load and once or twice for the refreshes
    // (depends on how the implementation handles concurrent calls)
    expect(mockedGetBTCPrice.mock.calls.length).toBeGreaterThanOrEqual(2)
    expect(result.current.btcPrice).toBe(secondPrice)
    expect(result.current.isLoading).toBe(false)
  })

  it('should recover from an error state on successful refresh', async () => {
    // Arrange - First call fails
    const errorMessage = 'Network Error'
    mockedGetBTCPrice.mockRejectedValueOnce(new Error(errorMessage))
    
    // Act - Initial render
    const { result, waitForNextUpdate } = renderHook(() => useBitcoinPrice())
    
    // Wait for the first async operation to complete (error state)
    await waitForNextUpdate()
    
    // Verify error state
    expect(result.current.error).toBe('Failed to fetch Bitcoin price')
    
    // Setup for successful refresh
    const successPrice = 45000
    mockedGetBTCPrice.mockResolvedValueOnce(successPrice)
    
    // Act - Manual refresh
    await act(async () => {
      await result.current.refreshPrice()
    })
    
    // Assert
    expect(result.current.error).toBe(null)
    expect(result.current.btcPrice).toBe(successPrice)
    expect(result.current.isLoading).toBe(false)
  })
}) 