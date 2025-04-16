/**
 * Currency options configuration
 */

// Currency type
export type CurrencyType = 'USD' | 'BTC' | 'SATS';

// Currency options for dropdown selectors
export const CURRENCY_OPTIONS = [
  { label: 'USD', value: 'USD' },
  { label: 'BTC', value: 'BTC' },
  { label: 'SATS', value: 'SATS' },
]

// Conversion constants
export const SATS_PER_BTC = 100000000 