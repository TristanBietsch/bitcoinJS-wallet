/**
 * Bitcoin RPC Service Type Definitions
 * 
 * This file contains types for Bitcoin RPC requests and responses.
 */

/**
 * RPC configuration interface
 */
export interface RpcConfig {
  host: string
  port: number
  username: string
  password: string
  protocol: 'http' | 'https'
  timeout: number
  allowSelfSignedCert?: boolean
  maxRetries?: number
}

/**
 * RPC Response format
 */
export interface BitcoinRpcResponse<T> {
  result: T
  error: null | BitcoinRpcError
  id: string | number
}

/**
 * RPC Error format
 */
export interface BitcoinRpcError {
  code: number
  message: string
}

/**
 * Transaction interface
 */
export interface BitcoinTransaction {
  txid: string
  hash: string
  time: number
  amount: number
  fee: number
  confirmations: number
  blockhash?: string
  blockindex?: number
  blocktime?: number
  category: 'send' | 'receive' | 'generate' | 'immature' | 'orphan'
  address?: string
  label?: string
  vout?: number
}

/**
 * Blockchain info interface
 */
export interface BlockchainInfo {
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

/**
 * Wallet info interface
 */
export interface WalletInfo {
  walletname: string
  walletversion: number
  balance: number
  unconfirmed_balance: number
  immature_balance: number
  txcount: number
  keypoololdest: number
  keypoolsize: number
  paytxfee: number
  private_keys_enabled: boolean
}

/**
 * UTXO interface
 */
export interface Utxo {
  txid: string
  vout: number
  address: string
  label?: string
  scriptPubKey: string
  amount: number
  confirmations: number
  spendable: boolean
  solvable: boolean
  desc?: string
  safe: boolean
}

/**
 * Address validation result interface
 */
export interface AddressValidationResult {
  isvalid: boolean
  address?: string
  scriptPubKey?: string
  isscript?: boolean
  iswitness?: boolean
  witness_version?: number
  witness_program?: string
}

/**
 * Fee estimation response
 */
export interface FeeEstimation {
  feerate: number
  blocks: number
} 