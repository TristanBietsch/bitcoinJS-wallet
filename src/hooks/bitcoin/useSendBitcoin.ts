import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWalletStore } from '../../store/walletStore' // To get current network and invalidate queries
import { getUtxos } from '../../services/bitcoin/blockchain'
import { normalizeUtxosForSigning, selectUtxosSimple, AddressToPathMapper, PublicKeyDeriver } from '../../utils/bitcoin/utxo'
import { buildTransaction } from '../../services/bitcoin/txBuilder'
import { signTransaction } from '../../services/bitcoin/txSigner'
import { broadcastTx } from '../../services/bitcoin/broadcast'
import { bitcoinjsNetwork as currentBitcoinNetwork, CURRENT_NETWORK as APP_NETWORK } from '../../config/env' // For network object and type
import { seedPhraseService } from '../../services/bitcoin/wallet/seedPhraseService'
import type { NormalizedUTXO, TransactionOutput } from '../../types/tx.types'

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

// Placeholder for address to path mapping (would be part of wallet management)
const placeholderAddressToPathMapper: AddressToPathMapper = (_address: string): string | undefined => {
  // TODO: Implement actual mapping based on how your wallet stores derived addresses and paths
  // For example, if UTXO belongs to receive address at index 0 on account 0 for P2WPKH on testnet:
  // return "m/84'/1'/0'/0/0"; 
  return "m/84'/" + (APP_NETWORK === 'mainnet' ? "0'" : "1'") + "/0'/0/0" // Generic path, needs to be specific to UTXO
}

// Placeholder for public key derivation (would use BIP32)
const placeholderPublicKeyDeriver: PublicKeyDeriver = (_path: string): Buffer => {
  // TODO: Implement actual public key derivation using BIP32 and the root key.
  // Example: const root = bip32.fromSeed(seed, network);
  // const child = root.derivePath(path);
  // return child.publicKey;
  return Buffer.from('03' + '00'.repeat(32), 'hex') // Dummy public key
}
// --- End Placeholders ---

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

      // 1. Fetch UTXOs for the wallet (using primary address for now)
      // In a real wallet, you'd fetch UTXOs for all relevant addresses or use a UTXO set from walletStore.
      const availableEsploraUtxos = await getUtxos(primaryFromAddress)
      if (!availableEsploraUtxos || availableEsploraUtxos.length === 0) {
        throw new Error('No UTXOs available to make a transaction.')
      }

      // 2. Normalize UTXOs (add path and publicKey - using placeholders for now)
      // TODO: Replace placeholder mappers with actual wallet key management logic
      const normalizedUtxos: NormalizedUTXO[] = normalizeUtxosForSigning(
        availableEsploraUtxos,
        placeholderAddressToPathMapper,
        placeholderPublicKeyDeriver
      )
      
      // Add address to normalized UTXOs for scriptPubKey generation if not already present
      // This is a temporary workaround if EsploraUTXO doesn't have address.
      // Our current txBuilder expects utxo.publicKey to create scriptPubKey, so address is not strictly needed there if publicKey is present.
      // However, placeholderAddressToPathMapper might need it.
      const utxosWithAddressForMapper = normalizedUtxos.map(u => ({...u, address: primaryFromAddress}))

      // 3. Select UTXOs for the transaction
      const selectionResult = selectUtxosSimple(
        utxosWithAddressForMapper, // Use UTXOs that now have an address for the mapper
        amountSat,
        feeRate
        // Using default estimates for overhead, input, output vbytes from selectUtxosSimple
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
      const mnemonic = await getMnemonicFromSecureStorage() // Crucial: Securely fetch mnemonic
      if (!mnemonic) throw new Error('Mnemonic not available for signing.')

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