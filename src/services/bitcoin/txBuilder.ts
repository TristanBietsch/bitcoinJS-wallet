import * as bitcoin from 'bitcoinjs-lib'
import type {
  BuildTransactionParams,
  TransactionFeeDetails,
  NormalizedUTXO,
  TransactionOutput,
} from '../../types/tx.types'
import { DUST_THRESHOLD, estimateTxVirtualBytes } from '../../utils/bitcoin/utils'

// Placeholder for master fingerprint - in a real app, this comes from your HD root key
const PLACEHOLDER_MASTER_FINGERPRINT = Buffer.from('00000000', 'hex')

/**
 * Builds a PSBT (Partially Signed Bitcoin Transaction).
 *
 * Note: This function assumes that NormalizedUTXO inputs will have their `path` and `publicKey`
 * properties populated for SegWit inputs. For P2WPKH, it also needs the `scriptPubKey` of the UTXO being spent.
 * This implementation primarily focuses on P2WPKH inputs for simplicity.
 */
export function buildTransaction(
  params: BuildTransactionParams
): { psbt: bitcoin.Psbt; feeDetails: TransactionFeeDetails } {
  const { inputs, outputs, feeRate, changeAddress, network } = params

  if (!inputs || inputs.length === 0) {
    throw new Error('Transaction must have at least one input.')
  }
  if (!outputs || outputs.length === 0) {
    throw new Error('Transaction must have at least one output (recipient).')
  }
  if (!changeAddress) {
    throw new Error('Change address is required.')
  }

  const psbt = new bitcoin.Psbt({ network })

  let totalInputValue = 0
  inputs.forEach((utxo: NormalizedUTXO) => {
    totalInputValue += utxo.value

    if (!utxo.publicKey) {
      throw new Error(`UTXO (txid: ${utxo.txid}, vout: ${utxo.vout}) is missing publicKey needed for P2WPKH scriptPubKey.`)
    }
    // Construct P2WPKH scriptPubKey directly from the publicKey
    const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: utxo.publicKey, network })
    if (!p2wpkh.output) {
        throw new Error(`Failed to construct P2WPKH script for UTXO ${utxo.txid}:${utxo.vout}`)
    }
    const scriptPubKey = p2wpkh.output

    const inputToAdd: any = {
      hash        : utxo.txid,
      index       : utxo.vout,
      witnessUtxo : {
        script : scriptPubKey,
        value  : utxo.value,
      },
    }
    if (utxo.path && utxo.publicKey) { // publicKey check is somewhat redundant here but good for clarity
      inputToAdd.bip32Derivation = [
        {
          masterFingerprint : PLACEHOLDER_MASTER_FINGERPRINT,
          path              : utxo.path,
          pubkey            : utxo.publicKey,
        },
      ]
    } else {
      // This case should ideally be caught by the !utxo.publicKey check above if path also implies publicKey
      console.warn(`UTXO ${utxo.txid}:${utxo.vout} is missing path or publicKey for BIP32 derivation info.`)
    }
    psbt.addInput(inputToAdd)
  })

  let totalOutputValue = 0
  outputs.forEach((output: TransactionOutput) => {
    if (output.value <= 0 || output.value <= DUST_THRESHOLD) {
        throw new Error(`Output value for address ${output.address} must be greater than dust threshold (${DUST_THRESHOLD} sats). Value: ${output.value}`)
    }
    psbt.addOutput({
      address : output.address,
      value   : output.value,
    })
    totalOutputValue += output.value
  })

  // Initial fee & weight estimation assuming a change output might be needed
  const initialEstimatedWeight = estimateTxVirtualBytes(
    inputs.length, 
    outputs.length + 1, // +1 for potential change output
    inputs.map(() => 'P2WPKH'), 
    [ ...outputs.map(() => 'P2WPKH'), 'P2WPKH' ] 
  )
  const initialCalculatedFee = Math.ceil(initialEstimatedWeight * feeRate)

  if (totalInputValue < totalOutputValue + initialCalculatedFee) {
    throw new Error(
      `Insufficient funds. Needed: ${totalOutputValue + initialCalculatedFee} (outputs + initial fee), Available: ${totalInputValue}. Fee: ${initialCalculatedFee}`
    )
  }

  const changeValue = totalInputValue - totalOutputValue - initialCalculatedFee
  let finalFeeDetails: TransactionFeeDetails

  if (changeValue > DUST_THRESHOLD) {
    psbt.addOutput({
      address : changeAddress,
      value   : changeValue,
    })
    finalFeeDetails = {
      feeRate,
      estimatedWeight : initialEstimatedWeight, // Weight estimate included change
      calculatedFee   : initialCalculatedFee,     // Fee was based on this weight
    }
  } else {
    // Change is dust, zero, or negative (though negative should be caught by insufficient funds).
    // No change output is added. The actual fee paid is totalInputValue - totalOutputValue.
    const actualFeePaid = totalInputValue - totalOutputValue

    if (actualFeePaid < 0) { // Should ideally not happen if prior check is robust
      throw new Error(`Internal error: Negative fee (${actualFeePaid}) calculated when change is dust or zero.`)
    }

    // Re-estimate weight for a transaction with NO change output for more accurate reporting.
    const estimatedWeightWithoutChange = estimateTxVirtualBytes(
      inputs.length,
      outputs.length, // Only recipient outputs, no change
      inputs.map(() => 'P2WPKH'),
      outputs.map(() => 'P2WPKH')
    )
    
    finalFeeDetails = {
      feeRate,
      estimatedWeight : estimatedWeightWithoutChange, // More accurate weight for the actual tx
      calculatedFee   : actualFeePaid,
    }
  }

  return { psbt, feeDetails: finalFeeDetails }
} 