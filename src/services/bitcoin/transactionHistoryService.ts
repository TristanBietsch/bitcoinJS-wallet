/**
 * Bitcoin Transaction History Service
 * 
 * Fetches and processes transaction history from blockchain APIs
 * Transforms raw blockchain data to UI-friendly format using sats as currency
 * Follows existing Bitcoin service patterns for consistency
 * Enhanced with pagination support for performance optimization
 */

import { getTxs, getTransactionDetails } from './blockchain'
import type { EsploraTransaction } from '../../types/blockchain.types'
import type { Transaction } from '../../types/domain/transaction/transaction.types'
import type { BitcoinWallet } from './wallet/bitcoinWalletService'

/**
 * Determines if a transaction is a send or receive for the wallet
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
  
  // If we're sending from our wallet to somewhere else, it's a send
  if (hasInputFromWallet && !hasOutputToWallet) {
    return 'send'
  }
  
  // If we're receiving to our wallet (regardless of change outputs), it's a receive
  if (hasOutputToWallet) {
    return 'receive'
  }
  
  // Default fallback (shouldn't happen with proper wallet transactions)
  return 'receive'
}

/**
 * Calculates the net amount and recipient for a transaction
 */
function calculateNetAmount(
  transaction: EsploraTransaction,
  walletAddresses: string[]
): { amount: number; recipientAddress?: string } {
  let netAmount = 0
  let recipientAddress: string | undefined
  
  // Calculate amount from inputs (what we're spending)
  transaction.vin.forEach(input => {
    if (input.prevout?.scriptpubkey_address && 
        walletAddresses.includes(input.prevout.scriptpubkey_address)) {
      netAmount -= input.prevout.value
    }
  })
  
  // Calculate amount from outputs (what we're receiving or change)
  transaction.vout.forEach(output => {
    if (output.scriptpubkey_address) {
      if (walletAddresses.includes(output.scriptpubkey_address)) {
        // This is our address (change or receive)
        netAmount += output.value
      } else {
        // This is an external address (recipient for sends)
        if (!recipientAddress && netAmount < 0) {
          recipientAddress = output.scriptpubkey_address
        }
      }
    }
  })
  
  return {
    amount           : Math.abs(netAmount),
    recipientAddress
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
  
  // Create the base transaction
  const transaction: Transaction = {
    id            : esploraTransaction.txid,
    type,
    amount, // Already in sats
    currency      : 'sats',
    date          : esploraTransaction.status.block_time 
      ? new Date(esploraTransaction.status.block_time * 1000) 
      : new Date(),
    status        : esploraTransaction.status.confirmed ? 'completed' : 'pending',
    fee           : esploraTransaction.fee,
    txid          : esploraTransaction.txid,
    recipient     : type === 'send' ? recipientAddress : undefined,
    total         : amount + esploraTransaction.fee,
    confirmations : esploraTransaction.status.block_height ? 1 : 0, // Simplified
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
    
    console.log(`✅ [TransactionHistoryService] Found ${uiTransactions.length} transactions (page ${Math.floor(offset / limit) + 1})`)
    
    return uiTransactions
    
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