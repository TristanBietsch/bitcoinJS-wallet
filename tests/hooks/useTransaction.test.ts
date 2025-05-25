import { renderHook, act } from '@testing-library/react-hooks'
import { useTransaction } from '../../src/hooks/send/useTransaction'
import { useSendStore } from '@/src/store/sendStore'
import { useSendTransactionStore } from '@/src/store/sendTransactionStore'
import { SendTransactionService } from '@/src/services/sendTransactionService'
import { validateBitcoinAddress } from '@/src/services/bitcoin/addressValidationService'
import { useRouter } from 'expo-router'

// Mock dependencies
jest.mock('expo-router')
jest.mock('@/src/store/sendStore')
jest.mock('@/src/store/sendTransactionStore')
jest.mock('@/src/services/sendTransactionService')
jest.mock('@/src/services/bitcoin/addressValidationService')

describe('useTransaction', () => {
  const mockRouter = {
    replace : jest.fn(),
    push    : jest.fn(),
    back    : jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    
    // Mock store states
    ;(useSendStore as unknown as jest.Mock).mockReturnValue({
      address           : 'bc1qtest...',
      amount            : '1000',
      speed             : 'normal',
      selectedFeeOption : { feeRate: 10 }
    })
    
    ;(useSendTransactionStore as unknown as jest.Mock).mockReturnValue({
      inputs : {
        recipientAddress : 'bc1qtest...',
        amount           : '1000',
        currency         : 'SATS',
        feeRate          : 10
      },
      derived : {
        amountSats     : 1000,
        isValidAddress : true,
        estimatedFee   : 150,
        totalSats      : 1150
      },
      utxos : {
        selectedUtxos : [ { value: 2000 } ],
        changeAddress : 'bc1qchange...'
      },
      isValidTransaction   : jest.fn().mockReturnValue(true),
      getValidationErrors  : jest.fn().mockReturnValue([]),
      setRecipientAddress  : jest.fn(),
      setAmount            : jest.fn(),
      setFeeRate           : jest.fn(),
      calculateFeeAndUtxos : jest.fn(),
      reset                : jest.fn()
    })
    
    ;(validateBitcoinAddress as jest.Mock).mockReturnValue({
      isValid : true,
      error   : null
    })
  })

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useTransaction())
      
      expect(result.current.state).toEqual({
        status        : 'idle',
        progress      : 0,
        message       : '',
        error         : null,
        canRetry      : false,
        isLoading     : false,
        transactionId : undefined
      })
    })
  })

  describe('Validation Utilities', () => {
    it('should validate a valid Bitcoin address', () => {
      const { result } = renderHook(() => useTransaction())
      
      const validation = result.current.validation.validateAddress('bc1qvalid...')
      
      expect(validation.isValid).toBe(true)
      expect(validation.error).toBeUndefined()
    })

    it('should reject an invalid Bitcoin address', () => {
      ;(validateBitcoinAddress as jest.Mock).mockReturnValue({
        isValid : false,
        error   : 'Invalid address format'
      })
      
      const { result } = renderHook(() => useTransaction())
      
      const validation = result.current.validation.validateAddress('invalid')
      
      expect(validation.isValid).toBe(false)
      expect(validation.error).toBe('Invalid address format')
    })

    it('should validate amount correctly', () => {
      const { result } = renderHook(() => useTransaction())
      
      // Valid amount
      expect(result.current.validation.validateAmount(1000).isValid).toBe(true)
      
      // Zero amount
      expect(result.current.validation.validateAmount(0).isValid).toBe(false)
      
      // Below dust limit
      expect(result.current.validation.validateAmount(100).isValid).toBe(false)
    })

    it('should validate fee rate correctly', () => {
      const { result } = renderHook(() => useTransaction())
      
      // Valid fee rate
      expect(result.current.validation.validateFeeRate(10).isValid).toBe(true)
      
      // Zero fee rate
      expect(result.current.validation.validateFeeRate(0).isValid).toBe(false)
      
      // Extremely high fee rate
      expect(result.current.validation.validateFeeRate(2000).isValid).toBe(false)
    })
  })

  describe('Fee Utilities', () => {
    it('should load UTXOs and calculate fees', async () => {
      const { result } = renderHook(() => useTransaction())
      
      await act(async () => {
        await result.current.fees.loadUtxosAndCalculateFees()
      })
      
      expect(SendTransactionService.loadUtxosAndCalculateFees).toHaveBeenCalled()
    })

    it('should handle fee loading errors', async () => {
      const error = new Error('Network error')
      ;(SendTransactionService.loadUtxosAndCalculateFees as jest.Mock).mockRejectedValue(error)
      
      const { result } = renderHook(() => useTransaction())
      
      await act(async () => {
        try {
          await result.current.fees.loadUtxosAndCalculateFees()
        } catch (e) {
          // Expected to throw
        }
      })
      
      expect(result.current.state.error).toBeTruthy()
      expect(result.current.state.status).toBe('error')
    })
  })

  describe('Transaction Execution', () => {
    it('should execute a valid transaction successfully', async () => {
      const mockResult = {
        txid   : 'abc123...',
        fee    : 150,
        amount : 1000
      }
      
      ;(SendTransactionService.executeTransaction as jest.Mock).mockResolvedValue(mockResult)
      ;(SendTransactionService.validateForExecution as jest.Mock).mockReturnValue({
        isValid : true,
        errors  : []
      })
      
      const { result } = renderHook(() => useTransaction())
      
      let txResult
      await act(async () => {
        txResult = await result.current.actions.executeTransaction()
      })
      
      expect(txResult).toEqual(mockResult)
      expect(result.current.state.status).toBe('success')
      expect(result.current.state.transactionId).toBe('abc123...')
    })

    it('should handle transaction execution errors', async () => {
      const error = new Error('Insufficient funds')
      ;(SendTransactionService.executeTransaction as jest.Mock).mockRejectedValue(error)
      ;(SendTransactionService.validateForExecution as jest.Mock).mockReturnValue({
        isValid : true,
        errors  : []
      })
      
      const { result } = renderHook(() => useTransaction())
      
      await act(async () => {
        await result.current.actions.executeTransaction()
      })
      
      expect(result.current.state.status).toBe('error')
      expect(result.current.state.error).toBeTruthy()
      expect(result.current.state.canRetry).toBe(true)
    })

    it('should prevent double execution', async () => {
      ;(SendTransactionService.validateForExecution as jest.Mock).mockReturnValue({
        isValid : true,
        errors  : []
      })
      
      const { result } = renderHook(() => useTransaction())
      
      // Start two executions simultaneously
      await act(async () => {
        const promise1 = result.current.actions.executeTransaction()
        const promise2 = result.current.actions.executeTransaction()
        
        await Promise.all([ promise1, promise2 ])
      })
      
      // Should only execute once
      expect(SendTransactionService.executeTransaction).toHaveBeenCalledTimes(1)
    })
  })

  describe('Navigation', () => {
    it('should navigate to error screen with error state', () => {
      const { result } = renderHook(() => useTransaction())
      const mockError = {
        type    : 'INSUFFICIENT_FUNDS',
        message : 'Not enough funds',
        code    : 'INSUFFICIENT_FUNDS'
      }
      
      act(() => {
        result.current.actions.navigateToError(mockError as any)
      })
      
      expect(result.current.state.status).toBe('error')
      expect(result.current.state.error).toEqual(mockError)
      expect(mockRouter.replace).toHaveBeenCalledWith('/send/error')
    })

    it('should navigate to success screen with transaction ID', () => {
      const { result } = renderHook(() => useTransaction())
      
      act(() => {
        result.current.actions.navigateToSuccess('tx123')
      })
      
      expect(result.current.state.status).toBe('success')
      expect(result.current.state.transactionId).toBe('tx123')
      expect(mockRouter.replace).toHaveBeenCalledWith({
        pathname : '/send/success',
        params   : { transactionId: 'tx123' }
      })
    })
  })

  describe('State Management', () => {
    it('should reset state correctly', () => {
      const { result } = renderHook(() => useTransaction())
      
      // Set some state first
      act(() => {
        result.current.actions.navigateToError({
          type    : 'NETWORK_ERROR',
          message : 'Network error',
          code    : 'NETWORK_ERROR'
        } as any)
      })
      
      expect(result.current.state.error).toBeTruthy()
      
      // Reset
      act(() => {
        result.current.actions.reset()
      })
      
      expect(result.current.state).toEqual({
        status        : 'idle',
        progress      : 0,
        message       : '',
        error         : null,
        canRetry      : false,
        isLoading     : false,
        transactionId : undefined
      })
      expect(SendTransactionService.reset).toHaveBeenCalled()
    })

    it('should retry transaction after error', async () => {
      ;(SendTransactionService.validateForExecution as jest.Mock).mockReturnValue({
        isValid : true,
        errors  : []
      })
      
      const { result } = renderHook(() => useTransaction())
      
      // Set error state
      act(() => {
        result.current.actions.navigateToError({
          type    : 'NETWORK_ERROR',
          message : 'Network error',
          code    : 'NETWORK_ERROR'
        } as any)
      })
      
      // Retry
      await act(async () => {
        await result.current.actions.retry()
      })
      
      expect(SendTransactionService.executeTransaction).toHaveBeenCalled()
    })
  })
}) 