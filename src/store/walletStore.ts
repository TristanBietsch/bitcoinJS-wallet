import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { BitcoinWallet } from '@/src/services/bitcoin/wallet/bitcoinWalletService'
import { seedPhraseService } from '@/src/services/bitcoin/wallet/seedPhraseService'
import { validateMnemonic } from '@/src/services/bitcoin/wallet/keyManagementService'
import { deriveAddresses } from '@/src/services/bitcoin/wallet/addressDerivationService'
import { getDefaultNetwork } from '@/src/services/bitcoin/network/bitcoinNetworkConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'
import logger, { LogScope } from '@/src/utils/logger'
import {
  EsploraUTXO, 
  ProcessedTransaction 
} from '../types/blockchain.types'
import {
  getUtxos,
  getTxs,
} from '../services/bitcoin/blockchain'
import type { EsploraTransaction } from '../types/blockchain.types'

// Global reference to query client for transaction cache invalidation
let globalQueryClient: any = null

/**
 * Set the query client for transaction cache invalidation
 * This will be called from the app root layout
 */
export function setQueryClientForWalletStore(queryClient: any) {
  globalQueryClient = queryClient
}

/**
 * Invalidate transaction cache after wallet sync
 */
function invalidateTransactionCache(walletId?: string) {
  if (!globalQueryClient) {
    console.warn('[WalletStore] QueryClient not available for transaction cache invalidation')
    return
  }
  
  console.log('🔄 [WalletStore] Invalidating transaction cache after wallet sync')
  
  try {
    // Import query keys dynamically to avoid circular dependency
    import('../hooks/transaction/useTransactionHistory').then(module => {
      const { TRANSACTION_QUERY_KEYS } = module
      
      // Invalidate all transaction-related queries
      if (walletId) {
        globalQueryClient.invalidateQueries({
          queryKey : TRANSACTION_QUERY_KEYS.history(walletId)
        })
      }
      
      // Invalidate all transaction queries for good measure
      globalQueryClient.invalidateQueries({
        queryKey : TRANSACTION_QUERY_KEYS.list()
      })
      
      console.log('✅ [WalletStore] Transaction cache invalidated')
    }).catch(error => {
      console.warn('[WalletStore] Failed to invalidate transaction cache:', error)
    })
  } catch (error) {
    console.warn('[WalletStore] Error during transaction cache invalidation:', error)
  }
}

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

// Custom AsyncStorage wrapper to handle Zustand's persistence
const simpleStorage = {
  setItem : (name: string, value: string) => {
    return AsyncStorage.setItem(name, value)
  },
  getItem : (name: string) => {
    const value = AsyncStorage.getItem(name)
    return value ?? null
  },
  removeItem : (name: string) => {
    return AsyncStorage.removeItem(name)
  },
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
          logger.error(LogScope.WALLET, "Failed to retrieve seed phrase from secure storage", e)
        }

        if (persistedWallet && storedSeedPhrase) {
          logger.wallet("Initializing with persisted wallet and stored seed phrase", persistedWallet)
          set({
            wallet        : persistedWallet,
            seedPhrase    : storedSeedPhrase,
            isInitialized : true,
            isSyncing     : false,
            error         : null,
          })

          get().refreshWalletData(true).catch(refreshError => {
            logger.warn(LogScope.WALLET, 'Background refresh failed during initialization', refreshError)
          })
          return
        }
        
        logger.init("Proceeding with full wallet initialization/setup")
        set({ isSyncing: true, error: null })

        try {
          if (!storedSeedPhrase) {
            logger.init('No seed phrase found in secure storage. New user or cleared wallet')
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
          logger.error(LogScope.WALLET, 'Error during wallet initialization process', error)
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
      
      // Refresh wallet data (balances, transactions, UTXOs) with transaction cache integration
      refreshWalletData : async (silent = false, addressToRefresh?: string) => {
        const { wallet } = get()
        
        const primaryAddress = addressToRefresh || (wallet?.addresses.nativeSegwit[0] || null)

        if (!primaryAddress) {
          logger.warn(LogScope.WALLET, 'No primary address available for refresh')
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
          
          logger.walletSuccess(`Data refreshed for ${primaryAddress.slice(0, 8)}...${primaryAddress.slice(-4)}`)
          
          // Invalidate transaction cache after successful wallet sync
          if (wallet?.id) {
            invalidateTransactionCache(wallet.id)
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error refreshing wallet'
          logger.error(LogScope.WALLET, `Error refreshing wallet data for address ${primaryAddress}`, error)
          
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
          logger.error(LogScope.WALLET, 'Error importing wallet', error)
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
          logger.error(LogScope.WALLET, 'Error clearing wallet', error)
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