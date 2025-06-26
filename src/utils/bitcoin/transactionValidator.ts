/**
 * Bitcoin Transaction Validation Utilities
 * Helps debug and validate raw transaction hex before broadcasting
 */

export interface TransactionValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  details: {
    length: number
    version: string
    inputCount: number
    outputCount: number
    locktime: string
    isSegwit: boolean
  }
}

/**
 * Validate a raw transaction hex string
 */
export function validateTransactionHex(txHex: string): TransactionValidationResult {
  const result: TransactionValidationResult = {
    isValid  : true,
    errors   : [],
    warnings : [],
    details  : {
      length      : 0,
      version     : '',
      inputCount  : 0,
      outputCount : 0,
      locktime    : '',
      isSegwit    : false
    }
  }

  try {
    // Basic validation
    if (!txHex || typeof txHex !== 'string') {
      result.errors.push('Transaction hex is required and must be a string')
      result.isValid = false
      return result
    }

    // Check if hex is valid
    if (!/^[0-9a-fA-F]+$/.test(txHex)) {
      result.errors.push('Transaction hex contains invalid characters')
      result.isValid = false
      return result
    }

    // Check if length is even
    if (txHex.length % 2 !== 0) {
      result.errors.push('Transaction hex length must be even')
      result.isValid = false
      return result
    }

    result.details.length = txHex.length / 2 // Convert to bytes

    // Parse basic transaction structure
    let offset = 0
    const buffer = Buffer.from(txHex, 'hex')

    // Version (4 bytes)
    if (buffer.length < 4) {
      result.errors.push('Transaction too short - missing version')
      result.isValid = false
      return result
    }
    const version = buffer.readUInt32LE(0)
    result.details.version = `0x${version.toString(16).padStart(8, '0')}`
    offset += 4

    // Check for segwit marker and flag
    let isSegwit = false
    if (buffer.length > offset + 1 && buffer[offset] === 0x00 && buffer[offset + 1] === 0x01) {
      isSegwit = true
      result.details.isSegwit = true
      offset += 2 // Skip marker and flag
    }

    // Input count (varint)
    const inputCountResult = readVarInt(buffer, offset)
    if (!inputCountResult) {
      result.errors.push('Invalid input count')
      result.isValid = false
      return result
    }
    result.details.inputCount = inputCountResult.value
    offset = inputCountResult.offset

    // Basic transaction size validation
    if (result.details.length < 60) {
      result.warnings.push('Transaction is very small, may be incomplete')
    }

    if (result.details.length > 100000) {
      result.errors.push('Transaction is too large (>100KB)')
      result.isValid = false
    }

    // Input validation
    if (result.details.inputCount === 0) {
      result.errors.push('Transaction must have at least one input')
      result.isValid = false
    }

    if (result.details.inputCount > 1000) {
      result.warnings.push('Transaction has many inputs, may be expensive to broadcast')
    }

    // Skip input parsing for now, just validate we have enough data
    // Each input is at least 36 bytes (outpoint) + 1 byte (script length) + 4 bytes (sequence)
    const minInputSize = result.details.inputCount * 41
    if (buffer.length < offset + minInputSize) {
      result.errors.push('Transaction too short for declared input count')
      result.isValid = false
    }

    // Additional checks for common issues
    if (result.details.length === 223 && txHex.startsWith('02000000')) {
      result.warnings.push('This appears to be a version 2 transaction')
    }

    // Check for testnet/mainnet indicators
    if (isSegwit) {
      result.warnings.push('This is a SegWit transaction')
    }

  } catch (error) {
    result.errors.push(`Transaction parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    result.isValid = false
  }

  return result
}

/**
 * Read a variable-length integer from buffer
 */
function readVarInt(buffer: Buffer, offset: number): { value: number; offset: number } | null {
  if (offset >= buffer.length) return null

  const first = buffer[offset]
  
  if (first < 0xfd) {
    return { value: first, offset: offset + 1 }
  } else if (first === 0xfd) {
    if (offset + 3 > buffer.length) return null
    return { value: buffer.readUInt16LE(offset + 1), offset: offset + 3 }
  } else if (first === 0xfe) {
    if (offset + 5 > buffer.length) return null
    return { value: buffer.readUInt32LE(offset + 1), offset: offset + 5 }
  } else {
    if (offset + 9 > buffer.length) return null
    // Note: This could overflow for very large values
    const low = buffer.readUInt32LE(offset + 1)
    const high = buffer.readUInt32LE(offset + 5)
    return { value: low + (high * 0x100000000), offset: offset + 9 }
  }
}

/**
 * Log detailed transaction analysis
 */
export function logTransactionAnalysis(txHex: string): void {
  const validation = validateTransactionHex(txHex)
  
  console.log('📋 [TransactionValidator] Transaction Analysis:')
  console.log(`   Length: ${validation.details.length} bytes`)
  console.log(`   Version: ${validation.details.version}`)
  console.log(`   Input Count: ${validation.details.inputCount}`)
  console.log(`   SegWit: ${validation.details.isSegwit ? 'Yes' : 'No'}`)
  console.log(`   Valid: ${validation.isValid ? '✅' : '❌'}`)
  
  if (validation.errors.length > 0) {
    console.log('❌ Errors:')
    validation.errors.forEach(error => console.log(`   - ${error}`))
  }
  
  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:')
    validation.warnings.forEach(warning => console.log(`   - ${warning}`))
  }
}