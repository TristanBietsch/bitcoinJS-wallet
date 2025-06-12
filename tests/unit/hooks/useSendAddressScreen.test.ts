import { renderHook, act } from '@testing-library/react-native'
import { useSendAddressScreen } from '@/src/hooks/send/useSendAddressScreen'
import { useSendStore } from '@/src/store/sendStore'
import { validateBitcoinAddress } from '@/src/services/bitcoin/addressValidationService'
import { getEnhancedFeeEstimates } from '@/src/services/bitcoin/feeEstimationService'
import { useRouter } from 'expo-router'

// Mock dependencies
jest.mock('expo-router')
jest.mock('@/src/store/sendStore')
jest.mock('@/src/services/bitcoin/addressValidationService')
jest.mock('@/src/services/bitcoin/feeEstimationService')

describe('useSendAddressScreen', () => {
  const mockRouter = {
    push : jest.fn(),
    back : jest.fn()
  }

  const mockSendStore = {
    address              : '',
    speed                : 'normal',
    customFee            : null,
    feeOptions           : [] as Array<{ feeRate: number; totalSats: number; confirmationTime: number }>,
    setAddress           : jest.fn(),
    setSpeed             : jest.fn(),
    setCustomFee         : jest.fn(),
    setSelectedFeeOption : jest.fn(),
    setFeeOptions        : jest.fn(),
    setFeeRates          : jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSendStore as unknown as jest.Mock).mockReturnValue(mockSendStore)
    
    ;(validateBitcoinAddress as jest.Mock).mockReturnValue({
      isValid : true,
      error   : null
    })
    
    ;(getEnhancedFeeEstimates as jest.Mock).mockResolvedValue({
      economy             : 1,
      normal              : 10,
      fast                : 25,
      slow                : 5,
      lastUpdated         : Date.now(),
      source              : 'mempool',
      confirmationTargets : {
        economy : 144,
        slow    : 72,
        normal  : 6,
        fast    : 1
      }
    })
  })

  describe('Address Validation', () => {
    it('should validate address on input', () => {
      const { result } = renderHook(() => useSendAddressScreen())
      
      act(() => {
        result.current.setAddress('bc1qvalid...')
      })
      
      expect(mockSendStore.setAddress).toHaveBeenCalledWith('bc1qvalid...')
      expect(validateBitcoinAddress).toHaveBeenCalledWith('bc1qvalid...')
      expect(result.current.addressError).toBeNull()
      expect(result.current.isValidAddress).toBe(true)
    })

    it('should show error for invalid address', () => {
      ;(validateBitcoinAddress as jest.Mock).mockReturnValue({
        isValid : false,
        error   : 'Invalid Bitcoin address'
      })
      
      const { result } = renderHook(() => useSendAddressScreen())
      
      act(() => {
        result.current.setAddress('invalid')
      })
      
      expect(result.current.addressError).toBe('Invalid Bitcoin address')
      expect(result.current.isValidAddress).toBe(false)
    })

    it('should clear error when address is empty', () => {
      const { result } = renderHook(() => useSendAddressScreen())
      
      // Set invalid address first
      ;(validateBitcoinAddress as jest.Mock).mockReturnValue({
        isValid : false,
        error   : 'Invalid'
      })
      
      act(() => {
        result.current.setAddress('invalid')
      })
      
      expect(result.current.addressError).toBe('Invalid')
      
      // Clear address
      act(() => {
        result.current.setAddress('')
      })
      
      expect(result.current.addressError).toBeNull()
    })
  })

  describe('Fee Management', () => {
    it('should load fee rates on mount', async () => {
      renderHook(() => useSendAddressScreen())
      
      // Wait for useEffect
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(getEnhancedFeeEstimates).toHaveBeenCalled()
      expect(mockSendStore.setFeeOptions).toHaveBeenCalled()
      expect(mockSendStore.setFeeRates).toHaveBeenCalled()
    })

    it('should set selected speed and update fee option', () => {
      mockSendStore.feeOptions = [
        { feeRate: 1, totalSats: 0, confirmationTime: 144 },
        { feeRate: 10, totalSats: 0, confirmationTime: 6 },
        { feeRate: 25, totalSats: 0, confirmationTime: 1 }
      ]
      
      const { result } = renderHook(() => useSendAddressScreen())
      
      act(() => {
        result.current.setSelectedSpeed('express')
      })
      
      expect(mockSendStore.setSpeed).toHaveBeenCalledWith('express')
      expect(mockSendStore.setSelectedFeeOption).toHaveBeenCalledWith({
        feeRate          : 25,
        totalSats        : 0,
        confirmationTime : 1
      })
    })

    it('should handle custom fee rate', () => {
      const { result } = renderHook(() => useSendAddressScreen())
      
      act(() => {
        result.current.setCustomFeeRate(15)
      })
      
      expect(mockSendStore.setCustomFee).toHaveBeenCalledWith({
        feeRate          : 15,
        totalSats        : 0,
        confirmationTime : 6
      })
    })

    it('should not set custom fee if rate is 0 or negative', () => {
      const { result } = renderHook(() => useSendAddressScreen())
      
      act(() => {
        result.current.setCustomFeeRate(0)
      })
      
      expect(mockSendStore.setCustomFee).not.toHaveBeenCalled()
      
      act(() => {
        result.current.setCustomFeeRate(-5)
      })
      
      expect(mockSendStore.setCustomFee).not.toHaveBeenCalled()
    })
  })

  describe('Navigation', () => {
    it('should navigate to amount screen when valid', () => {
      ;(validateBitcoinAddress as jest.Mock).mockReturnValue({
        isValid : true,
        error   : null
      })
      
      mockSendStore.address = 'bc1qvalid...'
      
      const { result } = renderHook(() => useSendAddressScreen())
      
      act(() => {
        result.current.setAddress('bc1qvalid...')
      })
      
      act(() => {
        result.current.handleContinue()
      })
      
      expect(mockRouter.push).toHaveBeenCalledWith('/send/amount')
    })

    it('should not navigate without valid address', () => {
      const { result } = renderHook(() => useSendAddressScreen())
      
      act(() => {
        result.current.handleContinue()
      })
      
      expect(mockRouter.push).not.toHaveBeenCalled()
      expect(result.current.addressError).toBe('Please enter a valid Bitcoin address')
    })

    it('should not navigate with custom speed and no fee rate', () => {
      mockSendStore.address = 'bc1qvalid...'
      mockSendStore.speed = 'custom'
      mockSendStore.customFee = null
      
      const { result } = renderHook(() => useSendAddressScreen())
      
      act(() => {
        result.current.setAddress('bc1qvalid...')
        result.current.setSelectedSpeed('custom')
      })
      
      act(() => {
        result.current.handleContinue()
      })
      
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })
}) 