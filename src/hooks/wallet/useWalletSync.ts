import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useWalletStore } from '../../store/walletStore'
import { getUtxos, getTxs } from '../../services/bitcoin/blockchain'
import type { 
    EsploraTransaction, 
    EsploraUTXO
} from '../../types/blockchain.types' // Corrected import path for types

export function useWalletSync() {
  const {
    wallet,
    isSyncing: storeIsSyncing, // Zustand's syncing state
    lastSyncTime: storeLastSyncTime,
    error: storeError,
  } = useWalletStore(state => ({
    wallet       : state.wallet,
    isSyncing    : state.isSyncing,
    lastSyncTime : state.lastSyncTime,
    error        : state.error,
  }))
  
  const { refreshWalletData } = useWalletStore.getState()

  const primaryAddress = wallet?.addresses.nativeSegwit[0]

  const utxosQuery = useQuery<EsploraUTXO[], Error>({
    queryKey : [ 'utxos', primaryAddress ],
    queryFn  : () => {
      if (!primaryAddress) throw new Error('Primary address not available for fetching UTXOs.')
      return getUtxos(primaryAddress)
    },
    enabled : !!primaryAddress,
  })

  const transactionsQuery = useQuery<EsploraTransaction[], Error>({
    queryKey : [ 'transactions', primaryAddress ],
    queryFn  : () => {
      if (!primaryAddress) throw new Error('Primary address not available for fetching transactions.')
      return getTxs(primaryAddress)
    },
    enabled : !!primaryAddress,
  })
  
  const isQueryFetching = utxosQuery.isFetching || transactionsQuery.isFetching
  const queryError = utxosQuery.error || transactionsQuery.error

  const syncWallet = async () => {
    if (!primaryAddress) {
      console.warn('[useWalletSync] Cannot sync: Wallet address not available.')
      // store.setError could be called here, but refreshWalletData should also handle it.
      return
    }
    // Let refreshWalletData in the store handle its own isSyncing and error states.
    await refreshWalletData(false, primaryAddress) // silent = false, allows store to manage its full sync state
  }

  useEffect(() => {
    if (primaryAddress && !storeIsSyncing && !isQueryFetching) {
      // syncWallet(); // Uncomment to enable auto-sync behavior
    }
  }, [ primaryAddress, storeIsSyncing, isQueryFetching, refreshWalletData ])

  return {
    isLoading    : isQueryFetching, // Reflects React Query's fetching state (isFetching is often better than isLoading for this pattern)
    isSyncing    : storeIsSyncing,  // Reflects Zustand's isSyncing state (primarily set by refreshWalletData)
    error        : queryError ? queryError.message : storeError, // Prefer React Query error, fallback to store error
    syncWallet,
    lastSyncTime : storeLastSyncTime,
    utxos        : utxosQuery.data, // Raw data from React Query
    transactions : transactionsQuery.data, // Raw data from React Query
  }
} 