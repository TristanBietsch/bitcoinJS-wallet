/**
 * DEPRECATED - Bitcoin RPC Service 
 * 
 * This file is being maintained for backward compatibility.
 * Please use the modular approach instead by importing from:
 * `src/services/bitcoin`
 * 
 * Example:
 * ```
 * import { sendToAddress, getNewAddress } from '../services/bitcoin'
 * ```
 */

// Re-export everything from the modular structure
export * from './index'

// Log a warning in development mode
if (__DEV__) {
  console.warn(
    'DEPRECATION WARNING: Using bitcoinRpc.ts directly is deprecated. ' +
    'Please import from src/services/bitcoin instead.'
  )
} 