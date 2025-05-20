import * as bitcoin from 'bitcoinjs-lib'
import * as bip39 from 'bip39'
import { BIP32Factory } from 'bip32'
import { ECPairFactory } from 'ecpair'
import * as ecc from 'tiny-secp256k1' // Use tiny-secp256k1 directly
import type { SignTransactionParams } from '../../types/tx.types'

// Initialize BIP32 factory with tiny-secp256k1
const bip32 = BIP32Factory(ecc)

// Initialize bitcoinjs-lib with tiny-secp256k1
// This should ideally be done once at the application's entry point,
// but for service modularity, we can ensure it here or expect it to be done.
bitcoin.initEccLib(ecc)

// Create ECPair interface from the factory
const ECPair = ECPairFactory(ecc)

/**
 * Signs a PSBT (Partially Signed Bitcoin Transaction) using a mnemonic seed phrase.
 *
 * @param params - Parameters including the PSBT, mnemonic, and network.
 * @returns The signed transaction hex string.
 * @throws Error if signing fails, mnemonic is invalid, or private keys cannot be derived.
 */
export async function signTransaction(params: SignTransactionParams): Promise<string> {
  const { psbt, mnemonic, network } = params

  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic seed phrase provided for signing.')
  }

  const seed = await bip39.mnemonicToSeed(mnemonic)
  const root = bip32.fromSeed(seed, network) // network should be bitcoinjs-lib network object

  // Iterate over each input in the PSBT
  // We need to ensure that the `bip32Derivation` field was correctly populated in the txBuilder
  // for each input, as it contains the path needed to derive the correct private key.
  psbt.data.inputs.forEach((input, index) => {
    if (!input.bip32Derivation || input.bip32Derivation.length === 0) {
      // If there are inputs that are not ours or don't have derivation info,
      // we might choose to skip them or throw an error if all inputs must be signed by us.
      // For a simple wallet, we usually expect all inputs to be signable.
      console.warn(`Input ${index} is missing BIP32 derivation information. Cannot sign this input.`)
      // Depending on PSBT finalization rules, this might still work if other signers are involved,
      // or fail if this input was expected to be signed by this key.
      // For now, we attempt to sign only those with derivation paths.
      return // Skip this input if no derivation path
    }

    // Assuming the first derivation path is the one to use for this wallet's signature
    const derivation = input.bip32Derivation[0]
    if (!derivation.path) {
        console.warn(`Input ${index} has BIP32 derivation info but is missing the path string.`)
        return // Skip if path is missing
    }

    try {
      const childNode = root.derivePath(derivation.path)
      if (!childNode || !childNode.privateKey) {
        // This should ideally not happen if the path and root are correct
        throw new Error(`Failed to derive private key for input ${index} using path ${derivation.path}`)
      }
      // Convert BIP32 node to ECPair
      const keyPair = ECPair.fromPrivateKey(childNode.privateKey, { network })
      
      // Fix the type error by creating a compatible signer object
      const signer = {
        publicKey : Buffer.from(keyPair.publicKey),
        sign      : (hash: Buffer) => Buffer.from(keyPair.sign(hash))
      }
      
      psbt.signInput(index, signer)
    } catch (e) {
      console.error(`Error signing input ${index} with path ${derivation.path}:`, e)
      // Rethrow or accumulate errors, for now, let it throw to stop the process
      throw new Error(`Failed to sign input ${index}: ${e instanceof Error ? e.message : String(e)}`)
    }
  })

  // Validate all signatures before finalizing
  // psbt.validateSignaturesOfInput(inputIndex, validator) // More granular validation if needed

  // Finalize all inputs. This will assemble the witnesses and scripts.
  // It will throw an error if any input cannot be finalized (e.g., missing signature).
  try {
    psbt.finalizeAllInputs() 
  } catch (e) {
    console.error('Failed to finalize PSBT inputs:', e)
    // Provide a more user-friendly error or log details for debugging
    // e.g. check which inputs failed finalization.
    // For now, rethrow with a generic message.
    throw new Error(`Failed to finalize transaction: ${e instanceof Error ? e.message : String(e)}. Ensure all necessary inputs are signed.`)
  }

  // Extract the fully signed transaction
  const transaction = psbt.extractTransaction()
  return transaction.toHex()
} 