import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

// Types for Bitcoin RPC responses
interface BitcoinRpcResponse<T> {
  result: T
  error: null | {
    code: number
    message: string
  }
  id: string | number
}

interface BlockchainInfo {
  chain: string
  blocks: number
  headers: number
  bestblockhash: string
  difficulty: number
  mediantime: number
  verificationprogress: number
  initialblockdownload: boolean
  chainwork: string
  size_on_disk: number
  pruned: boolean
}

interface TransactionInfo {
  txid: string
  hash: string
  version: number
  size: number
  vsize: number
  weight: number
  locktime: number
  vin: any[]
  vout: any[]
  hex: string
}

// Configuration for the Bitcoin RPC client
interface BitcoinRpcConfig {
  url: string
  auth: {
    username: string
    password: string
  }
  network: 'regtest' | 'mainnet'
  isDevelopment: boolean
}

// Default configuration
const DEFAULT_CONFIG: BitcoinRpcConfig = {
  url  : 'http://localhost:18443', // regtest default
  auth : {
    username : 'admin',
    password : 'admin'
  },
  network       : 'regtest',
  isDevelopment : __DEV__ // React Native's development flag
}

// Alternative configuration for mainnet
const MAINNET_CONFIG: Partial<BitcoinRpcConfig> = {
  url     : 'http://localhost:8332', 
  network : 'mainnet'
}

/**
 * Bitcoin Core RPC client for interacting with a Bitcoin node
 * Supports both regtest and mainnet networks
 */
class BitcoinRpcClient {
  private config: BitcoinRpcConfig
  private rpcId: number = 1
  
  /**
   * Initialize the Bitcoin RPC client
   * @param customConfig Optional custom configuration
   */
  constructor(customConfig: Partial<BitcoinRpcConfig> = {}) {
    // Determine if we should use mainnet or regtest config
    // This could come from an environment variable or config store
    const useMainnet = process.env.BITCOIN_NETWORK === 'mainnet'
    
    // Merge configurations
    this.config = {
      ...DEFAULT_CONFIG,
      ...(useMainnet ? MAINNET_CONFIG : {}),
      ...customConfig
    }
    
    this.log('Bitcoin RPC client initialized with network:', this.config.network)
  }
  
  /**
   * Make a generic RPC call to the Bitcoin node
   * @param method The RPC method to call
   * @param params Parameters for the RPC method
   * @returns Promise with the response data
   */
  public async call<T>(method: string, params: any[] = []): Promise<T> {
    const requestBody = {
      jsonrpc : '1.0',
      id      : this.rpcId++,
      method,
      params
    }
    
    const requestConfig: AxiosRequestConfig = {
      auth : {
        username : this.config.auth.username,
        password : this.config.auth.password
      },
      headers : {
        'Content-Type' : 'application/json'
      }
    }
    
    this.log(`RPC REQUEST: ${method}`, params)
    
    try {
      const response: AxiosResponse<BitcoinRpcResponse<T>> = await axios.post(
        this.config.url,
        requestBody,
        requestConfig
      )
      
      this.log(`RPC RESPONSE: ${method}`, response.data)
      
      if (response.data.error) {
        throw new Error(`Bitcoin RPC error: ${response.data.error.message} (code: ${response.data.error.code})`)
      }
      
      return response.data.result
    } catch (error) {
      this.log(`RPC ERROR: ${method}`, error)
      if (axios.isAxiosError(error)) {
        throw new Error(`Bitcoin RPC request failed: ${error.message}`)
      }
      throw error
    }
  }
  
  /**
   * Get a new Bitcoin address from the wallet
   * @param label Optional label for the address
   * @param addressType Optional address type (legacy, p2sh-segwit, bech32)
   * @returns Promise with the new address
   */
  public async getNewAddress(
    label: string = '',
    addressType: 'legacy' | 'p2sh-segwit' | 'bech32' = 'bech32'
  ): Promise<string> {
    return this.call<string>('getnewaddress', [ label, addressType ])
  }
  
  /**
   * Send Bitcoin to an address
   * @param address Destination Bitcoin address
   * @param amount Amount to send in BTC
   * @param comment Optional comment for the transaction
   * @returns Promise with the transaction ID
   */
  public async sendToAddress(
    address: string,
    amount: number,
    comment: string = ''
  ): Promise<string> {
    return this.call<string>('sendtoaddress', [ address, amount, comment ])
  }
  
  /**
   * Get blockchain information
   * @returns Promise with blockchain information
   */
  public async getBlockchainInfo(): Promise<BlockchainInfo> {
    return this.call<BlockchainInfo>('getblockchaininfo', [])
  }
  
  /**
   * Get transaction details
   * @param txid Transaction ID
   * @returns Promise with transaction details
   */
  public async getTransaction(txid: string): Promise<TransactionInfo> {
    return this.call<TransactionInfo>('getrawtransaction', [ txid, true ])
  }
  
  /**
   * Generate blocks (regtest only)
   * @param blocks Number of blocks to generate
   * @param address Optional address to receive the reward
   * @returns Promise with the generated block hashes
   */
  public async generateToAddress(
    blocks: number,
    address: string
  ): Promise<string[]> {
    if (this.config.network !== 'regtest') {
      throw new Error('Block generation is only available in regtest network')
    }
    return this.call<string[]>('generatetoaddress', [ blocks, address ])
  }
  
  /**
   * Log messages in development mode
   * @param message Message to log
   * @param data Optional data to log
   */
  private log(message: string, data?: any): void {
    if (this.config.isDevelopment) {
      console.log(`[Bitcoin RPC] ${message}`, data !== undefined ? data : '')
    }
  }
}

// Create default export as a singleton instance
const bitcoinRpc = new BitcoinRpcClient()

// Also export the class for custom instances
export { BitcoinRpcClient, BitcoinRpcConfig }

export default bitcoinRpc 