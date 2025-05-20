import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query'
import { useWalletStore } from '../../store/walletStore'
import {
  // getUTXOs, // Not called directly, used in store
  // getTransactionHistory, // Not called directly, used in store
  getFeeEstimates,
  broadcastTransaction,
  // calculateWalletBalance, // Not called directly, used in store
} from '../../services/bitcoin/blockchain'
import {
  CURRENT_NETWORK,
} from '../../config/env'
// import type { EsploraUTXO } from '../../types/blockchain.types'; // Not directly used here
import type { /* EsploraUTXO, */ FeeRates, ProcessedTransaction } from '../../types/blockchain.types' // ProcessedTransaction is used in return type
// import { useEffect } from 'react' // Removed unused useEffect

interface UseWalletSyncOptions {
  currentAddress: string | null;
  enableAutoRefresh?: boolean;
  autoRefreshInterval?: number;
}

export function useWalletSync({ currentAddress }: UseWalletSyncOptions) {
  const queryClient = useQueryClient()

  const storeActions = useWalletStore(state => ({ 
    refreshWalletDataInStore : state.refreshWalletData, 
  }))
  const walletState = useWalletStore(state => ({
    balance            : state.balances.total,
    utxos              : state.utxos,
    transactions       : state.transactions as ProcessedTransaction[], // Explicitly type here
    lastSyncTimestamp  : state.lastSyncTime,
    isSyncingFromStore : state.isSyncing,
    errorFromStore     : state.error,
  }))

  const getQueryKey = (key: string): QueryKey => [ key, currentAddress, CURRENT_NETWORK ]

  // Define the query function for refreshing store data
  const refreshStoreDataQueryFn = async () => {
    if (!currentAddress) return null
    await storeActions.refreshWalletDataInStore(true, currentAddress) // true for silent from RQ perspective
    return true // Indicate success for React Query
  }

  // This query is the main trigger for the Zustand store's refreshWalletData action.
  // The store action itself handles fetching UTXOs, Txs, and calculating balance.
  const {
    isLoading: isLoadingStoreRefresh,
    isError: isErrorStoreRefresh,
    error: errorStoreRefresh,
    isFetching: isFetchingStoreRefresh, // Use isFetching for background updates
  } = useQuery(
    getQueryKey('walletStoreRefreshTrigger'),
    refreshStoreDataQueryFn, // Use the defined function
    {
      enabled              : !!currentAddress,
      refetchOnWindowFocus : true,
      // Let the store handle its own success/error states for data population.
      // This query just ensures the process is triggered.
    }
  )

  const { 
    data: feeEstimates, 
    isLoading: isLoadingFeeEstimates,
    isError: isErrorFeeEstimates, 
    error: errorFeeEstimates 
  } = useQuery<FeeRates, Error>(
    [ 'feeEstimates', CURRENT_NETWORK ],
    getFeeEstimates,
    {
      staleTime            : 300000, // 5 minutes
      refetchOnWindowFocus : false,
    }
  )

  const broadcastTxMutation = useMutation<string, Error, string, unknown>(
    broadcastTransaction, // Pass the function reference directly
    {
      onSuccess : () => {
        queryClient.invalidateQueries(getQueryKey('walletStoreRefreshTrigger'))
        console.log('Transaction broadcasted successfully, triggering wallet data refresh...')
      },
      onError : (error: Error) => {
        console.error('Failed to broadcast transaction:', error.message)
      },
    }
  )

  const refreshWalletData = () => {
    if (currentAddress) {
      queryClient.invalidateQueries(getQueryKey('walletStoreRefreshTrigger'))
    }
  }
  
  // Consolidate loading and error states from React Query and Zustand
  const isLoadingWalletData = isLoadingStoreRefresh || walletState.isSyncingFromStore || isFetchingStoreRefresh
  const walletDataError = errorStoreRefresh || (walletState.errorFromStore ? new Error(walletState.errorFromStore) : null)
  const isErrorWalletDataFinal = isErrorStoreRefresh || !!walletDataError

  return {
    // Data from Zustand Store
    balance           : walletState.balance,
    utxos             : walletState.utxos,
    transactions      : walletState.transactions,
    lastSyncTimestamp : walletState.lastSyncTimestamp,

    // Status for wallet data sync
    isLoadingWalletData,
    isErrorWalletData : isErrorWalletDataFinal,
    errorWalletData   : walletDataError,

    // Fee Estimates
    feeEstimates,
    isLoadingFeeEstimates,
    isErrorFeeEstimates,
    errorFeeEstimates : errorFeeEstimates as Error | null,

    // Actions
    broadcastTx : broadcastTxMutation,
    refreshWalletData,
  }
} 