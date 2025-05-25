import { getEnhancedFeeEstimates, estimateTransactionFee } from '@/src/services/bitcoin/feeEstimationService'

// Default transaction size for fee calculations
const DEFAULT_TX_SIZE_VBYTES = 200

/**
 * Get speed options with real-time fee rates
 * @deprecated Use getSpeedOptions from utils/send/speedOptions.ts instead
 */
export const getSpeedOptions = async () => {
  try {
    const feeRates = await getEnhancedFeeEstimates()
    
    return {
      economy : {
        sats    : estimateTransactionFee(DEFAULT_TX_SIZE_VBYTES, feeRates.economy),
        feeRate : feeRates.economy
      },
      standard : {
        sats    : estimateTransactionFee(DEFAULT_TX_SIZE_VBYTES, feeRates.normal),
        feeRate : feeRates.normal
      },
      express : {
        sats    : estimateTransactionFee(DEFAULT_TX_SIZE_VBYTES, feeRates.fast),
        feeRate : feeRates.fast
      }
    }
  } catch (error) {
    console.error('Failed to fetch real-time fee rates:', error)
    
    // Fallback to conservative estimates
    return {
      economy : {
        sats    : estimateTransactionFee(DEFAULT_TX_SIZE_VBYTES, 1),
        feeRate : 1
      },
      standard : {
        sats    : estimateTransactionFee(DEFAULT_TX_SIZE_VBYTES, 10),
        feeRate : 10
      },
      express : {
        sats    : estimateTransactionFee(DEFAULT_TX_SIZE_VBYTES, 25),
        feeRate : 25
      }
    }
  }
}

/**
 * Fallback speed options for immediate use (before async loading)
 * @deprecated Use getSpeedOptions from utils/send/speedOptions.ts instead
 */
export const speedOptions = {
  economy : {
    sats    : 200,
    feeRate : 1
  },
  standard : {
    sats    : 2000,
    feeRate : 10
  },
  express : {
    sats    : 5000,
    feeRate : 25
  }
} 