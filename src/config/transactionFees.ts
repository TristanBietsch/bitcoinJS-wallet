import { transactionFees } from '@/tests/mockData/transactionData'

/**
 * Speed options with their fees for transaction processing
 */
export const speedOptions = {
  economy : {
    sats    : transactionFees.tiers.economy.sats,
    usd     : transactionFees.tiers.economy.usd,
    feeRate : transactionFees.tiers.economy.feeRate
  },
  standard : {
    sats    : transactionFees.tiers.standard.sats,
    usd     : transactionFees.tiers.standard.usd,
    feeRate : transactionFees.tiers.standard.feeRate
  },
  express : {
    sats    : transactionFees.tiers.express.sats,
    usd     : transactionFees.tiers.express.usd,
    feeRate : transactionFees.tiers.express.feeRate
  }
} 