import * as bitcoin from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'
import { BIP32Factory } from 'bip32'
import { Buffer } from 'buffer'
import { seedPhraseService } from './seedPhraseService'
import { BITCOIN_NETWORK, BitcoinNetworkType, DEFAULT_DERIVATION_PATH } from '@/src/config/bitcoinNetwork'

// Initialize bip32 with the secp256k1 implementation
const bip32 = BIP32Factory(ecc)

// Bitcoin network configuration map
const networkConfig = {
  mainnet : bitcoin.networks.bitcoin,
  testnet : bitcoin.networks.testnet,
  regtest : {
    ...bitcoin.networks.testnet, // Regtest uses testnet params with some differences
    bech32 : 'bcrt',             // Different bech32 prefix for regtest
    bip32  : {
      public  : 0x043587cf,       // Same as testnet
      private : 0x04358394       // Same as testnet
    }
  }
}

/**
 * Interface for key pair with metadata
 */
export interface BitcoinKeyPair {
  path : string
  network : BitcoinNetworkType
  publicKey : Buffer
  privateKey : Buffer
  wif : string
  address : string | undefined
  extendedPubKey : string
  extendedPrivKey : string
}

/**
 * Service for Bitcoin key management
 * Handles key derivation, address generation, and key serialization
 */
export const keyManagement = {
  /**
   * Generate a key pair from a seed
   * 
   * @param seed The seed buffer to derive keys from
   * @param path The derivation path
   * @param network The target Bitcoin network
   * @returns Object containing the derived keys and addresses
   */
  deriveFromSeed : (
    seed: Buffer,
    path: string = DEFAULT_DERIVATION_PATH,
    network: BitcoinNetworkType = BITCOIN_NETWORK
  ): BitcoinKeyPair => {
    // Get network configuration
    const networkParams = networkConfig[network]
    
    // Derive the HD node from seed
    const root = bip32.fromSeed(seed, networkParams)
    
    // Derive child key at specified path
    const child = root.derivePath(path)
    
    // Generate a P2WPKH (native segwit) address from the public key
    const payment = bitcoin.payments.p2wpkh({
      pubkey  : child.publicKey,
      network : networkParams
    })
    
    return {
      path,
      network,
      publicKey       : child.publicKey,
      privateKey      : child.privateKey as Buffer,
      wif             : child.toWIF(),
      address         : payment.address,
      extendedPubKey  : child.neutered().toBase58(),
      extendedPrivKey : child.toBase58()
    }
  },
  
  /**
   * Generate a key pair from a mnemonic seed phrase
   * 
   * @param mnemonic The mnemonic seed phrase
   * @param path The derivation path
   * @param network The target Bitcoin network
   * @returns Promise resolving to an object containing the derived keys and addresses
   */
  deriveFromMnemonic : async (
    mnemonic: string,
    path: string = DEFAULT_DERIVATION_PATH,
    network: BitcoinNetworkType = BITCOIN_NETWORK
  ): Promise<BitcoinKeyPair> => {
    // Validate the mnemonic
    const isValid = seedPhraseService.validateMnemonic(mnemonic)
    if (!isValid) {
      throw new Error('Invalid mnemonic seed phrase')
    }
    
    // Convert mnemonic to seed
    const seed = await seedPhraseService.mnemonicToSeed(mnemonic)
    
    // Derive keys from seed
    return keyManagement.deriveFromSeed(seed, path, network)
  },
  
  /**
   * Verify that a seed phrase correctly restores a specific address
   * 
   * @param mnemonic The mnemonic seed phrase to verify
   * @param expectedAddress The expected address that should be derived
   * @param path The derivation path to use
   * @param network The target Bitcoin network
   * @returns Promise resolving to a boolean indicating if the address matches
   */
  verifyMnemonicAddress : async (
    mnemonic: string,
    expectedAddress: string,
    path: string = DEFAULT_DERIVATION_PATH,
    network: BitcoinNetworkType = BITCOIN_NETWORK
  ): Promise<boolean> => {
    try {
      const keyPair = await keyManagement.deriveFromMnemonic(mnemonic, path, network)
      return keyPair.address === expectedAddress
    } catch (_error) {
      return false
    }
  },
  
  /**
   * Generate a key pair from random entropy
   * (Creates a mnemonic internally and derives keys from it)
   * 
   * @param path The derivation path
   * @param network The target Bitcoin network
   * @returns Promise resolving to an object containing the mnemonic, keys and address
   */
  generateKeyPair : async (
    path: string = DEFAULT_DERIVATION_PATH,
    network: BitcoinNetworkType = BITCOIN_NETWORK
  ): Promise<{ mnemonic: string } & BitcoinKeyPair> => {
    // Generate random mnemonic
    const mnemonic = seedPhraseService.generateSeedPhrase(12)
    
    // Derive keys from mnemonic
    const keyPair = await keyManagement.deriveFromMnemonic(mnemonic, path, network)
    
    // Return both mnemonic and derived keys
    return {
      mnemonic,
      ...keyPair
    }
  }
} 