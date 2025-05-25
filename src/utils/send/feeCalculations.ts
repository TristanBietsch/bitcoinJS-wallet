import { CurrencyType } from '@/src/types/domain/finance'
import { SATS_PER_BTC } from '@/src/constants/currency'

// Default transaction size for estimates
const DEFAULT_TX_SIZE_VBYTES = 200

/**
 * Type for transaction fee
 */
export type TransactionFee = {
  sats: number
  feeRate: number
}

// Fallback fee rates for immediate calculation
const FALLBACK_FEE_RATES = {
  economy  : 1,
  standard : 10,
  express  : 25
}

/**
 * Calculate transaction fee from fee rate
 */
const estimateTransactionFee = (txSizeVBytes: number, feeRatePerVByte: number): number => {
  return Math.ceil(txSizeVBytes * feeRatePerVByte)
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
  
  // Use fallback fee rates for immediate calculation
  const feeRate = FALLBACK_FEE_RATES[speed as keyof typeof FALLBACK_FEE_RATES] || FALLBACK_FEE_RATES.standard
  
  return {
    sats : estimateTransactionFee(DEFAULT_TX_SIZE_VBYTES, feeRate),
    feeRate
  }
}

/**
 * Convert fee to different currency unit
 */
export const getFeeInCurrency = (fee: TransactionFee, currency: CurrencyType): number => {
  switch (currency) {
    case 'SATS':
      return fee.sats
    case 'BTC':
      return fee.sats / SATS_PER_BTC
    default:
      return fee.sats
  }
} 