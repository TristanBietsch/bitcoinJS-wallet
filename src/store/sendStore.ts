import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CurrencyType } from '@/src/types/domain/finance'
import type { EnhancedFeeRates, FeeOption } from '@/src/services/bitcoin/feeEstimationService'

interface CustomFee {
  totalSats        : number
  confirmationTime : number
  feeRate          : number
}

// Error modes to simulate different failures
export type ErrorMode = 'none' | 'validation' | 'network'

interface SendState {
  // Transaction details
  address          : string
  speed            : string
  customFee?       : CustomFee
  amount           : string
  currency         : CurrencyType
  errorMode        : ErrorMode
  
  // Enhanced fee estimation
  feeRates?        : EnhancedFeeRates
  feeOptions?      : FeeOption[]
  selectedFeeOption? : FeeOption
  isLoadingFees    : boolean
  feeError?        : string
  
  // Transaction preview
  estimatedTxSize? : number
  
  // Actions
  setAddress       : (address: string) => void
  setSpeed         : (speed: string) => void
  setCustomFee     : (customFee: CustomFee | undefined) => void
  setAmount        : (amount: string) => void
  setCurrency      : (currency: CurrencyType) => void
  setErrorMode     : (errorMode: ErrorMode) => void
  
  // Enhanced fee actions
  setFeeRates      : (rates: EnhancedFeeRates) => void
  setFeeOptions    : (options: FeeOption[]) => void
  setSelectedFeeOption : (option: FeeOption) => void
  setIsLoadingFees : (loading: boolean) => void
  setFeeError      : (error: string | undefined) => void
  setEstimatedTxSize : (size: number) => void
  
  reset            : () => void
}

export const useSendStore = create<SendState>()(
  persist(
    (set) => ({
      // Transaction details
      address   : '',
      speed     : 'economy',
      customFee : undefined,
      amount    : '0',
      currency  : 'SATS',
      errorMode : 'none',
      
      // Enhanced fee estimation
      feeRates          : undefined,
      feeOptions        : undefined,
      selectedFeeOption : undefined,
      isLoadingFees     : false,
      feeError          : undefined,
      
      // Transaction preview
      estimatedTxSize : undefined,
      
      // Basic actions
      setAddress   : (address) => set({ address }),
      setSpeed     : (speed) => set({ speed }),
      setCustomFee : (customFee) => set({ customFee }),
      setAmount    : (amount) => set({ amount }),
      setCurrency  : (currency) => set({ currency }),
      setErrorMode : (errorMode) => set({ errorMode }),
      
      // Enhanced fee actions
      setFeeRates          : (feeRates) => set({ feeRates }),
      setFeeOptions        : (feeOptions) => set({ feeOptions }),
      setSelectedFeeOption : (selectedFeeOption) => set({ selectedFeeOption }),
      setIsLoadingFees     : (isLoadingFees) => set({ isLoadingFees }),
      setFeeError          : (feeError) => set({ feeError }),
      setEstimatedTxSize   : (estimatedTxSize) => set({ estimatedTxSize }),
      
      reset : () => set({ 
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
    }),
    {
      name    : 'send-storage',
      storage : createJSONStorage(() => AsyncStorage)
    }
  )
) 