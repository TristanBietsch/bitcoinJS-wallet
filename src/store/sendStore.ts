import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CurrencyType } from '@/src/types/domain/finance'
import { useSendTransactionStore } from './sendTransactionStore'

// Legacy interface for backward compatibility
interface CustomFee {
  totalSats: number
  confirmationTime: number
  feeRate: number
}

export type ErrorMode = 'none' | 'validation' | 'network'

interface EnhancedFeeRates {
  economy: number
  normal: number
  fast: number
  timestamp: number
}

interface FeeOption {
  feeRate: number
  totalSats: number
  confirmationTime: number
}

/**
 * Legacy compatibility layer for the old sendStore
 * This provides the same interface but uses the new SendTransactionStore underneath
 * @deprecated Use useSendTransactionStore directly for new code
 */
interface LegacySendState {
  // Legacy properties
  address: string
  speed: string
  customFee?: CustomFee
  amount: string
  currency: CurrencyType
  errorMode: ErrorMode
  
  // Enhanced fee estimation (legacy)
  feeRates?: EnhancedFeeRates
  feeOptions?: FeeOption[]
  selectedFeeOption?: FeeOption
  isLoadingFees: boolean
  feeError?: string
  estimatedTxSize?: number
  
  // Legacy actions
  setAddress: (address: string) => void
  setSpeed: (speed: string) => void
  setCustomFee: (customFee: CustomFee | undefined) => void
  setAmount: (amount: string) => void
  setCurrency: (currency: CurrencyType) => void
  setErrorMode: (errorMode: ErrorMode) => void
  
  // Enhanced fee actions (legacy)
  setFeeRates: (rates: EnhancedFeeRates | undefined) => void
  setFeeOptions: (options: FeeOption[]) => void
  setSelectedFeeOption: (option: FeeOption | undefined) => void
  setIsLoadingFees: (loading: boolean) => void
  setFeeError: (error: string | undefined) => void
  setEstimatedTxSize: (size: number | undefined) => void
  
  reset: () => void
}

export const useSendStore = create<LegacySendState>()(
  persist(
    (set) => ({
      // Default legacy state
      address   : '',
      speed     : 'economy',
      customFee : undefined,
      amount    : '0',
      currency  : 'SATS',
      errorMode : 'none',
      
      feeRates          : undefined,
      feeOptions        : undefined,
      selectedFeeOption : undefined,
      isLoadingFees     : false,
      feeError          : undefined,
      estimatedTxSize   : undefined,
      
      // Legacy actions that delegate to new store
      setAddress : (address: string) => {
        useSendTransactionStore.getState().setRecipientAddress(address)
        set({ address })
      },
      
      setSpeed : (speed: string) => {
        // Map speed to fee rate
        const feeRateMap: Record<string, number> = {
          economy  : 1,
          standard : 10,
          express  : 25
        }
        const feeRate = feeRateMap[speed] || 10
        useSendTransactionStore.getState().setFeeRate(feeRate)
        set({ speed })
      },
      
      setCustomFee : (customFee: CustomFee | undefined) => {
        if (customFee) {
          useSendTransactionStore.getState().setFeeRate(customFee.feeRate)
          set({ speed: 'custom' })
        }
        set({ customFee })
      },
      
      setAmount : (amount: string) => {
        useSendTransactionStore.getState().setAmount(amount)
        set({ amount })
      },
      
      setCurrency : (currency: CurrencyType) => {
        useSendTransactionStore.getState().setCurrency(currency)
        set({ currency })
      },
      
      setErrorMode : (errorMode: ErrorMode) => {
        set({ errorMode })
      },
      
      // Legacy fee methods (mostly no-ops or simple state updates)
      setFeeRates : (feeRates: EnhancedFeeRates | undefined) => {
        set({ feeRates })
      },
      
      setFeeOptions : (feeOptions: FeeOption[]) => {
        set({ feeOptions })
      },
      
      setSelectedFeeOption : (selectedFeeOption: FeeOption | undefined) => {
        if (selectedFeeOption) {
          useSendTransactionStore.getState().setFeeRate(selectedFeeOption.feeRate)
        }
        set({ selectedFeeOption })
      },
      
      setIsLoadingFees : (isLoadingFees: boolean) => {
        set({ isLoadingFees })
      },
      
      setFeeError : (feeError: string | undefined) => {
        set({ feeError })
      },
      
      setEstimatedTxSize : (estimatedTxSize: number | undefined) => {
        set({ estimatedTxSize })
      },
      
      reset : () => {
        useSendTransactionStore.getState().reset()
        set({
          address           : '',
          speed             : 'economy',
          customFee         : undefined,
          amount            : '0',
          currency          : 'SATS',
          errorMode         : 'none',
          feeRates          : undefined,
          feeOptions        : undefined,
          selectedFeeOption : undefined,
          isLoadingFees     : false,
          feeError          : undefined,
          estimatedTxSize   : undefined
        })
      }
    }),
    {
      name    : 'send-storage-legacy',
      storage : createJSONStorage(() => AsyncStorage)
    }
  )
) 