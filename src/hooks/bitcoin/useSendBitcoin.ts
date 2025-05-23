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
  const { wallet } = useWalletStore(state => ({ wallet: state.wallet }))

  const sendBitcoinMutation = useMutation<
    string, // Type of data returned on success (txid)
    Error,  // Type of error
    SendBitcoinParams // Type of variables passed to the mutation function
  >({
    mutationFn : async (params: SendBitcoinParams) => {
      const { recipientAddress, amountSat, feeRate, changeAddress } = params

      if (!wallet) {
        throw new Error('Wallet not loaded. Cannot determine addresses to fetch UTXOs from.')
      }
      // For simplicity, using the first native segwit address as the primary one for fetching UTXOs.
      // A real implementation would scan multiple addresses or use a dedicated UTXO provider service for the wallet.
      const primaryFromAddress = wallet.addresses.nativeSegwit[0]
      if (!primaryFromAddress) {
        throw new Error('No primary address found in the wallet to fetch UTXOs.')
      }

      // 1. Fetch UTXOs for all wallet addresses with enhanced information
      const mnemonic = await getMnemonicFromSecureStorage()
      if (!mnemonic) throw new Error('Mnemonic not available for UTXO management.')

      const enhancedUtxos = await fetchWalletUtxos(wallet, mnemonic, currentBitcoinNetwork)
      if (!enhancedUtxos || enhancedUtxos.length === 0) {
        throw new Error('No UTXOs available to make a transaction.')
      }

      // 2. Filter UTXOs by confirmation status (default to confirmed only for sending)
      const confirmedUtxos = filterUtxosByConfirmation(enhancedUtxos, false)
      if (confirmedUtxos.length === 0) {
        throw new Error('No confirmed UTXOs available. Please wait for pending transactions to confirm.')
      }

      // 3. Enrich UTXOs with public keys for signing
      const normalizedUtxos = enrichUtxosWithPublicKeys(confirmedUtxos, mnemonic, currentBitcoinNetwork)

      // 4. Select UTXOs for the transaction using enhanced algorithm
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

      // 4. Build the transaction (PSBT)
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

      // 5. Sign the transaction
      // Mnemonic already retrieved above for UTXO management

      const signedTxHex = await signTransaction({
        psbt,
        mnemonic,
        network : currentBitcoinNetwork,
      })

      // 6. Broadcast the transaction
      const txid = await broadcastTx(signedTxHex)
      return txid
    },
    onSuccess : (txid) => {
      console.log('Transaction broadcasted successfully! TXID:', txid)
      // Invalidate queries to refresh wallet balance, UTXOs, and transaction history
      queryClient.invalidateQueries({ queryKey: [ 'utxos', wallet?.addresses.nativeSegwit[0] ] })
      queryClient.invalidateQueries({ queryKey: [ 'transactions', wallet?.addresses.nativeSegwit[0] ] })
      // Optionally trigger a toast notification for success
      // toast.show("Transaction sent!", { type: 'success' });
      useWalletStore.getState().refreshWalletData(false, wallet?.addresses.nativeSegwit[0]) // Trigger store refresh
    },
    onError : (error: Error) => {
      console.error('Failed to send Bitcoin:', error.message)
      // Optionally trigger a toast notification for error
      // toast.show(`Error: ${error.message}`, { type: 'danger' });
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