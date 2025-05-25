/**
 * Bitcoin Crypto Configuration
 * 
 * Configures cryptographic libraries used by Bitcoin operations
 * Uses @bitcoinerlab/secp256k1 which is React Native compatible and doesn't require WASM
 */

import { initEccProvider } from './eccProvider'

/**
 * Initialize crypto configuration
 * Call this function at app startup before using any Bitcoin functionality
 */
export function initCryptoConfig(): void {
  // Initialize the React Native compatible ECC provider
  initEccProvider()
  
  console.log('Bitcoin crypto configuration initialized - React Native compatible ECC provider')
}

export default {
  initCryptoConfig
} 