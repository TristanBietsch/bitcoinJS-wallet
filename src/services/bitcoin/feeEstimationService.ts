/**
 * Enhanced Fee Estimation Service
 * Provides multi-source fee estimation with fallbacks and caching
 */

import { getFeeEstimates } from './blockchain'
import type { FeeRates } from '../../types/blockchain.types'

export interface EnhancedFeeRates extends FeeRates {
  economy : number    // Very slow, lowest cost
  source  : 'mempool' | 'fallback' | 'cached'
  lastUpdated : number
  confirmationTargets : {
    slow   : number // blocks
    normal : number // blocks  
    fast   : number // blocks
    economy : number // blocks
  }
}

// Cache for fee estimates
let cachedFeeRates: EnhancedFeeRates | null = null
let lastFetchTime = 0
const CACHE_DURATION = 60000 // 1 minute cache

// Get network-appropriate fallback rates
function getNetworkFallbackRates(): EnhancedFeeRates {
  const { IS_TESTNET } = require('@/src/config/bitcoinNetwork')
  
  if (IS_TESTNET) {
    return {
      economy             : 1,
      slow                : 1, 
      normal              : 1,
      fast                : 2,
      source              : 'fallback',
      lastUpdated         : Date.now(),
      confirmationTargets : {
        economy : 144,  // ~24 hours
        slow    : 72,   // ~12 hours  
        normal  : 6,    // ~1 hour
        fast    : 1,    // next block
      }
    }
  } else {
    return {
      economy             : 1,
      slow                : 3,
      normal              : 10,
      fast                : 25,
      source              : 'fallback',
      lastUpdated         : Date.now(),
      confirmationTargets : {
        economy : 144,  // ~24 hours
        slow    : 72,   // ~12 hours
        normal  : 6,    // ~1 hour
        fast    : 1,    // next block
      }
    }
  }
}

/**
 * Gets enhanced fee estimates with multiple fallback options
 */
export async function getEnhancedFeeEstimates(): Promise<EnhancedFeeRates> {
  const now = Date.now()
  
  // Debug network configuration
  const { BITCOIN_NETWORK, IS_TESTNET } = require('@/src/config/bitcoinNetwork')
  console.log(`🔧 [FeeEstimationService] Network: ${BITCOIN_NETWORK} (testnet: ${IS_TESTNET})`)
  
  // Return cached rates if still valid
  if (cachedFeeRates && (now - lastFetchTime) < CACHE_DURATION) {
    console.log('💾 [FeeEstimationService] Using cached rates')
    return cachedFeeRates
  }

  try {
    // Primary: Mempool API
    console.log('🌐 [FeeEstimationService] Fetching rates from blockchain service...')
    const mempoolRates = await getFeeEstimates()
    console.log('📊 [FeeEstimationService] Raw rates from API:', {
      fast   : mempoolRates.fast,
      normal : mempoolRates.normal,
      slow   : mempoolRates.slow
    })
    
    const enhancedRates: EnhancedFeeRates = {
      economy             : Math.max(1, Math.min(mempoolRates.slow, 2)), // Cap economy at 2 sats/vB
      slow                : mempoolRates.slow,
      normal              : mempoolRates.normal,
      fast                : mempoolRates.fast,
      source              : 'mempool',
      lastUpdated         : now,
      confirmationTargets : {
        economy : 144,
        slow    : 72,
        normal  : 6,
        fast    : 1,
      }
    }
    
    console.log('✅ [FeeEstimationService] Enhanced rates:', {
      economy : enhancedRates.economy,
      slow    : enhancedRates.slow,
      normal  : enhancedRates.normal,
      fast    : enhancedRates.fast,
      source  : enhancedRates.source
    })

    // Validate rates are reasonable
    if (validateFeeRates(enhancedRates)) {
      cachedFeeRates = enhancedRates
      lastFetchTime = now
      return enhancedRates
    } else {
      console.warn('Mempool API fee rates failed validation, using fallback')
      return getFallbackRates()
    }

  } catch (error) {
    console.error('Error fetching fee estimates:', error)
    return getFallbackRates()
  }
}

/**
 * Validates fee rates are within reasonable bounds
 */
function validateFeeRates(rates: EnhancedFeeRates): boolean {
  const { economy, slow, normal, fast } = rates
  
  // Check all rates are positive
  if (economy <= 0 || slow <= 0 || normal <= 0 || fast <= 0) {
    return false
  }
  
  // Check rates are in ascending order
  if (economy > slow || slow > normal || normal > fast) {
    return false
  }
  
  // Check rates are within reasonable bounds
  if (fast > 1000 || economy > 100) { // Sanity check for extremely high fees
    return false
  }
  
  return true
}

/**
 * Returns fallback fee rates with current timestamp
 */
function getFallbackRates(): EnhancedFeeRates {
  console.warn('Using network-appropriate fallback fee rates')
  return getNetworkFallbackRates()
}

/**
 * Estimates total transaction fee for a given transaction size and fee rate
 */
export function estimateTransactionFee(
  txSizeVBytes: number,
  feeRatePerVByte: number
): number {
  return Math.ceil(txSizeVBytes * feeRatePerVByte)
}

/**
 * Calculates transaction size based on input/output counts and types
 */
export function estimateTransactionSize(
  inputCount: number,
  outputCount: number,
  inputTypes: Array<'legacy' | 'segwit' | 'native_segwit'> = [],
  hasChangeOutput = true
): number {
  const baseSize = 10 // version, locktime, input count, output count
  
  // Calculate input sizes
  let inputSize = 0
  if (inputTypes.length === inputCount) {
    // Use specific input types
    inputSize = inputTypes.reduce((acc, type) => {
      switch (type) {
        case 'legacy'       : return acc + 148
        case 'segwit'       : return acc + 91  
        case 'native_segwit': return acc + 68
        default             : return acc + 68
      }
    }, 0)
  } else {
    // Default to native segwit if types not specified
    inputSize = inputCount * 68
  }
  
  // Calculate output sizes (assume P2WPKH outputs)
  const actualOutputCount = hasChangeOutput ? outputCount + 1 : outputCount
  const outputSize = actualOutputCount * 31
  
  return baseSize + inputSize + outputSize
}

/**
 * Gets fee estimate for a specific confirmation target (in blocks)
 */
export function getFeeForTarget(
  rates: EnhancedFeeRates,
  targetBlocks: number
): number {
  // Find the best rate for the target
  if (targetBlocks <= 1) return rates.fast
  if (targetBlocks <= 6) return rates.normal
  if (targetBlocks <= 72) return rates.slow
  return rates.economy
}

/**
 * Calculates fee options for a transaction
 */
export interface FeeOption {
  name            : string
  feeRate         : number
  totalFee        : number
  estimatedBlocks : number
  estimatedTime   : string
}

export async function calculateFeeOptions(
  txSizeVBytes: number
): Promise<FeeOption[]> {
  const rates = await getEnhancedFeeEstimates()
  
  const options: FeeOption[] = [
    {
      name            : 'Economy',
      feeRate         : rates.economy,
      totalFee        : estimateTransactionFee(txSizeVBytes, rates.economy),
      estimatedBlocks : rates.confirmationTargets.economy,
      estimatedTime   : '~24 hours'
    },
    {
      name            : 'Slow',
      feeRate         : rates.slow,
      totalFee        : estimateTransactionFee(txSizeVBytes, rates.slow),
      estimatedBlocks : rates.confirmationTargets.slow,
      estimatedTime   : '~12 hours'
    },
    {
      name            : 'Normal',
      feeRate         : rates.normal,
      totalFee        : estimateTransactionFee(txSizeVBytes, rates.normal),
      estimatedBlocks : rates.confirmationTargets.normal,
      estimatedTime   : '~1 hour'
    },
    {
      name            : 'Fast',
      feeRate         : rates.fast,
      totalFee        : estimateTransactionFee(txSizeVBytes, rates.fast),
      estimatedBlocks : rates.confirmationTargets.fast,
      estimatedTime   : '~10 minutes'
    }
  ]
  
  return options
}

/**
 * Validates a custom fee rate
 */
export function validateCustomFeeRate(
  feeRate: number,
  rates: EnhancedFeeRates
): { isValid: boolean; message?: string } {
  if (feeRate <= 0) {
    return { isValid: false, message: 'Fee rate must be positive' }
  }
  
  if (feeRate < 1) {
    return { isValid: false, message: 'Fee rate too low (minimum 1 sat/vB)' }
  }
  
  if (feeRate > 1000) {
    return { isValid: false, message: 'Fee rate exceptionally high (>1000 sat/vB)' }
  }
  
  // Warn if significantly different from market rates
  if (feeRate < rates.economy * 0.5) {
    return { isValid: false, message: 'Fee rate may be too low for timely confirmation' }
  }
  
  if (feeRate > rates.fast * 3) {
    return { isValid: false, message: 'Fee rate much higher than necessary' }
  }
  
  return { isValid: true }
}

/**
 * Clears the fee rate cache (useful for testing or manual refresh)
 */
export function clearFeeCache(): void {
  cachedFeeRates = null
  lastFetchTime = 0
} 