import { useSendTransactionStore } from '@/src/store/sendTransactionStore'
import { useWalletStore } from '@/src/store/walletStore'
import { signTransaction } from '@/src/services/bitcoin/txSigner'
import { bitcoinjsNetwork } from '@/src/config/env'
import { fetchWalletUtxos, enrichUtxosWithPublicKeys, filterUtxosByConfirmation } from '@/src/services/bitcoin/wallet/walletUtxoService'
import type { TransactionResult } from '@/src/types/transaction.types'
import type { SendBTCError } from '@/src/types/errors.types'
import {
  createInsufficientFundsError,
  createAddressValidationError,
  createTransactionError,
  createNetworkError,
  createSecurityError,
  createFeeEstimationError
} from '@/src/types/errors.types'

/**
 * Enhanced service layer for Send BTC transactions
 * Optimized for integration with the unified useTransaction hook
 */
export class SendTransactionService {
  
  /**
   * Maps generic errors to specific SendBTCError types for consistent error handling
   */
  private static mapErrorToSendBTCError(error: Error, context: string): SendBTCError {
    const errorMessage = error.message.toLowerCase()
    
    // Insufficient funds errors
    if (errorMessage.includes('insufficient funds') || 
        errorMessage.includes('not enough') || 
        errorMessage.includes('balance')) {
      const walletState = useWalletStore.getState()
      return createInsufficientFundsError(
        0, // Will be filled with actual amounts by caller
        walletState.balances.confirmed,
                 { 
           confirmed   : walletState.balances.confirmed, 
           unconfirmed : walletState.balances.unconfirmed 
         }
      )
    }
    
    // Network and API errors
    if (errorMessage.includes('network') || 
        errorMessage.includes('connection') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('broadcast failed') ||
        errorMessage.includes('api') ||
        errorMessage.includes('fetch')) {
      return createNetworkError('NETWORK_TIMEOUT', { endpoint: context })
    }
    
    // Address validation errors
    if (errorMessage.includes('invalid address') ||
        errorMessage.includes('address') ||
        errorMessage.includes('script')) {
      return createAddressValidationError('unknown', 'INVALID_ADDRESS')
    }
    
    // Security and wallet errors
    if (errorMessage.includes('seed phrase') ||
        errorMessage.includes('mnemonic') ||
        errorMessage.includes('wallet') ||
        errorMessage.includes('signing')) {
      return createSecurityError('MNEMONIC_UNAVAILABLE')
    }
    
    // Fee estimation errors
    if (errorMessage.includes('fee') ||
        errorMessage.includes('utxo') ||
        errorMessage.includes('dust')) {
      return createFeeEstimationError('FEE_ESTIMATION_FAILED')
    }
    
    // Default to transaction error
    const stage = context.includes('build') ? 'build' : 
                  context.includes('sign') ? 'sign' : 
                  context.includes('broadcast') ? 'broadcast' : 'utxo_fetch'
                  
    return createTransactionError('TRANSACTION_BUILD_FAILED', stage)
  }
  
  /**
   * Load wallet UTXOs and calculate fees for current transaction
   * Enhanced with better error handling and progress tracking
   */
  static async loadUtxosAndCalculateFees(): Promise<void> {
    const walletStore = useWalletStore.getState()
    
    // Enhanced validation
    if (!walletStore.wallet) {
      throw this.mapErrorToSendBTCError(new Error('No wallet available'), 'wallet_check')
    }
    
    if (!walletStore.seedPhrase) {
      throw this.mapErrorToSendBTCError(new Error('No seed phrase available'), 'security_check')
    }
    
    const sendActions = useSendTransactionStore.getState()
    
    try {
      // Set loading state with better tracking
      useSendTransactionStore.setState(state => ({
        meta : { 
          ...state.meta, 
          isLoadingUtxos   : true, 
          error            : undefined,
          isCalculatingFee : false // Reset any previous fee calculation state
        }
      }))
      
      console.log('🔍 [SendTransactionService] Fetching wallet UTXOs...')
      
      // Fetch UTXOs with enhanced error handling
      const rawUtxos = await fetchWalletUtxos(
        walletStore.wallet, 
        walletStore.seedPhrase, 
        bitcoinjsNetwork
      ).catch(error => {
        throw this.mapErrorToSendBTCError(error, 'utxo_fetch')
      })
      
      // Filter for confirmed UTXOs only (enhanced safety)
      const confirmedUtxos = filterUtxosByConfirmation(rawUtxos, false)
      
      if (confirmedUtxos.length === 0) {
        throw this.mapErrorToSendBTCError(
          new Error('No confirmed UTXOs available'), 
          'utxo_filter'
        )
      }
      
      console.log(`✅ [SendTransactionService] Found ${confirmedUtxos.length} confirmed UTXOs`)
      
             // Enrich UTXOs with public keys and derivation paths
       let enrichedUtxos
       try {
         enrichedUtxos = await enrichUtxosWithPublicKeys(
           confirmedUtxos,
           walletStore.seedPhrase,
           bitcoinjsNetwork
         )
       } catch (error: any) {
         throw this.mapErrorToSendBTCError(error, 'utxo_enrich')
       }
      
      console.log(`✅ [SendTransactionService] Enriched ${enrichedUtxos.length} UTXOs with keys`)
      
      // Get change address with validation
      const changeAddress = walletStore.wallet.addresses.nativeSegwit[0]
      if (!changeAddress) {
        throw this.mapErrorToSendBTCError(
          new Error('No change address available'), 
          'change_address'
        )
      }
      
      // Calculate fees and select UTXOs with error handling
      try {
        sendActions.calculateFeeAndUtxos(enrichedUtxos, changeAddress)
      } catch (error) {
        throw this.mapErrorToSendBTCError(
          error instanceof Error ? error : new Error('Fee calculation failed'), 
          'fee_calculation'
        )
      }
      
      // Verify UTXO selection was successful
      const updatedState = useSendTransactionStore.getState()
      if (updatedState.utxos.selectedUtxos.length === 0) {
        throw this.mapErrorToSendBTCError(
          new Error('No suitable UTXOs found for transaction amount'), 
          'utxo_selection'
        )
      }
      
      // Success - clear loading state
      useSendTransactionStore.setState(state => ({
        meta : { ...state.meta, isLoadingUtxos: false, error: undefined }
      }))
      
      console.log('✅ [SendTransactionService] UTXO loading and fee calculation complete')
      
    } catch (error) {
      console.error('[SendTransactionService] Failed to load UTXOs:', error)
      
      // Update state with error
      useSendTransactionStore.setState(state => ({
        meta : {
          ...state.meta,
          isLoadingUtxos   : false,
          isCalculatingFee : false,
          error            : error instanceof Error ? error.message : 'Failed to load wallet data'
        }
      }))
      
      // Re-throw as SendBTCError for useTransaction hook
      if (error && typeof error === 'object' && 'code' in error) {
        throw error // Already a SendBTCError
      }
      throw this.mapErrorToSendBTCError(
        error instanceof Error ? error : new Error('Unknown error'), 
        'utxo_loading'
      )
    }
  }
  
  /**
   * Execute complete transaction flow: validate, build, sign, broadcast
   * Enhanced for perfect integration with useTransaction hook
   */
  static async executeTransaction(): Promise<TransactionResult> {
    const sendStore = useSendTransactionStore.getState()
    const walletStore = useWalletStore.getState()
    
    // Enhanced pre-execution validation
    if (!walletStore.wallet) {
      throw this.mapErrorToSendBTCError(new Error('No wallet available'), 'wallet_check')
    }
    
    if (!walletStore.seedPhrase) {
      throw this.mapErrorToSendBTCError(new Error('No seed phrase available for signing'), 'security_check')
    }
    
    // Validate transaction readiness
    if (!sendStore.isValidTransaction()) {
      const errors = sendStore.getValidationErrors()
      throw this.mapErrorToSendBTCError(
        new Error(`Transaction validation failed: ${errors.join(', ')}`), 
        'validation'
      )
    }
    
    console.log('✅ [SendTransactionService] Transaction validation passed')
    
    try {
      // Step 1: Build the transaction
      console.log('🔨 [SendTransactionService] Building transaction...')
      const { psbt, fee } = await sendStore.buildTransaction().catch(error => {
        throw this.mapErrorToSendBTCError(
          error instanceof Error ? error : new Error('Transaction build failed'), 
          'build'
        )
      })
      
      console.log(`✅ [SendTransactionService] Transaction built successfully`, { 
        fee, 
        inputs  : psbt.inputCount, 
        outputs : psbt.data.outputs.length 
      })
      
      // Step 2: Sign the transaction
      console.log('✍️ [SendTransactionService] Signing transaction...')
      const signedTxHex = await signTransaction({
        psbt,
        mnemonic : walletStore.seedPhrase,
        network  : bitcoinjsNetwork,
      }).catch(error => {
        throw this.mapErrorToSendBTCError(
          error instanceof Error ? error : new Error('Transaction signing failed'), 
          'sign'
        )
      })
      
      console.log('✅ [SendTransactionService] Transaction signed successfully')
      
      // Step 3: Broadcast the transaction
      console.log('📡 [SendTransactionService] Broadcasting transaction...')
      const txid = await sendStore.broadcastTransaction(signedTxHex).catch(error => {
        throw this.mapErrorToSendBTCError(
          error instanceof Error ? error : new Error('Transaction broadcast failed'), 
          'broadcast'
        )
      })
      
      console.log(`✅ [SendTransactionService] Transaction broadcasted successfully: ${txid}`)
      
      // Return standardized result
      return {
        txid,
        fee,
        amount : sendStore.derived.amountSats
      }
      
    } catch (error) {
      console.error('[SendTransactionService] Transaction execution failed:', error)
      
      // Ensure we're throwing a SendBTCError for the hook
      if (error && typeof error === 'object' && 'code' in error) {
        throw error // Already a SendBTCError
      }
      throw this.mapErrorToSendBTCError(
        error instanceof Error ? error : new Error('Unknown execution error'), 
        'execution'
      )
    }
  }
  
  /**
   * Enhanced transaction validation for execution readiness
   * Provides detailed validation suitable for useTransaction hook
   */
  static validateForExecution(): { isValid: boolean; errors: string[] } {
    const sendStore = useSendTransactionStore.getState()
    const walletStore = useWalletStore.getState()
    
    const errors = sendStore.getValidationErrors()
    
    // Enhanced execution readiness checks
    if (!walletStore.wallet) {
      errors.push('Wallet not available')
    }
    
    if (!walletStore.seedPhrase) {
      errors.push('Seed phrase not available for signing')
    }
    
    if (sendStore.utxos.selectedUtxos.length === 0) {
      errors.push('No UTXOs selected for transaction')
    }
    
    if (!sendStore.utxos.changeAddress) {
      errors.push('No change address available')
    }
    
    // Check balance sufficiency
    if (sendStore.derived.totalSats > walletStore.balances.confirmed) {
      errors.push(`Insufficient balance: need ${sendStore.derived.totalSats} sats, have ${walletStore.balances.confirmed} sats`)
    }
    
    // Check for reasonable fee rate
    if (sendStore.inputs.feeRate > 1000) {
      errors.push('Fee rate is unusually high (>1000 sat/vB)')
    }
    
    return {
      isValid : errors.length === 0,
      errors
    }
  }
  
  /**
   * Get transaction summary for confirmation screen
   * Enhanced with additional validation
   */
  static getTransactionSummary() {
    const summary = useSendTransactionStore.getState().getTransactionSummary()
    
    // Add validation to summary
    const validation = this.validateForExecution()
    
    return {
      ...summary,
      isValid          : validation.isValid,
      validationErrors : validation.errors
    }
  }
  
  /**
   * Enhanced reset that clears all transaction state
   * Perfect for useTransaction hook integration
   */
  static reset(): void {
    const sendStore = useSendTransactionStore.getState()
    sendStore.reset()
    console.log('🔄 [SendTransactionService] Transaction state reset')
  }
  
  /**
   * Prepare transaction for execution (used by useTransaction hook)
   * Combines UTXO loading and validation in one step
   */
  static async prepareTransaction(): Promise<void> {
    console.log('🚀 [SendTransactionService] Preparing transaction...')
    
    // Step 1: Load UTXOs and calculate fees
    await this.loadUtxosAndCalculateFees()
    
    // Step 2: Validate everything is ready
    const validation = this.validateForExecution()
    if (!validation.isValid) {
      throw this.mapErrorToSendBTCError(
        new Error(`Transaction preparation failed: ${validation.errors.join(', ')}`),
        'preparation'
      )
    }
    
    console.log('✅ [SendTransactionService] Transaction preparation complete')
  }
} 