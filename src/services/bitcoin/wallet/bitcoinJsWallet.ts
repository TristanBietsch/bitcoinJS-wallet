import * as bitcoin from 'bitcoinjs-lib'
import * as bip39 from 'bip39'
import { getEccLib } from '../config/eccProvider'
import { BIP32Factory } from 'bip32'

// Get the React Native compatible ECC implementation
const ecc = getEccLib()

// Initialize bip32 with the ECC provider
const bip32 = BIP32Factory(ecc)

/**
 * Generate a new Bitcoin wallet with mnemonic phrase and address
 * @returns Object containing the mnemonic phrase and derived Bitcoin address
 */
export const generateWallet = async () => {
  const mnemonic = bip39.generateMnemonic()
  const seed = await bip39.mnemonicToSeed(mnemonic)
  const root = bip32.fromSeed(Buffer.from(seed))
  const child = root.derivePath("m/44'/0'/0'/0/0")

  // Convert publicKey to Buffer to ensure type compatibility
  const publicKeyBuffer = Buffer.from(child.publicKey)

  // Create payment with correctly typed buffer
  const payment = bitcoin.payments.p2wpkh({
    pubkey  : publicKeyBuffer,
    network : bitcoin.networks.bitcoin,
  })

  return { mnemonic, address: payment.address }
}

/**
 * Import a Bitcoin wallet from an existing mnemonic phrase
 * @param mnemonic The mnemonic phrase to import
 * @returns Object containing the derived Bitcoin address
 */
export const importWallet = async (mnemonic: string) => {
  const seed = await bip39.mnemonicToSeed(mnemonic)
  const root = bip32.fromSeed(Buffer.from(seed))
  const child = root.derivePath("m/44'/0'/0'/0/0")

  // Convert publicKey to Buffer to ensure type compatibility
  const publicKeyBuffer = Buffer.from(child.publicKey)

  // Create payment with correctly typed buffer
  const payment = bitcoin.payments.p2wpkh({
    pubkey  : publicKeyBuffer,
    network : bitcoin.networks.bitcoin,
  })

  return { address: payment.address }
}

/**
 * Validate if a string is a valid mnemonic phrase
 * @param mnemonic The mnemonic phrase to validate
 * @returns Boolean indicating if the mnemonic is valid
 */
export const validateMnemonic = (mnemonic: string): boolean => {
  return bip39.validateMnemonic(mnemonic)
}

/**
 * Get a wallet private key from mnemonic
 * @param mnemonic The mnemonic phrase
 * @param path The derivation path (default: BIP44 for Bitcoin)
 * @returns The private key in WIF format
 */
export const getPrivateKeyFromMnemonic = async (
  mnemonic: string,
  path: string = "m/44'/0'/0'/0/0"
): Promise<string> => {
  const seed = await bip39.mnemonicToSeed(mnemonic)
  const root = bip32.fromSeed(Buffer.from(seed))
  const child = root.derivePath(path)
  return child.toWIF()
} 