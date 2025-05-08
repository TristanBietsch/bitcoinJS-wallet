/**
 * Utility functions for Bitcoin operations
 */

export interface BitcoinAmount {
  satoshis: number
  btc: number
}

// Convert satoshis to BTC
export function convertToBtc(satoshis: number): BitcoinAmount {
  const btc = satoshis / 100000000
  return {
    satoshis,
    btc
  }
}

// Convert BTC to satoshis
export function convertToSatoshis(btc: number): BitcoinAmount {
  const satoshis = Math.round(btc * 100000000)
  return {
    satoshis,
    btc
  }
}

// Format BTC with appropriate precision
export function formatBtc(btc: number): string {
  return btc.toLocaleString('en-US', {
    minimumFractionDigits : 8,
    maximumFractionDigits : 8
  })
}

// Format satoshis as a readable string
export function formatSatoshis(satoshis: number): string {
  return satoshis.toLocaleString('en-US')
} 