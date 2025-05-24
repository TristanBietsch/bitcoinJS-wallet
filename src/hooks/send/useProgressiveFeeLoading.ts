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
  const isInitializedRef = useRef(false)

  // Clear cache - stable function
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
    
    setFeeRates(undefined)
    setFeeOptions([])
    setFeeError(undefined)
  }, [ setFeeRates, setFeeOptions, setFeeError ])

  // Core fee loading logic - stable function
  const loadFees = useCallback(async (showLoading: boolean = false) => {
    // Validate inputs
    if (!address || !amount) {
      clearCache()
      return
    }

    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      clearCache()
      return
    }

    if (showLoading) {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      setIsLoadingFees(true)
    } else {
      setState(prev => {
        if (prev.isBackgroundRefreshing) return prev
        return { ...prev, isBackgroundRefreshing: true }
      })
    }

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
        isLoading              : false,
        isBackgroundRefreshing : false,
        feeRates,
        feeOptions,
        lastUpdated            : Date.now(),
        error                  : null,
        cacheAge               : 0
      }))

      // Update store with fresh data
      setFeeRates(feeRates)
      setFeeOptions(feeOptions)
      setIsLoadingFees(false)
      setFeeError(undefined)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load fee estimates'
      
      setState(prev => ({
        ...prev,
        isLoading              : false,
        isBackgroundRefreshing : false,
        error                  : errorMessage
      }))

      setIsLoadingFees(false)
      setFeeError(errorMessage)
    }
  }, [ address, amount, clearCache, setFeeRates, setFeeOptions, setIsLoadingFees, setFeeError ])

  // Main refresh function (with loading state)
  const refreshFees = useCallback(async () => {
    await loadFees(true)
  }, [ loadFees ])

  // Force refresh (ignores cache)
  const forceRefresh = useCallback(async () => {
    setState(prev => ({ ...prev, lastUpdated: null }))
    await loadFees(true)
  }, [ loadFees ])

  // Background refresh without loading state
  const refreshFeesInBackground = useCallback(async () => {
    await loadFees(false)
  }, [ loadFees ])

  // Start background refresh timer - stable function that doesn't change
  const startBackgroundRefresh = useCallback(() => {
    if (backgroundTimerRef.current) {
      clearInterval(backgroundTimerRef.current)
    }

    backgroundTimerRef.current = setInterval(() => {
      setState(prev => {
        const now = Date.now()
        const newCacheAge = prev.lastUpdated ? now - prev.lastUpdated : 0
        
        // Only refresh if data is getting stale
        if (prev.lastUpdated && 
            newCacheAge > FEE_CACHE_CONFIG.backgroundRefresh &&
            !prev.isBackgroundRefreshing) {
          refreshFeesInBackground()
        }
        
        return prev.cacheAge !== newCacheAge ? { ...prev, cacheAge: newCacheAge } : prev
      })
    }, 10000) // Check every 10 seconds
  }, [ refreshFeesInBackground ])

  // Effect to handle address/amount changes
  useEffect(() => {
    // Only run after initial mount
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      return
    }

    if (address && amount) {
      const numericAmount = parseFloat(amount)
      if (!isNaN(numericAmount) && numericAmount > 0) {
        loadFees(true)
        startBackgroundRefresh()
      } else {
        clearCache()
      }
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
  }, [ address, amount, loadFees, startBackgroundRefresh, clearCache ])

  // Initial load effect - runs once on mount
  useEffect(() => {
    if (address && amount) {
      const numericAmount = parseFloat(amount)
      if (!isNaN(numericAmount) && numericAmount > 0) {
        loadFees(true)
        startBackgroundRefresh()
      }
    }
  }, [ address, amount, loadFees, startBackgroundRefresh ])

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