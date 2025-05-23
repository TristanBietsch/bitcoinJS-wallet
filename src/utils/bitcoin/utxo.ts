import type { NormalizedUTXO } from '../../types/tx.types' // Adjusted path
import type { EnhancedUTXO } from '../../types/blockchain.types'
// import * as bitcoin from 'bitcoinjs-lib'; // If needed for scriptPubKey generation or other utils
// import { BIP32Interface } from 'bip32'; // If key derivation happens here



/**
 * Enhanced coin selection algorithm that considers address types and privacy
 * Prioritizes native segwit UTXOs for lower fees and prefers larger UTXOs to minimize inputs
 */
export function selectUtxosEnhanced(
  availableUtxos: Array<EnhancedUTXO & { publicKey: Buffer }>,
  targetAmount: number,
  feePerByte: number,
  options: {
    preferAddressType?: 'native_segwit' | 'segwit' | 'legacy'
    includeUnconfirmed?: boolean
    minimizeInputs?: boolean
  } = {}
): { selectedUtxos: NormalizedUTXO[], totalFee: number, totalSelectedValue: number, changeAmount: number } | null {
  const { 
    preferAddressType = 'native_segwit', 
    includeUnconfirmed = false,
    minimizeInputs = true 
  } = options

  if (!availableUtxos || availableUtxos.length === 0) return null

  // Filter UTXOs by confirmation status
  let filteredUtxos = includeUnconfirmed 
    ? availableUtxos 
    : availableUtxos.filter(utxo => utxo.status.confirmed)

  if (filteredUtxos.length === 0) return null

  // Sort UTXOs for optimal selection
  const sortedUtxos = [ ...filteredUtxos ].sort((a, b) => {
    // Prefer specified address type
    if (a.addressType === preferAddressType && b.addressType !== preferAddressType) return -1
    if (b.addressType === preferAddressType && a.addressType !== preferAddressType) return 1
    
    // Then sort by size (largest first if minimizing inputs, smallest first otherwise)
    return minimizeInputs ? b.value - a.value : a.value - b.value
  })

  let selectedUtxos: NormalizedUTXO[] = []
  let currentTotalValue = 0

  // Base transaction size estimation
  const getInputSize = (addressType: 'legacy' | 'segwit' | 'native_segwit'): number => {
    switch (addressType) {
      case 'legacy': return 148        // P2PKH input
      case 'segwit': return 91         // P2SH-P2WPKH input  
      case 'native_segwit': return 68  // P2WPKH input
      default: return 68
    }
  }

  const outputSize = 31 // P2WPKH output size
  const baseTransactionSize = 10 // Version, locktime, etc.

  for (const utxo of sortedUtxos) {
    selectedUtxos.push(utxo as NormalizedUTXO)
    currentTotalValue += utxo.value

    // Calculate current transaction size and fee
    const currentTxSize = baseTransactionSize + 
      selectedUtxos.reduce((acc, u) => acc + getInputSize(u.addressType), 0) +
      outputSize + // recipient output
      outputSize   // potential change output

    const estimatedFee = Math.ceil(currentTxSize * feePerByte)
    const changeAmount = currentTotalValue - targetAmount - estimatedFee

    // Check if we have enough to cover target + fee
    if (currentTotalValue >= targetAmount + estimatedFee) {
      const DUST_THRESHOLD = 546 // Standard dust threshold
      
      if (changeAmount >= DUST_THRESHOLD || changeAmount === 0) {
        // We have a valid solution
        return { 
          selectedUtxos, 
          totalFee           : estimatedFee, 
          totalSelectedValue : currentTotalValue,
          changeAmount       : Math.max(0, changeAmount)
        }
      } else if (changeAmount > 0 && changeAmount < DUST_THRESHOLD) {
        // Change is dust, add it to fee
        const feeWithDust = estimatedFee + changeAmount
        return { 
          selectedUtxos, 
          totalFee           : feeWithDust, 
          totalSelectedValue : currentTotalValue,
          changeAmount       : 0
        }
      }
    }
  }

  // Insufficient funds
  return null
}

/**
 * Legacy function maintained for backward compatibility
 * Now delegates to the enhanced version
 */
export function selectUtxosSimple(
  availableUtxos: NormalizedUTXO[],
  targetAmount: number,
  feePerByte: number
): { selectedUtxos: NormalizedUTXO[], totalFee: number, totalSelectedValue: number } | null {
  
  // Convert to enhanced format for processing
  const enhancedUtxos = availableUtxos.map(utxo => ({
    ...utxo,
    // Use existing data if available, otherwise use defaults
    addressType    : utxo.addressType || 'native_segwit' as const,
    address        : utxo.address || 'unknown',
    derivationPath : utxo.derivationPath || 'm/84\'/1\'/0\'/0/0',
    addressIndex   : utxo.addressIndex || 0
  }))

  const result = selectUtxosEnhanced(enhancedUtxos, targetAmount, feePerByte, {
    includeUnconfirmed : true,
    minimizeInputs     : true
  })

  if (!result) return null

  return {
    selectedUtxos      : result.selectedUtxos,
    totalFee           : result.totalFee,
    totalSelectedValue : result.totalSelectedValue
  }
}

/**
 * Analyzes UTXO set for optimization opportunities
 */
export function analyzeUtxoSet(utxos: EnhancedUTXO[]): {
  totalValue: number
  confirmedValue: number
  unconfirmedValue: number
  addressTypeDistribution: Record<string, { count: number; value: number }>
  dustUtxos: EnhancedUTXO[]
  largeUtxos: EnhancedUTXO[]
  privacyScore: number
} {
  let totalValue = 0
  let confirmedValue = 0
  let unconfirmedValue = 0
  const addressTypeDistribution: Record<string, { count: number; value: number }> = {}
  const dustUtxos: EnhancedUTXO[] = []
  const largeUtxos: EnhancedUTXO[] = []
  
  const DUST_THRESHOLD = 546
  const LARGE_UTXO_THRESHOLD = 1000000 // 0.01 BTC

  utxos.forEach(utxo => {
    totalValue += utxo.value
    
    if (utxo.status.confirmed) {
      confirmedValue += utxo.value
    } else {
      unconfirmedValue += utxo.value
    }

    // Address type distribution
    if (!addressTypeDistribution[utxo.addressType]) {
      addressTypeDistribution[utxo.addressType] = { count: 0, value: 0 }
    }
    addressTypeDistribution[utxo.addressType].count++
    addressTypeDistribution[utxo.addressType].value += utxo.value

    // Categorize by size
    if (utxo.value <= DUST_THRESHOLD) {
      dustUtxos.push(utxo)
    } else if (utxo.value >= LARGE_UTXO_THRESHOLD) {
      largeUtxos.push(utxo)
    }
  })

  // Simple privacy score based on UTXO count and distribution
  const utxoCount = utxos.length
  const addressCount = new Set(utxos.map(u => u.address)).size
  const privacyScore = Math.min(100, (addressCount / Math.max(1, utxoCount)) * 100)

  return {
    totalValue,
    confirmedValue,
    unconfirmedValue,
    addressTypeDistribution,
    dustUtxos,
    largeUtxos,
    privacyScore
  }
} 