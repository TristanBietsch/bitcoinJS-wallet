/**
 * Bitcoin Transaction History Service
 * 
 * Fetches and processes transaction history from blockchain APIs
 * Transforms raw blockchain data to UI-friendly format using sats as currency
 * Follows existing Bitcoin service patterns for consistency
 * Enhanced with pagination support for performance optimization
 */

import { getTxs, getTransactionDetails } from './blockchain'
import { usePendingTransactionsStore } from '../../store/pendingTransactionsStore'
import type { EsploraTransaction } from '../../types/blockchain.types'
import type { Transaction } from '../../types/domain/transaction/transaction.types'
import type { BitcoinWallet } from './wallet/bitcoinWalletService'

/**
 * Determines if a transaction is a send or receive for the wallet
 * Fixed logic: if we have inputs from our wallet, it's a send (we're spending)
 * If we only have outputs to our wallet, it's a receive
 */
function determineTransactionType(
  transaction: EsploraTransaction, 
  walletAddresses: string[]
): 'send' | 'receive' {
  const hasInputFromWallet = transaction.vin.some(input => 
    input.prevout?.scriptpubkey_address && 
    walletAddresses.includes(input.prevout.scriptpubkey_address)
  )
  
  const hasOutputToWallet = transaction.vout.some(output => 
    output.scriptpubkey_address && 
    walletAddresses.includes(output.scriptpubkey_address)
  )
  
  // If we have any inputs from our wallet, it means we're spending (sending)
  // This is true even if we have change outputs back to our wallet
  if (hasInputFromWallet) {
    return 'send'
  }
  
  // If we only have outputs to our wallet (no inputs from wallet), it's a receive
  if (hasOutputToWallet) {
    return 'receive'
  }
  
  // Default fallback (shouldn't happen with proper wallet transactions)
  return 'receive'
}

/**
 * Calculates the net amount and recipient for a transaction
 * For sends: shows amount sent to external addresses (excluding change)
 * For receives: shows amount received to our addresses
 */
function calculateNetAmount(
  transaction: EsploraTransaction,
  walletAddresses: string[]
): { amount: number; recipientAddress?: string } {
  const isWalletTransaction = transaction.vin.some(input => 
    input.prevout?.scriptpubkey_address && 
    walletAddresses.includes(input.prevout.scriptpubkey_address)
  )
  
  if (isWalletTransaction) {
    // This is a send transaction - calculate total impact on wallet (amount + fee)
    let amountSentToExternals = 0
    let recipientAddress: string | undefined
    
    transaction.vout.forEach(output => {
      if (output.scriptpubkey_address) {
        if (!walletAddresses.includes(output.scriptpubkey_address)) {
          // This output goes to an external address (not our wallet)
          amountSentToExternals += output.value
          if (!recipientAddress) {
            recipientAddress = output.scriptpubkey_address
          }
        }
        // Skip outputs to our own addresses (change outputs)
      }
    })
    
    // For send transactions, show total impact (amount sent + fee)
    const totalImpact = amountSentToExternals + transaction.fee
    
    console.log(`💰 [TransactionHistoryService] Send transaction ${transaction.txid?.slice(0, 8)}: ${amountSentToExternals} sats sent + ${transaction.fee} fee = ${totalImpact} total impact`)
    
    return {
      amount : totalImpact,
      recipientAddress
    }
  } else {
    // This is a receive transaction - calculate amount received to our addresses
    let amountReceived = 0
    
    transaction.vout.forEach(output => {
      if (output.scriptpubkey_address && 
          walletAddresses.includes(output.scriptpubkey_address)) {
        amountReceived += output.value
      }
    })
    
    return {
      amount           : amountReceived,
      recipientAddress : undefined
    }
  }
}

/**
 * Transform raw blockchain transaction to UI transaction format
 */
function transformTransaction(
  esploraTransaction: EsploraTransaction,
  walletAddresses: string[]
): Transaction {
  const type = determineTransactionType(esploraTransaction, walletAddresses)
  const { amount, recipientAddress } = calculateNetAmount(esploraTransaction, walletAddresses)
  
  // Create the base transaction with proper handling of unconfirmed transactions
  const transaction: Transaction = {
    id       : esploraTransaction.txid,
    type,
    amount, // Already in sats
    currency : 'sats',
    date     : esploraTransaction.status.block_time 
      ? new Date(esploraTransaction.status.block_time * 1000) 
      : new Date(), // Use current time for unconfirmed transactions
    status        : esploraTransaction.status.confirmed ? 'completed' : 'pending',
    fee           : esploraTransaction.fee,
    txid          : esploraTransaction.txid,
    recipient     : type === 'send' ? recipientAddress : undefined,
    total         : amount + esploraTransaction.fee,
    confirmations : esploraTransaction.status.block_height ? 1 : 0, // 0 for unconfirmed
  }
  
  return transaction
}

/**
 * Fetches transaction history for a wallet with pagination support
 */
export async function fetchTransactionHistory(
  wallet: BitcoinWallet,
  limit: number = 50,
  offset: number = 0
): Promise<Transaction[]> {
  try {
    // Get all wallet addresses
    const allAddresses = [
      ...wallet.addresses.legacy,
      ...wallet.addresses.segwit,
      ...wallet.addresses.nativeSegwit
    ]
    
    console.log(`🔍 [TransactionHistoryService] Fetching transactions for ${allAddresses.length} addresses (limit: ${limit}, offset: ${offset})...`)
    
    // Fetch transactions for all addresses in parallel
    const transactionPromises = allAddresses.map(async (address) => {
      try {
        const transactions = await getTxs(address)
        return transactions.map(tx => ({ ...tx, address }))
      } catch (error) {
        console.error(`Error fetching transactions for address ${address}:`, error)
        return []
      }
    })
    
    const transactionArrays = await Promise.all(transactionPromises)
    const allTransactions = transactionArrays.flat()
    
    // Remove duplicates by txid and sort by block time
    const uniqueTransactions = Array.from(
      new Map(allTransactions.map(tx => [ tx.txid, tx ])).values()
    ).sort((a, b) => {
      const timeA = a.status.block_time || 0
      const timeB = b.status.block_time || 0
      return timeB - timeA // Most recent first
    })
    
    // Apply pagination
    const paginatedTransactions = uniqueTransactions.slice(offset, offset + limit)
    
    // Transform to UI format
    const uiTransactions = paginatedTransactions.map(tx => transformTransaction(tx, allAddresses))
    
    // Get pending transactions and merge with API transactions
    const pendingStore = usePendingTransactionsStore.getState()
    const pendingTransactions = pendingStore.pendingTransactions
    
    console.log(`🔗 [TransactionHistoryService] Merging ${uiTransactions.length} API + ${pendingTransactions.length} pending transactions`)
    
    // Remove pending transactions that are now in API data (deduplicate)
    const filteredPendingTransactions = pendingTransactions.filter(pending => 
      !uiTransactions.some(apiTx => apiTx.txid === pending.txid)
    )
    
    // Auto-cleanup: remove pending transactions that appear in API (they're now confirmed/pending in mempool)
    filteredPendingTransactions.forEach(pending => {
      if (uiTransactions.some(apiTx => apiTx.txid === pending.txid)) {
        pendingStore.removePendingTransaction(pending.txid!)
      }
    })
    
    // Merge pending transactions at the top (most recent first)
    const mergedTransactions = [
      ...filteredPendingTransactions, // Pending transactions first
      ...uiTransactions // Then API transactions
    ]
    
    console.log(`✅ [TransactionHistoryService] Found ${uiTransactions.length} API + ${filteredPendingTransactions.length} pending transactions`)
    
    return mergedTransactions
    
  } catch (error) {
    console.error('Failed to fetch transaction history:', error)
    throw new Error(`Failed to fetch transaction history: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Fetches details for a specific transaction
 */
export async function fetchTransactionDetails(
  txid: string,
  wallet: BitcoinWallet
): Promise<Transaction | null> {
  try {
    console.log(`🔍 [TransactionHistoryService] Fetching details for transaction: ${txid}`)
    
    const esploraTransaction = await getTransactionDetails(txid)
    
    if (!esploraTransaction) {
      console.warn(`Transaction ${txid} not found`)
      return null
    }
    
    // Get all wallet addresses for transformation
    const allAddresses = [
      ...wallet.addresses.legacy,
      ...wallet.addresses.segwit,
      ...wallet.addresses.nativeSegwit
    ]
    
    const transaction = transformTransaction(esploraTransaction, allAddresses)
    
    console.log(`✅ [TransactionHistoryService] Fetched details for transaction: ${txid}`)
    
    return transaction
    
  } catch (error) {
    console.error(`Failed to fetch transaction details for ${txid}:`, error)
    throw new Error(`Failed to fetch transaction details: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Utility function to format transaction amount for display
 */
export function formatTransactionAmount(amount: number, includeSign: boolean = false): string {
  const formattedAmount = amount.toLocaleString()
  return includeSign ? `+${formattedAmount}` : formattedAmount
}

/**
 * Utility function to get transaction status text
 */
export function getTransactionStatusText(status: Transaction['status']): string {
  switch (status) {
    case 'completed':
      return 'Confirmed'
    case 'pending':
      return 'Pending'
    case 'failed':
      return 'Failed'
    default:
      return 'Unknown'
  }
}

/**
 * Utility function to get display address for transaction
 */
export function getDisplayAddress(transaction: Transaction): string {
  if (transaction.type === 'send' && transaction.recipient) {
    return transaction.recipient
  }
  
  // For receive transactions or when recipient is not available
  return transaction.txid?.slice(0, 12) || transaction.id.slice(0, 12) || 'Unknown'
}

/**
 * Get transaction count for a wallet (for pagination calculations)
 */
export async function getTransactionCount(wallet: BitcoinWallet): Promise<number> {
  try {
    const allAddresses = [
      ...wallet.addresses.legacy,
      ...wallet.addresses.segwit,
      ...wallet.addresses.nativeSegwit
    ]
    
    // Fetch all transactions to get count (this could be optimized with API support)
    const transactionPromises = allAddresses.map(async (address) => {
      try {
        const transactions = await getTxs(address)
        return transactions
      } catch (error) {
        console.error(`Error fetching transaction count for address ${address}:`, error)
        return []
      }
    })
    
    const transactionArrays = await Promise.all(transactionPromises)
    const allTransactions = transactionArrays.flat()
    
    // Remove duplicates by txid
    const uniqueTransactions = Array.from(
      new Map(allTransactions.map(tx => [ tx.txid, tx ])).values()
    )
    
    return uniqueTransactions.length
    
  } catch (error) {
    console.error('Failed to get transaction count:', error)
    return 0
  }
} 