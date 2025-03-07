import { useState, useEffect } from 'react';
import { getWalletBalance } from '@/utils/dummyWalletData';

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
 * This hook can be replaced with real API calls in the future
 */
export const useWalletBalance = (): WalletBalanceData => {
  const [balanceData, setBalanceData] = useState({
    btcAmount: 0,
    usdAmount: 0,
    satsAmount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In the future, this would be a real API call
      const data = getWalletBalance();
      
      setBalanceData(data);
    } catch (err) {
      setError('Failed to load balance data. Please try again.');
      console.error('Balance fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchBalance();
  }, []);

  return {
    ...balanceData,
    isLoading,
    error,
    refetch: fetchBalance
  };
}; 