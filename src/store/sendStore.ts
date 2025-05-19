import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CurrencyType } from '@/src/types/domain/finance'

interface CustomFee {
  totalSats        : number
  confirmationTime : number
  feeRate          : number
}

// Error modes to simulate different failures
export type ErrorMode = 'none' | 'validation' | 'network'

interface SendState {
  address          : string
  speed            : string
  customFee?       : CustomFee
  amount           : string
  currency         : CurrencyType
  errorMode        : ErrorMode
  setAddress       : (address: string) => void
  setSpeed         : (speed: string) => void
  setCustomFee     : (customFee: CustomFee | undefined) => void
  setAmount        : (amount: string) => void
  setCurrency      : (currency: CurrencyType) => void
  setErrorMode     : (errorMode: ErrorMode) => void
  reset            : () => void
}

export const useSendStore = create<SendState>()(
  persist(
    (set) => ({
      address      : '',
      speed        : 'economy',
      customFee    : undefined,
      amount       : '0',
      currency     : 'SATS',
      errorMode    : 'none',
      setAddress   : (address) => set({ address }),
      setSpeed     : (speed) => set({ speed }),
      setCustomFee : (customFee) => set({ customFee }),
      setAmount    : (amount) => set({ amount }),
      setCurrency  : (currency) => set({ currency }),
      setErrorMode : (errorMode) => set({ errorMode }),
      reset        : () => set({ 
        address   : '', 
        speed     : 'economy', 
        customFee : undefined,
        amount    : '0',
        currency  : 'SATS',
        errorMode : 'none'
      })
    }),
    {
      name    : 'send-storage',
      storage : createJSONStorage(() => AsyncStorage)
    }
  )
) 