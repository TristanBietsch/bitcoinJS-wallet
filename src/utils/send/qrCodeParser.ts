/**
 * Parses different formats of Bitcoin QR codes
 * Supports:
 * - BIP21 URI format (bitcoin:address?amount=0.1)
 * - Plain Bitcoin addresses
 */

interface ParsedQRResult {
  address : string
  amount? : number
  label? : string
  message? : string
}

/**
 * Parse a Bitcoin QR code string
 * @param qrData - The string data from the QR code
 * @returns ParsedQRResult with address and possibly other metadata
 */
export function parseQRCode(qrData: string): ParsedQRResult {
  // Check if it's a BIP21 URI
  if (qrData.toLowerCase().startsWith('bitcoin:')) {
    return parseBIP21URI(qrData)
  }
  
  // Default case: Treat as plain Bitcoin address
  return {
    address : qrData.trim()
  }
}

/**
 * Parse a BIP21 URI format
 * Format: bitcoin:address?amount=0.1&label=name&message=description
 */
function parseBIP21URI(uri: string): ParsedQRResult {
  try {
    // Remove the 'bitcoin:' prefix
    const withoutPrefix = uri.substring(8)
    
    // Split the address and parameters
    const [ address, queryParams ] = withoutPrefix.split('?')
    
    const result: ParsedQRResult = {
      address : address
    }
    
    // If we have query parameters, parse them
    if (queryParams) {
      const params = new URLSearchParams(queryParams)
      
      // Extract amount if present
      const amountStr = params.get('amount')
      if (amountStr) {
        result.amount = parseFloat(amountStr)
      }
      
      // Extract label if present
      const label = params.get('label')
      if (label) {
        result.label = label
      }
      
      // Extract message if present
      const message = params.get('message')
      if (message) {
        result.message = message
      }
    }
    
    return result
  } catch (error) {
    console.error('Error parsing BIP21 URI:', error)
    // In case of any parsing errors, just return the URI as is
    return {
      address : uri
    }
  }
} 