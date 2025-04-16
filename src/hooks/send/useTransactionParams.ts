/**
 * Hook for parsing and handling transaction parameters
 */
import { useLocalSearchParams } from 'expo-router'
import { useSendStore } from '@/src/store/sendStore'
import { CurrencyType } from '@/src/types/currency.types'
import { calculateTransactionFee, getFeeInCurrency, TransactionFee } from '@/src/utils/send/feeCalculations'

interface TransactionParams {
  amount: number
  currency: CurrencyType
  fee: TransactionFee
  feeInCurrency: number
  totalAmount: number
  address: string
  speed: string
}

/**
 * Hook to parse route parameters and calculate transaction details
 */
export const useTransactionParams = (): TransactionParams => {
  const { address, speed, customFee } = useSendStore()
  const params = useLocalSearchParams<Record<string, string | string[]>>()
  
  // Parse amount and currency from route params
  const amount = parseFloat(params.amount as string || '0')
  const currency = (params.currency as string || 'USD') as CurrencyType
  
  // Calculate fee based on selected speed or custom fee
  const fee = calculateTransactionFee(speed, customFee)
  
  // Calculate fee in the correct currency
  const feeInCurrency = getFeeInCurrency(fee, currency)
  
  // Calculate total amount (amount + fee)
  const totalAmount = amount + feeInCurrency
  
  return {
    amount,
    currency,
    fee,
    feeInCurrency,
    totalAmount,
    address,
    speed
  }
} 