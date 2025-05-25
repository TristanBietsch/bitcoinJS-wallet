import { useMemo } from 'react'
import { CurrencyType } from '@/src/types/domain/finance'
import { SATS_PER_BTC } from '@/src/constants/currency'

interface InvoiceAmountResult {
  satsAmount: string
  formattedAmount: string
}

/**
 * Hook to handle invoice amount formatting (SATS and BTC)
 * @param amountStr - The payment amount as a string
 * @param currency - The currency of the amount (BTC or SATS)
 */
export const useInvoiceAmount = (
  amountStr: string = '0',
  currency: CurrencyType = 'SATS' // Default to SATS
): InvoiceAmountResult => {
  const satsAmountNum = useMemo(() => {
    const numAmount = parseFloat(amountStr) || 0
    if (currency === 'BTC') {
      return Math.round(numAmount * SATS_PER_BTC)
    }
    return Math.round(numAmount) // Assuming SATS if not BTC
  }, [ amountStr, currency ])

  const formattedAmount = useMemo(() => {
    if (currency === 'BTC') {
      // For BTC, show the original BTC amount with 'BTC' suffix
      // Or convert satsAmountNum back to BTC for display if preferred
      const btcDisplay = (satsAmountNum / SATS_PER_BTC).toFixed(8).replace(/\.?0+$/, "")
      return `${btcDisplay} BTC`
    }
    return `${satsAmountNum} SATS` // Default to SATS display
  }, [ satsAmountNum, currency ])

  return {
    satsAmount : String(satsAmountNum),
    formattedAmount,
  }
} 