import { CurrencyType } from '@/src/config/currency'

/**
 * Get the appropriate amount based on selected currency
 * @param currency The currency type to get the amount for
 * @param amounts Object containing different currency amounts
 * @returns The amount for the specified currency
 */
export const getAmountForCurrency = (
  currency: CurrencyType,
  amounts: { 
    usdAmount: number,
    btcAmount: number,
    satsAmount: number 
  }
) => {
  const { usdAmount, btcAmount, satsAmount } = amounts
  
  switch(currency) {
    case 'USD':
      return usdAmount
    case 'BTC':
      return btcAmount
    case 'SATS':
      return satsAmount
    default:
      return usdAmount
  }
} 