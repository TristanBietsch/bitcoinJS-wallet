import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface CustomFee {
  totalSats: number
  confirmationTime: number
  feeRate: number
}

interface SendState {
  address: string
  speed: string
  customFee?: CustomFee
  amount: string
  currency: 'USD' | 'BTC' | 'SATS'
  forceError: boolean
  setAddress: (address: string) => void
  setSpeed: (speed: string) => void
  setCustomFee: (customFee: CustomFee | undefined) => void
  setAmount: (amount: string) => void
  setCurrency: (currency: 'USD' | 'BTC' | 'SATS') => void
  setForceError: (forceError: boolean) => void
  reset: () => void
}

export const useSendStore = create<SendState>()(
  persist(
    (set) => ({
      address       : '',
      speed         : 'economy',
      customFee     : undefined,
      amount        : '0',
      currency      : 'USD',
      forceError    : false,
      setAddress    : (address) => set({ address }),
      setSpeed      : (speed) => set({ speed }),
      setCustomFee  : (customFee) => set({ customFee }),
      setAmount     : (amount) => set({ amount }),
      setCurrency   : (currency) => set({ currency }),
      setForceError : (forceError) => set({ forceError }),
      reset         : () => set({ 
        address    : '', 
        speed      : 'economy', 
        customFee  : undefined,
        amount     : '0',
        currency   : 'USD',
        forceError : false
      })
    }),
    {
      name    : 'send-storage',
      storage : createJSONStorage(() => AsyncStorage)
    }
  )
) 