import { useState, useEffect, useCallback } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { getBalance } from '@/src/services/bitcoin/blockchain'
import { useWalletStore } from '@/src/store/walletStore'

interface UseAddressMonitoringProps {
  address: string | null;
  checkInterval?: number; // in milliseconds
}

interface UseAddressMonitoringResult {
  monitoredBalance: number;
  isLoading: boolean;
  error: Error | null;
  forceCheck: () => Promise<void>;
}

const DEFAULT_CHECK_INTERVAL = 30000 // Increased to 30 seconds to reduce API load
const MAX_RETRIES = 2
const RETRY_DELAY = 5000 // 5 seconds

export const useAddressMonitoring = ({
  address,
  checkInterval = DEFAULT_CHECK_INTERVAL,
}: UseAddressMonitoringProps): UseAddressMonitoringResult => {
  const [ monitoredBalance, setMonitoredBalance ] = useState<number>(0)
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const [ error, setError ] = useState<Error | null>(null)
  const [ retryCount, setRetryCount ] = useState<number>(0)
  const refreshWalletData = useWalletStore((state) => state.refreshWalletData)

  const fetchAddressBalance = useCallback(async (isRetry = false) => {
    if (!address) {
      setMonitoredBalance(0)
      setError(null)
      return
    }

    // Don't set loading state for retries to avoid UI flashing
    if (!isRetry) {
      setIsLoading(true)
    }
    
    try {
      console.log(`Checking balance for address: ${address}`)
      const currentBalance = await getBalance(address)
      setMonitoredBalance(currentBalance)
      setError(null) // Clear any previous errors on success
      setRetryCount(0) // Reset retry count on success

      // If balance has increased, trigger a full wallet refresh
      if (currentBalance > monitoredBalance) {
        console.log(
          `New funds detected for address ${address}. Current balance: ${currentBalance}. Triggering full wallet refresh.`,
        )
        await refreshWalletData(true, address) // Pass address, silent true
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Failed to fetch address balance')
      
      // Check if it's a timeout or network error
      const isNetworkError = err.message.includes('504') || 
                            err.message.includes('timeout') || 
                            err.message.includes('ECONNABORTED') ||
                            err.message.includes('Network Error')
      
      if (isNetworkError && retryCount < MAX_RETRIES) {
        console.warn(`Network error monitoring address ${address}, retrying in ${RETRY_DELAY/1000}s (attempt ${retryCount + 1}/${MAX_RETRIES})`)
        setRetryCount(prev => prev + 1)
        
        // Schedule a retry
        setTimeout(() => {
          fetchAddressBalance(true)
        }, RETRY_DELAY)
        
        // Don't set error for network errors that we're retrying
        return
      }
      
      // For non-network errors or after max retries, log and set error
      if (isNetworkError) {
        console.warn(`Address monitoring failed after ${MAX_RETRIES} retries. This is normal for new addresses on testnet.`)
        // Don't set error for failed monitoring of likely empty addresses
        setError(null)
      } else {
        console.error(`Error monitoring address ${address}:`, err)
        setError(err)
      }
    } finally {
      if (!isRetry) {
        setIsLoading(false)
      }
    }
  }, [ address, refreshWalletData, monitoredBalance, retryCount ])

  // Effect for interval-based polling
  useEffect(() => {
    if (!address) return

    // Initial check with a small delay to let the UI render first
    const initialTimeout = setTimeout(() => {
      fetchAddressBalance()
    }, 1000)

    // Set up interval for subsequent checks
    const intervalId = setInterval(() => {
      fetchAddressBalance()
    }, checkInterval)
    
    return () => {
      clearTimeout(initialTimeout)
      clearInterval(intervalId)
    }
  }, [ address, checkInterval, fetchAddressBalance ])

  // Effect for app state changes (resume)
  useEffect(() => {
    if (!address) return

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('App resumed, checking address balance:', address)
        // Small delay to avoid immediate API calls on app resume
        setTimeout(() => {
          fetchAddressBalance()
        }, 2000)
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => {
      subscription.remove()
    }
  }, [ address, fetchAddressBalance ])

  return {
    monitoredBalance,
    isLoading,
    error,
    forceCheck : () => fetchAddressBalance(false), // Expose a manual refresh for this address
  }
} 