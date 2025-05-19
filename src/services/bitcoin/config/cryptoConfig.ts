/**
 * Bitcoin Crypto Configuration
 * 
 * Configures cryptographic libraries used by Bitcoin operations
 * Specifically disables WASM in tiny-secp256k1 to ensure React Native compatibility
 */

/**
 * Initialize crypto configuration
 * Call this function at app startup before using any Bitcoin functionality
 */
export function initCryptoConfig(): void {
  // Force tiny-secp256k1 to use JS implementation instead of WASM
  // Using any to avoid TypeScript errors with global property
  (globalThis as any).__tinysecp256k1_useWasm = false
  
  console.log('Bitcoin crypto configuration initialized - WASM disabled')
}

export default {
  initCryptoConfig
} 