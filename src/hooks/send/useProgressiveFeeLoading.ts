/**
 * Progressive Fee Loading Hook
 * Provides cached fee estimates with background updates for smooth UX
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSendStore } from '../../store/sendStore'
import { 
  getEnhancedFeeEstimates,
  calculateFeeOptions,
  type EnhancedFeeRates,
  type FeeOption
} from '../../services/bitcoin/feeEstimationService'

interface ProgressiveFeeState {
  isLoading: boolean
  isBackgroundRefreshing: boolean
  feeRates: EnhancedFeeRates | null
  feeOptions: FeeOption[]
  error: string | null
  lastUpdated: number | null
  cacheAge: number
}

interface ProgressiveFeeActions {
  refreshFees: () => Promise<void>
  clearCache: () => void
  forceRefresh: () => Promise<void>
}

interface UseProgressiveFeeLoadingReturn {
  state: ProgressiveFeeState
  actions: ProgressiveFeeActions
}

// Cache configuration
const FEE_CACHE_CONFIG = {
  maxAge            : 60 * 1000,           // 1 minute fresh
  staleAge          : 5 * 60 * 1000,     // 5 minutes stale but usable
  backgroundRefresh : 30 * 1000  // 30 seconds background refresh
}

/**
 * Hook for progressive fee loading with caching and background updates
 * Provides immediate cached results while fetching fresh data in background
 */
export function useProgressiveFeeLoading(): UseProgressiveFeeLoadingReturn {
  const { amount, address, setFeeRates, setFeeOptions, setIsLoadingFees, setFeeError } = useSendStore()
  
  const [ state, setState ] = useState<ProgressiveFeeState>({
    isLoading              : false,
    isBackgroundRefreshing : false,
    feeRates               : null,
    feeOptions             : [],
    error                  : null,
    lastUpdated            : null,
    cacheAge               : 0
  })

  const backgroundTimerRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Calculate cache age
  const updateCacheAge = useCallback(() => {
    if (state.lastUpdated) {
      setState(prev => ({
        ...prev,
        cacheAge : Date.now() - prev.lastUpdated!
      }))
    }
  }, [ state.lastUpdated ])

  // Start background refresh timer
  const startBackgroundRefresh = useCallback(() => {
    if (backgroundTimerRef.current) {
      clearInterval(backgroundTimerRef.current)
    }

    backgroundTimerRef.current = setInterval(() => {
      updateCacheAge()
      
      // Only refresh if data is getting stale and we have amount + address
      if (state.lastUpdated && 
          Date.now() - state.lastUpdated > FEE_CACHE_CONFIG.backgroundRefresh &&
          amount && parseFloat(amount) > 0 && address) {
        refreshFeesInBackground()
      }
    }, 10000) // Check every 10 seconds
  }, [ state.lastUpdated, amount, address ])

  // Refresh fees in background without loading state
  const refreshFeesInBackground = useCallback(async () => {
    if (state.isBackgroundRefreshing) return

    setState(prev => ({ ...prev, isBackgroundRefreshing: true }))

    try {
      const amountSats = Math.floor(parseFloat(amount || '0') * (amount?.includes('.') ? 100000000 : 1))
      
      if (amountSats <= 0) return

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const feeRates = await getEnhancedFeeEstimates()
      
      // Estimate transaction size (simplified for now)
      const estimatedTxSize = 200 // rough estimate for 1-2 inputs, 2 outputs
      const feeOptions = await calculateFeeOptions(estimatedTxSize)

      setState(prev => ({
        ...prev,
        feeRates,
        feeOptions,
        lastUpdated            : Date.now(),
        error                  : null,
        isBackgroundRefreshing : false,
        cacheAge               : 0
      }))

      // Update store with fresh data
      setFeeRates(feeRates)
      setFeeOptions(feeOptions)
      setFeeError(undefined)

    } catch (error) {
      // Don't show errors for background refreshes unless cache is very stale
      const isStale = state.lastUpdated && (Date.now() - state.lastUpdated) > FEE_CACHE_CONFIG.staleAge
      
      if (isStale) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to refresh fee estimates'
        setState(prev => ({ ...prev, error: errorMessage, isBackgroundRefreshing: false }))
        setFeeError(errorMessage)
      } else {
        setState(prev => ({ ...prev, isBackgroundRefreshing: false }))
      }
    }
  }, [ state.isBackgroundRefreshing, state.lastUpdated, amount, setFeeRates, setFeeOptions, setFeeError ])

  // Main refresh function (with loading state)
  const refreshFees = useCallback(async () => {
    const amountSats = Math.floor(parseFloat(amount || '0') * (amount?.includes('.') ? 100000000 : 1))
    
    if (amountSats <= 0) {
      setState(prev => ({ ...prev, feeOptions: [], feeRates: null }))
      setFeeOptions([])
      return
    }

    // If we have recent cached data, use it immediately and refresh in background
    const hasRecentCache = state.lastUpdated && 
      (Date.now() - state.lastUpdated) < FEE_CACHE_CONFIG.maxAge

    if (hasRecentCache && state.feeRates) {
      // Use cached data immediately
      setFeeRates(state.feeRates)
      setFeeOptions(state.feeOptions)
      setIsLoadingFees(false)
      
      // Refresh in background
      refreshFeesInBackground()
      return
    }

    // No recent cache, show loading state
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    setIsLoadingFees(true)

    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const feeRates = await getEnhancedFeeEstimates()
      
      // Estimate transaction size (simplified for now)
      const estimatedTxSize = 200 // rough estimate for 1-2 inputs, 2 outputs
      const feeOptions = await calculateFeeOptions(estimatedTxSize)

      setState(prev => ({
        ...prev,
        isLoading   : false,
        feeRates,
        feeOptions,
        lastUpdated : Date.now(),
        error       : null,
        cacheAge    : 0
      }))

      // Update store
      setFeeRates(feeRates)
      setFeeOptions(feeOptions)
      setIsLoadingFees(false)
      setFeeError(undefined)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load fee estimates'
      
      setState(prev => ({
        ...prev,
        isLoading : false,
        error     : errorMessage
      }))

      setIsLoadingFees(false)
      setFeeError(errorMessage)
    }
  }, [ amount, state.lastUpdated, state.feeRates, state.feeOptions, setFeeRates, setFeeOptions, setIsLoadingFees, setFeeError, refreshFeesInBackground ])

  // Force refresh (ignores cache)
  const forceRefresh = useCallback(async () => {
    setState(prev => ({ ...prev, lastUpdated: null }))
    await refreshFees()
  }, [ refreshFees ])

  // Clear cache
  const clearCache = useCallback(() => {
    setState({
      isLoading              : false,
      isBackgroundRefreshing : false,
      feeRates               : null,
      feeOptions             : [],
      error                  : null,
      lastUpdated            : null,
      cacheAge               : 0
    })
    
    setFeeOptions([])
    setFeeError(undefined)
  }, [ setFeeRates, setFeeOptions, setFeeError ])

  // Auto-refresh when amount or address changes
  useEffect(() => {
    if (amount && address) {
      refreshFees()
      startBackgroundRefresh()
    } else {
      clearCache()
    }

    return () => {
      if (backgroundTimerRef.current) {
        clearInterval(backgroundTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [ amount, address, refreshFees, startBackgroundRefresh, clearCache ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (backgroundTimerRef.current) {
        clearInterval(backgroundTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    state,
    actions : {
      refreshFees,
      clearCache,
      forceRefresh
    }
  }
} 