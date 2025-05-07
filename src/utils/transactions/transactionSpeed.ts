import { SpeedOption } from '@/src/types/domain/transaction'
import { transactionFees } from '@/tests/mockData/transactionData'

export const speedOptions: SpeedOption[] = [
  {
    id    : 'economy',
    label : 'Economy',
    fee   : {
      sats : transactionFees.tiers.economy.sats,
      usd  : transactionFees.tiers.economy.usd
    }
  },
  {
    id    : 'standard',
    label : 'Standard',
    fee   : {
      sats : transactionFees.tiers.standard.sats,
      usd  : transactionFees.tiers.standard.usd
    }
  },
  {
    id    : 'express',
    label : 'Express',
    fee   : {
      sats : transactionFees.tiers.express.sats,
      usd  : transactionFees.tiers.express.usd
    }
  }
]

export const getFormattedUsdFee = (sats: number): string => {
  return (sats * transactionFees.conversion.satToDollar).toFixed(2)
} 