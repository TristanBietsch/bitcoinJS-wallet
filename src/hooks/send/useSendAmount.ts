import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useSendStore } from '@/src/store/sendStore'
import { CurrencyType } from '@/src/types/domain/finance'
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
  const [ currency, setLocalCurrency ] = useState<CurrencyType>(persistedCurrency || 'SATS')
  
  // Handle currency change
  const handleCurrencyChange = (newCurrency: string) => {
    const newCurrencyType = newCurrency as CurrencyType
    setLocalCurrency(newCurrencyType)
    setCurrency(newCurrencyType)
  }
  
  // Handle input
  const handleNumberPress = (num: string) => {
    if (!validateBitcoinInput(amount, num, currency)) {
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
    setAmount(amount)
    setCurrency(currency)
    
    router.push('/send/confirm' as any)
  }
  
  // Format displayed amount based on currency
  const getFormattedAmount = () => {
    return formatBitcoinAmount(amount, currency)
  }
  
  return {
    amount   : getFormattedAmount(),
    currency : currency,
    handleCurrencyChange,
    handleNumberPress,
    handleBackspace,
    handleBackPress,
    handleContinue
  }
} 