/**
 * Formats a Bitcoin address for display by showing the first and last few characters
 * with an ellipsis in the middle
 * @param address The full Bitcoin address
 * @param startChars Number of characters to show at the start (default: 8)
 * @param endChars Number of characters to show at the end (default: 8)
 * @returns The truncated address string
 */
export const truncateAddress = (
  address : string,
  startChars : number = 8,
  endChars : number = 8
): string => {
  if (!address) return ''
  if (address.length <= startChars + endChars) return address
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Formats a Bitcoin address into multiple lines for readable display
 * @param address The full Bitcoin address
 * @param lineLength Length of each line (default: 20)
 * @returns Array of address segments split into lines
 */
export const formatAddressIntoLines = (
  address: string,
  lineLength: number = 20
): string[] => {
  if (!address) return []
  
  return [
    address.slice(0, lineLength),
    address.slice(lineLength, lineLength * 2),
    address.slice(lineLength * 2)
  ].filter(Boolean)
} 