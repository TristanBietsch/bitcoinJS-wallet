export interface SpeedOption {
  id: string
  label: string
  fee?: {
    sats: number
    usd?: number  // Optional for backward compatibility
  }
  feeRate?: number  // Fee rate in sats/vbyte
  estimatedTime?: string  // Human-readable time estimate
  estimatedBlocks?: number  // Estimated blocks for confirmation
}

export interface CustomFee {
  totalSats: number
  confirmationTime: number  // in minutes
  feeRate: number  // in sats/vbyte
}

export type SpeedTier = 'economy' | 'standard' | 'express' | 'custom' 