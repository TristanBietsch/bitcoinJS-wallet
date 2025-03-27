export interface SpeedOption {
  id: string
  label: string
  fee?: {
    sats: number
    usd: number
  }
}

export interface CustomFee {
  totalSats: number
  confirmationTime: number  // in minutes
  feeRate: number  // in sats/vbyte
}

export type SpeedTier = 'economy' | 'standard' | 'express' | 'custom' 