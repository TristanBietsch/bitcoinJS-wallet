import * as bitcoin from 'bitcoinjs-lib'

/**
 * Standard dust threshold in satoshis. Outputs below this value are generally considered uneconomical.
 * For P2WPKH, it's 294 sats, but 546 is a common safer threshold for P2PKH.
 */
export const DUST_THRESHOLD = 546 // Satoshis

/**
 * Estimates the virtual size of a Bitcoin transaction.
 * This is a simplified estimator and should be adjusted based on actual input/output script types used.
 * 
 * Weights:
 * - P2WPKH input: ~68 vBytes (unlocking script + witness)
 * - P2PKH input: ~148 vBytes
 * - P2SH-P2WPKH input: ~91 vBytes
 * - P2WPKH output: 31 vBytes
 * - P2PKH output: 34 vBytes
 * - P2SH output: 32 vBytes
 * - Base transaction overhead (version, locktime, input/output counts): ~10-11 vBytes
 *
 * @param inputCount Number of inputs.
 * @param outputCount Number of outputs (including change).
 * @param inputTypes Array of strings indicating input types (e.g., 'P2WPKH', 'P2PKH'). Defaults to P2WPKH if not provided.
 * @param outputTypes Array of strings indicating output types. Defaults to P2WPKH if not provided.
 * @returns Estimated virtual size in vBytes.
 */
export function estimateTxVirtualBytes(
  inputCount: number,
  outputCount: number,
  inputTypes?: string[],
  outputTypes?: string[]
): number {
  let totalVBytes = 10.5 // Base overhead (version, locktime, marker, flag, etc.)

  // Add input sizes
  for (let i = 0; i < inputCount; i++) {
    const type = inputTypes && inputTypes[i] ? inputTypes[i] : 'P2WPKH' // Default to P2WPKH
    switch (type) {
      case 'P2PKH':
        totalVBytes += 148
        break
      case 'P2SH-P2WPKH':
        totalVBytes += 91
        break
      case 'P2WPKH':
      default:
        totalVBytes += 68
        break
    }
  }

  // Add output sizes
  for (let i = 0; i < outputCount; i++) {
    const type = outputTypes && outputTypes[i] ? outputTypes[i] : 'P2WPKH' // Default to P2WPKH
    switch (type) {
      case 'P2PKH':
        totalVBytes += 34
        break
      case 'P2SH':
        totalVBytes += 32
        break
      case 'P2WPKH':
      default:
        totalVBytes += 31
        break
    }
  }
  return Math.ceil(totalVBytes)
}

/**
 * Derives the scriptPubKey (Buffer) for a given Bitcoin address and network.
 * This is crucial for constructing the `witnessUtxo` for SegWit inputs.
 *
 * @param address The Bitcoin address (e.g., bech32 for P2WPKH, base58 for P2PKH).
 * @param network The bitcoinjs-lib network object.
 * @returns The scriptPubKey as a Buffer.
 * @throws Error if the address is invalid or type is not supported for scriptPubKey generation here.
 */
export function getScriptPubKeyForAddress(address: string, network: bitcoin.networks.Network): Buffer {
  try {
    return bitcoin.address.toOutputScript(address, network)
  } catch (e) {
    console.error(`Failed to convert address to output script: ${address}`, e)
    throw new Error(`Invalid address or unsupported address type for scriptPubKey generation: ${address}`)
  }
} 