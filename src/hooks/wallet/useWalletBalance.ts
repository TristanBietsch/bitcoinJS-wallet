import { useEffect, useState } from 'react'
import { useWalletStore } from '@/src/store/walletStore' // Wallet data
import { SATS_PER_BTC } from '@/src/constants/currency'

export interface BalanceData {
  btcAmount: number;
  satsAmount: number;
}

/**
 * Custom hook to get wallet balance in BTC and SATS.
 */
export const useWalletBalance = () => { // Removed return type for now, will add back if needed
  // Get wallet data from Zustand store using individual selectors
  const balances = useWalletStore(state => state.balances)
  const isSyncing = useWalletStore(state => state.isSyncing) // Changed from isLoading to isSyncing
  const walletError = useWalletStore(state => state.error)
  const refreshWalletData = useWalletStore(state => state.refreshWalletData)

  // Define state for combined balance data
  const [ balanceData, setBalanceData ] = useState<BalanceData>({
    btcAmount  : 0,
    satsAmount : 0,
  })

  // Calculate derived values whenever the wallet balances changes
  useEffect(() => {
    if (balances) {
      const satsAmount = balances.total // total is in SATS
      const btcAmount = satsAmount / SATS_PER_BTC
      setBalanceData({
        btcAmount,
        satsAmount,
      })
    }
  }, [ balances ])

  // Combined loading state
  const isLoading = isSyncing // Use isSyncing as isLoading

  // Function to refresh balance data
  const refreshBalances = (silent?: boolean) => {
    refreshWalletData(silent)
  }

  return {
    ...balanceData,
    isLoading,
    error : walletError, // error directly from store
    refreshBalances,
  }
} 