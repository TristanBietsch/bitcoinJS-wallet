import { useEffect, useState, useCallback, useRef } from 'react'
import { useWalletStore } from '@/src/store/walletStore' // Wallet data
import { SATS_PER_BTC } from '@/src/constants/currency'
import { AppState, AppStateStatus } from 'react-native'
import logger, { LogScope } from '@/src/utils/logger'

export interface BalanceData {
  btcAmount: number;
  satsAmount: number;
}

// Store the last known balance data at module level so it persists between component mounts
let lastKnownBalance: BalanceData = {
  btcAmount  : 0,
  satsAmount : 0
}

// Rate limiting constants to prevent infinite loops
const REFRESH_INTERVAL_MS = 30000 // 30 seconds
const MIN_TIME_BETWEEN_REFRESHES = 5000 // 5 seconds minimum between manual refreshes
const MAX_FAILED_REFRESHES_BEFORE_BACKOFF = 3 // Stop automatic refresh after 3 consecutive failures

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
  
  // Tracking refresh intervals and rate limiting
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const backgroundRefreshActive = useRef<boolean>(false)
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)
  const lastManualRefreshRef = useRef<number>(0)
  const consecutiveFailuresRef = useRef<number>(0)
  const isUnmountedRef = useRef<boolean>(false)

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
        
        // Reset failure counter on successful balance update
        consecutiveFailuresRef.current = 0
      }
    }
  }, [ balances, balanceData ])

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // If app came to foreground from background
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        logger.divider('RUNTIME')
        logger.walletProgress('Foreground refresh triggered')
        
        // Rate limit foreground refreshes
        const now = Date.now()
        if (now - lastManualRefreshRef.current > MIN_TIME_BETWEEN_REFRESHES) {
          lastManualRefreshRef.current = now
                     refreshWalletData(true).catch((error) => {
             logger.warn(LogScope.WALLET, 'Foreground refresh failed', error)
             consecutiveFailuresRef.current += 1
           })
        }
      }
      appStateRef.current = nextAppState
    }

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange)
    
    return () => {
      subscription.remove()
    }
  }, [ refreshWalletData ])

  // Set up periodic background refreshes with enhanced rate limiting
  useEffect(() => {
    // Skip if already active or component is unmounting
    if (backgroundRefreshActive.current || isUnmountedRef.current) return
    
    // Set up a refresh interval (every 30 seconds)
    const startBackgroundRefresh = () => {
      backgroundRefreshActive.current = true
      
      const executeRefresh = async () => {
        // Check if component is still mounted and not too many failures
        if (isUnmountedRef.current || consecutiveFailuresRef.current >= MAX_FAILED_REFRESHES_BEFORE_BACKOFF) {
          return
        }
        
        try {
          logger.walletProgress('Background refresh triggered (30s interval)')
          await refreshWalletData(true) // Silent refresh
          consecutiveFailuresRef.current = 0 // Reset on success
                          } catch (error) {
           logger.warn(LogScope.WALLET, 'Background refresh failed', error)
           consecutiveFailuresRef.current += 1
           
           // If too many failures, temporarily stop automatic refresh
           if (consecutiveFailuresRef.current >= MAX_FAILED_REFRESHES_BEFORE_BACKOFF) {
             logger.warn(LogScope.WALLET, `Stopping automatic refresh after ${MAX_FAILED_REFRESHES_BEFORE_BACKOFF} consecutive failures`)
           }
         }
      }
      
      // Execute initial refresh after a short delay
      const initialDelay = setTimeout(executeRefresh, 2000) // 2 second delay on start
      
      // Set up recurring refresh
      refreshIntervalRef.current = setInterval(executeRefresh, REFRESH_INTERVAL_MS)
      
      // Clean up initial delay if component unmounts quickly
      return () => {
        clearTimeout(initialDelay)
      }
    }
    
    // Start the background refresh
    const cleanup = startBackgroundRefresh()
    
    // Clean up on unmount
    return () => {
      isUnmountedRef.current = true
      
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
      backgroundRefreshActive.current = false
      
      if (cleanup) {
        cleanup()
      }
    }
  }, [ refreshWalletData ])

  // Function to refresh balance data with better control over the silent parameter and rate limiting
  const refreshBalances = useCallback((silent = false) => {
    const now = Date.now()
    
    // Rate limit manual refreshes
    if (now - lastManualRefreshRef.current < MIN_TIME_BETWEEN_REFRESHES) {
      logger.warn('Manual refresh rate limited - please wait a moment')
      return Promise.resolve()
    }
    
    lastManualRefreshRef.current = now
    
    // Reset failure counter on manual refresh
    consecutiveFailuresRef.current = 0
    
    return refreshWalletData(silent).catch((error) => {
      logger.error('Manual refresh failed:', error)
      consecutiveFailuresRef.current += 1
      throw error
    })
  }, [ refreshWalletData ])

  return {
    ...balanceData,
    isLoading : isSyncing,
    error     : walletError,
    refreshBalances,
    lastSyncTime,
    // Add some debugging info
    refreshStats: {
      consecutiveFailures: consecutiveFailuresRef.current,
      isBackgroundActive: backgroundRefreshActive.current,
      canAutoRefresh: consecutiveFailuresRef.current < MAX_FAILED_REFRESHES_BEFORE_BACKOFF
    }
  }
} 