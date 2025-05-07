/**
 * Bitcoin Blockchain Service
 * 
 * Provides blockchain-related functionality like querying chain info,
 * blocks, and estimating fees.
 */

import { BlockchainInfo, FeeEstimation } from '../../../types/bitcoin'
import { callRpc } from '../rpc/rpcClient'

/**
 * Get blockchain information
 */
export async function getBlockchainInfo(): Promise<BlockchainInfo> {
  return callRpc<BlockchainInfo>('getblockchaininfo', [])
}

/**
 * Get network info
 */
export async function getNetworkInfo(): Promise<any> {
  return callRpc<any>('getnetworkinfo', [])
}

/**
 * Get raw block by hash
 */
export async function getBlock(blockHash: string, verbosity: number = 1): Promise<any> {
  return callRpc<any>('getblock', [ blockHash, verbosity ])
}

/**
 * Get block hash by height
 */
export async function getBlockHash(height: number): Promise<string> {
  return callRpc<string>('getblockhash', [ height ])
}

/**
 * Get block count (current chain height)
 */
export async function getBlockCount(): Promise<number> {
  return callRpc<number>('getblockcount', [])
}

/**
 * Estimate smart fee (satoshis per byte)
 */
export async function estimateSmartFee(
  confirmTarget: number = 6
): Promise<FeeEstimation> {
  return callRpc<FeeEstimation>('estimatesmartfee', [ confirmTarget ])
}

/**
 * Get multiple fee estimates for different confirmation targets
 */
export async function getFeeEstimates(): Promise<{ 
  highFee: number; 
  mediumFee: number; 
  lowFee: number;
}> {
  try {
    const [ high, medium, low ] = await Promise.all([
      estimateSmartFee(1),  // High priority (next block)
      estimateSmartFee(6),  // Medium priority (~ 1 hour)
      estimateSmartFee(24)  // Low priority (~ 4 hours)
    ])
    
    return {
      highFee   : high.feerate || 0.0001,
      mediumFee : medium.feerate || 0.00005,
      lowFee    : low.feerate || 0.00001
    }
  } catch (error) {
    console.error('Error getting fee estimates:', error)
    // Fallback values if estimation fails
    return {
      highFee   : 0.0001,   // 10 sat/byte
      mediumFee : 0.00005, // 5 sat/byte
      lowFee    : 0.00001    // 1 sat/byte
    }
  }
} 