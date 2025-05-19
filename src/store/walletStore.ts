import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
// SecureStore is now only used through secureStore utility
// import * as Keychain from 'react-native-keychain' // Unused
// import { Platform } from 'react-native' // Unused
import { BitcoinWallet } from '@/src/services/bitcoin/wallet/bitcoinWalletService'
import { seedPhraseService } from '@/src/services/bitcoin/wallet/seedPhraseService'
import { validateMnemonic } from '@/src/services/bitcoin/wallet/keyManagementService'
import { deriveAddresses } from '@/src/services/bitcoin/wallet/addressDerivationService'
import { getDefaultNetwork } from '@/src/services/bitcoin/network/bitcoinNetworkConfig'
import { walletBalanceService } from '@/src/services/api/walletBalanceService'
import { secureStore } from '@/src/services/storage/secureStore'
import { 
  // encryptData, // Unused in this file now
  // decryptData, // Unused in this file now
  // encryptWithWebCrypto, // Unused in this file now
  // decryptWithWebCrypto, // Unused in this file now
  deriveStorageKey,
  // generateRandomGarbageData // Unused in this file now
} from '@/src/utils/security/encryptionUtils'

// Define the wallet store state type
interface WalletState {
  // Wallet data
  wallet: BitcoinWallet | null
  seedPhrase: string | null
  balances: {
    confirmed: number
    unconfirmed: number
    total: number
  }
  transactions: any[] // Replace with proper transaction type
  
  // Sync and loading states
  lastSyncTime: number
  isSyncing: boolean
  error: string | null
  isInitialized: boolean
  
  // Actions
  initializeWallet: () => Promise<void>
  refreshWalletData: (silent?: boolean) => Promise<void>
  importWallet: (seedPhrase: string) => Promise<boolean>
  clearWallet: () => Promise<void>
}

// Create secure storage for sensitive data with enhanced encryption
const secureStorage = {
  getItem : async (key: string): Promise<string | null> => {
    try {
      // For all persistent data, use our enhanced secure store with derived keys
      const derivedKey = deriveStorageKey('nummus_wallet', key)
      return await secureStore.get(derivedKey)
    } catch (error) {
      console.error('Error retrieving from secure storage:', error)
      return null
    }
  },
  
  setItem : async (key: string, value: string): Promise<void> => {
    try {
      // For all persistent data, use our enhanced secure store with derived keys
      const derivedKey = deriveStorageKey('nummus_wallet', key)
      await secureStore.set(derivedKey, value)
    } catch (error) {
      console.error('Error saving to secure storage:', error)
    }
  },
  
  removeItem : async (key: string): Promise<void> => {
    try {
      // For all persistent data, use our enhanced secure store with derived keys
      const derivedKey = deriveStorageKey('nummus_wallet', key)
      await secureStore.delete(derivedKey)
    } catch (error) {
      console.error('Error removing from secure storage:', error)
    }
  }
}

// Create the wallet store with persistence
export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      wallet     : null,
      seedPhrase : null,
      balances   : {
        confirmed   : 0,
        unconfirmed : 0,
        total       : 0
      },
      transactions  : [],
      lastSyncTime  : 0,
      isSyncing     : false,
      error         : null,
      isInitialized : false,
      
      // Initialize wallet from secure storage
      initializeWallet : async () => {
        try {
          // Set initializing state
          set({ isSyncing: true, error: null })
          
          // Check if we already have wallet data
          const { wallet, seedPhrase } = get()
          
          if (wallet && seedPhrase) {
            // We're already initialized, just refresh data
            await get().refreshWalletData(true)
            set({ isInitialized: true })
            return
          }
          
          // Try to retrieve seed phrase from secure storage
          const storedSeedPhrase = await seedPhraseService.retrieveSeedPhrase()
          
          if (!storedSeedPhrase) {
            console.log('No seed phrase found in storage')
            set({ 
              isSyncing     : false, 
              isInitialized : true,
              wallet        : null,
              seedPhrase    : null,
              balances      : { confirmed: 0, unconfirmed: 0, total: 0 },
              transactions  : [],
              lastSyncTime  : 0
            })
            return
          }
          
          // Validate seed phrase
          if (!validateMnemonic(storedSeedPhrase)) {
            throw new Error('Invalid seed phrase retrieved from storage')
          }
          
          // Create wallet from seed phrase
          const network = getDefaultNetwork()
          const legacyAddresses = deriveAddresses(storedSeedPhrase, network, 'legacy', 0, 3)
          const segwitAddresses = deriveAddresses(storedSeedPhrase, network, 'segwit', 0, 3)
          const nativeSegwitAddresses = deriveAddresses(storedSeedPhrase, network, 'native_segwit', 0, 3)
          
          // Create wallet object
          const walletData: BitcoinWallet = {
            id        : 'primary_wallet',
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
          
          // Update state with wallet data
          set({ 
            wallet        : walletData,
            seedPhrase    : storedSeedPhrase,
            isInitialized : true 
          })
          
          // Fetch initial balances
          await get().refreshWalletData(false)
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error initializing wallet'
          console.error('Error initializing wallet:', errorMessage)
          set({ 
            error         : errorMessage,
            wallet        : null,
            seedPhrase    : null,
            balances      : { confirmed: 0, unconfirmed: 0, total: 0 },
            transactions  : [],
            lastSyncTime  : 0,
            isSyncing     : false,
            isInitialized : true
          })
        }
      },
      
      // Refresh wallet data (balances, transactions)
      refreshWalletData : async (silent = false) => {
        const { wallet } = get()
        if (!wallet) return
        
        try {
          // Only show loading state if not silent refresh
          if (!silent) {
            set({ isSyncing: true, error: null })
          }
          
          // Get the primary receiving address
          const address = wallet.addresses.nativeSegwit[0]
          
          // Fetch balance from service
          const balanceData = await walletBalanceService.getAddressBalance(address)
          
          // Calculate total balance
          const total = balanceData.confirmed + balanceData.unconfirmed
          
          // Only update if balance has changed to avoid unnecessary renders
          const currentBalances = get().balances
          const hasChanged = 
            currentBalances.confirmed !== balanceData.confirmed || 
            currentBalances.unconfirmed !== balanceData.unconfirmed
          
          if (hasChanged) {
            // Update balances in store
            set({ 
              balances : {
                confirmed   : balanceData.confirmed,
                unconfirmed : balanceData.unconfirmed,
                total
              },
              // Also update wallet object's balance
              wallet : {
                ...wallet,
                balances : {
                  confirmed   : balanceData.confirmed,
                  unconfirmed : balanceData.unconfirmed
                }
              },
              lastSyncTime : Date.now(),
            })
            
            console.log('Wallet balance updated:', balanceData)
          } else {
            console.log('Balance unchanged, skipping update')
            // Still update sync time
            set({ lastSyncTime: Date.now() })
          }
          
          // TODO: Add transaction history fetching here
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error refreshing wallet'
          console.error('Error refreshing wallet:', errorMessage)
          
          // Only set error state if not a silent refresh
          if (!silent) {
            set({ error: errorMessage })
          }
        } finally {
          // Only update loading state if not a silent refresh
          if (!silent) {
            set({ isSyncing: false })
          }
        }
      },
      
      // Import wallet from seed phrase
      importWallet : async (seedPhrase: string) => {
        try {
          set({ isSyncing: true, error: null })
          
          // Validate the seed phrase
          if (!validateMnemonic(seedPhrase)) {
            throw new Error('Invalid seed phrase')
          }
          
          // Save seed phrase to secure storage
          await seedPhraseService.storeSeedPhrase(seedPhrase)
          
          // Create wallet
          const network = getDefaultNetwork()
          const legacyAddresses = deriveAddresses(seedPhrase, network, 'legacy', 0, 3)
          const segwitAddresses = deriveAddresses(seedPhrase, network, 'segwit', 0, 3)
          const nativeSegwitAddresses = deriveAddresses(seedPhrase, network, 'native_segwit', 0, 3)
          
          // Create wallet object
          const walletData: BitcoinWallet = {
            id        : 'primary_wallet',
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
          
          // Update state with wallet data
          set({ 
            wallet        : walletData,
            seedPhrase    : seedPhrase,
            isInitialized : true 
          })
          
          // Fetch initial balances
          await get().refreshWalletData(true)
          
          return true
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error importing wallet'
          console.error('Error importing wallet:', errorMessage)
          set({ 
            error     : errorMessage,
            isSyncing : false
          })
          return false
        }
      },
      
      // Clear wallet data completely
      clearWallet : async () => {
        try {
          // Clear data from secure storage
          await seedPhraseService.removeSeedPhrase()
          
          // Reset store state
          set({
            wallet     : null,
            seedPhrase : null,
            balances   : {
              confirmed   : 0,
              unconfirmed : 0,
              total       : 0
            },
            transactions  : [],
            lastSyncTime  : 0,
            isSyncing     : false,
            error         : null,
            isInitialized : true // We still consider it initialized, just empty
          })
        } catch (error) {
          console.error('Error clearing wallet:', error)
          throw error
        }
      }
    }),
    {
      name    : 'nummus-wallet-storage',
      storage : createJSONStorage(() => secureStorage),
      
      // Only store non-sensitive data in persisted state
      // Seed phrase is stored separately via seedPhraseService
      partialize : (state) => ({
        wallet        : state.wallet,
        balances      : state.balances,
        transactions  : state.transactions,
        lastSyncTime  : state.lastSyncTime,
        isInitialized : state.isInitialized,
        // Excluding: seedPhrase, isSyncing, error
      }),
    }
  )
)

// Helper hooks for common wallet operations
export const useWalletBalance = () => {
  const { balances, error, isSyncing, refreshWalletData } = useWalletStore()
  return { 
    balances, 
    error, 
    isLoading      : isSyncing,
    refreshBalance : (silent?: boolean) => refreshWalletData(silent) 
  }
}

export const useWalletAddress = () => {
  const wallet = useWalletStore(state => state.wallet)
  // Default to native segwit as primary address
  return wallet?.addresses.nativeSegwit[0] || null
}

export const useWalletStatus = () => {
  return useWalletStore(state => ({
    isInitialized : state.isInitialized,
    hasWallet     : !!state.wallet,
    lastSyncTime  : state.lastSyncTime,
    isSyncing     : state.isSyncing
  }))
} 