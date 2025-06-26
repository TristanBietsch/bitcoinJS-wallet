/**
 * Consolidated Bitcoin Wallet Service
 * Combines functionality from wallet/, seedPhraseService, keyManagementService, etc.
 * 
 * SECURITY UPDATE: Now uses secure session management instead of global variables
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
import { SecureMemoryManager } from '@/src/utils/security/secureMemoryManager'

// Initialize the BIP32 factory
const bip32 = BIP32Factory(ecc)

// Constants
const SECURE_SEED_PHRASE_KEY = 'com.nummus.wallet.seed_phrase'
const isDevelopment = __DEV__

// Network configuration
const networkConfig = {
  mainnet : bitcoin.networks.bitcoin,
  testnet : bitcoin.networks.testnet,
  regtest : {
    ...bitcoin.networks.testnet,
    bech32 : 'bcrt',
    bip32  : {
      public  : 0x043587cf,
      private : 0x04358394
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

// Security audit data structure to track operations
interface SecurityAuditLog {
  timestamp: number
  operation: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  details: string
}

/**
 * Consolidated Wallet Service - Now with Enhanced Security (Testnet Ready)
 */
export class WalletService {
  
  // SECURITY: No more global memory variables!
  // All sensitive data now managed through SecureMemoryManager
  
  // Security audit log
  private static securityAuditLog: SecurityAuditLog[] = []
  
  /**
   * SECURITY AUDIT METHODS
   */
  
  /**
   * Log security events for audit purposes
   */
  private static logSecurityEvent(
    operation: string,
    riskLevel: SecurityAuditLog['riskLevel'],
    details: string
  ): void {
    const auditEntry: SecurityAuditLog = {
      timestamp : Date.now(),
      operation,
      riskLevel,
      details
    }
    
    this.securityAuditLog.push(auditEntry)
    
    // Keep only last 100 audit entries
    if (this.securityAuditLog.length > 100) {
      this.securityAuditLog.shift()
    }
    
    // Log critical events to console (without sensitive data)
    if (riskLevel === 'critical' || riskLevel === 'high') {
      console.warn(`🔒 [SECURITY AUDIT] ${operation}: ${riskLevel.toUpperCase()} - ${details}`)
    }
  }
  
  /**
   * Get security audit log (for debugging/monitoring)
   */
  static getSecurityAuditLog(): SecurityAuditLog[] {
    return [ ...this.securityAuditLog ]
  }

  /**
   * SEED PHRASE MANAGEMENT - SECURE VERSION (TESTNET READY)
   */

  /**
   * Generate a new BIP39 mnemonic seed phrase
   */
  static generateSeedPhrase(wordCount: WordCount = 12): string {
    this.logSecurityEvent(
      'generateSeedPhrase',
      'medium',
      `Generated new ${wordCount}-word seed phrase`
    )
    
    const entropyBits = wordCount === 24 ? 256 : 128
    return bip39.generateMnemonic(entropyBits)
  }

  /**
   * Validate if a string is a valid BIP39 mnemonic
   */
  static validateMnemonic(mnemonic: string): boolean {
    try {
      const isValid = bip39.validateMnemonic(mnemonic)
      
      this.logSecurityEvent(
        'validateMnemonic',
        'low',
        `Mnemonic validation: ${isValid ? 'valid' : 'invalid'}`
      )
      
      return isValid
    } catch (error) {
      this.logSecurityEvent(
        'validateMnemonic',
        'medium',
        `Mnemonic validation error: ${error instanceof Error ? error.message : String(error)}`
      )
      return false
    }
  }

  /**
   * Convert mnemonic to seed buffer
   */
  static async mnemonicToSeed(mnemonic: string, passphrase: string = ''): Promise<Buffer> {
    if (!this.validateMnemonic(mnemonic)) {
      this.logSecurityEvent(
        'mnemonicToSeed',
        'high',
        'Attempted to convert invalid mnemonic to seed'
      )
      throw new Error('Invalid mnemonic phrase')
    }
    
    this.logSecurityEvent(
      'mnemonicToSeed',
      'medium',
      'Converting mnemonic to seed buffer'
    )
    
    return bip39.mnemonicToSeed(mnemonic, passphrase)
  }

  /**
   * Store seed phrase securely using session management
   * SECURITY: Replaces insecure global variable storage
   */
  static async storeSeedPhrase(mnemonic: string): Promise<void> {
    if (!this.validateMnemonic(mnemonic)) {
      this.logSecurityEvent(
        'storeSeedPhrase',
        'critical',
        'Attempted to store invalid seed phrase'
      )
      throw new Error('Invalid seed phrase provided')
    }

    try {
      if (isDevelopment) {
        // Development mode: Store in secure session with extended timeout
        console.warn('⚠️ [DEVELOPMENT] Storing seed phrase in secure session for development')
        
        const sessionId = SecureMemoryManager.createSession(mnemonic, {
          timeoutMs : 30 * 60 * 1000 // 30 minutes in development
        })
        
        // Store session ID for later retrieval
        await SecureStore.setItemAsync(`${SECURE_SEED_PHRASE_KEY}_session`, sessionId)
        
        this.logSecurityEvent(
          'storeSeedPhrase',
          'medium',
          'Stored seed phrase in development secure session'
        )
        return
      } else {
        // Production: Store with basic protection (ready for future encryption)
        // For testnet launch, we'll use SecureStore with a marker for future encryption
        const storageMetadata = {
          version     : '1.0',
          stored      : Date.now(),
          encrypted   : false, // Ready for future encryption
          testnetMode : true
        }
        
        await SecureStore.setItemAsync(`${SECURE_SEED_PHRASE_KEY}_meta`, JSON.stringify(storageMetadata))
        await SecureStore.setItemAsync(SECURE_SEED_PHRASE_KEY, mnemonic)
        
        this.logSecurityEvent(
          'storeSeedPhrase',
          'medium',
          'Stored seed phrase in production secure storage (testnet mode)'
        )
      }
      
    } catch (error) {
      this.logSecurityEvent(
        'storeSeedPhrase',
        'critical',
        `Failed to store seed phrase: ${error instanceof Error ? error.message : String(error)}`
      )
      throw new Error(`Failed to store seed phrase: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Retrieve stored seed phrase
   * SECURITY: Replaces insecure global variable access
   */
  static async getSeedPhrase(): Promise<string | null> {
    try {
      // SECURITY: Check for development session first
      if (isDevelopment) {
        try {
          const sessionId = await SecureStore.getItemAsync(`${SECURE_SEED_PHRASE_KEY}_session`)
          if (sessionId) {
            const sessionData = SecureMemoryManager.accessSession<string>(sessionId)
            if (sessionData) {
              this.logSecurityEvent(
                'getSeedPhrase',
                'medium',
                'Retrieved seed phrase from development secure session'
              )
              return sessionData
            }
          }
        } catch (_sessionError) {
          // Continue to production storage
        }
      }
      
      // Check for production storage with metadata
      const metadataJson = await SecureStore.getItemAsync(`${SECURE_SEED_PHRASE_KEY}_meta`)
      if (metadataJson) {
        const metadata = JSON.parse(metadataJson)
        
        // Get seed phrase from secure storage
        const seedPhrase = await SecureStore.getItemAsync(SECURE_SEED_PHRASE_KEY)
        if (seedPhrase) {
          this.logSecurityEvent(
            'getSeedPhrase',
            'medium',
            `Successfully retrieved seed phrase (version: ${metadata.version}, testnet: ${metadata.testnetMode})`
          )
          return seedPhrase
        }
      }
      
      // Fallback to legacy storage (for existing users)
      const legacySeed = await SecureStore.getItemAsync(SECURE_SEED_PHRASE_KEY)
      if (legacySeed) {
        this.logSecurityEvent(
          'getSeedPhrase',
          'high',
          'Retrieved legacy seed phrase - consider migrating to new format'
        )
        
        // Auto-migrate to new format
        await this.storeSeedPhrase(legacySeed)
        
        this.logSecurityEvent(
          'getSeedPhrase',
          'medium',
          'Auto-migrated legacy seed phrase to new storage format'
        )
        
        return legacySeed
      }
      
      this.logSecurityEvent(
        'getSeedPhrase',
        'low',
        'No seed phrase found in storage'
      )
      
      return null
    } catch (error) {
      this.logSecurityEvent(
        'getSeedPhrase',
        'high',
        `Failed to retrieve seed phrase: ${error instanceof Error ? error.message : String(error)}`
      )
      return null
    }
  }

  /**
   * Delete stored seed phrase and clear all sessions
   * SECURITY: Secure cleanup of all sensitive data
   */
  static async deleteSeedPhrase(): Promise<void> {
    try {
      // Clear development session if exists
      if (isDevelopment) {
        try {
          const sessionId = await SecureStore.getItemAsync(`${SECURE_SEED_PHRASE_KEY}_session`)
          if (sessionId) {
            SecureMemoryManager.clearSession(sessionId)
            await SecureStore.deleteItemAsync(`${SECURE_SEED_PHRASE_KEY}_session`)
          }
        } catch (_sessionError) {
          // Continue with other cleanup
        }
      }
      
      // Delete production storage and metadata
      await SecureStore.deleteItemAsync(SECURE_SEED_PHRASE_KEY)
      await SecureStore.deleteItemAsync(`${SECURE_SEED_PHRASE_KEY}_meta`)
      
      // Clear all secure sessions related to seed phrases
      SecureMemoryManager.clearAllSessions()
      
      this.logSecurityEvent(
        'deleteSeedPhrase',
        'medium',
        'Successfully deleted all seed phrase data and cleared sessions'
      )
      
    } catch (error) {
      this.logSecurityEvent(
        'deleteSeedPhrase',
        'high',
        `Failed to delete seed phrase: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Check if seed phrase exists (without accessing it)
   */
  static async hasSeedPhrase(): Promise<boolean> {
    try {
      // Check production storage
      const hasMetadata = await SecureStore.getItemAsync(`${SECURE_SEED_PHRASE_KEY}_meta`)
      if (hasMetadata) {
        return true
      }
      
      // Check development session
      if (isDevelopment) {
        const sessionId = await SecureStore.getItemAsync(`${SECURE_SEED_PHRASE_KEY}_session`)
        if (sessionId && SecureMemoryManager.isSessionValid(sessionId)) {
          return true
        }
      }
      
      // Check legacy storage
      const legacySeed = await SecureStore.getItemAsync(SECURE_SEED_PHRASE_KEY)
      return legacySeed !== null && legacySeed.length > 0
    } catch (error) {
      this.logSecurityEvent(
        'hasSeedPhrase',
        'low',
        `Error checking seed phrase existence: ${error instanceof Error ? error.message : String(error)}`
      )
      return false
    }
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
      network    : BITCOIN_NETWORK as BitcoinNetworkType,
      publicKey  : Buffer.from(child.publicKey),
      privateKey : child.privateKey ? Buffer.from(child.privateKey) : null,
      wif        : child.toWIF(),
      address    : undefined, // Set by caller based on address type
      hdPath     : path
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

      // Generate key pair and derive addresses
      const keyPair = await this.generateKeyPairFromMnemonic(mnemonic)
      
      // Derive addresses for different types
      const addresses = {
        legacy       : [] as string[],
        segwit       : [] as string[],
        nativeSegwit : [] as string[]
      }
      
      // Generate a few addresses for each type using the key pair
      if (keyPair.publicKey) {
        try {
          // Generate P2WPKH (native segwit) address
          const p2wpkh = bitcoin.payments.p2wpkh({ 
            pubkey : keyPair.publicKey, 
            network 
          })
          if (p2wpkh.address) {
            addresses.nativeSegwit.push(p2wpkh.address)
          }
          
          // Generate P2SH-P2WPKH (segwit) address
          const p2sh = bitcoin.payments.p2sh({
            redeem : bitcoin.payments.p2wpkh({ 
              pubkey : keyPair.publicKey, 
              network 
            }),
            network
          })
          if (p2sh.address) {
            addresses.segwit.push(p2sh.address)
          }
          
          // Generate P2PKH (legacy) address
          const p2pkh = bitcoin.payments.p2pkh({ 
            pubkey : keyPair.publicKey, 
            network 
          })
          if (p2pkh.address) {
            addresses.legacy.push(p2pkh.address)
          }
          
          console.log('✅ [Wallet] Successfully derived addresses:', {
            legacy       : addresses.legacy.length,
            segwit       : addresses.segwit.length,
            nativeSegwit : addresses.nativeSegwit.length
          })
          
        } catch (addressError) {
          console.warn('⚠️ [Wallet] Failed to derive some addresses:', addressError)
        }
      }
      
      return {
        id       : 'main-wallet',
        network,
        addresses,
        balances : {
          confirmed   : 0,
          unconfirmed : 0
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
      
      return await callRpc<number>('getbalance', [ '*', requiredConfirmations ])
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
        
      return await callRpc<string>('getnewaddress', [ label, finalAddressType ])
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
      return await callRpc<BitcoinTransaction>('gettransaction', [ txid ])
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
  }
}

// Export singleton-style static methods as default
export default WalletService