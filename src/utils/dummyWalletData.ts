/**
 * Dummy wallet data utility
 * This module provides mock data and utility functions for wallet balance display
 * It can be replaced with real data fetching and calculation later
 */

// Mock BTC price in USD
export const DUMMY_BTC_PRICE_USD = 67890.45

// Mock wallet balance in BTC
export const DUMMY_WALLET_BTC_BALANCE = 1.47299012

// Constants
export const SATS_PER_BTC = 100000000 // 1 BTC = 100,000,000 satoshis

/**
 * Get wallet balance in different formats
 * This can be replaced with actual wallet balance fetching later
 */
export const getWalletBalance = () => {
  // Calculate USD value from BTC amount
  const balanceUSD = DUMMY_WALLET_BTC_BALANCE * DUMMY_BTC_PRICE_USD
  // Calculate satoshis
  const balanceSats = Math.floor(DUMMY_WALLET_BTC_BALANCE * SATS_PER_BTC)
  
  return {
    btcAmount  : DUMMY_WALLET_BTC_BALANCE,
    usdAmount  : balanceUSD,
    satsAmount : balanceSats,
    // Could add more currencies here in the future
  }
}

/**
 * Format currency for display
 * @param amount - The amount to format
 * @param currency - The currency type (USD, BTC, or SATS)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: 'USD' | 'BTC' | 'SATS'): string => {
  if (currency === 'USD') {
    // Format as USD with comma separators and 2 decimal places
    return `$${amount.toLocaleString('en-US', { 
      minimumFractionDigits : 2,
      maximumFractionDigits : 2 
    })}`
  } else if (currency === 'BTC') {
    // Format as BTC with up to 8 decimal places
    return `₿${amount.toLocaleString('en-US', { 
      minimumFractionDigits : 2,
      maximumFractionDigits : 8 
    })}`
  } else {
    // Format as satoshis with no decimal places (without 'sats' text)
    return `${amount.toLocaleString('en-US', { 
      minimumFractionDigits : 0,
      maximumFractionDigits : 0
    })}`
  }
} 