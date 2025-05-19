import { useEffect, useState, useCallback, useRef } from 'react'
import { useWalletStore } from '@/src/store/walletStore' // Wallet data
import { SATS_PER_BTC } from '@/src/constants/currency'
import { AppState, AppStateStatus } from 'react-native'

export interface BalanceData {
  btcAmount: number;
  satsAmount: number;
}

// Store the last known balance data at module level so it persists between component mounts
let lastKnownBalance: BalanceData = {
  btcAmount  : 0,
  satsAmount : 0
}

/**
 * Custom hook to get wallet balance in BTC and SATS.
 * Includes background refresh and persistence between screen changes.
 */
export const useWalletBalance = () => {
  // Get wallet data from Zustand store using individual selectors
  const balances = useWalletStore(state => state.balances)
  const isSyncing = useWalletStore(state => state.isSyncing) 
  const walletError = useWalletStore(state => state.error)
  const refreshWalletData = useWalletStore(state => state.refreshWalletData)
  const lastSyncTime = useWalletStore(state => state.lastSyncTime)

  // Use the persistent balance data as initial state
  const [ balanceData, setBalanceData ] = useState<BalanceData>(lastKnownBalance)
  
  // Tracking refresh intervals
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const backgroundRefreshActive = useRef<boolean>(false)
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)

  // Calculate derived values whenever the wallet balances changes
  useEffect(() => {
    if (balances) {
      // Wallet stores balances in SATS internally
      const satsAmount = balances.total || 0
      // Convert to BTC for display purposes
      const btcAmount = satsAmount / SATS_PER_BTC
      
      // Check if values actually changed
      if (satsAmount !== balanceData.satsAmount || btcAmount !== balanceData.btcAmount) {
        const newBalanceData = {
          btcAmount  : btcAmount,
          satsAmount : satsAmount,
        }
        
        // Update component state
        setBalanceData(newBalanceData)
        
        // Also update the module-level persistent cache
        lastKnownBalance = newBalanceData
      }
    }
  }, [ balances, balanceData ])

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // If app came to foreground from background
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground, refreshing wallet data')
        refreshWalletData(true) // Silent refresh when returning to app
      }
      appStateRef.current = nextAppState
    }

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange)
    
    return () => {
      subscription.remove()
    }
  }, [ refreshWalletData ])

  // Set up periodic background refreshes
  useEffect(() => {
    // Skip if already active
    if (backgroundRefreshActive.current) return
    
    // Set up a refresh interval (every 30 seconds)
    const startBackgroundRefresh = () => {
      backgroundRefreshActive.current = true
      refreshIntervalRef.current = setInterval(() => {
        console.log('Background refresh of wallet balance')
        refreshWalletData(true) // Silent refresh
      }, 30000) // 30 seconds
    }
    
    // Start the background refresh
    startBackgroundRefresh()
    
    // Clean up on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
      backgroundRefreshActive.current = false
    }
  }, [ refreshWalletData ])

  // Function to refresh balance data with better control over the silent parameter
  const refreshBalances = useCallback((silent = false) => {
    refreshWalletData(silent)
  }, [ refreshWalletData ])

  return {
    ...balanceData,
    isLoading : isSyncing,
    error     : walletError,
    refreshBalances,
    lastSyncTime,
  }
} 