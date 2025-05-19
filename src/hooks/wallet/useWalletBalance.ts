import { useEffect, useState, useCallback } from 'react'
import { useWalletStore } from '@/src/store/walletStore' // Wallet data
import { SATS_PER_BTC } from '@/src/constants/currency'

export interface BalanceData {
  btcAmount: number;
  satsAmount: number;
}

/**
 * Custom hook to get wallet balance in BTC and SATS.
 */
export const useWalletBalance = () => {
  // Get wallet data from Zustand store using individual selectors
  const balances = useWalletStore(state => state.balances)
  const isSyncing = useWalletStore(state => state.isSyncing) 
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
      const satsAmount = balances.total || 0 // total is in SATS, default to 0 if undefined
      const btcAmount = satsAmount / SATS_PER_BTC
      
      // Only update state if values actually changed
      if (balanceData.satsAmount !== satsAmount || balanceData.btcAmount !== btcAmount) {
        setBalanceData({
          btcAmount,
          satsAmount,
        })
      }
    }
  }, [ balances, balanceData ])

  // Function to refresh balance data with better control over the silent parameter
  const refreshBalances = useCallback((silent = false) => {
    refreshWalletData(silent)
  }, [ refreshWalletData ])

  return {
    ...balanceData,
    isLoading : isSyncing,
    error     : walletError,
    refreshBalances,
  }
} 