import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface SendState {
  address  : string
  speed    : string
  setAddress : (address: string) => void
  setSpeed   : (speed: string) => void
  reset     : () => void
}

export const useSendStore = create<SendState>()(
  persist(
    (set) => ({
      address    : '',
      speed      : 'economy',
      setAddress : (address) => set({ address }),
      setSpeed   : (speed) => set({ speed }),
      reset      : () => set({ address: '', speed: 'economy' })
    }),
    {
      name    : 'send-storage',
      storage : createJSONStorage(() => AsyncStorage)
    }
  )
) 