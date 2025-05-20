import type { EsploraUTXO } from '../../types/blockchain.types' // Adjusted path
import type { NormalizedUTXO } from '../../types/tx.types' // Adjusted path
// import * as bitcoin from 'bitcoinjs-lib'; // If needed for scriptPubKey generation or other utils
// import { BIP32Interface } from 'bip32'; // If key derivation happens here

/**
 * Placeholder type for a function that maps an address to its derivation path.
 * In a real wallet, this would involve looking up the address in the wallet's known addresses.
 */
export type AddressToPathMapper = (address: string) => string | undefined;

/**
 * Placeholder type for a function that derives a public key from a BIP32 path.
 */
export type PublicKeyDeriver = (path: string) => Buffer;

/**
 * Normalizes UTXOs fetched from Esplora by associating them with their derivation paths
 * and public keys, which are necessary for signing.
 *
 * @param utxos - An array of UTXOs as fetched from Esplora.
 * @param _addressToPathMapper - A function that can map a UTXO's address to its BIP32 derivation path.
 * @param _derivePublicKey - A function that can derive a public key Buffer from a BIP32 path.
 * @returns An array of NormalizedUTXO objects, ready for transaction building.
 */
export function normalizeUtxosForSigning(
  utxos: EsploraUTXO[],
  _addressToPathMapper: AddressToPathMapper,
  _derivePublicKey: PublicKeyDeriver
): NormalizedUTXO[] {
  if (!utxos) return []

  return utxos.map((utxo) => {
    // To get the address from an EsploraUTXO, we need to ensure EsploraUTXO includes
    // scriptpubkey_address or similar. The current EsploraUTXO definition in
    // blockchain.types.ts from previous phases was:
    // export const EsploraUTXOSchema = z.object({
    //   txid: z.string(),
    //   vout: z.number().int().nonnegative(),
    //   status: EsploraStatusSchema,
    //   value: z.number().int().positive(),
    // });
    // This basic schema does NOT contain the address directly.
    // The address is part of the vout object within a full transaction (EsploraTransactionSchema).
    // For UTXOs from /address/:address/utxo, the address is implicitly the one queried.
    // However, for coin selection from a list of *all* wallet UTXOs, each UTXO needs its address info.

    // For this function to work robustly, EsploraUTXO type should ideally include `scriptpubkey_address`.
    // Assuming for now `utxo.scriptpubkey_address` exists (needs type update for EsploraUTXO).
    // If not, this function would need the address that owns the UTXO as an additional parameter, 
    // or the UTXO type needs to be enriched upstream.

    // Let's assume `utxo` has an `address` field for demonstration, or that the upstream source provides it.
    // This part is highly dependent on how your `EsploraUTXO` type is populated or if you fetch further details.
    // For now, we'll make a placeholder for where the address would come from. 
    // In a real scenario, you might need to iterate known wallet addresses and match UTXOs.
    
    // const address = utxo.address; // This field is NOT in the current EsploraUTXO type
    // This function can't work as intended without address info on each UTXO object.
    // Let's modify the function signature slightly for now or assume EsploraUTXO gets updated.
    // For the purpose of this plan, we will proceed ASSUMING `utxo` object will have an `address` field.
    // This would require an update to how UTXOs are fetched or processed before this step.

    // TODO: Resolve how to get the address for each utxo. 
    // For now, skipping path/pubkey derivation if address is missing from utxo object model.
    // const path = address ? addressToPathMapper(address) : undefined;
    // const publicKey = path ? derivePublicKey(path) : undefined;

    const normalized: NormalizedUTXO = {
      ...utxo,
      // path: path, // Uncomment when address resolution is clear
      // publicKey: publicKey, // Uncomment when address resolution is clear
    }
    return normalized
  }).filter(utxo => utxo !== null) as NormalizedUTXO[] // Filter out any potential nulls if mapping fails
}

/**
 * Example: Selects UTXOs to cover a target amount plus estimated fee.
 * This is a simple greedy algorithm.
 *
 * @param availableUtxos - Array of NormalizedUTXO available to spend.
 * @param targetAmount - The amount to send to the recipient(s).
 * @param feePerByte - The desired fee rate in satoshis/vByte.
 * @param estimatedTxOverheadVBytes - Estimated non-input/output virtual bytes for the transaction (e.g., version, locktime, nInputs, nOutputs count).
 * @param bytesPerInput - Estimated virtual bytes per input.
 * @param bytesPerOutput - Estimated virtual bytes per output (for recipient and change).
 * @returns Object containing selected UTXOs and the total fee, or null if insufficient funds.
 */
export function selectUtxosSimple(
  availableUtxos: NormalizedUTXO[],
  targetAmount: number,
  feePerByte: number,
  estimatedTxOverheadVBytes: number = 10, // Base tx vbytes (version, locktime, etc.)
  bytesPerInput: number = 68, // Approx P2WPKH input vbytes
  bytesPerOutput: number = 31 // Approx P2WPKH output vbytes
): { selectedUtxos: NormalizedUTXO[], totalFee: number, totalSelectedValue: number } | null {
  if (!availableUtxos || availableUtxos.length === 0) return null

  let selectedUtxos: NormalizedUTXO[] = []
  let currentTotalValue = 0
  let estimatedFee = 0
  let estimatedWeight = estimatedTxOverheadVBytes + bytesPerOutput // Base + recipient output

  // Sort UTXOs: smallest first can help make exact change, largest first can minimize inputs
  // For simplicity, let's use them as they come or sort descending to pick larger UTXOs first.
  const sortedUtxos = [ ...availableUtxos ].sort((a, b) => b.value - a.value) // largest first

  for (const utxo of sortedUtxos) {
    selectedUtxos.push(utxo)
    currentTotalValue += utxo.value
    estimatedWeight += bytesPerInput // Add weight for this new input
    
    // Estimate fee with current inputs and one change output (worst case for fee)
    const tempEstimatedWeightWithChange = estimatedWeight + bytesPerOutput
    estimatedFee = Math.ceil(tempEstimatedWeightWithChange * feePerByte)

    if (currentTotalValue >= targetAmount + estimatedFee) {
      // Check if we can make change without the change output being dust
      const changeAmount = currentTotalValue - targetAmount - estimatedFee
      const DUST_THRESHOLD = 546 // sats, typical dust threshold

      if (changeAmount >= 0) { // If change is positive or zero
        if (changeAmount < DUST_THRESHOLD && changeAmount > 0) {
          // Change is dust. We can't create a dust output. 
          // The fee will effectively increase to consume this dust.
          // Re-calculate fee without change output for this scenario.
          const feeWithoutChange = Math.ceil(estimatedWeight * feePerByte)
          if (currentTotalValue >= targetAmount + feeWithoutChange) {
            // Selected UTXOs cover amount + fee (where fee consumes dust)
            return { selectedUtxos, totalFee: feeWithoutChange, totalSelectedValue: currentTotalValue }
          } else {
            // Cannot cover even if change is dust, try adding more UTXOs
            continue
          }
        } else {
          // Change is not dust, or zero. This selection is good.
          return { selectedUtxos, totalFee: estimatedFee, totalSelectedValue: currentTotalValue }
        }
      }
      // If changeAmount is negative, currentTotalValue isn't enough yet, loop continues
    }
  }

  // If loop finishes and not enough value was gathered
  return null // Insufficient funds
} 