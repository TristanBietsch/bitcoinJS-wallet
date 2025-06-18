/**
 * Consolidated Bitcoin Wallet Service
 * Combines functionality from wallet/, seedPhraseService, keyManagementService, etc.
 */
import * as bitcoin from 'bitcoinjs-lib'
import * as bip39 from 'bip39'
import { BIP32Factory } from 'bip32'
import * as ecc from '@bitcoinerlab/secp256k1'
import { Buffer } from 'buffer'
import * as SecureStore from 'expo-secure-store'
import { BITCOIN_NETWORK, BitcoinNetworkType, DEFAULT_DERIVATION_PATH } from '@/src/config/bitcoinNetwork'
import { BitcoinTransaction, Utxo, WalletInfo } from '@/src/types/api'
import { BitcoinAddressError, BitcoinRpcError } from './errors/rpcErrors'
import { callRpc } from './rpc/rpcClient'
// We'll implement address validation inline since we're consolidating services

// Initialize the BIP32 factory
const bip32 = BIP32Factory(ecc)

// Constants
const SECURE_SEED_PHRASE_KEY = 'com.nummus.wallet.seed_phrase'
const isDevelopment = __DEV__

// Network configuration
const networkConfig = {
  mainnet: bitcoin.networks.bitcoin,
  testnet: bitcoin.networks.testnet,
  regtest: {
    ...bitcoin.networks.testnet,
    bech32: 'bcrt',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394
    }
  }
}

// Types
export type WordCount = 12 | 24

export interface BitcoinKeyPair {
  path: string
  network: BitcoinNetworkType
  publicKey: Buffer
  privateKey: Buffer | null
  wif: string | null
  address: string | undefined
  hdPath: string
}

export interface BitcoinWallet {
  id: string
  network: bitcoin.networks.Network
  addresses: {
    legacy: string[]
    segwit: string[]
    nativeSegwit: string[]
  }
  balances: {
    confirmed: number
    unconfirmed: number
  }
}

/**
 * Consolidated Wallet Service
 */
export class WalletService {
  // Temporary storage for development mode only
  private static _tempSeedPhrase = ''

  /**
   * SEED PHRASE MANAGEMENT
   */

  /**
   * Generate a new BIP39 mnemonic seed phrase
   */
  static generateSeedPhrase(wordCount: WordCount = 12): string {
    const entropyBits = wordCount === 24 ? 256 : 128
    return bip39.generateMnemonic(entropyBits)
  }

  /**
   * Validate if a string is a valid BIP39 mnemonic
   */
  static validateMnemonic(mnemonic: string): boolean {
    try {
      return bip39.validateMnemonic(mnemonic)
    } catch (error) {
      console.error('Error validating mnemonic:', error)
      return false
    }
  }

  /**
   * Convert mnemonic to seed buffer
   */
  static async mnemonicToSeed(mnemonic: string, passphrase: string = ''): Promise<Buffer> {
    if (!this.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase')
    }
    return bip39.mnemonicToSeed(mnemonic, passphrase)
  }

  /**
   * Store seed phrase securely
   */
  static async storeSeedPhrase(mnemonic: string): Promise<void> {
    if (!this.validateMnemonic(mnemonic)) {
      throw new Error('Invalid seed phrase provided')
    }

    try {
      if (isDevelopment) {
        // Development fallback
        try {
          await SecureStore.setItemAsync(SECURE_SEED_PHRASE_KEY, mnemonic)
        } catch (storageError) {
          console.warn('SecureStore failed in development, using temporary storage:', storageError)
          this._tempSeedPhrase = mnemonic
        }
      } else {
        await SecureStore.setItemAsync(SECURE_SEED_PHRASE_KEY, mnemonic)
      }
    } catch (error) {
      throw new Error(`Failed to store seed phrase: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Retrieve stored seed phrase
   */
  static async getSeedPhrase(): Promise<string | null> {
    try {
      if (isDevelopment && this._tempSeedPhrase) {
        return this._tempSeedPhrase
      }
      return await SecureStore.getItemAsync(SECURE_SEED_PHRASE_KEY)
    } catch (error) {
      console.error('Failed to retrieve seed phrase:', error)
      return null
    }
  }

  /**
   * Delete stored seed phrase
   */
  static async deleteSeedPhrase(): Promise<void> {
    try {
      if (isDevelopment) {
        this._tempSeedPhrase = ''
      }
      await SecureStore.deleteItemAsync(SECURE_SEED_PHRASE_KEY)
    } catch (error) {
      console.error('Failed to delete seed phrase:', error)
    }
  }

  /**
   * Check if seed phrase exists
   */
  static async hasSeedPhrase(): Promise<boolean> {
    const seedPhrase = await this.getSeedPhrase()
    return seedPhrase !== null && seedPhrase.length > 0
  }

  /**
   * KEY MANAGEMENT
   */

  /**
   * Get current network configuration
   */
  static getNetwork(): bitcoin.networks.Network {
    return networkConfig[BITCOIN_NETWORK as keyof typeof networkConfig] || bitcoin.networks.testnet
  }

  /**
   * Derive HD key from seed
   */
  static deriveKeyFromSeed(seed: Buffer, path: string = DEFAULT_DERIVATION_PATH): BitcoinKeyPair {
    const network = this.getNetwork()
    const root = bip32.fromSeed(seed, network)
    const child = root.derivePath(path)

    if (!child.privateKey) {
      throw new Error('Failed to derive private key')
    }

    return {
      path,
      network: BITCOIN_NETWORK as BitcoinNetworkType,
      publicKey: Buffer.from(child.publicKey),
      privateKey: child.privateKey ? Buffer.from(child.privateKey) : null,
      wif: child.toWIF(),
      address: undefined, // Set by caller based on address type
      hdPath: path
    }
  }

  /**
   * Generate key pair from mnemonic
   */
  static async generateKeyPairFromMnemonic(
    mnemonic: string,
    path: string = DEFAULT_DERIVATION_PATH,
    passphrase: string = ''
  ): Promise<BitcoinKeyPair> {
    if (!this.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase')
    }

    const seed = await this.mnemonicToSeed(mnemonic, passphrase)
    return this.deriveKeyFromSeed(seed, path)
  }

  /**
   * WALLET OPERATIONS
   */

  /**
   * Import wallet from mnemonic
   */
  static async importFromMnemonic(
    mnemonic: string,
    network: bitcoin.networks.Network = this.getNetwork()
  ): Promise<BitcoinWallet> {
    if (!this.validateMnemonic(mnemonic)) {
      throw new Error('Invalid seed phrase')
    }

    try {
      // Store the seed phrase
      await this.storeSeedPhrase(mnemonic)

      // Generate addresses (simplified - would derive multiple addresses in practice)
      const keyPair = await this.generateKeyPairFromMnemonic(mnemonic)
      
      return {
        id: 'main-wallet',
        network,
        addresses: {
          legacy: [],
          segwit: [],
          nativeSegwit: []
        },
        balances: {
          confirmed: 0,
          unconfirmed: 0
        }
      }
    } catch (error) {
      throw new Error(`Failed to import wallet: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Get wallet balance
   */
  static async getBalance(minConfirmations: number = 0): Promise<number> {
    try {
      const requiredConfirmations = BITCOIN_NETWORK === 'mainnet' 
        ? Math.max(3, minConfirmations) 
        : minConfirmations
      
      return await callRpc<number>('getbalance', ['*', requiredConfirmations])
    } catch (error) {
      console.error('Failed to get wallet balance:', error)
      throw new BitcoinRpcError(
        `Failed to get wallet balance: ${error instanceof Error ? error.message : String(error)}`,
        -1,
        'getbalance'
      )
    }
  }

  /**
   * Generate new address
   */
  static async getNewAddress(
    label: string = '',
    addressType: 'legacy' | 'p2sh-segwit' | 'bech32' = 'bech32'
  ): Promise<string> {
    try {
      const finalAddressType = BITCOIN_NETWORK === 'mainnet' && addressType === 'bech32'
        ? 'p2sh-segwit' // More compatible
        : addressType
        
      return await callRpc<string>('getnewaddress', [label, finalAddressType])
    } catch (error) {
      console.error('Failed to generate new address:', error)
      throw new BitcoinRpcError(
        `Failed to generate new address: ${error instanceof Error ? error.message : String(error)}`,
        -1,
        'getnewaddress'
      )
    }
  }

  /**
   * List unspent outputs
   */
  static async listUnspent(
    minConfirmations: number = 1,
    maxConfirmations: number = 9999999,
    addresses: string[] = []
  ): Promise<Utxo[]> {
    try {
      return await callRpc<Utxo[]>('listunspent', [
        minConfirmations,
        maxConfirmations,
        addresses
      ])
    } catch (error) {
      console.error('Failed to list unspent outputs:', error)
      throw new BitcoinRpcError(
        `Failed to list unspent outputs: ${error instanceof Error ? error.message : String(error)}`,
        -1,
        'listunspent'
      )
    }
  }

  /**
   * List recent transactions
   */
  static async listTransactions(
    count: number = 10,
    skip: number = 0,
    includeWatchOnly: boolean = false
  ): Promise<BitcoinTransaction[]> {
    try {
      return await callRpc<BitcoinTransaction[]>('listtransactions', [
        '*',
        count,
        skip,
        includeWatchOnly
      ])
    } catch (error) {
      console.error('Failed to list transactions:', error)
      throw new BitcoinRpcError(
        `Failed to list transactions: ${error instanceof Error ? error.message : String(error)}`,
        -1,
        'listtransactions'
      )
    }
  }

  /**
   * Get transaction details
   */
  static async getTransaction(txid: string): Promise<BitcoinTransaction> {
    try {
      return await callRpc<BitcoinTransaction>('gettransaction', [txid])
    } catch (error) {
      console.error(`Failed to get transaction ${txid}:`, error)
      throw new BitcoinRpcError(
        `Failed to get transaction: ${error instanceof Error ? error.message : String(error)}`,
        -1,
        'gettransaction'
      )
    }
  }

  /**
   * Get wallet info
   */
  static async getWalletInfo(): Promise<WalletInfo> {
    try {
      return await callRpc<WalletInfo>('getwalletinfo')
    } catch (error) {
      console.error('Failed to get wallet info:', error)
      throw new BitcoinRpcError(
        `Failed to get wallet info: ${error instanceof Error ? error.message : String(error)}`,
        -1,
        'getwalletinfo'
      )
    }
  }

  /**
   * Send to address
   */
  static async sendToAddress(
    address: string,
    amount: number,
    comment: string = '',
    commentTo: string = ''
  ): Promise<string> {
    try {
      // Basic address validation - in a real implementation, use AddressService
      if (!address || address.length < 26) {
        throw new BitcoinAddressError(`Invalid Bitcoin address: ${address}`, address)
      }

      return await callRpc<string>('sendtoaddress', [
        address,
        amount,
        comment,
        commentTo
      ])
    } catch (error) {
      console.error(`Failed to send to address ${address}:`, error)
      throw new BitcoinRpcError(
        `Failed to send to address: ${error instanceof Error ? error.message : String(error)}`,
        -1,
        'sendtoaddress'
      )
    }
  }

  /**
   * UTILITY FUNCTIONS
   */

  /**
   * Get transaction history (sorted by time)
   */
  static async getTransactionHistory(
    count: number = 20,
    skip: number = 0
  ): Promise<BitcoinTransaction[]> {
    try {
      const transactions = await this.listTransactions(count, skip)
      return transactions.sort((a, b) => b.time - a.time)
    } catch (error) {
      console.error('Failed to get transaction history:', error)
      return []
    }
  }

  /**
   * Clear all wallet data (for logout/reset)
   */
  static async clearWalletData(): Promise<void> {
    await this.deleteSeedPhrase()
    this._tempSeedPhrase = ''
  }
}

// Export singleton-style static methods as default
export default WalletService