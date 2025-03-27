import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface CustomFee {
  totalSats: number
  confirmationTime: number
  feeRate: number
}

interface SendState {
  address  : string
  speed    : string
  customFee?: CustomFee
  setAddress : (address: string) => void
  setSpeed   : (speed: string) => void
  setCustomFee : (customFee: CustomFee) => void
  reset     : () => void
}

export const useSendStore = create<SendState>()(
  persist(
    (set) => ({
      address      : '',
      speed        : 'economy',
      customFee    : undefined,
      setAddress   : (address) => set({ address }),
      setSpeed     : (speed) => set({ speed }),
      setCustomFee : (customFee) => set({ customFee }),
      reset        : () => set({ address: '', speed: 'economy', customFee: undefined })
    }),
    {
      name    : 'send-storage',
      storage : createJSONStorage(() => AsyncStorage)
    }
  )
) 