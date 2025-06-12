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
  createFeeEstimationError,
  createSecurityError
} from '@/src/types/errors.types'

/**
 * Enhanced service layer for Send BTC transactions
 * Integrates with SendTransactionStore and provides comprehensive error handling
 */
export class SendTransactionService {
  
  /**
   * Maps generic errors to structured SendBTCError types
   */
  private static mapErrorToSendBTCError(error: Error, context?: string): SendBTCError {
    const errorMessage = error.message.toLowerCase()
    
    // Insufficient funds errors
    if (errorMessage.includes('insufficient funds') || 
        errorMessage.includes('not enough') || 
        errorMessage.includes('needed:') ||
        errorMessage.includes('balance')) {
      return createInsufficientFundsError(0, 0, { confirmed: 0, unconfirmed: 0 })
    }
    
    // Address validation errors
    if (errorMessage.includes('invalid address') ||
        errorMessage.includes('address validation') ||
        errorMessage.includes('invalid character') ||
        errorMessage.includes('invalid checksum')) {
      return createAddressValidationError('unknown', 'INVALID_ADDRESS')
    }
    
    // Network/connectivity errors
    if (errorMessage.includes('network') || 
        errorMessage.includes('connection') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('broadcast failed')) {
      return createNetworkError('NETWORK_TIMEOUT', { endpoint: context })
    }
    
    // Fee-related errors
    if (errorMessage.includes('fee') && 
        (errorMessage.includes('too high') || errorMessage.includes('too low'))) {
      return createFeeEstimationError('FEE_ESTIMATION_FAILED')
    }
    
    // Security/wallet errors
    if (errorMessage.includes('seed phrase') ||
        errorMessage.includes('mnemonic') ||
        errorMessage.includes('wallet locked') ||
        errorMessage.includes('no wallet')) {
      return createSecurityError('MNEMONIC_UNAVAILABLE')
    }
    
    // Transaction building errors
    if (errorMessage.includes('utxo') ||
        errorMessage.includes('transaction build') ||
        errorMessage.includes('signing') ||
        errorMessage.includes('psbt')) {
      const stage = errorMessage.includes('signing') ? 'sign' :
                   errorMessage.includes('build') ? 'build' :
                   errorMessage.includes('utxo') ? 'utxo_select' : 'build'
      return createTransactionError('TRANSACTION_BUILD_FAILED', stage)
    }
    
    // Default to generic transaction error
    return createTransactionError('TRANSACTION_BUILD_FAILED', 'build')
  }
  
  /**
   * Validates wallet and balance state before transaction operations
   */
  private static validateWalletState(): { isValid: boolean; error?: SendBTCError } {
    const walletStore = useWalletStore.getState()
    const sendStore = useSendTransactionStore.getState()
    
    if (!walletStore.wallet) {
      return {
        isValid : false,
        error   : createSecurityError('MNEMONIC_UNAVAILABLE')
      }
    }
    
    if (!walletStore.seedPhrase) {
      return {
        isValid : false,
        error   : createSecurityError('MNEMONIC_UNAVAILABLE')
      }
    }
    
    // Check if amount exceeds reasonable limits (security check)
    const MAX_SINGLE_TX = 100_000_000 // 1 BTC
    if (sendStore.derived.amountSats > MAX_SINGLE_TX) {
      return {
        isValid : false,
        error   : createSecurityError('AMOUNT_TOO_LARGE', {
          requiredAmount   : sendStore.derived.amountSats,
          maxAllowedAmount : MAX_SINGLE_TX
        })
      }
    }
    
    return { isValid: true }
  }
  
  /**
   * Validates fee rate is reasonable
   */
  private static validateFeeRate(feeRate: number): { isValid: boolean; error?: SendBTCError } {
    if (feeRate <= 0) {
      return {
        isValid : false,
        error   : createFeeEstimationError('FEE_TOO_LOW', { requestedFeeRate: feeRate, suggestedFeeRate: 1 })
      }
    }
    
    if (feeRate > 1000) {
      return {
        isValid : false,
        error   : createFeeEstimationError('FEE_TOO_HIGH', { requestedFeeRate: feeRate, suggestedFeeRate: 20 })
      }
    }
    
    return { isValid: true }
  }
  
  /**
   * Load wallet UTXOs and calculate fees for current transaction
   */
  static async loadUtxosAndCalculateFees(): Promise<void> {
    // Validate wallet state first
    const walletValidation = this.validateWalletState()
    if (!walletValidation.isValid) {
      throw walletValidation.error
    }
    
    const walletStore = useWalletStore.getState()
    const sendActions = useSendTransactionStore.getState()
    
    try {
      // Set loading state
      useSendTransactionStore.setState(state => ({
        meta : { ...state.meta, isLoadingUtxos: true, error: undefined }
      }))
      
      console.log('🔍 Fetching wallet UTXOs...')
      
      // Fetch UTXOs for the wallet
      const rawUtxos = await fetchWalletUtxos(walletStore.wallet!, walletStore.seedPhrase!, bitcoinjsNetwork)
      
      if (!rawUtxos || rawUtxos.length === 0) {
        throw createInsufficientFundsError(
          sendActions.derived.totalSats,
          0,
          { confirmed: 0, unconfirmed: 0 }
        )
      }
      
      // Filter for confirmed UTXOs only
      const confirmedUtxos = filterUtxosByConfirmation(rawUtxos, false)
      
      if (confirmedUtxos.length === 0) {
        throw createInsufficientFundsError(
          sendActions.derived.totalSats,
          0,
          { confirmed: 0, unconfirmed: rawUtxos.reduce((sum, utxo) => sum + utxo.value, 0) }
        )
      }
      
      // Enrich UTXOs with public keys and derivation paths
      const enrichedUtxos = await enrichUtxosWithPublicKeys(
        confirmedUtxos,
        walletStore.seedPhrase!,
        bitcoinjsNetwork
      )
      
      console.log('✅ UTXOs loaded:', enrichedUtxos.length)
      
      // Use first native segwit address as change address
      const changeAddress = walletStore.wallet!.addresses.nativeSegwit[0]
      if (!changeAddress) {
        throw createTransactionError('TRANSACTION_BUILD_FAILED', 'build')
      }
      
      // Validate fee rate before calculation
      const feeValidation = this.validateFeeRate(sendActions.inputs.feeRate)
      if (!feeValidation.isValid) {
        throw feeValidation.error
      }
      
      // Calculate fees and select UTXOs
      sendActions.calculateFeeAndUtxos(enrichedUtxos, changeAddress)
      
      // Check if UTXO selection was successful
      const updatedState = useSendTransactionStore.getState()
      if (updatedState.utxos.selectedUtxos.length === 0) {
        const totalAvailable = enrichedUtxos.reduce((sum, utxo) => sum + utxo.value, 0)
        throw createInsufficientFundsError(
          updatedState.derived.totalSats,
          totalAvailable,
          { confirmed: totalAvailable, unconfirmed: 0 }
        )
      }
      
      useSendTransactionStore.setState(state => ({
        meta : { ...state.meta, isLoadingUtxos: false }
      }))
      
    } catch (error) {
      console.error('Failed to load UTXOs:', error)
      
      const mappedError = error instanceof Error ? this.mapErrorToSendBTCError(error, 'UTXO_LOAD') : error as SendBTCError
      
      useSendTransactionStore.setState(state => ({
        meta : {
          ...state.meta,
          isLoadingUtxos : false,
          error          : mappedError.message
        }
      }))
      
      throw mappedError
    }
  }
  
  /**
   * Execute complete transaction flow: validate, build, sign, broadcast
   */
  static async executeTransaction(): Promise<TransactionResult> {
    // Validate wallet state first
    const walletValidation = this.validateWalletState()
    if (!walletValidation.isValid) {
      throw walletValidation.error
    }
    
    const sendStore = useSendTransactionStore.getState()
    const walletStore = useWalletStore.getState()
    
    // Validate transaction is ready
    if (!sendStore.isValidTransaction()) {
      const errors = sendStore.getValidationErrors()
      throw createTransactionError('TRANSACTION_BUILD_FAILED', 'build')
    }
    
    console.log('✅ Transaction validation passed')
    
    try {
      // Step 1: Build the transaction
      console.log('🔨 Building transaction...')
      const { psbt, fee } = await sendStore.buildTransaction()
      
              console.log('✅ Transaction built successfully', { 
          fee, 
          inputs        : psbt.inputCount, 
          outputs       : psbt.data.outputs.length,
          estimatedSize : sendStore.derived.estimatedSize
        })
      
      // Step 2: Sign the transaction
      console.log('✍️ Signing transaction...')
      const signedTxHex = await signTransaction({
        psbt,
        mnemonic : walletStore.seedPhrase!,
        network  : bitcoinjsNetwork,
      })
      
      if (!signedTxHex || signedTxHex.length === 0) {
        throw createTransactionError('SIGNING_FAILED', 'sign')
      }
      
      console.log('✅ Transaction signed, hex length:', signedTxHex.length)
      
      // Step 3: Broadcast the transaction
      console.log('📡 Broadcasting transaction...')
      const txid = await sendStore.broadcastTransaction(signedTxHex)
      
      if (!txid || txid.length !== 64) {
        throw createNetworkError('BROADCAST_FAILED', { endpoint: 'broadcast' })
      }
      
      console.log('✅ Transaction broadcasted successfully:', txid)
      
      return {
        txid,
        fee,
        amount : sendStore.derived.amountSats
      }
      
    } catch (error) {
      console.error('Transaction execution failed:', error)
      
      const mappedError = error instanceof Error ? this.mapErrorToSendBTCError(error, 'EXECUTE') : error as SendBTCError
      throw mappedError
    }
  }
  
  /**
   * Get transaction summary for confirmation screen
   */
  static getTransactionSummary() {
    return useSendTransactionStore.getState().getTransactionSummary()
  }
  
  /**
   * Enhanced validation for transaction execution readiness
   */
  static validateForExecution(): { isValid: boolean; errors: string[] } {
    const sendStore = useSendTransactionStore.getState()
    const walletValidation = this.validateWalletState()
    
    const errors: string[] = []
    
    // Include wallet validation errors
    if (!walletValidation.isValid && walletValidation.error) {
      errors.push(walletValidation.error.message)
    }
    
    // Include store validation errors
    errors.push(...sendStore.getValidationErrors())
    
    // Additional checks for execution readiness
    if (sendStore.utxos.selectedUtxos.length === 0) {
      errors.push('No UTXOs selected for transaction')
    }
    
    if (!sendStore.utxos.changeAddress) {
      errors.push('No change address available')
    }
    
    // Validate fee rate
    const feeValidation = this.validateFeeRate(sendStore.inputs.feeRate)
    if (!feeValidation.isValid && feeValidation.error) {
      errors.push(feeValidation.error.message)
    }
    
    // Check if estimated fee is reasonable compared to amount
    const feePercentage = (sendStore.derived.estimatedFee / sendStore.derived.amountSats) * 100
    if (feePercentage > 50) { // Fee is more than 50% of amount
      errors.push(`Fee (${sendStore.derived.estimatedFee} sats) is ${feePercentage.toFixed(1)}% of transaction amount`)
    }
    
    return {
      isValid : errors.length === 0,
      errors
    }
  }
  
  /**
   * Get detailed transaction preparation status
   */
  static getPreparationStatus(): {
    isReady: boolean
    walletState: 'loading' | 'ready' | 'error'
    utxosState: 'loading' | 'ready' | 'error' | 'insufficient'
    validationState: 'pending' | 'valid' | 'invalid'
    details: {
      utxoCount: number
      totalValue: number
      estimatedFee: number
      feeRate: number
    }
  } {
    const sendStore = useSendTransactionStore.getState()
    const walletStore = useWalletStore.getState()
    
    const walletState = !walletStore.wallet ? 'loading' : 
                       !walletStore.seedPhrase ? 'error' : 'ready'
    
    const utxosState = sendStore.meta.isLoadingUtxos ? 'loading' :
                      sendStore.meta.error ? 'error' :
                      sendStore.utxos.selectedUtxos.length === 0 ? 'insufficient' : 'ready'
    
    const validationState = sendStore.isValidTransaction() ? 'valid' :
                           sendStore.getValidationErrors().length > 0 ? 'invalid' : 'pending'
    
    return {
      isReady : walletState === 'ready' && utxosState === 'ready' && validationState === 'valid',
      walletState,
      utxosState,
      validationState,
      details : {
        utxoCount    : sendStore.utxos.selectedUtxos.length,
        totalValue   : sendStore.utxos.totalUtxoValue,
        estimatedFee : sendStore.derived.estimatedFee,
        feeRate      : sendStore.inputs.feeRate
      }
    }
  }
  
  /**
   * Reset the transaction store and clear any cached data
   */
  static reset(): void {
    useSendTransactionStore.getState().reset()
  }
} 