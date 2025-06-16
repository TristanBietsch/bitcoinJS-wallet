/**
 * Unified Transaction History Hook
 * 
 * Single hook for all transaction history operations
 * Uses React Query for caching and background updates
 * Integrates with wallet store and transaction history service
 * Follows existing hook patterns in the codebase
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useWalletStore } from '../../store/walletStore'
import { 
  fetchTransactionHistory, 
  fetchTransactionDetails,
  formatTransactionAmount,
  getTransactionStatusText,
  getDisplayAddress 
} from '../../services/bitcoin/transactionHistoryService'
import type { Transaction } from '../../types/domain/transaction/transaction.types'

// Query keys for React Query caching
export const TRANSACTION_QUERY_KEYS = {
  history : (walletId: string) => [ 'transactions', 'history', walletId ],
  details : (txid: string) => [ 'transactions', 'details', txid ],
  list    : () => [ 'transactions' ],
} as const

/**
 * Hook for fetching transaction history
 */
export function useTransactionHistory(limit: number = 50) {
  const { wallet } = useWalletStore()
  const queryClient = useQueryClient()
  
  const query = useQuery({
    queryKey    : wallet ? TRANSACTION_QUERY_KEYS.history(wallet.id) : [ 'transactions', 'no-wallet' ],
    queryFn     : async (): Promise<Transaction[]> => {
      if (!wallet) {
        return []
      }
      
      return await fetchTransactionHistory(wallet, limit)
    },
    enabled     : !!wallet, // Only fetch when wallet is available
    staleTime   : 5 * 60 * 1000, // 5 minutes - transactions don't change often
    gcTime      : 10 * 60 * 1000, // 10 minutes cache time
    refetchOnWindowFocus : false, // Don't refetch on window focus
    refetchOnMount       : 'always', // Always refetch on mount for fresh data
    retry       : 3, // Retry failed requests 3 times
    retryDelay  : (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
  
  // Invalidate transaction history when needed
  const invalidateHistory = () => {
    if (wallet) {
      queryClient.invalidateQueries({
        queryKey : TRANSACTION_QUERY_KEYS.history(wallet.id)
      })
    }
  }
  
  // Refresh transaction history manually
  const refreshHistory = () => {
    if (wallet) {
      return queryClient.refetchQueries({
        queryKey : TRANSACTION_QUERY_KEYS.history(wallet.id)
      })
    }
  }
  
  return {
    // Data
    transactions : query.data || [],
    
    // Loading states
    isLoading    : query.isLoading,
    isFetching   : query.isFetching,
    isRefreshing : query.isRefetching,
    
    // Error states
    error        : query.error,
    isError      : query.isError,
    
    // Success state
    isSuccess    : query.isSuccess,
    
    // Actions
    refresh      : refreshHistory,
    invalidate   : invalidateHistory,
    
    // Status info
    lastUpdated  : query.dataUpdatedAt,
    fetchStatus  : query.fetchStatus,
  }
}

/**
 * Hook for fetching individual transaction details
 */
export function useTransactionDetails(txid: string | undefined) {
  const { wallet } = useWalletStore()
  
  const query = useQuery({
    queryKey : txid ? TRANSACTION_QUERY_KEYS.details(txid) : [ 'transactions', 'no-txid' ],
    queryFn  : async (): Promise<Transaction | null> => {
      if (!txid || !wallet) {
        return null
      }
      
      return await fetchTransactionDetails(txid, wallet)
    },
    enabled     : !!txid && !!wallet, // Only fetch when both txid and wallet are available
    staleTime   : 60 * 60 * 1000, // 1 hour - transaction details are immutable
    gcTime      : 2 * 60 * 60 * 1000, // 2 hours cache time
    refetchOnWindowFocus : false,
    retry       : 3,
    retryDelay  : (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
  
  return {
    // Data
    transaction : query.data,
    
    // Loading states
    isLoading   : query.isLoading,
    isFetching  : query.isFetching,
    
    // Error states
    error       : query.error,
    isError     : query.isError,
    
    // Success state
    isSuccess   : query.isSuccess,
    
    // Status info
    lastUpdated : query.dataUpdatedAt,
  }
}

/**
 * Hook for transaction utilities and formatting
 */
export function useTransactionUtils() {
  return {
    formatAmount : formatTransactionAmount,
    getStatus    : getTransactionStatusText,
    getAddress   : getDisplayAddress,
  }
}

/**
 * Hook for managing transaction query cache
 */
export function useTransactionCache() {
  const queryClient = useQueryClient()
  const { wallet } = useWalletStore()
  
  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey : TRANSACTION_QUERY_KEYS.list()
    })
  }
  
  const clearCache = () => {
    queryClient.removeQueries({
      queryKey : TRANSACTION_QUERY_KEYS.list()
    })
  }
  
  const prefetchTransaction = (txid: string) => {
    if (wallet) {
      queryClient.prefetchQuery({
        queryKey : TRANSACTION_QUERY_KEYS.details(txid),
        queryFn  : () => fetchTransactionDetails(txid, wallet),
        staleTime : 60 * 60 * 1000, // 1 hour
      })
    }
  }
  
  return {
    invalidateAll,
    clearCache,
    prefetchTransaction,
  }
}

/**
 * Main unified transaction hook that combines all functionality
 * This is the primary hook that components should use
 */
export function useTransactions(options: {
  limit?: number
  enableHistory?: boolean
  enableUtils?: boolean
} = {}) {
  const { 
    limit = 50, 
    enableHistory = true,
    enableUtils = true 
  } = options
  
  // Core transaction history
  const history = useTransactionHistory(enableHistory ? limit : 0)
  
  // Utilities
  const utils = enableUtils ? useTransactionUtils() : null
  
  // Cache management
  const cache = useTransactionCache()
  
  return {
    // Data
    transactions : history.transactions,
    
    // Loading states
    isLoading    : history.isLoading,
    isFetching   : history.isFetching,
    isRefreshing : history.isRefreshing,
    
    // Error states
    error        : history.error,
    isError      : history.isError,
    
    // Success state
    isSuccess    : history.isSuccess,
    
    // Actions
    refresh      : history.refresh,
    invalidate   : history.invalidate,
    
    // Utils (if enabled)
    utils,
    
    // Cache management
    cache,
    
    // Status info
    lastUpdated  : history.lastUpdated,
    fetchStatus  : history.fetchStatus,
  }
} 