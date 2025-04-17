/**
 * Hook for parsing and handling transaction parameters
 */
import { useSendStore } from '@/src/store/sendStore'
import { CurrencyType } from '@/src/types/currency.types'
import { calculateTransactionFee, getFeeInCurrency, TransactionFee } from '@/src/utils/send/feeCalculations'

interface TransactionParams {
  amount: number
  currency: CurrencyType
  fee: TransactionFee
  feeInCurrency: number
  totalAmount: number
  totalAmountUsd: number
  address: string
  speed: string
}

/**
 * Hook to parse route parameters and calculate transaction details
 */
export const useTransactionParams = (): TransactionParams => {
  const { address, speed, customFee, amount: storeAmount, currency: storeCurrency } = useSendStore()
  
  // Parse amount from store, not from route params
  const amount = parseFloat(storeAmount || '0')
  const currency = storeCurrency as CurrencyType
  
  // Calculate fee based on selected speed or custom fee
  const fee = calculateTransactionFee(speed, customFee)
  
  // Calculate fee in the correct currency
  const feeInCurrency = getFeeInCurrency(fee, currency)
  
  // Calculate total amount (amount + fee)
  const totalAmount = amount + feeInCurrency
  
  // Calculate USD equivalent for total amount
  const totalAmountUsd = currency === 'USD' 
    ? totalAmount 
    : fee.usd + (currency === 'SATS' 
        ? amount * fee.usd / fee.sats 
        : amount * fee.usd / (fee.sats / 100000000))
  
  return {
    amount,
    currency,
    fee,
    feeInCurrency,
    totalAmount,
    totalAmountUsd,
    address,
    speed
  }
} 