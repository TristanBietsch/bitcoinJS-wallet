import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { BitcoinWallet } from '@/src/services/bitcoin/wallet/bitcoinWalletService'
import { seedPhraseService } from '@/src/services/bitcoin/wallet/seedPhraseService'
import { walletBalanceService } from '@/src/services/api/walletBalanceService'
import { validateMnemonic } from '@/src/services/bitcoin/wallet/keyManagementService'
import { deriveAddresses } from '@/src/services/bitcoin/wallet/addressDerivationService'
import { getDefaultNetwork } from '@/src/services/bitcoin/network/bitcoinNetworkConfig'

interface WalletContextType {
  wallet: BitcoinWallet | null;
  isLoading: boolean;
  error: string | null;
  balances: {
    confirmed: number;
    unconfirmed: number;
    total: number;
  };
  isBalanceLoading: boolean;
  balanceError: string | null;
  loadWallet: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const defaultContext: WalletContextType = {
  wallet    : null,
  isLoading : false,
  error     : null,
  balances  : {
    confirmed   : 0,
    unconfirmed : 0,
    total       : 0
  },
  isBalanceLoading : false,
  balanceError     : null,
  loadWallet       : async () => {},
  refreshBalance   : async () => {}
}

const WalletContext = createContext<WalletContextType>(defaultContext)

interface WalletProviderProps {
  children: ReactNode;
  autoLoad?: boolean;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ 
  children, 
  autoLoad = true
}) => {
  const [ wallet, setWallet ] = useState<BitcoinWallet | null>(null)
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const [ error, setError ] = useState<string | null>(null)
  
  const [ balances, setBalances ] = useState({
    confirmed   : 0,
    unconfirmed : 0,
    total       : 0
  })
  const [ isBalanceLoading, setIsBalanceLoading ] = useState<boolean>(false)
  const [ balanceError, setBalanceError ] = useState<string | null>(null)

  // Load wallet from storage
  const loadWallet = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // First, try to retrieve the stored seed phrase
      const seedPhrase = await seedPhraseService.retrieveSeedPhrase()
      if (!seedPhrase) {
        console.log('No seed phrase found in storage')
        setWallet(null)
        setIsLoading(false)
        return
      }
      
      // Validate the seed phrase
      if (!validateMnemonic(seedPhrase)) {
        throw new Error('Invalid seed phrase retrieved from storage')
      }
      
      console.log('Successfully retrieved and validated seed phrase')
      
      // Get the network
      const network = getDefaultNetwork()
      
      // Derive addresses for all types
      const legacyAddresses = deriveAddresses(seedPhrase, network, 'legacy', 0, 3)
      const segwitAddresses = deriveAddresses(seedPhrase, network, 'segwit', 0, 3)
      const nativeSegwitAddresses = deriveAddresses(seedPhrase, network, 'native_segwit', 0, 3)
      
      // Create wallet object
      const walletData: BitcoinWallet = {
        id        : 'primary_wallet', // Use a fixed ID for now
        network,
        addresses : {
          legacy       : legacyAddresses.map(addr => addr.address),
          segwit       : segwitAddresses.map(addr => addr.address),
          nativeSegwit : nativeSegwitAddresses.map(addr => addr.address)
        },
        balances : {
          confirmed   : 0,
          unconfirmed : 0
        }
      }
      
      // Set wallet in state
      setWallet(walletData)
      console.log('Wallet loaded with addresses:', walletData.addresses.nativeSegwit[0])
      
      // Fetch initial balance
      await refreshBalanceForWallet(walletData)
    } catch (err) {
      console.error('Error loading wallet:', err)
      setError(err instanceof Error ? err.message : 'Unknown error loading wallet')
      setWallet(null)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Refresh wallet balance
  const refreshBalanceForWallet = async (walletToRefresh: BitcoinWallet) => {
    if (!walletToRefresh) return
    
    try {
      setIsBalanceLoading(true)
      setBalanceError(null)
      
      // Get the primary receiving address
      const address = walletToRefresh.addresses.nativeSegwit[0]
      
      // Fetch balance from service
      const balanceData = await walletBalanceService.getAddressBalance(address)
      
      // Update balances
      const newBalances = {
        confirmed   : balanceData.confirmed,
        unconfirmed : balanceData.unconfirmed,
        total       : balanceData.confirmed + balanceData.unconfirmed
      }
      
      setBalances(newBalances)
      
      // Also update the wallet object
      setWallet(prev => {
        if (!prev) return null
        return {
          ...prev,
          balances : {
            confirmed   : balanceData.confirmed,
            unconfirmed : balanceData.unconfirmed
          }
        }
      })
      
      console.log('Wallet balance updated:', newBalances)
    } catch (err) {
      console.error('Error fetching wallet balance:', err)
      setBalanceError(err instanceof Error ? err.message : 'Unknown error fetching balance')
    } finally {
      setIsBalanceLoading(false)
    }
  }
  
  // Main refresh balance function
  const refreshBalance = async () => {
    if (wallet) {
      await refreshBalanceForWallet(wallet)
    }
  }
  
  // Auto-load wallet on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadWallet()
    }
  }, [ autoLoad ])
  
  // Create context value
  const contextValue: WalletContextType = {
    wallet,
    isLoading,
    error,
    balances,
    isBalanceLoading,
    balanceError,
    loadWallet,
    refreshBalance
  }
  
  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

// Hook to use the wallet context
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
} 