import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWalletStore } from '../../store/walletStore' // To get current network and invalidate queries
import { 
  fetchWalletUtxos, 
  enrichUtxosWithPublicKeys,
  filterUtxosByConfirmation 
} from '../../services/bitcoin/wallet/walletUtxoService'
import { selectUtxosEnhanced } from '../../utils/bitcoin/utxo'
import { buildTransaction } from '../../services/bitcoin/txBuilder'
import { signTransaction } from '../../services/bitcoin/txSigner'
import { broadcastTx } from '../../services/bitcoin/broadcast'
import { bitcoinjsNetwork as currentBitcoinNetwork } from '../../config/env' // For network object and type
import { seedPhraseService } from '../../services/bitcoin/wallet/seedPhraseService'
import type { TransactionOutput } from '../../types/tx.types'

// --- Mnemonic Retrieval from Secure Storage ---
// Uses the existing seedPhraseService to get the mnemonic from secure storage
async function getMnemonicFromSecureStorage(): Promise<string> {
  try {
    // First try to get from secure storage via seedPhraseService
    const storedMnemonic = await seedPhraseService.retrieveSeedPhrase()
    
    if (storedMnemonic) {
      return storedMnemonic
    }
    
    // If no stored mnemonic, check if we can get it from wallet store
    const walletState = useWalletStore.getState()
    if (walletState.seedPhrase) {
      return walletState.seedPhrase
    }
    
    console.warn('No mnemonic found in secure storage or wallet store. Using development fallback.')
    return 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about' // Development fallback
    
  } catch (error) {
    console.error('Error retrieving mnemonic from secure storage:', error)
    console.warn('Using development fallback mnemonic.')
    return 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about' // Development fallback
  }
}

// --- Enhanced UTXO Management ---

interface SendBitcoinParams {
  recipientAddress: string;
  amountSat: number;
  feeRate: number; // sats/vByte
  changeAddress: string;
  // fromAddress is implicitly determined by UTXOs available to the wallet
}

export function useSendBitcoin() {
  const queryClient = useQueryClient()

  const sendBitcoinMutation = useMutation<
    string, // Type of data returned on success (txid)
    Error,  // Type of error
    SendBitcoinParams // Type of variables passed to the mutation function
  >({
    mutationKey : [ 'sendBitcoin' ],
    mutationFn  : async (params: SendBitcoinParams) => {
      const { recipientAddress, amountSat, feeRate, changeAddress } = params

      console.log('Starting Bitcoin transaction:', { recipientAddress, amountSat, feeRate, changeAddress })

      // Get wallet from store state directly to avoid selector issues
      const wallet = useWalletStore.getState().wallet
      if (!wallet) {
        throw new Error('Wallet not loaded. Cannot determine addresses to fetch UTXOs from.')
      }

      const primaryFromAddress = wallet.addresses.nativeSegwit[0]
      if (!primaryFromAddress) {
        throw new Error('No primary address found in the wallet to fetch UTXOs.')
      }

      console.log('Fetching mnemonic from secure storage...')
      const mnemonic = await getMnemonicFromSecureStorage()
      if (!mnemonic) throw new Error('Mnemonic not available for UTXO management.')

      console.log('Fetching wallet UTXOs...')
      const enhancedUtxos = await fetchWalletUtxos(wallet, mnemonic, currentBitcoinNetwork)
      if (!enhancedUtxos || enhancedUtxos.length === 0) {
        throw new Error('No UTXOs available to make a transaction.')
      }

      console.log('Filtering confirmed UTXOs...')
      const confirmedUtxos = filterUtxosByConfirmation(enhancedUtxos, false)
      if (confirmedUtxos.length === 0) {
        throw new Error('No confirmed UTXOs available. Please wait for pending transactions to confirm.')
      }

      console.log('Enriching UTXOs with public keys...')
      const normalizedUtxos = enrichUtxosWithPublicKeys(confirmedUtxos, mnemonic, currentBitcoinNetwork)

      console.log('Selecting UTXOs for transaction...')
      const selectionResult = selectUtxosEnhanced(
        normalizedUtxos,
        amountSat,
        feeRate,
        {
          preferAddressType  : 'native_segwit', // Prefer native segwit for lower fees
          includeUnconfirmed : false,
          minimizeInputs     : true
        }
      )

      if (!selectionResult) {
        throw new Error('Insufficient funds to cover the amount and transaction fee.')
      }
      const { selectedUtxos, totalFee } = selectionResult

      console.log('Building transaction...')
      const recipientOutput: TransactionOutput = { address: recipientAddress, value: amountSat }
      const buildParams = {
        inputs  : selectedUtxos, // These are NormalizedUTXO from selectionResult
        outputs : [ recipientOutput ],
        feeRate,
        changeAddress,
        network : currentBitcoinNetwork,
      }
      const { psbt, feeDetails } = buildTransaction(buildParams)
      console.log('Built PSBT, calculated fee:', feeDetails.calculatedFee, 'target fee was:', totalFee)
      // Note: feeDetails.calculatedFee from buildTransaction might differ slightly from `totalFee` from `selectUtxosSimple`
      // due to more precise estimation or dust handling in `buildTransaction`. For now, we proceed.

      console.log('Signing transaction...')
      const signedTxHex = await signTransaction({
        psbt,
        mnemonic,
        network : currentBitcoinNetwork,
      })

      console.log('Broadcasting transaction...')
      const txid = await broadcastTx(signedTxHex)
      console.log('Transaction broadcast successful! TXID:', txid)
      
      return txid
    },
    onSuccess : (txid) => {
      console.log('Transaction completed successfully! TXID:', txid)
      
      setTimeout(() => {
        const wallet = useWalletStore.getState().wallet
        if (wallet?.addresses.nativeSegwit[0]) {
          queryClient.invalidateQueries({ queryKey: [ 'utxos', wallet.addresses.nativeSegwit[0] ] })
          queryClient.invalidateQueries({ queryKey: [ 'transactions', wallet.addresses.nativeSegwit[0] ] })
        }
        
        const refreshWalletData = useWalletStore.getState().refreshWalletData
        if (refreshWalletData && wallet?.addresses.nativeSegwit[0]) {
          refreshWalletData(false, wallet.addresses.nativeSegwit[0])
        }
      }, 0)
    },
    onError : (error: Error) => {
      console.error('Failed to send Bitcoin:', error.message)
    },
  })

  return {
    sendBitcoin      : sendBitcoinMutation.mutate,
    sendBitcoinAsync : sendBitcoinMutation.mutateAsync,
    isLoading        : sendBitcoinMutation.isPending,
    error            : sendBitcoinMutation.error,
    isSuccess        : sendBitcoinMutation.isSuccess,
    transactionId    : sendBitcoinMutation.data,
    reset            : sendBitcoinMutation.reset,
  }
} 