import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Transaction } from '../types/domain/transaction/transaction.types'

// Pending transaction with additional metadata
export interface PendingTransaction extends Omit<Transaction, 'id' | 'status' | 'confirmations'> {
  id: string // Same as txid for consistency
  status: 'sending' | 'pending' | 'failed'
  confirmations: 0 // Always 0 for pending transactions
  broadcastTime: number // Timestamp when broadcasted
  isOptimistic: true // Flag to identify optimistic transactions
}

interface PendingTransactionsState {
  // Data
  pendingTransactions: PendingTransaction[]
  
  // Actions
  addPendingTransaction: (transaction: Omit<PendingTransaction, 'broadcastTime' | 'isOptimistic'>) => void
  updateTransactionStatus: (txid: string, status: PendingTransaction['status']) => void
  removePendingTransaction: (txid: string) => void
  cleanupOldTransactions: () => void
  
  // Getters
  getPendingTransactionByTxid: (txid: string) => PendingTransaction | undefined
  hasPendingTransaction: (txid: string) => boolean
  getPendingCount: () => number
}

// Cleanup threshold - remove transactions older than 24 hours
const CLEANUP_THRESHOLD_MS = 24 * 60 * 60 * 1000

export const usePendingTransactionsStore = create<PendingTransactionsState>()(
  persist(
    (set, get) => ({
      // === DATA ===
      pendingTransactions : [],
      
      // === ACTIONS ===
      addPendingTransaction : (transaction) => {
        const pendingTransaction: PendingTransaction = {
          ...transaction,
          broadcastTime : Date.now(),
          isOptimistic  : true,
        }
        
        set((state) => ({
          pendingTransactions : [
            pendingTransaction,
            ...state.pendingTransactions.filter(tx => tx.txid !== transaction.txid)
          ]
        }))
        
        console.log(`✅ [PendingTransactionsStore] Added pending transaction: ${transaction.txid}`)
      },
      
      updateTransactionStatus : (txid, status) => {
        set((state) => ({
          pendingTransactions : state.pendingTransactions.map(tx =>
            tx.txid === txid ? { ...tx, status } : tx
          )
        }))
        
        console.log(`🔄 [PendingTransactionsStore] Updated transaction ${txid} status to: ${status}`)
      },
      
      removePendingTransaction : (txid) => {
        set((state) => ({
          pendingTransactions : state.pendingTransactions.filter(tx => tx.txid !== txid)
        }))
        
        console.log(`🗑️ [PendingTransactionsStore] Removed pending transaction: ${txid}`)
      },
      
      cleanupOldTransactions : () => {
        const now = Date.now()
        const threshold = now - CLEANUP_THRESHOLD_MS
        
        set((state) => ({
          pendingTransactions : state.pendingTransactions.filter(tx => 
            tx.broadcastTime > threshold
          )
        }))
        
        console.log(`🧹 [PendingTransactionsStore] Cleaned up old pending transactions`)
      },
      
      // === GETTERS ===
      getPendingTransactionByTxid : (txid) => {
        return get().pendingTransactions.find(tx => tx.txid === txid)
      },
      
      hasPendingTransaction : (txid) => {
        return get().pendingTransactions.some(tx => tx.txid === txid)
      },
      
      getPendingCount : () => {
        return get().pendingTransactions.length
      },
    }),
    {
      name       : 'pending-transactions-store',
      storage    : createJSONStorage(() => AsyncStorage),
      // Only persist the essential data
      partialize : (state) => ({
        pendingTransactions : state.pendingTransactions
      }),
    }
  )
) 