import { useEffect, useRef, useCallback } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useWalletStore } from '@/src/store/walletStore'
import logger, { LogScope } from '@/src/utils/logger'

// Auto-sync configuration constants
const AUTO_SYNC_INTERVAL_MS = 30000 // 30 seconds
const MIN_TIME_BETWEEN_SYNCS = 10000 // 10 seconds minimum between syncs
const MAX_CONSECUTIVE_FAILURES = 5 // Stop auto-sync after 5 consecutive failures
const RETRY_BACKOFF_MULTIPLIER = 2 // Exponential backoff for retries
const MAX_RETRY_DELAY_MS = 300000 // Maximum 5-minute delay between retries

interface AutoSyncState {
  isActive : boolean
  consecutiveFailures : number
  lastSyncAttempt : number
  nextRetryTime : number
}

/**
 * Hook for automatic wallet synchronization with rate limiting and error handling
 * Fetches wallet balance every 30 seconds with intelligent backoff on failures
 */
export const useAutoWalletSync = () => {
  const { wallet, refreshWalletData, isSyncing, lastSyncTime } = useWalletStore()
  
  // Refs for persistent state across renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)
  const syncStateRef = useRef<AutoSyncState>({
    isActive            : false,
    consecutiveFailures : 0,
    lastSyncAttempt     : 0,
    nextRetryTime       : 0
  })

  // Calculate next retry delay with exponential backoff
  const calculateRetryDelay = useCallback((failures: number): number => {
    const baseDelay = AUTO_SYNC_INTERVAL_MS
    const backoffDelay = baseDelay * Math.pow(RETRY_BACKOFF_MULTIPLIER, failures)
    return Math.min(backoffDelay, MAX_RETRY_DELAY_MS)
  }, [])

  // Execute a single sync attempt with error handling
  const executeSyncAttempt = useCallback(async (): Promise<boolean> => {
    const now = Date.now()
    const state = syncStateRef.current

    // Check if we should skip this sync attempt
    if (!wallet) {
      logger.warn(LogScope.WALLET, 'Auto-sync skipped: No wallet available')
      return false
    }

    if (isSyncing) {
      logger.info(LogScope.WALLET, 'Auto-sync skipped: Sync already in progress')
      return false
    }

    if (now < state.nextRetryTime) {
      logger.info(LogScope.WALLET, 'Auto-sync skipped: Still in backoff period')
      return false
    }

    if (now - state.lastSyncAttempt < MIN_TIME_BETWEEN_SYNCS) {
      logger.info(LogScope.WALLET, 'Auto-sync rate limited')
      return false
    }

    // Check if too many consecutive failures
    if (state.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      logger.warn(LogScope.WALLET, `Auto-sync suspended after ${MAX_CONSECUTIVE_FAILURES} consecutive failures`)
      return false
    }

    try {
      state.lastSyncAttempt = now
      logger.info(LogScope.WALLET, 'Auto-sync executing...')
      
      await refreshWalletData(true) // Silent refresh
      
      // Success - reset failure counter
      state.consecutiveFailures = 0
      state.nextRetryTime = 0
      
      logger.info(LogScope.WALLET, 'Auto-sync completed successfully')
      return true
      
    } catch (error) {
      state.consecutiveFailures += 1
      const retryDelay = calculateRetryDelay(state.consecutiveFailures)
      state.nextRetryTime = now + retryDelay
      
      logger.warn(LogScope.WALLET, `Auto-sync failed (attempt ${state.consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES})`, error)
      logger.info(LogScope.WALLET, `Next retry in ${Math.round(retryDelay / 1000)} seconds`)
      
      return false
    }
  }, [ wallet, isSyncing, refreshWalletData, calculateRetryDelay ])

  // Start automatic synchronization
  const startAutoSync = useCallback(() => {
    const state = syncStateRef.current
    
    if (state.isActive) {
      logger.info(LogScope.WALLET, 'Auto-sync already active')
      return
    }

    logger.info(LogScope.WALLET, 'Starting auto-sync with 30-second interval')
    state.isActive = true
    state.consecutiveFailures = 0
    state.nextRetryTime = 0

    // Execute initial sync after a short delay
    setTimeout(() => {
      executeSyncAttempt()
    }, 2000)

    // Set up recurring sync
    intervalRef.current = setInterval(() => {
      executeSyncAttempt()
    }, AUTO_SYNC_INTERVAL_MS)

  }, [ executeSyncAttempt ])

  // Stop automatic synchronization
  const stopAutoSync = useCallback(() => {
    const state = syncStateRef.current
    
    if (!state.isActive) {
      return
    }

    logger.info(LogScope.WALLET, 'Stopping auto-sync')
    state.isActive = false

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Manual sync with rate limiting
  const manualSync = useCallback(async (): Promise<boolean> => {
    const now = Date.now()
    const state = syncStateRef.current

    if (now - state.lastSyncAttempt < MIN_TIME_BETWEEN_SYNCS) {
      logger.warn(LogScope.WALLET, 'Manual sync rate limited - please wait')
      return false
    }

    // Reset failure counter on manual sync
    state.consecutiveFailures = 0
    state.nextRetryTime = 0
    
    return executeSyncAttempt()
  }, [ executeSyncAttempt ])

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const prevState = appStateRef.current
      appStateRef.current = nextAppState

      // App coming to foreground from background
      if (prevState.match(/inactive|background/) && nextAppState === 'active') {
        logger.info(LogScope.WALLET, 'App foregrounded - triggering sync')
        
        // Trigger immediate sync when app comes to foreground
        setTimeout(() => {
          executeSyncAttempt()
        }, 1000)
      }

      // App going to background
      if (nextAppState.match(/inactive|background/)) {
        logger.info(LogScope.WALLET, 'App backgrounded - continuing auto-sync')
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => subscription.remove()
  }, [ executeSyncAttempt ])

  // Start/stop auto-sync based on wallet availability
  useEffect(() => {
    if (wallet) {
      startAutoSync()
    } else {
      stopAutoSync()
    }

    // Cleanup on unmount
    return () => {
      stopAutoSync()
    }
  }, [ wallet, startAutoSync, stopAutoSync ])

  // Get current sync status
  const getSyncStatus = useCallback(() => {
    const state = syncStateRef.current
    const now = Date.now()
    
    return {
      isAutoSyncActive      : state.isActive,
      consecutiveFailures   : state.consecutiveFailures,
      maxFailures           : MAX_CONSECUTIVE_FAILURES,
      isSuspended           : state.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES,
      secondsUntilNextRetry : state.nextRetryTime > now ? Math.ceil((state.nextRetryTime - now) / 1000) : 0,
      lastSyncTime,
      canManualSync         : now - state.lastSyncAttempt >= MIN_TIME_BETWEEN_SYNCS,
    }
  }, [ lastSyncTime ])

  return {
    manualSync,
    getSyncStatus,
    startAutoSync,
    stopAutoSync,
  }
} 