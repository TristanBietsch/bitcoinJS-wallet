import { create } from 'zustand'
import { TEST_ERROR_PHRASE, TEST_BYPASS_PHRASE } from '@/src/constants/testing'
import { bitcoinWalletService, BitcoinWallet } from '@/src/services/bitcoin/wallet/bitcoinWalletService'
import { useWalletStore } from '@/src/store/walletStore'

type ImportState = 'input' | 'checking' | 'success' | 'error'

interface ImportStoreState {
  importFlowState: ImportState // Renamed to avoid conflict if merged into a larger store
  seedPhrase: string
  importedWallet: BitcoinWallet | null // Renamed to avoid conflict
  importError: string | null // Renamed

  setSeedPhrase: (phrase: string) => void
  startChecking: (phrase: string) => Promise<void>
  // completeImport is implicit via startChecking success
  failImport: (error?: string) => void
  returnToInput: () => void
  resetImportStore: () => void

  isTestBypass: () => boolean
  isTestError: () => boolean
}

const initialState = {
  importFlowState : 'input' as ImportState,
  seedPhrase      : '',
  importedWallet  : null as BitcoinWallet | null,
  importError     : null as string | null,
}

export const useImportStore = create<ImportStoreState>((set, get) => ({
  ...initialState,

  setSeedPhrase : (phrase: string) => set({ seedPhrase: phrase }),

  startChecking : async (phrase: string) => {
    set({ seedPhrase: phrase, importFlowState: 'checking', importError: null, importedWallet: null })
    
    try {
      if (get().isTestError()) {
        setTimeout(() => {
          set({ importError: 'This is a test error', importFlowState: 'error' })
        }, 2000)
        return
      }
      
      if (get().isTestBypass()) {
        setTimeout(() => {
          set({ importFlowState: 'success' }) // No wallet set for bypass test
        }, 2000)
        return
      }
      
      // Import the wallet using bitcoinWalletService first
      const imported = await bitcoinWalletService.importFromMnemonic(phrase)
      
      // Then use the walletStore's importWallet function to fully set up the wallet 
      // and trigger balance fetching
      const importSuccess = await useWalletStore.getState().importWallet(phrase)
      
      if (importSuccess) {
        // Only set success if the wallet was successfully imported in the wallet store
        set({ importedWallet: imported, importFlowState: 'success' })
        
        // Explicitly fetch wallet balance immediately (not silently)
        // This ensures the balance shows up right away
        await useWalletStore.getState().refreshWalletData(false)
      } else {
        throw new Error('Failed to import wallet')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during import'
      set({ importError: errorMessage, importFlowState: 'error' })
    }
  },

  failImport : (error?: string) => {
    set(state => ({ 
      importError     : error || state.importError || 'Import failed', 
      importFlowState : 'error' 
    }))
  },

  returnToInput : () => {
    set({ importError: null, importFlowState: 'input', seedPhrase: '', importedWallet: null })
  },
  
  resetImportStore : () => {
    set(initialState)
  },

  isTestBypass : () => get().seedPhrase.trim() === TEST_BYPASS_PHRASE,
  isTestError  : () => get().seedPhrase.trim() === TEST_ERROR_PHRASE,
})) 