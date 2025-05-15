import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { BitcoinWallet } from '@/src/services/bitcoin/wallet/bitcoinWalletService'
import { seedPhraseService } from '@/src/services/bitcoin/wallet/seedPhraseService'
import { walletBalanceService } from '../services/api/walletBalanceService'
import { validateMnemonic } from '@/src/services/bitcoin/wallet/keyManagementService'
import { deriveAddresses } from '@/src/services/bitcoin/wallet/addressDerivationService'
import { getDefaultNetwork } from '@/src/services/bitcoin/network/bitcoinNetworkConfig'
import { useFocusEffect } from '@react-navigation/native'
import { AppState, AppStateStatus } from 'react-native'

// Keep a global reference to wallet state to ensure persistence across navigation
// This prevents the wallet state from being lost when the context is unmounted
const globalWalletState = {
  wallet   : null as BitcoinWallet | null,
  balances : {
    confirmed   : 0,
    unconfirmed : 0,
    total       : 0
  },
  lastRefreshTime : 0,
  isInitialized   : false
}

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
  refreshBalance: (showLoading?: boolean) => Promise<void>;
  silentRefreshBalance: () => Promise<void>;
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
  isBalanceLoading     : false,
  balanceError         : null,
  loadWallet           : async () => {},
  refreshBalance       : async () => {},
  silentRefreshBalance : async () => {}
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
  // Track if this is the first mount of the provider
  const isFirstMount = useRef(true)
  
  // Use the global wallet state if it exists, otherwise initialize with defaults
  const [ wallet, setWallet ] = useState<BitcoinWallet | null>(() => globalWalletState.wallet)
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const [ error, setError ] = useState<string | null>(null)
  
  const [ balances, setBalances ] = useState(() => globalWalletState.balances)
  const [ isBalanceLoading, setIsBalanceLoading ] = useState<boolean>(false)
  const [ balanceError, setBalanceError ] = useState<string | null>(null)
  const [ _lastRefreshTime, setLastRefreshTime ] = useState<number>(globalWalletState.lastRefreshTime)
  
  // Keep track of in-flight requests to prevent multiple simultaneous refreshes
  const refreshInProgress = useRef(false)

  // Load wallet from storage
  const loadWallet = async () => {
    // If wallet is already loaded or loading is in progress, don't reload
    if (globalWalletState.isInitialized || refreshInProgress.current) {
      console.log('Wallet already initialized, skipping loadWallet')
      return
    }
    
    try {
      refreshInProgress.current = true
      
      // Only show loading indicator on initial app load
      if (isFirstMount.current) {
        setIsLoading(true)
      }
      
      setError(null)
      
      // First, try to retrieve the stored seed phrase
      const seedPhrase = await seedPhraseService.retrieveSeedPhrase()
      if (!seedPhrase) {
        console.log('No seed phrase found in storage')
        setWallet(null)
        setIsLoading(false)
        refreshInProgress.current = false
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
      
      // Update global state first
      globalWalletState.wallet = walletData
      globalWalletState.isInitialized = true
      
      // Then update component state
      setWallet(walletData)
      console.log('Wallet loaded with addresses:', walletData.addresses.nativeSegwit[0])
      
      // Fetch initial balance - we want to show loading indicator for initial load
      await refreshBalanceForWallet(walletData, isFirstMount.current)
      
      // No longer first mount
      isFirstMount.current = false
    } catch (err) {
      console.error('Error loading wallet:', err)
      setError(err instanceof Error ? err.message : 'Unknown error loading wallet')
      setWallet(null)
    } finally {
      setIsLoading(false)
      refreshInProgress.current = false
    }
  }
  
  // Refresh wallet balance with option to show/hide loading indicator
  const refreshBalanceForWallet = async (walletToRefresh: BitcoinWallet, showLoading = true) => {
    if (!walletToRefresh || refreshInProgress.current) return
    
    refreshInProgress.current = true
    
    try {
      // Only show loading indicator if explicitly requested
      if (showLoading) {
        setIsBalanceLoading(true)
      }
      
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
      
      // Only update UI if balance has changed
      const hasBalanceChanged = 
        newBalances.confirmed !== balances.confirmed || 
        newBalances.unconfirmed !== balances.unconfirmed
        
      if (hasBalanceChanged) {
        // Update global state first
        globalWalletState.balances = newBalances
        
        // For silent refresh, don't trigger UI updates for same values
        setBalances(prev => {
          // Return the same object reference if values haven't changed
          // This prevents unnecessary re-renders
          if (prev.confirmed === newBalances.confirmed && 
              prev.unconfirmed === newBalances.unconfirmed &&
              prev.total === newBalances.total) {
            return prev
          }
          return newBalances
        })
        
        // Also update the wallet object
        setWallet(prev => {
          if (!prev) return null
          
          // Similarly, return same reference if no change
          if (prev.balances.confirmed === balanceData.confirmed &&
              prev.balances.unconfirmed === balanceData.unconfirmed) {
            return prev
          }
          
          // Update the global wallet state
          if (globalWalletState.wallet) {
            globalWalletState.wallet.balances = {
              confirmed   : balanceData.confirmed,
              unconfirmed : balanceData.unconfirmed
            }
          }
          
          return {
            ...prev,
            balances : {
              confirmed   : balanceData.confirmed,
              unconfirmed : balanceData.unconfirmed
            }
          }
        })
        
        console.log('Wallet balance updated:', newBalances)
      } else {
        console.log('Balance unchanged, skipping UI update')
      }
      
      // Update last refresh timestamp
      const now = Date.now()
      globalWalletState.lastRefreshTime = now
      setLastRefreshTime(now)
    } catch (err) {
      console.error('Error fetching wallet balance:', err)
      if (showLoading) {
        // Only show error in UI if we were showing loading state
        setBalanceError(err instanceof Error ? err.message : 'Unknown error fetching balance')
      }
    } finally {
      if (showLoading) {
        setIsBalanceLoading(false)
      }
      refreshInProgress.current = false
    }
  }
  
  // Main refresh balance function with loading indicator
  const refreshBalance = async (showLoading = true) => {
    if (wallet) {
      await refreshBalanceForWallet(wallet, showLoading)
    }
  }
  
  // Silent refresh without loading indicator
  const silentRefreshBalance = async () => {
    if (wallet) {
      // Don't show any loading indicators for silent refresh
      await refreshBalanceForWallet(wallet, false)
    }
  }
  
  // UseEffect hooks modified to ensure no blinking during navigation
  
  // Listen for app state changes to refresh balance when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && wallet) {
        // App has come to the foreground - completely silent refresh
        silentRefreshBalance()
      }
    })

    return () => {
      subscription.remove()
    }
  }, [ wallet ])
  
  // Auto-load wallet on mount if enabled, but only if not already initialized
  useEffect(() => {
    if (autoLoad && !globalWalletState.isInitialized) {
      loadWallet()
    }
  }, [ autoLoad ])
  
  // Periodic silent refresh (every 2 minutes if wallet is loaded)
  useEffect(() => {
    if (!wallet) return
    
    // First refresh on mount should happen silently in the background
    // Only if it's been more than 30 seconds since the last refresh
    const timeSinceLastRefresh = Date.now() - globalWalletState.lastRefreshTime
    if (timeSinceLastRefresh > 30 * 1000 && !isFirstMount.current) {
      silentRefreshBalance()
    }
    
    const refreshInterval = setInterval(() => {
      silentRefreshBalance()
    }, 2 * 60 * 1000) // 2 minutes
    
    return () => clearInterval(refreshInterval)
  }, [ wallet ])
  
  // Create context value
  const contextValue: WalletContextType = {
    wallet,
    isLoading,
    error,
    balances,
    isBalanceLoading,
    balanceError,
    loadWallet,
    refreshBalance,
    silentRefreshBalance
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

// Custom hook for screens to use that handles focus events
export const useWalletWithFocusRefresh = (): WalletContextType => {
  const walletContext = useWallet()
  const isInitialFocus = useRef(true)
  
  // Silently refresh balance when screen comes into focus
  // But NEVER show loading indicators or trigger UI changes
  useFocusEffect(
    React.useCallback(() => {
      if (walletContext.wallet) {
        // Skip the first focus event to prevent double loading
        // (since useEffect already triggered a load)
        if (isInitialFocus.current) {
          isInitialFocus.current = false
          return
        }
        
        // ALWAYS use silentRefreshBalance to prevent loading spinners
        setTimeout(() => {
          walletContext.silentRefreshBalance()
        }, 300) // Add a small delay to allow UI to settle first
      }
      return () => {}
    }, [ walletContext.wallet ])
  )
  
  return walletContext
}