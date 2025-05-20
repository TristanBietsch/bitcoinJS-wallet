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

  // Estimate transaction weight and calculate fee
  // Number of inputs and outputs are now known. Change output will be added if necessary.
  // Assuming primarily P2WPKH inputs and outputs for this estimation.
  const estimatedWeight = estimateTxVirtualBytes(
    inputs.length, 
    outputs.length + 1, // +1 for potential change output
    inputs.map(() => 'P2WPKH'), // Assume all inputs are P2WPKH for this simple estimator
    [ ...outputs.map(() => 'P2WPKH'), 'P2WPKH' ] // Assume outputs and change are P2WPKH
  )
  const calculatedFee = Math.ceil(estimatedWeight * feeRate)

  if (totalInputValue < totalOutputValue + calculatedFee) {
    throw new Error(
      `Insufficient funds. Needed: ${totalOutputValue + calculatedFee}, Available: ${totalInputValue}. Fee: ${calculatedFee}`
    )
  }

  const changeValue = totalInputValue - totalOutputValue - calculatedFee

  if (changeValue > DUST_THRESHOLD) {
    psbt.addOutput({
      address : changeAddress,
      value   : changeValue,
    })
  } else if (changeValue > 0 && changeValue <= DUST_THRESHOLD) {
    // Change is dust, add to fee instead of creating a dust output
    // The PSBT library might handle this by not adding the output, or fee needs recalculation.
    // For simplicity, we assume the fee calculated is what we pay, and this dust amount goes to miners.
    // No action to add output, the fee effectively increases. Check if existing outputs need adjustment
    // or if the fee calculation should be re-run to absorb this. Simpler: let it be absorbed by miners.
    // The `calculatedFee` would then be `totalInputValue - totalOutputValue`.
    // Let's re-evaluate the calculated fee if change is dust:
    const actualFeePaid = totalInputValue - totalOutputValue
    if (actualFeePaid < calculatedFee) {
        // This scenario implies the initial fee calculation was too low if change is now dust.
        // This can get complex. For now, we stick to the initial calculatedFee and if change is dust,
        // it just means the miners get a bit more than the target feeRate if we don't add change output.
        // Or, more correctly, if change is dust, don't create change output, the fee is totalInputValue - totalOutputValue
        // The feeDetails should reflect the *actual* fee paid.
        const feeDetails: TransactionFeeDetails = {
            feeRate,
            estimatedWeight, // This might be slightly off now if change output isn't added
            calculatedFee : actualFeePaid, 
          }
          // No change output is added. The fee is now totalInputValue - totalOutputValue.
          // We must ensure this new fee is acceptable (e.g. not negative, and reasonable)
          if (actualFeePaid < 0) throw new Error("Internal error: Negative fee after attempting to handle dust.")
          // Update fee details to reflect actual fee if change is dust and not added.
          return { psbt, feeDetails }
    }
    // If changeValue is dust, it means it will be added to the fee.
    // The psbt.addOutput for change will not be called.
    // The effective fee will be totalInputValue - totalOutputValue.
  }
  // If changeValue is 0, no change output is added.
  // If changeValue is negative, the insufficient funds error above should have caught it.

  const feeDetails: TransactionFeeDetails = {
    feeRate,
    estimatedWeight,
    calculatedFee,
  }

  return { psbt, feeDetails }
} 