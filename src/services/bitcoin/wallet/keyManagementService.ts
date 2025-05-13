import * as bip39 from 'bip39'
import * as bitcoin from 'bitcoinjs-lib'
import { BIP32Factory } from 'bip32'
import * as ecc from '@bitcoinerlab/secp256k1'

// Initialize the BIP32 factory with the secp256k1 implementation
const bip32 = BIP32Factory(ecc)

/**
 * Validates a seed phrase (mnemonic)
 * @param mnemonic The seed phrase to validate
 * @returns Whether the mnemonic is valid
 */
export const validateMnemonic = (mnemonic: string): boolean => {
  try {
    return bip39.validateMnemonic(mnemonic)
  } catch (error) {
    console.error('Error validating mnemonic:', error)
    return false
  }
}

/**
 * Generates a root key from a mnemonic
 * @param mnemonic The seed phrase
 * @param network The bitcoin network
 * @returns The root key object
 */
export const generateRootKeyFromMnemonic = (
  mnemonic: string,
  network: bitcoin.networks.Network
) => {
  try {
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    return bip32.fromSeed(seed, network)
  } catch (error) {
    console.error('Error generating root key:', error)
    throw new Error('Failed to generate wallet from seed phrase')
  }
}

/**
 * Get the derivation path based on the address type
 */
export const getDerivationPath = (
  addressType: 'legacy' | 'segwit' | 'native_segwit',
  accountIndex: number = 0
): string => {
  // BIP44: m/44'/0'/0' - Legacy addresses (P2PKH)
  // BIP49: m/49'/0'/0' - SegWit addresses (P2SH-P2WPKH)
  // BIP84: m/84'/0'/0' - Native SegWit addresses (P2WPKH)
  
  const PURPOSE = addressType === 'legacy' ? 44 : addressType === 'segwit' ? 49 : 84
  const COIN_TYPE = 0 // 0 for Bitcoin, 1 for Bitcoin testnet
  
  return `m/${PURPOSE}'/${COIN_TYPE}'/${accountIndex}'`
} 