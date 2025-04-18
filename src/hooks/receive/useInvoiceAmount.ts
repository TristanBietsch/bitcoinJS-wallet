import { useMemo, useEffect } from 'react'
import { useConvertBitcoin } from '@/src/hooks/bitcoin/useConvertBitcoin'

interface InvoiceAmountResult {
  satsAmount: string
  usdAmount: string
  formattedAmount: string
  formattedUsdAmount: string
}

/**
 * Hook to handle invoice amount conversions and formatting
 * @param amount - The payment amount
 * @param currency - The currency of the amount (BTC, USD, etc.)
 */
export const useInvoiceAmount = (
  amount: string = '0',
  currency: string = 'BTC'
): InvoiceAmountResult => {
  const { getConvertedAmounts, refreshPrice } = useConvertBitcoin()
  
  // Use the bitcoin conversion hook to get the amounts
  const amounts = useMemo(() => {
    return getConvertedAmounts(amount, currency)
  }, [ amount, currency, getConvertedAmounts ])
  
  // Create formatted display versions of the amounts
  const formattedAmount = useMemo(() => {
    return `${amounts.sats} Sats`
  }, [ amounts.sats ])
  
  const formattedUsdAmount = useMemo(() => {
    return `≈ $${amounts.usd} USD`
  }, [ amounts.usd ])
  
  // Refresh price on initialization - using useEffect instead of useMemo to avoid render loops
  useEffect(() => {
    refreshPrice()
  }, [ refreshPrice ])
  
  return {
    satsAmount : amounts.sats,
    usdAmount  : amounts.usd,
    formattedAmount,
    formattedUsdAmount
  }
} 