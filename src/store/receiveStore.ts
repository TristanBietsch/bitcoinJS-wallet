/**
 * Store for managing state related to the receive functionality
 */
import { create } from 'zustand'
import { CurrencyType } from '@/src/types/domain/finance'
import { convertAmount } from '@/src/utils/currency/conversion'

interface ReceiveStore {
  // State
  amount: string
  currency: CurrencyType
  conversionDisabled: boolean
  
  // Actions
  setAmount: (amount: string) => void
  setCurrency: (currency: CurrencyType) => void
  setConversionDisabled: (disabled: boolean) => void
  handleCurrencyChange: (newCurrency: string, btcPrice: number | null) => void
  handleNumberPress: (num: string) => void
  handleBackspace: () => void
  resetState: () => void
}

export const useReceiveStore = create<ReceiveStore>((set, get) => ({
  // Initial state
  amount             : '0',
  currency           : 'USD',
  conversionDisabled : false,
  
  // Actions
  setAmount             : (amount) => set({ amount }),
  setCurrency           : (currency) => set({ currency }),
  setConversionDisabled : (disabled) => set({ conversionDisabled: disabled }),
  
  handleCurrencyChange : (newCurrency, btcPrice) => {
    const { currency, amount, conversionDisabled } = get()
    const newCurrencyType = newCurrency as CurrencyType
    
    if (currency !== newCurrencyType && !conversionDisabled) {
      const newAmount = convertAmount(amount, currency, newCurrencyType, btcPrice)
      set({ 
        amount   : newAmount,
        currency : newCurrencyType
      })
    } else {
      set({ currency: newCurrencyType })
    }
  },
  
  handleNumberPress : (num) => {
    const { amount } = get()
    // Enable conversion when user manually enters a value
    set({ conversionDisabled: false })
    
    let newAmount = amount
    if (amount === '0' && num !== '.') {
      newAmount = num
    } else if (num === '.' && amount.includes('.')) {
      newAmount = amount // Don't add another decimal point
    } else {
      newAmount = amount + num
    }
    
    set({ amount: newAmount })
  },
  
  handleBackspace : () => {
    const { amount } = get()
    // Enable conversion when user manually modifies a value
    set({ conversionDisabled: false })
    
    const newAmount = amount.length <= 1 ? '0' : amount.slice(0, -1)
    set({ amount: newAmount })
  },
  
  resetState : () => set({
    amount             : '0',
    currency           : 'USD',
    conversionDisabled : false
  })
})) 