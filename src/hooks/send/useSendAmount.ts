import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useSendStore } from '@/src/store/sendStore'
import { useBitcoinPriceConverter, CurrencyType } from '@/src/hooks/send'
import { validateBitcoinInput } from '@/src/utils/formatting/currencyUtils'
import { formatBitcoinAmount } from '@/src/utils/formatting/formatCurrencyValue'

export const useSendAmount = () => {
  const router = useRouter()
  const { 
    amount: persistedAmount,
    currency: persistedCurrency,
    setAmount,
    setCurrency
  } = useSendStore()
  
  // State for amount and currency
  const [ amount, setLocalAmount ] = useState(persistedAmount)
  const [ currency, setLocalCurrency ] = useState<CurrencyType>(persistedCurrency)
  const [ conversionDisabled, setConversionDisabled ] = useState(false)
  
  // Get Bitcoin price and conversion utilities
  const { isLoading, error, convertAmount } = useBitcoinPriceConverter()
  
  // Dummy balance for display
  const balance = '$2,257.65'
  
  // Handle currency change
  const handleCurrencyChange = (newCurrency: string) => {
    const newCurrencyType = newCurrency as CurrencyType
    if (currency !== newCurrencyType && !conversionDisabled) {
      const newAmount = convertAmount(amount, currency, newCurrencyType)
      setLocalAmount(newAmount)
      setAmount(newAmount)
    }
    setLocalCurrency(newCurrencyType)
    setCurrency(newCurrencyType)
  }
  
  // Handle input
  const handleNumberPress = (num: string) => {
    // Enable conversion when user manually enters a value
    setConversionDisabled(false)
    
    // Validate input for BTC/SATS to prevent more than 8 decimal places
    if (!validateBitcoinInput(amount, num, currency)) {
      // Don't update if the input would be invalid
      return
    }
    
    setLocalAmount(prev => {
      const newAmount = prev === '0' && num !== '.' ? num :
        num === '.' && prev.includes('.') ? prev :
        prev + num
      setAmount(newAmount)
      return newAmount
    })
  }
  
  const handleBackspace = () => {
    // Enable conversion when user manually enters a value
    setConversionDisabled(false)
    
    setLocalAmount(prev => {
      const newAmount = prev.length <= 1 ? '0' : prev.slice(0, -1)
      setAmount(newAmount)
      return newAmount
    })
  }
  
  // Handle back navigation
  const handleBackPress = () => {
    router.back()
  }
  
  // Handle continue
  const handleContinue = () => {
    // Ensure the store is updated with the latest values
    setAmount(amount)
    setCurrency(currency)
    
    // Navigate to confirmation screen without sending params
    router.push('/send/confirm' as any)
  }
  
  // Format displayed amount based on currency
  const getFormattedAmount = () => {
    return formatBitcoinAmount(amount, currency)
  }
  
  return {
    amount   : getFormattedAmount(),
    currency : currency,
    balance  : balance,
    isLoading,
    error,
    handleCurrencyChange,
    handleNumberPress,
    handleBackspace,
    handleBackPress,
    handleContinue
  }
} 