/**
 * ECC Provider for Bitcoin Operations
 * 
 * Provides a React Native compatible ECC implementation using @bitcoinerlab/secp256k1
 * This replaces tiny-secp256k1 which has WASM compatibility issues in React Native
 */

import * as ecc from '@bitcoinerlab/secp256k1'
import logger from '@/src/utils/logger'

// Track if ECC has been initialized to avoid duplicate logs
let eccInitialized = false

/**
 * Get the ECC implementation for Bitcoin operations
 * Uses @bitcoinerlab/secp256k1 which is React Native compatible
 * and implements the exact same interface as tiny-secp256k1
 * 
 * @returns ECC library instance compatible with bitcoinjs-lib
 */
export function getEccLib() {
  // Validate that the ECC library has required methods
  const requiredMethods = {
    isPoint         : ecc.isPoint,
    isPrivate       : ecc.isPrivate,
    pointFromScalar : ecc.pointFromScalar,
    pointAdd        : ecc.pointAdd,
    pointAddScalar  : ecc.pointAddScalar,
    pointMultiply   : ecc.pointMultiply,
    pointCompress   : ecc.pointCompress,
    privateAdd      : ecc.privateAdd,
    sign            : ecc.sign,
    verify          : ecc.verify
  }
  
  for (const [ methodName, method ] of Object.entries(requiredMethods)) {
    if (typeof method !== 'function') {
      throw new Error(`ECC library missing required method: ${methodName}`)
    }
  }
  
  // Only log on first initialization
  if (!eccInitialized) {
    logger.crypto('ECC Provider initialized - @bitcoinerlab/secp256k1 (React Native compatible)')
    eccInitialized = true
  }
  return ecc
}

/**
 * Initialize ECC for bitcoinjs-lib and related libraries
 * Call this once at app startup before using any Bitcoin functionality
 */
export function initEccProvider(): typeof ecc {
  const eccLib = getEccLib()
  
  // Log successful initialization
  logger.crypto('Bitcoin ECC Provider ready for use')
  
  return eccLib
}

export default {
  getEccLib,
  initEccProvider
} 