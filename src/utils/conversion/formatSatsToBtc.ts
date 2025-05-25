/**
 * Converts an amount in satoshis to a string representation in BTC.
 * @param sats The amount in satoshis (number).
 * @param decimalPlaces The number of decimal places to display for BTC (default is 8).
 * @returns A string representing the BTC amount, e.g., "0.12345678".
 */
export const formatSatsToBtc = (sats: number, decimalPlaces: number = 8): string => {
  if (typeof sats !== 'number' || isNaN(sats)) {
    return '0' // Or throw an error, or return a specific placeholder like 'Invalid amount'
  }
  const btcValue = sats / 100_000_000
  // toFixed handles the decimal places and converts to string.
  // It also rounds, which is generally desired for display.
  return btcValue.toFixed(decimalPlaces)
} 