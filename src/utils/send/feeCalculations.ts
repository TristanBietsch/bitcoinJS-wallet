import { speedOptions } from '@/src/config/transactionFees'
import { CurrencyType } from '@/src/types/domain/finance'
import { SATS_PER_BTC } from '@/src/constants/currency'

/**
 * Type for transaction fee
 */
export type TransactionFee = {
  sats: number
  feeRate: number
}

/**
 * Calculate the transaction fee based on speed or custom fee
 * @param speed Selected speed type
 * @param customFee Optional custom fee settings
 * @returns Fee object with sats and feeRate
 */
export const calculateTransactionFee = (
  speed: string, 
  customFee?: { totalSats: number; feeRate: number }
): TransactionFee => {
  if (speed === 'custom' && customFee) {
    return {
      sats    : customFee.totalSats,
      feeRate : customFee.feeRate
    }
  } 
  
  const selectedSpeedOption = speedOptions[speed as keyof typeof speedOptions]
  if (!selectedSpeedOption) {
    console.warn(`Invalid speed option: ${speed}. Defaulting to a zero fee.`)
    return { sats: 0, feeRate: 0 }
  }
  // Assuming speedOptions provides sats and feeRate, or its usd field will be ignored
  return {
    sats    : selectedSpeedOption.sats,
    feeRate : selectedSpeedOption.feeRate
  }
}

/**
 * Convert fee (in SATS) to the specified currency (BTC or SATS)
 * @param fee Transaction fee object (now only contains sats and feeRate)
 * @param currency Target currency type (BTC or SATS)
 * @returns Fee amount in the specified currency
 */
export const getFeeInCurrency = (fee: TransactionFee, currency: CurrencyType): number => {
  if (currency === 'SATS') return fee.sats
  // If BTC, convert sats to BTC
  return fee.sats / SATS_PER_BTC
} 