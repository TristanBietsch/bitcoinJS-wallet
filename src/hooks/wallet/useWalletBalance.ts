import { useState, useEffect } from 'react'
import { useGlobalBitcoinPrice } from '@/src/context/PriceContext'
import { SATS_PER_BTC } from '@/src/constants/currency'

// For now, we'll still use the mock BTC amount until we connect to a real wallet API
const DUMMY_WALLET_BTC_BALANCE = 1.47299012

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
 * Uses real-time BTC price for USD calculations
 */
export const useWalletBalance = (): WalletBalanceData => {
  // Get real-time Bitcoin price from context
  const { btcPrice, isLoading: isPriceLoading, error: priceError, refreshPrice } = useGlobalBitcoinPrice()
  
  const [ balanceData, setBalanceData ] = useState({
    btcAmount  : DUMMY_WALLET_BTC_BALANCE,
    usdAmount  : 0,
    satsAmount : Math.floor(DUMMY_WALLET_BTC_BALANCE * SATS_PER_BTC)
  })
  const [ isLoading, setIsLoading ] = useState(true)
  const [ error, setError ] = useState<string | null>(null)

  // Update USD amount whenever price changes
  useEffect(() => {
    if (btcPrice) {
      setBalanceData(prev => ({
        ...prev,
        usdAmount : prev.btcAmount * btcPrice
      }))
      setIsLoading(false)
    } else if (priceError) {
      setError(priceError)
      setIsLoading(false)
    } else {
      setIsLoading(isPriceLoading)
    }
  }, [ btcPrice, isPriceLoading, priceError ])

  // Function to refresh both price and balance data
  const refreshBalance = () => {
    setIsLoading(true)
    refreshPrice()
    // In the future, this would also refresh the BTC balance from the wallet API
  }

  return {
    ...balanceData,
    isLoading,
    error,
    refetch : refreshBalance
  }
} 