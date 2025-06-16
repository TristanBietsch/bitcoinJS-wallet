/**
 * Bitcoin Transaction History Service
 * 
 * Fetches and processes transaction history from blockchain APIs
 * Transforms raw blockchain data to UI-friendly format using sats as currency
 * Follows existing Bitcoin service patterns for consistency
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
  // Check if any inputs belong to our wallet (we're sending)
  const hasOurInputs = transaction.vin.some(input => 
    input.prevout?.scriptpubkey_address && 
    walletAddresses.includes(input.prevout.scriptpubkey_address)
  )
  
  // Check if any outputs belong to our wallet (we're receiving)
  const hasOurOutputs = transaction.vout.some(output => 
    output.scriptpubkey_address && 
    walletAddresses.includes(output.scriptpubkey_address)
  )
  
  // If we have inputs, it's a send transaction
  if (hasOurInputs) {
    return 'send'
  }
  
  // If we only have outputs, it's a receive transaction
  if (hasOurOutputs) {
    return 'receive'
  }
  
  // Fallback (shouldn't happen for wallet transactions)
  return 'receive'
}

/**
 * Calculate the net amount for a transaction from the wallet's perspective
 */
function calculateNetAmount(
  transaction: EsploraTransaction,
  walletAddresses: string[]
): { amount: number; recipientAddress?: string } {
  let totalInputs = 0
  let totalOutputs = 0
  let recipientAddress: string | undefined
  
  // Calculate total inputs from our wallet
  transaction.vin.forEach(input => {
    if (input.prevout?.scriptpubkey_address && 
        walletAddresses.includes(input.prevout.scriptpubkey_address)) {
      totalInputs += input.prevout.value
    }
  })
  
  // Calculate total outputs to our wallet and find recipient
  transaction.vout.forEach(output => {
    if (output.scriptpubkey_address) {
      if (walletAddresses.includes(output.scriptpubkey_address)) {
        totalOutputs += output.value
      } else if (!recipientAddress) {
        // First non-wallet address is likely the recipient
        recipientAddress = output.scriptpubkey_address
      }
    }
  })
  
  // Net amount is what we received minus what we sent
  const netAmount = totalOutputs - totalInputs
  
  return {
    amount : Math.abs(netAmount),
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
    id       : esploraTransaction.txid,
    type,
    amount, // Already in sats
    currency : 'sats',
    date     : esploraTransaction.status.block_time 
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
 * Fetches transaction history for a wallet
 */
export async function fetchTransactionHistory(
  wallet: BitcoinWallet,
  limit: number = 50
): Promise<Transaction[]> {
  try {
    // Get all wallet addresses
    const allAddresses = [
      ...wallet.addresses.legacy,
      ...wallet.addresses.segwit,
      ...wallet.addresses.nativeSegwit
    ]
    
    console.log(`🔍 [TransactionHistoryService] Fetching transactions for ${allAddresses.length} addresses...`)
    
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
    
    // Transform to UI format
    const uiTransactions = uniqueTransactions
      .slice(0, limit)
      .map(tx => transformTransaction(tx, allAddresses))
    
    console.log(`✅ [TransactionHistoryService] Found ${uiTransactions.length} transactions`)
    
    return uiTransactions
    
  } catch (error) {
    console.error('Failed to fetch transaction history:', error)
    throw new Error(`Failed to fetch transaction history: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Fetches detailed information for a specific transaction
 */
export async function fetchTransactionDetails(
  txid: string,
  wallet: BitcoinWallet
): Promise<Transaction | null> {
  try {
    console.log(`🔍 [TransactionHistoryService] Fetching details for transaction ${txid}`)
    
    const esploraTransaction = await getTransactionDetails(txid)
    
    // Get all wallet addresses for context
    const allAddresses = [
      ...wallet.addresses.legacy,
      ...wallet.addresses.segwit,
      ...wallet.addresses.nativeSegwit
    ]
    
    const transaction = transformTransaction(esploraTransaction, allAddresses)
    
    console.log(`✅ [TransactionHistoryService] Transaction details fetched for ${txid}`)
    
    return transaction
    
  } catch (error) {
    console.error(`Failed to fetch transaction details for ${txid}:`, error)
    return null
  }
}

/**
 * Gets the transaction status for display
 */
export function getTransactionStatusText(transaction: Transaction): string {
  switch (transaction.status) {
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
 * Formats transaction amount for display
 */
export function formatTransactionAmount(transaction: Transaction): string {
  const sign = transaction.type === 'send' ? '-' : '+'
  return `${sign}${transaction.amount.toLocaleString()} sats`
}

/**
 * Gets the appropriate address for display (recipient for sends, sender for receives)
 */
export function getDisplayAddress(transaction: Transaction): string {
  if (transaction.type === 'send' && transaction.recipient) {
    return transaction.recipient
  }
  
  // For receives, we don't typically show the sender address
  // Return a placeholder or the transaction ID
  return `Transaction ${transaction.txid?.slice(0, 8) || transaction.id}...`
} 