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

const DEFAULT_CHECK_INTERVAL = 15000 // 15 seconds

export const useAddressMonitoring = ({
  address,
  checkInterval = DEFAULT_CHECK_INTERVAL,
}: UseAddressMonitoringProps): UseAddressMonitoringResult => {
  const [ monitoredBalance, setMonitoredBalance ] = useState<number>(0)
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const [ error, setError ] = useState<Error | null>(null)
  const refreshWalletData = useWalletStore((state) => state.refreshWalletData)

  const fetchAddressBalance = useCallback(async () => {
    if (!address) {
      setMonitoredBalance(0)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const currentBalance = await getBalance(address)
      setMonitoredBalance(currentBalance)

      // If balance has increased, trigger a full wallet refresh
      if (currentBalance > monitoredBalance) { // check against previous state value
        console.log(
          `New funds detected for address ${address}. Current balance: ${currentBalance}. Triggering full wallet refresh.`,
        )
        await refreshWalletData(true, address) // Pass address, silent true
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Failed to fetch address balance')
      console.error(`Error monitoring address ${address}:`, err)
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [ address, refreshWalletData, monitoredBalance ])

  // Effect for interval-based polling
  useEffect(() => {
    if (!address) return

    fetchAddressBalance() // Initial check

    const intervalId = setInterval(fetchAddressBalance, checkInterval)
    return () => clearInterval(intervalId)
  }, [ address, checkInterval, fetchAddressBalance ])

  // Effect for app state changes (resume)
  useEffect(() => {
    if (!address) return

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('App resumed, checking address balance:', address)
        fetchAddressBalance()
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
    forceCheck : fetchAddressBalance, // Expose a manual refresh for this address
  }
} 