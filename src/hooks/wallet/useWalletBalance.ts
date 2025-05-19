import { useState, useEffect } from 'react'
import { useGlobalBitcoinPrice } from '@/src/context/PriceContext'
// import { useWallet } from '@/src/context/WalletContext' // Old import
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
  // Get real-time Bitcoin price from context
  const { btcPrice, isLoading: isPriceLoading, error: priceError, refreshPrice } = useGlobalBitcoinPrice()
  
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
    refreshPrice()
    refreshBalance() // This will now call useWalletStore's refreshWalletData
  }

  return {
    ...balanceData,
    isLoading,
    error,
    refetch : refreshAll
  }
} 