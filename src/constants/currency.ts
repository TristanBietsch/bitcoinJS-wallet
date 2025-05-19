/**
 * Currency options configuration
 */

// Currency type
export type CurrencyType = 'BTC' | 'SATS';

// Currency options for dropdown selectors
export const CURRENCY_OPTIONS = [
  { label: 'BTC', value: 'BTC' },
  { label: 'SATS', value: 'SATS' },
]

// Conversion constants
export const SATS_PER_BTC = 100_000_000

// Add other currency-related constants here if needed 