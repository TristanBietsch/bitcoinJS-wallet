/**
 * Consolidated Bitcoin Fee Service
 * Combines fee estimation, calculation, and validation functionality
 */
import { getFeeEstimates as getBlockchainFeeEstimates } from './blockchain'
import { estimateTxVirtualBytes } from '@/src/utils/bitcoin/utils'
import type { FeeRates } from '@/src/types/blockchain.types'

// Enhanced fee structure with more options
export interface EnhancedFeeRates extends FeeRates {
  economy: number // Very slow, lowest cost
  source: 'mempool' | 'fallback' | 'cached'
  lastUpdated: number
  confirmationTargets: {
    slow: number    // blocks
    normal: number  // blocks  
    fast: number    // blocks
    economy: number // blocks
  }
}

export interface FeeOption {
  name: string
  feeRate: number
  totalFee: number
  estimatedBlocks: number
  estimatedTime: string
}

export interface FeeCalculation {
  inputCount: number
  outputCount: number
  estimatedSize: number
  feeRate: number
  totalFee: number
  feePercentage: number
}

/**
 * Consolidated Fee Service
 */
export class FeeService {
  private static cachedFeeRates: EnhancedFeeRates | null = null
  private static lastFetchTime = 0
  private static readonly CACHE_DURATION = 60000 // 1 minute cache

  /**
   * FEE RATE MANAGEMENT
   */

  /**
   * Get network-appropriate fallback rates
   */
  private static getNetworkFallbackRates(): EnhancedFeeRates {
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
          slow    : 72,      // ~12 hours  
          normal  : 6,     // ~1 hour
          fast    : 1,       // next block
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
          slow    : 72,      // ~12 hours
          normal  : 6,     // ~1 hour
          fast    : 1,       // next block
        }
      }
    }
  }

  /**
   * Validate fee rates are within reasonable bounds
   */
  private static validateFeeRates(rates: EnhancedFeeRates): boolean {
    const { economy, slow, normal, fast } = rates
    
    // Check all rates are positive
    if (economy <= 0 || slow <= 0 || normal <= 0 || fast <= 0) {
      return false
    }
    
    // Check rates are in ascending order (with some tolerance)
    if (economy > slow || slow > normal * 1.5 || normal > fast * 1.5) {
      return false
    }
    
    // Check rates are within reasonable bounds
    if (fast > 1000 || economy > 100) { // Sanity check for extremely high fees
      return false
    }
    
    return true
  }

  /**
   * Get enhanced fee estimates with caching and fallbacks
   */
  static async getEnhancedFeeEstimates(): Promise<EnhancedFeeRates> {
    const now = Date.now()
    
    // Debug network configuration
    const { BITCOIN_NETWORK, IS_TESTNET } = require('@/src/config/bitcoinNetwork')
    console.log(`🔧 [FeeService] Network: ${BITCOIN_NETWORK} (testnet: ${IS_TESTNET})`)
    
    // Return cached rates if still valid
    if (this.cachedFeeRates && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      console.log('💾 [FeeService] Using cached rates')
      return this.cachedFeeRates
    }

    try {
      // Primary: Blockchain service (uses BitcoinAPIClient)
      console.log('🌐 [FeeService] Fetching rates from blockchain service...')
      const blockchainRates = await getBlockchainFeeEstimates()
      console.log('📊 [FeeService] Raw rates from API:', {
        fast   : blockchainRates.fast,
        normal : blockchainRates.normal,
        slow   : blockchainRates.slow
      })
      
      const enhancedRates: EnhancedFeeRates = {
        economy             : Math.max(1, Math.min(blockchainRates.slow, 2)), // Cap economy at 2 sats/vB
        slow                : blockchainRates.slow,
        normal              : blockchainRates.normal,
        fast                : blockchainRates.fast,
        source              : 'mempool',
        lastUpdated         : now,
        confirmationTargets : {
          economy : 144,
          slow    : 72,
          normal  : 6,
          fast    : 1,
        }
      }
      
      console.log('✅ [FeeService] Enhanced rates:', {
        economy : enhancedRates.economy,
        slow    : enhancedRates.slow,
        normal  : enhancedRates.normal,
        fast    : enhancedRates.fast,
        source  : enhancedRates.source
      })

      // Validate rates are reasonable
      if (this.validateFeeRates(enhancedRates)) {
        this.cachedFeeRates = enhancedRates
        this.lastFetchTime = now
        return enhancedRates
      } else {
        console.warn('Blockchain API fee rates failed validation, using fallback')
        return this.getFallbackRates()
      }

    } catch (error) {
      console.error('Error fetching fee estimates:', error)
      return this.getFallbackRates()
    }
  }

  /**
   * Get fallback fee rates
   */
  private static getFallbackRates(): EnhancedFeeRates {
    console.warn('Using network-appropriate fallback fee rates')
    return this.getNetworkFallbackRates()
  }

  /**
   * Clear fee cache
   */
  static clearFeeCache(): void {
    this.cachedFeeRates = null
    this.lastFetchTime = 0
  }

  /**
   * FEE CALCULATION
   */

  /**
   * Estimate transaction fee for given size and rate
   */
  static estimateTransactionFee(txSizeVBytes: number, feeRatePerVByte: number): number {
    return Math.ceil(txSizeVBytes * feeRatePerVByte)
  }

  /**
   * Calculate transaction size based on input/output counts and types
   */
  static estimateTransactionSize(
    inputCount: number,
    outputCount: number,
    inputTypes: Array<'legacy' | 'segwit' | 'native_segwit'> = [],
    hasChangeOutput = true
  ): number {
    // Use the existing utility if available, otherwise implement basic estimation
    try {
      return estimateTxVirtualBytes(inputCount, outputCount + (hasChangeOutput ? 1 : 0))
    } catch {
      // Fallback calculation
      const baseSize = 10 // version, locktime, input count, output count
      
      // Calculate input sizes
      let inputSize = 0
      if (inputTypes.length === inputCount) {
        // Use specific input types
        inputSize = inputTypes.reduce((acc, type) => {
          switch (type) {
            case 'legacy': return acc + 148
            case 'segwit': return acc + 91  
            case 'native_segwit': return acc + 68
            default: return acc + 68
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
  }

  /**
   * Calculate comprehensive fee information
   */
  static calculateFeeDetails(
    inputCount: number,
    outputCount: number,
    feeRate: number,
    totalAmount: number,
    hasChangeOutput = true
  ): FeeCalculation {
    const estimatedSize = this.estimateTransactionSize(inputCount, outputCount, [], hasChangeOutput)
    const totalFee = this.estimateTransactionFee(estimatedSize, feeRate)
    const feePercentage = totalAmount > 0 ? (totalFee / totalAmount) * 100 : 0

    return {
      inputCount,
      outputCount,
      estimatedSize,
      feeRate,
      totalFee,
      feePercentage
    }
  }

  /**
   * FEE RATE UTILITIES
   */

  /**
   * Get fee rate for specific confirmation target
   */
  static getFeeForTarget(rates: EnhancedFeeRates, targetBlocks: number): number {
    // Find the best rate for the target
    if (targetBlocks <= 1) return rates.fast
    if (targetBlocks <= 6) return rates.normal
    if (targetBlocks <= 72) return rates.slow
    return rates.economy
  }

  /**
   * Calculate fee options for a transaction
   */
  static async calculateFeeOptions(txSizeVBytes: number): Promise<FeeOption[]> {
    const rates = await this.getEnhancedFeeEstimates()
    
    const options: FeeOption[] = [
      {
        name            : 'Economy',
        feeRate         : rates.economy,
        totalFee        : this.estimateTransactionFee(txSizeVBytes, rates.economy),
        estimatedBlocks : rates.confirmationTargets.economy,
        estimatedTime   : '~24 hours'
      },
      {
        name            : 'Slow',
        feeRate         : rates.slow,
        totalFee        : this.estimateTransactionFee(txSizeVBytes, rates.slow),
        estimatedBlocks : rates.confirmationTargets.slow,
        estimatedTime   : '~12 hours'
      },
      {
        name            : 'Normal',
        feeRate         : rates.normal,
        totalFee        : this.estimateTransactionFee(txSizeVBytes, rates.normal),
        estimatedBlocks : rates.confirmationTargets.normal,
        estimatedTime   : '~1 hour'
      },
      {
        name            : 'Fast',
        feeRate         : rates.fast,
        totalFee        : this.estimateTransactionFee(txSizeVBytes, rates.fast),
        estimatedBlocks : rates.confirmationTargets.fast,
        estimatedTime   : '~10 minutes'
      }
    ]
    
    return options
  }

  /**
   * FEE VALIDATION
   */

  /**
   * Validate a custom fee rate
   */
  static async validateCustomFeeRate(
    feeRate: number,
    providedRates?: EnhancedFeeRates
  ): Promise<{ isValid: boolean; message?: string }> {
    if (feeRate <= 0) {
      return { isValid: false, message: 'Fee rate must be positive' }
    }
    
    if (feeRate < 1) {
      return { isValid: false, message: 'Fee rate too low (minimum 1 sat/vB)' }
    }
    
    if (feeRate > 1000) {
      return { isValid: false, message: 'Fee rate exceptionally high (>1000 sat/vB)' }
    }
    
    // Get market rates for comparison
    const rates = providedRates || await this.getEnhancedFeeEstimates()
    
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
   * Check if fee is reasonable for amount being sent
   */
  static validateFeeForAmount(
    feeAmount: number,
    sendAmount: number,
    maxFeePercentage: number = 10
  ): { isValid: boolean; message?: string } {
    if (feeAmount <= 0) {
      return { isValid: false, message: 'Fee amount must be positive' }
    }

    if (sendAmount <= 0) {
      return { isValid: false, message: 'Send amount must be positive' }
    }

    const feePercentage = (feeAmount / sendAmount) * 100

    if (feePercentage > maxFeePercentage) {
      return { 
        isValid : false, 
        message : `Fee is ${feePercentage.toFixed(1)}% of send amount (max recommended: ${maxFeePercentage}%)` 
      }
    }

    // Warn for high fees but don't block
    if (feePercentage > 5) {
      return { 
        isValid : true, 
        message : `Fee is ${feePercentage.toFixed(1)}% of send amount - consider if this is acceptable` 
      }
    }

    return { isValid: true }
  }

  /**
   * CONVENIENCE METHODS
   */

  /**
   * Get current recommended fee rate
   */
  static async getRecommendedFeeRate(priority: 'economy' | 'slow' | 'normal' | 'fast' = 'normal'): Promise<number> {
    const rates = await this.getEnhancedFeeEstimates()
    return rates[priority]
  }

  /**
   * Estimate total cost for a transaction
   */
  static async estimateTransactionCost(
    sendAmount: number,
    inputCount: number,
    outputCount: number,
    priority: 'economy' | 'slow' | 'normal' | 'fast' = 'normal'
  ): Promise<{
    sendAmount: number
    feeAmount: number
    totalCost: number
    feeRate: number
    estimatedSize: number
  }> {
    const feeRate = await this.getRecommendedFeeRate(priority)
    const estimatedSize = this.estimateTransactionSize(inputCount, outputCount)
    const feeAmount = this.estimateTransactionFee(estimatedSize, feeRate)
    
    return {
      sendAmount,
      feeAmount,
      totalCost : sendAmount + feeAmount,
      feeRate,
      estimatedSize
    }
  }

  /**
   * Get fee summary for display
   */
  static async getFeeSummary(
    txSizeVBytes: number
  ): Promise<{
    options: FeeOption[]
    recommended: FeeOption
    rates: EnhancedFeeRates
  }> {
    const options = await this.calculateFeeOptions(txSizeVBytes)
    const rates = await this.getEnhancedFeeEstimates()
    
    // Find recommended option (normal priority)
    const recommended = options.find(opt => opt.name === 'Normal') || options[2]
    
    return {
      options,
      recommended,
      rates
    }
  }
}

// Export singleton-style static methods as default
export default FeeService