import * as bitcoin from 'bitcoinjs-lib'
import * as bip39 from 'bip39'
import * as ecc from 'tiny-secp256k1'
import { BIP32Factory } from 'bip32'

// Initialize bip32 with the secp256k1 implementation
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
  const { address } = bitcoin.payments.p2wpkh({
    pubkey  : child.publicKey,
    network : bitcoin.networks.bitcoin,
  })
  return { mnemonic, address }
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
  const { address } = bitcoin.payments.p2wpkh({
    pubkey  : child.publicKey,
    network : bitcoin.networks.bitcoin,
  })
  return { address }
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