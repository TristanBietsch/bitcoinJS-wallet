/**
 * Bitcoin Wallet Service
 * 
 * Provides wallet-related functionality like sending coins, checking balance, etc.
 */

import { BITCOIN_NETWORK } from '../../../config/bitcoinNetwork'
import { BitcoinTransaction, Utxo, WalletInfo } from '@/src/types/api'
import { BitcoinAddressError } from '../errors/rpcErrors'
import { callRpc } from '../rpc/rpcClient'
import { isValidAddress } from '../address/addressService'

/**
 * Get wallet balance
 */
export async function getBalance(
  minConfirmations: number = 0
): Promise<number> {
  return callRpc<number>('getbalance', [ '*', minConfirmations ])
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
  return callRpc<BitcoinTransaction[]>('listtransactions', [ '*', count, skip ])
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