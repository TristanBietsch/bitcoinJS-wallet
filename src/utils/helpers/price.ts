/**
 * Price helper functions
 */

/**
 * Calculates price change percentage
 */
export const calculatePriceChange = (currentPrice: number, previousPrice: number): number | null => {
  if (!currentPrice || !previousPrice) return null
  
  const change = ((currentPrice - previousPrice) / previousPrice) * 100
  return Number(change.toFixed(2))
} 