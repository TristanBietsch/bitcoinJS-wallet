import { useState, useEffect } from 'react'
// import { useGlobalBitcoinPrice } from '@/src/context/PriceContext' // Old import
import { usePriceStore } from '@/src/store/priceStore' // New import for price
import { useWalletStore } from '@/src/store/walletStore' // New import
import { SATS_PER_BTC } from '@/src/constants/currency'

type WalletBalanceData = {
  btcAmount: number;
  usdAmount: number;
  satsAmount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

/**
 * Custom hook to fetch and manage wallet balance data
 * Uses real wallet data from WalletContext and price data from PriceContext
 */
export const useWalletBalance = (): WalletBalanceData => {
  // Get real-time Bitcoin price from priceStore
  const btcPrice = usePriceStore(state => state.btcPrice)
  const isPriceLoading = usePriceStore(state => state.isLoading)
  const priceError = usePriceStore(state => state.error)
  const fetchPrice = usePriceStore(state => state.fetchPrice) // Renamed refreshPrice to fetchPrice for consistency
  
  // Get wallet data from Zustand store using individual selectors
  const balances = useWalletStore(state => state.balances)
  const walletError = useWalletStore(state => state.error)
  const isWalletLoading = useWalletStore(state => state.isSyncing)
  const refreshBalance = useWalletStore(state => state.refreshWalletData)
  
  // Combine balance with price data
  const [ balanceData, setBalanceData ] = useState({
    btcAmount  : 0,
    usdAmount  : 0,
    satsAmount : 0
  })
  
  // Calculate derived values whenever the wallet balances or price changes
  useEffect(() => {
    const btcAmount = balances.total / SATS_PER_BTC
    const usdAmount = btcPrice ? btcAmount * btcPrice : 0
    
    setBalanceData({
      btcAmount,
      usdAmount,
      satsAmount : balances.total
    })
  }, [ balances, btcPrice ])
  
  // Combined loading state
  const isLoading = isPriceLoading || isWalletLoading
  
  // Combined error state (prioritize wallet errors over price errors)
  const error = walletError || priceError
  
  // Function to refresh both price and balance data
  const refreshAll = async () => {
    fetchPrice() // This will call usePriceStore's fetchPrice
    refreshBalance() // This will now call useWalletStore's refreshWalletData
  }

  return {
    ...balanceData,
    isLoading,
    error,
    refetch : refreshAll
  }
} 