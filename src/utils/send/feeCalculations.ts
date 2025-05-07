import { transactionFees } from '@/tests/mockData/transactionData'
import { speedOptions } from '@/src/config/transactionFees'
import { CurrencyType } from '@/src/types/domain/finance'

/**
 * Type for transaction fee
 */
export type TransactionFee = {
  sats: number
  usd: number
  feeRate: number
}

/**
 * Calculate the transaction fee based on speed or custom fee
 * @param speed Selected speed type
 * @param customFee Optional custom fee settings
 * @returns Fee object with sats, usd, and feeRate
 */
export const calculateTransactionFee = (
  speed: string, 
  customFee?: { totalSats: number; feeRate: number }
): TransactionFee => {
  // Use custom fee if selected, otherwise use standard tiers
  if (speed === 'custom' && customFee) {
    return {
      sats    : customFee.totalSats,
      usd     : Number((customFee.totalSats * transactionFees.conversion.satToDollar).toFixed(2)),
      feeRate : customFee.feeRate
    }
  } 
  
  // Use fee from predefined speed options
  return speedOptions[speed as keyof typeof speedOptions]
}

/**
 * Convert fee to the specified currency
 * @param fee Transaction fee object
 * @param currency Target currency type
 * @returns Fee amount in the specified currency
 */
export const getFeeInCurrency = (fee: TransactionFee, currency: CurrencyType): number => {
  if (currency === 'USD') return fee.usd
  if (currency === 'SATS') return fee.sats
  // If BTC, convert sats to BTC
  return fee.sats / 100000000
} 