import { useSendTransactionStore } from '@/src/store/sendTransactionStore'
import { useWalletStore } from '@/src/store/walletStore'
import { signTransaction } from '@/src/services/bitcoin/txSigner'
import { bitcoinjsNetwork } from '@/src/config/env'
import { fetchWalletUtxos, enrichUtxosWithPublicKeys, filterUtxosByConfirmation } from '@/src/services/bitcoin/wallet/walletUtxoService'
import type { TransactionResult } from '@/src/services/transactionService'

/**
 * Clean service layer for Send BTC transactions
 * Integrates with the new SendTransactionStore
 */
export class SendTransactionService {
  
  /**
   * Load wallet UTXOs and calculate fees for current transaction
   */
  static async loadUtxosAndCalculateFees(): Promise<void> {
    const walletStore = useWalletStore.getState()
    
    if (!walletStore.wallet) {
      throw new Error('No wallet available')
    }
    
    if (!walletStore.seedPhrase) {
      throw new Error('No seed phrase available')
    }
    
    const sendActions = useSendTransactionStore.getState()
    
    try {
      // Set loading state
      useSendTransactionStore.setState(state => ({
        meta : { ...state.meta, isLoadingUtxos: true, error: undefined }
      }))
      
      console.log('🔍 Fetching wallet UTXOs...')
      
      // Fetch UTXOs for the wallet
      const rawUtxos = await fetchWalletUtxos(walletStore.wallet, walletStore.seedPhrase, bitcoinjsNetwork)
      
      // Filter for confirmed UTXOs only
      const confirmedUtxos = filterUtxosByConfirmation(rawUtxos, false)
      
      // Enrich UTXOs with public keys and derivation paths
      const enrichedUtxos = await enrichUtxosWithPublicKeys(
        confirmedUtxos,
        walletStore.seedPhrase,
        bitcoinjsNetwork
      )
      
      console.log('✅ UTXOs loaded:', enrichedUtxos.length)
      
      // Use first native segwit address as change address
      const changeAddress = walletStore.wallet.addresses.nativeSegwit[0]
      if (!changeAddress) {
        throw new Error('No change address available')
      }
      
      // Calculate fees and select UTXOs
      sendActions.calculateFeeAndUtxos(enrichedUtxos, changeAddress)
      
      useSendTransactionStore.setState(state => ({
        meta : { ...state.meta, isLoadingUtxos: false }
      }))
      
    } catch (error) {
      console.error('Failed to load UTXOs:', error)
      
      useSendTransactionStore.setState(state => ({
        meta : {
          ...state.meta,
          isLoadingUtxos : false,
          error          : error instanceof Error ? error.message : 'Failed to load wallet data'
        }
      }))
      
      throw error
    }
  }
  
  /**
   * Execute complete transaction flow: validate, build, sign, broadcast
   */
  static async executeTransaction(): Promise<TransactionResult> {
    const sendStore = useSendTransactionStore.getState()
    const walletStore = useWalletStore.getState()
    
    if (!walletStore.wallet) {
      throw new Error('No wallet available')
    }
    
    if (!walletStore.seedPhrase) {
      throw new Error('No seed phrase available for signing')
    }
    
    // Validate transaction first
    if (!sendStore.isValidTransaction()) {
      const errors = sendStore.getValidationErrors()
      throw new Error(`Transaction validation failed: ${errors.join(', ')}`)
    }
    
    console.log('✅ Transaction validation passed')
    
    try {
      // Step 1: Build the transaction
      console.log('🔨 Building transaction...')
      const { psbt, fee } = await sendStore.buildTransaction()
      
      console.log('✅ Transaction built successfully', { fee, inputs: psbt.inputCount, outputs: psbt.data.outputs.length })
      
      // Step 2: Sign the transaction
      console.log('✍️ Signing transaction...')
      const signedTxHex = await signTransaction({
        psbt,
        mnemonic : walletStore.seedPhrase,
        network  : bitcoinjsNetwork,
      })
      
      console.log('✅ Transaction signed')
      
      // Step 3: Broadcast the transaction
      console.log('📡 Broadcasting transaction...')
      const txid = await sendStore.broadcastTransaction(signedTxHex)
      
      console.log('✅ Transaction broadcasted:', txid)
      
      return {
        txid,
        fee,
        amount : sendStore.derived.amountSats
      }
      
    } catch (error) {
      console.error('Transaction execution failed:', error)
      throw error
    }
  }
  
  /**
   * Get transaction summary for confirmation screen
   */
  static getTransactionSummary() {
    return useSendTransactionStore.getState().getTransactionSummary()
  }
  
  /**
   * Validate if transaction is ready to execute
   */
  static validateForExecution(): { isValid: boolean; errors: string[] } {
    const sendStore = useSendTransactionStore.getState()
    
    const errors = sendStore.getValidationErrors()
    
    // Additional checks for execution readiness
    if (sendStore.utxos.selectedUtxos.length === 0) {
      errors.push('No UTXOs selected for transaction')
    }
    
    if (!sendStore.utxos.changeAddress) {
      errors.push('No change address available')
    }
    
    return {
      isValid : errors.length === 0,
      errors
    }
  }
  
  /**
   * Reset the transaction store
   */
  static reset(): void {
    useSendTransactionStore.getState().reset()
  }
} 