/**
 * Store for managing state related to the receive functionality
 */
import { create } from 'zustand'
import { CurrencyType } from '@/src/types/domain/finance'
// import { convertAmount } from '@/src/utils/currency/conversion' // No longer needed for complex conversion

interface ReceiveStore {
  // State
  amount: string
  currency: CurrencyType
  // conversionDisabled: boolean // No longer needed as conversion is simpler
  
  // Actions
  setAmount: (amount: string) => void
  setCurrency: (currency: CurrencyType) => void
  // setConversionDisabled: (disabled: boolean) => void // No longer needed
  handleCurrencyChange: (newCurrency: CurrencyType) => void // btcPrice removed
  handleNumberPress: (num: string) => void
  handleBackspace: () => void
  resetState: () => void
}

export const useReceiveStore = create<ReceiveStore>((set, get) => ({
  // Initial state
  amount   : '0',
  currency : 'SATS', // Default to SATS
  // conversionDisabled: false, // Removed
  
  // Actions
  setAmount   : (amount) => set({ amount }),
  setCurrency : (currency) => set({ currency }),
  // setConversionDisabled: (disabled) => set({ conversionDisabled: disabled }), // Removed
  
  handleCurrencyChange : (newCurrencyType) => {
    // const { currency, amount } = get() // amount no longer used for conversion logic here
    // No actual amount conversion, just changing the unit type
    set({ currency: newCurrencyType })
  },
  
  handleNumberPress : (num) => {
    const { amount, currency } = get() // currency might be needed for validation soon
    // set({ conversionDisabled: false }) // Removed
    
    // Basic input concatenation, validation might be added based on currency (e.g. decimal places for BTC)
    let newAmount = amount
    if (amount === '0' && num !== '.') {
      newAmount = num
    } else if (num === '.' && amount.includes('.')) {
      newAmount = amount
    } else {
      newAmount = amount + num
    }
    
    set({ amount: newAmount })
  },
  
  handleBackspace : () => {
    const { amount } = get()
    // set({ conversionDisabled: false }) // Removed
    
    const newAmount = amount.length <= 1 ? '0' : amount.slice(0, -1)
    set({ amount: newAmount })
  },
  
  resetState : () => set({
    amount   : '0',
    currency : 'SATS', // Default to SATS
    // conversionDisabled: false // Removed
  })
})) 