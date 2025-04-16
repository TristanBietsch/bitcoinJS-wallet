/**
 * Mock wallet data utility
 * This module provides mock data and utility functions for wallet balance display
 */
import { MOCK_BTC_PRICE } from './priceData'

// Mock wallet balance in BTC
export const DUMMY_WALLET_BTC_BALANCE = 1.47299012

// Constants
export const SATS_PER_BTC = 100000000 // 1 BTC = 100,000,000 satoshis

/**
 * Get wallet balance in different formats
 */
export const getWalletBalance = () => {
  // Calculate USD value from BTC amount using mock price
  const balanceUSD = DUMMY_WALLET_BTC_BALANCE * MOCK_BTC_PRICE
  // Calculate satoshis
  const balanceSats = Math.floor(DUMMY_WALLET_BTC_BALANCE * SATS_PER_BTC)
  
  return {
    btcAmount  : DUMMY_WALLET_BTC_BALANCE,
    usdAmount  : balanceUSD,
    satsAmount : balanceSats,
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