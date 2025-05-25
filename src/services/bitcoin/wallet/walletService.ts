/**
 * Bitcoin Wallet Service
 * 
 * Provides wallet-related functionality like sending coins, checking balance, etc.
 */

import { IS_MAINNET, BITCOIN_NETWORK } from '../../../config/bitcoinNetwork'
import { BitcoinTransaction, Utxo, WalletInfo } from '@/src/types/api'
import { BitcoinAddressError, BitcoinRpcError } from '../errors/rpcErrors'
import { callRpc } from '../rpc/rpcClient'
import { isValidAddress } from '../address/addressService'

/**
 * Get wallet balance
 */
export async function getBalance(
  minConfirmations: number = 0
): Promise<number> {
  try {
    // Require more confirmations on mainnet for security
    const requiredConfirmations = IS_MAINNET ? Math.max(3, minConfirmations) : minConfirmations
    
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
 * Generate a new Bitcoin address
 */
export async function getNewAddress(
  label: string = '', 
  addressType: 'legacy' | 'p2sh-segwit' | 'bech32' = 'bech32'
): Promise<string> {
  try {
    // On mainnet, consider using p2sh-segwit for better compatibility with older wallets
    const finalAddressType = IS_MAINNET && addressType === 'bech32' 
      ? 'p2sh-segwit' // More compatible with older wallets
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
 * List unspent transaction outputs (UTXOs)
 */
export async function listUnspent(
  minConfirmations: number = 1,
  maxConfirmations: number = 9999999,
  addresses: string[] = []
): Promise<Utxo[]> {
  return callRpc<Utxo[]>('listunspent', [ minConfirmations, maxConfirmations, addresses ])
}

/**
 * List transactions
 */
export async function listTransactions(
  count: number = 10,
  skip: number = 0
): Promise<BitcoinTransaction[]> {
  try {
    // Validate parameters
    const validCount = Math.min(Math.max(1, count), 100) // Limit between 1 and 100
    const validSkip = Math.max(0, skip)
    
    return await callRpc<BitcoinTransaction[]>(
      'listtransactions', 
      [ '*', validCount, validSkip, false ]
    )
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
 * Get transaction details by ID
 */
export async function getTransaction(txid: string): Promise<BitcoinTransaction> {
  return callRpc<BitcoinTransaction>('gettransaction', [ txid ])
}

/**
 * Get wallet information
 */
export async function getWalletInfo(): Promise<WalletInfo> {
  return callRpc<WalletInfo>('getwalletinfo', [])
}

/**
 * Send Bitcoin to an address
 * @throws BitcoinAddressError if the address is invalid
 */
export async function sendToAddress(
  address: string,
  amount: number,
  comment: string = '',
  commentTo: string = '',
  subtractFeeFromAmount: boolean = false
): Promise<string> {
  // Validate inputs before sending
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }
  
  // Validate the address
  const isValid = await isValidAddress(address)
  if (!isValid) {
    throw new BitcoinAddressError(`Invalid Bitcoin address for ${BITCOIN_NETWORK} network`, address)
  }
  
  return callRpc<string>('sendtoaddress', [
    address,
    amount,
    comment,
    commentTo,
    subtractFeeFromAmount
  ])
} 