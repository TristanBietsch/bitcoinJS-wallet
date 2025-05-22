import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { BitcoinWallet } from '@/src/services/bitcoin/wallet/bitcoinWalletService'
import { seedPhraseService } from '@/src/services/bitcoin/wallet/seedPhraseService'
import { validateMnemonic } from '@/src/services/bitcoin/wallet/keyManagementService'
import { deriveAddresses } from '@/src/services/bitcoin/wallet/addressDerivationService'
import { getDefaultNetwork } from '@/src/services/bitcoin/network/bitcoinNetworkConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  EsploraUTXO, 
  ProcessedTransaction 
} from '../types/blockchain.types'
import {
  getUtxos,
  getTxs,
} from '../services/bitcoin/blockchain'
import type { EsploraTransaction } from '../types/blockchain.types'

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
  utxos: EsploraUTXO[]
  transactions: ProcessedTransaction[]
  
  // Sync and loading states
  lastSyncTime: number
  isSyncing: boolean
  error: string | null
  isInitialized: boolean
  
  // Actions
  initializeWallet: () => Promise<void>
  refreshWalletData: (silent?: boolean, addressToRefresh?: string) => Promise<void>
  importWallet: (seedPhrase: string) => Promise<boolean>
  clearWallet: () => Promise<void>
}

// Create basic storage for data (temporary implementation)
// WARNING: No encryption - for development use only
const simpleStorage = {
  getItem : async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(`wallet_${key}`)
    } catch (error) {
      console.error('Error retrieving from storage:', error)
      return null
    }
  },
  
  setItem : async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(`wallet_${key}`, value)
    } catch (error) {
      console.error('Error saving to storage:', error)
    }
  },
  
  removeItem : async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(`wallet_${key}`)
    } catch (error) {
      console.error('Error removing from storage:', error)
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
        total       : 0,
      },
      utxos         : [],
      transactions  : [],
      lastSyncTime  : 0,
      isSyncing     : false,
      error         : null,
      isInitialized : false,
      
      initializeWallet : async () => {
        const persistedWallet = get().wallet // From Zustand's persisted state (AsyncStorage)
        let storedSeedPhrase: string | null = null

        try {
          storedSeedPhrase = await seedPhraseService.retrieveSeedPhrase()
        } catch (e) {
          console.error("Failed to retrieve seed phrase from secure storage", e)
        }

        if (persistedWallet && storedSeedPhrase) {
          console.log("Initializing with persisted wallet and stored seed phrase.")
          set({
            wallet        : persistedWallet,
            seedPhrase    : storedSeedPhrase,
            isInitialized : true,
            isSyncing     : false,
            error         : null,
          })

          get().refreshWalletData(true).catch(refreshError => {
            console.warn('Background refresh failed during initialization with persisted data:', refreshError)
          })
          return
        }
        
        console.log("Proceeding with full wallet initialization/setup.")
        set({ isSyncing: true, error: null })

        try {
          if (!storedSeedPhrase) {
            console.log('No seed phrase found in secure storage. New user or cleared wallet.')
            set({ 
              isSyncing     : false,
              isInitialized : true,
              wallet        : null,
              seedPhrase    : null,
              balances      : { confirmed: 0, unconfirmed: 0, total: 0 },
              utxos         : [],
              transactions  : [],
              lastSyncTime  : 0,
            })
            return
          }

          if (!validateMnemonic(storedSeedPhrase)) {
            throw new Error('Invalid seed phrase retrieved from secure storage')
          }
          
          const network = getDefaultNetwork()
          const legacyAddresses = deriveAddresses(storedSeedPhrase, network, 'legacy', 0, 3)
          const segwitAddresses = deriveAddresses(storedSeedPhrase, network, 'segwit', 0, 3)
          const nativeSegwitAddresses = deriveAddresses(storedSeedPhrase, network, 'native_segwit', 0, 3)
          
          const walletData: BitcoinWallet = {
            id        : 'primary_wallet',
            network,
            addresses : {
              legacy       : legacyAddresses.map(addr => addr.address),
              segwit       : segwitAddresses.map(addr => addr.address),
              nativeSegwit : nativeSegwitAddresses.map(addr => addr.address),
            },
            balances : persistedWallet ? persistedWallet.balances : get().balances,
          }
          
          set({ 
            wallet        : walletData,
            seedPhrase    : storedSeedPhrase,
            isInitialized : true,
          })
          
          await get().refreshWalletData(false)
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error during wallet initialization process'
          console.error('Error during wallet initialization process:', errorMessage, error)
          set({ 
            error         : errorMessage,
            wallet        : null,
            seedPhrase    : null,
            balances      : { confirmed: 0, unconfirmed: 0, total: 0 },
            utxos         : [],
            transactions  : [],
            lastSyncTime  : 0,
            isSyncing     : false,
            isInitialized : true,
          })
        }
      },
      
      // Refresh wallet data (balances, transactions, UTXOs)
      refreshWalletData : async (silent = false, addressToRefresh?: string) => {
        const { wallet } = get()
        
        const primaryAddress = addressToRefresh || (wallet?.addresses.nativeSegwit[0] || null)

        if (!primaryAddress) {
          console.warn('refreshWalletData: No primary address available. Wallet object:', wallet)
          set({ error: silent ? get().error : 'No wallet address available to refresh data.', isSyncing: false })
          return
        }
        
        try {
          if (!silent) {
            set({ isSyncing: true, error: null })
          }
          
          const fetchedUtxos: EsploraUTXO[] = await getUtxos(primaryAddress)
          const fetchedTransactions: EsploraTransaction[] = await getTxs(primaryAddress)
          
          const allWalletAddresses = wallet 
            ? Object.values(wallet.addresses).flat()
            : []

          const processedTransactions: ProcessedTransaction[] = fetchedTransactions.map((tx: EsploraTransaction) => {
            let netAmount = 0
            let isSending = false
            let isReceiving = false

            tx.vin.forEach(input => {
              if (input.prevout && input.prevout.scriptpubkey_address && allWalletAddresses.includes(input.prevout.scriptpubkey_address)) {
                isSending = true
                netAmount -= input.prevout.value
              }
            })

            tx.vout.forEach(output => {
              if (output.scriptpubkey_address && allWalletAddresses.includes(output.scriptpubkey_address)) {
                isReceiving = true
                netAmount += output.value
              }
            })
            
            let direction: 'sent' | 'received' | 'self'
            if (isSending && isReceiving) {
              direction = 'self'
            } else if (isSending) {
              direction = 'sent'
              if (direction === 'sent') {
                let amountSentToOthers = 0
                tx.vout.forEach(output => {
                  if (!(output.scriptpubkey_address && allWalletAddresses.includes(output.scriptpubkey_address))) {
                    amountSentToOthers += output.value                 
                  }
                })
                netAmount = -amountSentToOthers
              }
            } else if (isReceiving) {
              direction = 'received'
            } else {
              direction = 'self' 
              netAmount = 0
            }

            return {
              txid        : tx.txid,
              confirmed   : tx.status.confirmed,
              blockHeight : tx.status.block_height,
              blockTime   : tx.status.block_time,
              fee         : tx.fee,
              netAmount,
              direction,
            }
          })

          let confirmedBalance = 0
          let unconfirmedBalance = 0
          fetchedUtxos.forEach((utxo: EsploraUTXO) => {
            if (utxo.status.confirmed) {
              confirmedBalance += utxo.value
            } else {
              unconfirmedBalance += utxo.value
            }
          })
          const totalBalance = confirmedBalance + unconfirmedBalance

          const newBalances = {
            confirmed   : confirmedBalance,
            unconfirmed : unconfirmedBalance,
            total       : totalBalance,
          }

          set(state => ({
            balances     : newBalances,
            utxos        : fetchedUtxos,
            transactions : processedTransactions,
            lastSyncTime : Date.now(),
            isSyncing    : false,
            wallet       : state.wallet ? {
              ...state.wallet,
              balances : { 
                confirmed   : newBalances.confirmed,
                unconfirmed : newBalances.unconfirmed,
              }
            } : null,
          }))
          
          console.log(`Wallet data refreshed for address: ${primaryAddress}`)
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error refreshing wallet'
          console.error(`Error refreshing wallet data for address ${primaryAddress}:`, errorMessage, error)
          
          if (!silent) {
            set({ error: errorMessage, isSyncing: false })
          } else {
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
          
          // Save seed phrase to storage
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
          
          // Fetch initial balances - use non-silent refresh for better UX
          // This will show a loading indicator and ensure the balance is displayed right away
          await get().refreshWalletData(false)
          
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
          // Clear data from storage
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
            utxos         : [],
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
      storage : createJSONStorage(() => simpleStorage),
      
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