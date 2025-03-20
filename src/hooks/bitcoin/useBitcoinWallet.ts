/**
 * Bitcoin Wallet Hook
 * Custom hook for interacting with Bitcoin wallet functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { bdkService } from '../../services/bitcoin/bdkService';

interface WalletState {
  balance: {
    confirmed: number;
    unconfirmed: number;
    total: number;
  };
  transactions: any[];
  isLoading: boolean;
  error: string | null;
}

export const useBitcoinWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    balance: {
      confirmed: 0,
      unconfirmed: 0,
      total: 0,
    },
    transactions: [],
    isLoading: false,
    error: null,
  });

  // Function to fetch wallet data
  const refreshWallet = useCallback(async () => {
    setWalletState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Get wallet balance
      const balance = await bdkService.getBalance();
      
      // Get transaction history
      const transactions = await bdkService.getTransactions();
      
      setWalletState({
        balance,
        transactions,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error refreshing wallet data:', error);
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load wallet data'
      }));
    }
  }, []);

  // Function to generate a new receiving address
  const getNewAddress = useCallback(async () => {
    try {
      return await bdkService.getNewAddress();
    } catch (error) {
      console.error('Error generating address:', error);
      setWalletState(prev => ({
        ...prev,
        error: 'Failed to generate new address'
      }));
      return null;
    }
  }, []);

  // Function to send Bitcoin
  const sendBitcoin = useCallback(async (address: string, amount: number, feeRate: number) => {
    try {
      setWalletState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await bdkService.sendTransaction(address, amount, feeRate);
      // Refresh wallet data after sending
      await refreshWallet();
      return result;
    } catch (error) {
      console.error('Error sending Bitcoin:', error);
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to send transaction'
      }));
      throw error;
    }
  }, [refreshWallet]);

  // Get fee estimates
  const getFeeEstimates = useCallback(async () => {
    try {
      return await bdkService.getFeeEstimates();
    } catch (error) {
      console.error('Error getting fee estimates:', error);
      return {
        high: 15,
        medium: 8,
        low: 3
      };
    }
  }, []);

  // Load wallet data on initial component mount
  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  return {
    balance: walletState.balance,
    transactions: walletState.transactions,
    isLoading: walletState.isLoading,
    error: walletState.error,
    refreshWallet,
    getNewAddress,
    sendBitcoin,
    getFeeEstimates,
  };
}; 