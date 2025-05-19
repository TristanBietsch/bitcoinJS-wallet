/**
 * Hook for parsing and handling transaction parameters
 */
import { useSendStore } from '@/src/store/sendStore'
import { CurrencyType } from '@/src/types/domain/finance'
import { calculateTransactionFee, getFeeInCurrency } from '@/src/utils/send/feeCalculations'

export interface TransactionParams {
  amount: number
  currency: CurrencyType
  feeSats: number // Renamed from fee.sats for clarity at top level
  feeBtc: number  // Renamed from fee.btc
  feeRate: number // Added feeRate
  totalAmount: number // Total in the specified currency (amount + feeInCurrency)
  address: string
  speed: string
}

/**
 * Hook to get calculated transaction parameters from the send store.
 */
export const useTransactionParams = (): TransactionParams => {
  const { address, speed, customFee, amount: storeAmount, currency: storeCurrency } = useSendStore()

  const amount = parseFloat(storeAmount || '0')
  // Ensure currency is one of the allowed types, defaulting to SATS
  const currency = (storeCurrency === 'BTC' || storeCurrency === 'SATS') ? storeCurrency : 'SATS'

  const feeCalculated = calculateTransactionFee(speed, customFee)
  const feeInCurrency = getFeeInCurrency(feeCalculated, currency)
  const feeBtcValue = getFeeInCurrency(feeCalculated, 'BTC') // Calculate BTC fee

  // Calculate total amount (amount + fee)
  const totalAmount = amount + feeInCurrency

  return {
    amount,
    currency,
    feeSats : feeCalculated.sats,
    feeBtc  : feeBtcValue,
    feeRate : feeCalculated.feeRate,
    totalAmount,
    address,
    speed,
  }
} 