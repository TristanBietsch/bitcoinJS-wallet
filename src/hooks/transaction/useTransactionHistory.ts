/**
 * Unified Transaction History Hook
 * 
 * Single hook for all transaction history operations
 * Uses React Query for caching and background updates
 * Integrates with wallet store and transaction history service
 * Follows existing hook patterns in the codebase
 * 
 * Enhanced with pagination and performance optimizations
 */

import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useWalletStore } from '../../store/walletStore'
import { usePendingTransactionsStore } from '../../store/pendingTransactionsStore'
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
  paged   : (walletId: string) => [ 'transactions', 'paged', walletId ],
} as const

// Configuration for pagination and performance
const PAGINATION_CONFIG = {
  pageSize          : 25,  // Transactions per page
  maxPages          : 20,  // Maximum pages to cache
  staleTime         : 2 * 60 * 1000,  // 2 minutes for page data
  backgroundRefresh : 5 * 60 * 1000,  // 5 minutes for background refresh
}

// Error recovery configuration
const ERROR_RECOVERY_CONFIG = {
  maxRetries        : 5,    // Maximum retry attempts
  baseRetryDelay    : 1000, // Base delay between retries (ms)
  maxRetryDelay     : 30000, // Maximum delay between retries (ms)
  offlineRetryDelay : 60000, // Delay when offline (1 minute)
}

/**
 * Enhanced retry delay function with exponential backoff
 */
function createEnhancedRetryDelay(attemptIndex: number, error: any) {
  const isNetworkError = error?.message?.toLowerCase().includes('network') ||
                        error?.message?.toLowerCase().includes('fetch') ||
                        error?.message?.toLowerCase().includes('timeout')
  
  if (isNetworkError) {
    return ERROR_RECOVERY_CONFIG.offlineRetryDelay
  }
  
  return Math.min(
    ERROR_RECOVERY_CONFIG.baseRetryDelay * Math.pow(2, attemptIndex),
    ERROR_RECOVERY_CONFIG.maxRetryDelay
  )
}

/**
 * Hook for fetching transaction history with pagination support
 */
export function useTransactionHistory(limit: number = 50) {
  const { wallet } = useWalletStore()
  const queryClient = useQueryClient()
  const { pendingTransactions } = usePendingTransactionsStore()
  
  const query = useQuery({
    queryKey : wallet ? [
      ...TRANSACTION_QUERY_KEYS.history(wallet.id), 
      'pending-count', 
      pendingTransactions.length
    ] : [ 'transactions', 'no-wallet' ],
    queryFn : async (): Promise<Transaction[]> => {
      if (!wallet) {
        return []
      }
      
      console.log(`🔄 [useTransactionHistory] Fetching transactions (pending: ${pendingTransactions.length})`)
      return fetchTransactionHistory(wallet, limit)
    },
    enabled              : !!wallet, // Only fetch when wallet is available
    staleTime            : 10 * 60 * 1000, // 10 minutes (simplified)
    gcTime               : 30 * 60 * 1000, // 30 minutes cache time
    refetchOnWindowFocus : false, // Don't refetch on window focus
    refetchOnMount       : false, // Don't refetch on mount - use cached data
    retry                : 3, // Retry failed requests 3 times
    retryDelay           : (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
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
    error   : query.error,
    isError : query.isError,
    
    // Success state
    isSuccess : query.isSuccess,
    
    // Actions
    refresh    : refreshHistory,
    invalidate : invalidateHistory,
    
    // Status info
    lastUpdated : query.dataUpdatedAt,
    fetchStatus : query.fetchStatus,
  }
}

/**
 * Hook for infinite scrolling transaction history
 * Provides better performance for large transaction lists
 */
export function useInfiniteTransactionHistory() {
  const { wallet } = useWalletStore()
  const { pendingTransactions } = usePendingTransactionsStore()
  
  const query = useInfiniteQuery({
    queryKey : wallet ? [
      ...TRANSACTION_QUERY_KEYS.paged(wallet.id), 
      'pending-count', 
      pendingTransactions.length
    ] : [ 'transactions', 'paged', 'no-wallet' ],
    queryFn : async ({ pageParam }: { pageParam: number }): Promise<{
      transactions: Transaction[]
      nextPage?: number
      hasMore: boolean
    }> => {
      if (!wallet) {
        return { transactions: [], hasMore: false }
      }
      
      const offset = pageParam * PAGINATION_CONFIG.pageSize
      const transactions = await fetchTransactionHistory(
        wallet, 
        PAGINATION_CONFIG.pageSize,
        offset
      )
      
      const hasMore = transactions.length === PAGINATION_CONFIG.pageSize
      const nextPage = hasMore ? pageParam + 1 : undefined
      
      return {
        transactions,
        nextPage,
        hasMore
      }
    },
    initialPageParam     : 0,
    enabled              : !!wallet,
    getNextPageParam     : (lastPage: any) => lastPage.nextPage,
    staleTime            : PAGINATION_CONFIG.staleTime,
    gcTime               : 15 * 60 * 1000, // 15 minutes cache time for pages
    maxPages             : PAGINATION_CONFIG.maxPages,
    refetchOnWindowFocus : false,
    retry                : ERROR_RECOVERY_CONFIG.maxRetries,
    retryDelay           : createEnhancedRetryDelay,
  })
  
  // Flatten all pages into single transaction array
  const allTransactions = query.data?.pages?.flatMap(page => page.transactions) || []
  
  return {
    // Data
    transactions : allTransactions,
    pages        : query.data?.pages || [],
    
    // Pagination state
    hasNextPage        : query.hasNextPage,
    isFetchingNextPage : query.isFetchingNextPage,
    
    // Loading states
    isLoading    : query.isLoading,
    isFetching   : query.isFetching,
    isRefreshing : query.isRefetching,
    
    // Error states
    error   : query.error,
    isError : query.isError,
    
    // Success state
    isSuccess : query.isSuccess,
    
    // Actions
    fetchNextPage : query.fetchNextPage,
    refresh       : query.refetch,
    
    // Status info
    lastUpdated : query.dataUpdatedAt,
  }
}

/**
 * Hook for fetching individual transaction details with enhanced caching
 */
export function useTransactionDetails(txid: string | undefined) {
  const { wallet } = useWalletStore()
  
  const query = useQuery({
    queryKey : txid ? TRANSACTION_QUERY_KEYS.details(txid) : [ 'transactions', 'no-txid' ],
    queryFn  : async (): Promise<Transaction | null> => {
      if (!txid || !wallet) {
        return null
      }
      
      return fetchTransactionDetails(txid, wallet)
    },
    enabled              : !!txid && !!wallet, // Only fetch when both txid and wallet are available
    staleTime            : 60 * 60 * 1000, // 1 hour - transaction details are immutable
    gcTime               : 2 * 60 * 60 * 1000, // 2 hours cache time
    refetchOnWindowFocus : false,
    retry                : 3,
    retryDelay           : (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
  
  return {
    // Data
    transaction : query.data,
    
    // Loading states
    isLoading  : query.isLoading,
    isFetching : query.isFetching,
    
    // Error states
    error   : query.error,
    isError : query.isError,
    
    // Success state
    isSuccess : query.isSuccess,
    
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
 * Hook for managing transaction query cache with performance optimizations
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
  
  const clearOldCache = () => {
    const cutoffTime = Date.now() - (60 * 60 * 1000) // 1 hour ago
    
    queryClient.getQueryCache().getAll().forEach(query => {
      if (query.queryKey[0] === 'transactions' && 
          query.state.dataUpdatedAt < cutoffTime) {
        queryClient.removeQueries({ queryKey: query.queryKey })
      }
    })
  }
  
  const prefetchTransaction = (txid: string) => {
    if (wallet) {
      queryClient.prefetchQuery({
        queryKey  : TRANSACTION_QUERY_KEYS.details(txid),
        queryFn   : () => fetchTransactionDetails(txid, wallet),
        staleTime : 60 * 60 * 1000, // 1 hour
      })
    }
  }
  
  const prefetchNextPage = (currentPage: number = 0) => {
    if (wallet) {
      queryClient.prefetchInfiniteQuery({
        queryKey : TRANSACTION_QUERY_KEYS.paged(wallet.id),
        queryFn  : async ({ pageParam }: { pageParam: number }) => {
          const offset = pageParam * PAGINATION_CONFIG.pageSize
          const transactions = await fetchTransactionHistory(
            wallet, 
            PAGINATION_CONFIG.pageSize,
            offset
          )
          
          return {
            transactions,
            nextPage : transactions.length === PAGINATION_CONFIG.pageSize ? pageParam + 1 : undefined,
            hasMore  : transactions.length === PAGINATION_CONFIG.pageSize
          }
        },
        initialPageParam : currentPage + 1,
        staleTime        : PAGINATION_CONFIG.staleTime,
      })
    }
  }
  
  return {
    invalidateAll,
    clearCache,
    clearOldCache,
    prefetchTransaction,
    prefetchNextPage,
    
    // Performance stats
    cacheStats : {
      totalQueries       : queryClient.getQueryCache().getAll().length,
      transactionQueries : queryClient.getQueryCache().getAll()
        .filter(q => q.queryKey[0] === 'transactions').length,
      cacheSize : queryClient.getQueryCache().getAll()
        .reduce((size, q) => size + JSON.stringify(q.state.data || '').length, 0)
    }
  }
}

/**
 * Main unified transaction hook with performance optimizations
 * Enhanced version with pagination and background sync capabilities
 */
export function useTransactions(options: {
  limit?: number
  enableHistory?: boolean
  enableUtils?: boolean
  enableInfiniteScroll?: boolean
  enableBackgroundRefresh?: boolean
} = {}) {
  const { 
    limit = 50, 
    enableHistory = true,
    enableUtils = true,
    enableInfiniteScroll = false,
    enableBackgroundRefresh = true
  } = options
  
  // Choose between regular and infinite query based on options
  const regularHistory = useTransactionHistory(enableHistory && !enableInfiniteScroll ? limit : 0)
  const infiniteHistory = useInfiniteTransactionHistory()
  
  // Select the appropriate history based on infinite scroll setting
  const history = enableInfiniteScroll ? {
    transactions       : infiniteHistory.transactions,
    isLoading          : infiniteHistory.isLoading,
    isFetching         : infiniteHistory.isFetching,
    isRefreshing       : infiniteHistory.isRefreshing,
    error              : infiniteHistory.error,
    isError            : infiniteHistory.isError,
    isSuccess          : infiniteHistory.isSuccess,
    refresh            : infiniteHistory.refresh,
    lastUpdated        : infiniteHistory.lastUpdated,
    fetchStatus        : 'idle' as const,
    // Infinite scroll specific
    hasNextPage        : infiniteHistory.hasNextPage,
    fetchNextPage      : infiniteHistory.fetchNextPage,
    isFetchingNextPage : infiniteHistory.isFetchingNextPage,
  } : {
    ...regularHistory,
    // Infinite scroll placeholders
    hasNextPage        : false,
    fetchNextPage      : () => Promise.resolve(),
    isFetchingNextPage : false,
  }
  
  // Utilities - always call this hook too to avoid conditional usage
  const utils = useTransactionUtils()
  
  // Cache management
  const cache = useTransactionCache()
  
  // Background refresh disabled - rely on manual refresh and cache invalidation instead
  
  return {
    // Data
    transactions : history.transactions,
    
    // Loading states
    isLoading    : history.isLoading,
    isFetching   : history.isFetching,
    isRefreshing : history.isRefreshing,
    
    // Error states
    error   : history.error,
    isError : history.isError,
    
    // Success state
    isSuccess : history.isSuccess,
    
    // Actions
    refresh    : history.refresh,
    invalidate : regularHistory.invalidate,
    
    // Infinite scroll (when enabled)
    hasNextPage        : history.hasNextPage,
    fetchNextPage      : history.fetchNextPage,
    isFetchingNextPage : history.isFetchingNextPage,
    
    // Utils (conditionally return based on enableUtils, but always call the hook)
    utils : enableUtils ? utils : null,
    
    // Cache management
    cache,
    
    // Status info
    lastUpdated : history.lastUpdated,
    fetchStatus : history.fetchStatus,
    
    // Performance info
    performance : {
      totalTransactions : history.transactions.length,
      enabledFeatures   : {
        infiniteScroll    : enableInfiniteScroll,
        backgroundRefresh : enableBackgroundRefresh,
        utils             : enableUtils,
      },
      cacheStats : cache.cacheStats
    }
  }
} 