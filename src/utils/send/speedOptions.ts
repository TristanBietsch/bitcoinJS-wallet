import { SpeedOption } from '@/src/types/domain/transaction'
import { getEnhancedFeeEstimates, estimateTransactionFee } from '@/src/services/bitcoin/feeEstimationService'

// Default transaction size for fee estimation (average 1-2 inputs, 2 outputs)
const AVERAGE_TX_SIZE_VBYTES = 200

/**
 * Get real-time speed options with current Bitcoin network fee rates
 */
export const getSpeedOptions = async (): Promise<SpeedOption[]> => {
  try {
    const feeRates = await getEnhancedFeeEstimates()
    
    return [
      {
        id    : 'economy',
        label : 'Economy',
        fee   : {
          sats : estimateTransactionFee(AVERAGE_TX_SIZE_VBYTES, feeRates.economy)
        },
        feeRate         : feeRates.economy,
        estimatedTime   : '~24 hours',
        estimatedBlocks : feeRates.confirmationTargets.economy
      },
      {
        id    : 'standard',
        label : 'Standard', 
        fee   : {
          sats : estimateTransactionFee(AVERAGE_TX_SIZE_VBYTES, feeRates.normal)
        },
        feeRate         : feeRates.normal,
        estimatedTime   : '~1 hour',
        estimatedBlocks : feeRates.confirmationTargets.normal
      },
      {
        id    : 'express',
        label : 'Express',
        fee   : {
          sats : estimateTransactionFee(AVERAGE_TX_SIZE_VBYTES, feeRates.fast)
        },
        feeRate         : feeRates.fast,
        estimatedTime   : '~10 minutes',
        estimatedBlocks : feeRates.confirmationTargets.fast
      }
    ]
  } catch (error) {
    console.error('Failed to fetch real-time fee rates, using fallback:', error)
    
    // Fallback to conservative estimates if API fails
    return [
      {
        id    : 'economy',
        label : 'Economy',
        fee   : {
          sats : estimateTransactionFee(AVERAGE_TX_SIZE_VBYTES, 1)
        },
        feeRate         : 1,
        estimatedTime   : '~24 hours',
        estimatedBlocks : 144
      },
      {
        id    : 'standard',
        label : 'Standard',
        fee   : {
          sats : estimateTransactionFee(AVERAGE_TX_SIZE_VBYTES, 10)
        },
        feeRate         : 10,
        estimatedTime   : '~1 hour',
        estimatedBlocks : 6
      },
      {
        id    : 'express',
        label : 'Express',
        fee   : {
          sats : estimateTransactionFee(AVERAGE_TX_SIZE_VBYTES, 25)
        },
        feeRate         : 25,
        estimatedTime   : '~10 minutes',
        estimatedBlocks : 1
      }
    ]
  }
}

/**
 * Get formatted fee rate as string for display
 */
export const getFormattedFeeRate = (feeRate: number): string => {
  return `${feeRate} sat/vB`
}

/**
 * Legacy array export for backward compatibility - will be populated by calling getSpeedOptions()
 * @deprecated Use getSpeedOptions() instead for real-time data
 */
export let speedOptions: SpeedOption[] = []

// Initialize with fallback data synchronously for immediate use
speedOptions = [
  {
    id              : 'economy',
    label           : 'Economy',
    fee             : { sats: 200 },
    feeRate         : 1,
    estimatedTime   : '~24 hours',
    estimatedBlocks : 144
  },
  {
    id              : 'standard',
    label           : 'Standard',
    fee             : { sats: 2000 },
    feeRate         : 10,
    estimatedTime   : '~1 hour',
    estimatedBlocks : 6
  },
  {
    id              : 'express',
    label           : 'Express',
    fee             : { sats: 5000 },
    feeRate         : 25,
    estimatedTime   : '~10 minutes',
    estimatedBlocks : 1
  }
] 