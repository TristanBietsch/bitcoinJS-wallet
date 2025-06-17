import { useWalletStore } from '@/src/store/walletStore'
import { usePendingTransactionsStore } from '@/src/store/pendingTransactionsStore'
import { validateAndSanitizeAddress } from '@/src/utils/validation/validateAddress'
import { validateBitcoinInput } from '@/src/utils/formatting/currencyUtils'
import { UTXOService } from './utxoService'
import { TransactionService } from './transactionService'
import { SendInputs, SendValidation, SendResult } from './types'
import { CurrencyType } from '@/src/types/domain/finance/currency.types'

/**
 * Main Send Service - Orchestrates the entire send transaction flow
 * Simplified version that replaces SendTransactionService
 */
export class SendService {
  
  /**
   * Convert amount to satoshis
   */
  private static convertToSatoshis(amount: string, currency: CurrencyType): number {
    const numericAmount = parseFloat(amount)
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('Invalid amount')
    }
    
    switch (currency) {
      case 'SATS':
        return Math.floor(numericAmount)
      case 'BTC':
        return Math.floor(numericAmount * 100_000_000) // Convert BTC to sats
      default:
        throw new Error(`Unsupported currency: ${currency}`)
    }
  }
  
  /**
   * Validate send inputs
   */
  static validateInputs(inputs: SendInputs): SendValidation {
    const errors: string[] = []
    
    // Validate recipient address
    const addressValidation = validateAndSanitizeAddress(inputs.recipientAddress)
    if (!addressValidation.isValid) {
      errors.push(addressValidation.error || 'Invalid recipient address')
    }
    
    // Validate amount format
    if (!inputs.amount || inputs.amount === '0') {
      errors.push('Amount is required')
    } else {
      const formatValid = validateBitcoinInput('', inputs.amount, inputs.currency)
      if (!formatValid) {
        errors.push('Invalid amount format')
      } else {
        try {
          const amountSats = this.convertToSatoshis(inputs.amount, inputs.currency)
          
          if (amountSats < 546) {
            errors.push('Amount too small (minimum 546 sats)')
          }
          
          if (amountSats > 100_000_000) {
            errors.push('Amount exceeds maximum single transaction limit (1 BTC)')
          }
        } catch (_error) {
          errors.push('Invalid amount')
        }
      }
    }
    
    // Validate fee rate
    if (inputs.feeRate <= 0) {
      errors.push('Fee rate must be greater than 0')
    }
    
    if (inputs.feeRate > 1000) {
      errors.push('Fee rate is too high (>1000 sat/vB)')
    }
    
    return {
      isValid : errors.length === 0,
      errors
    }
  }
  
  /**
   * Prepare transaction (fetch UTXOs and calculate fees)
   */
  static async prepareTransaction(inputs: SendInputs): Promise<{
    utxos: any[]
    selection: any
    changeAddress: string
  }> {
    const { wallet, seedPhrase } = useWalletStore.getState()
    
    if (!wallet) {
      throw new Error('No wallet available')
    }
    
    if (!seedPhrase) {
      throw new Error('No seed phrase available')
    }
    
    // Fetch wallet UTXOs
    console.log('🔍 [SendService] Fetching wallet UTXOs...')
    const utxos = await UTXOService.fetchWalletUTXOs(wallet, seedPhrase)
    
    if (utxos.length === 0) {
      throw new Error('No UTXOs available')
    }
    
    console.log(`✅ [SendService] Found ${utxos.length} UTXOs`)
    
    // Convert amount to satoshis
    const amountSats = this.convertToSatoshis(inputs.amount, inputs.currency)
    
    // Select UTXOs for transaction
    const selection = UTXOService.selectUTXOs(utxos, amountSats, inputs.feeRate)
    
    if (!selection) {
      throw new Error('Insufficient funds for transaction')
    }
    
    console.log(`✅ [SendService] Selected ${selection.selectedUtxos.length} UTXOs, fee: ${selection.totalFee} sats`)
    
    // Get change address
    const changeAddress = wallet.addresses.nativeSegwit[0]
    if (!changeAddress) {
      throw new Error('No change address available')
    }
    
    return {
      utxos,
      selection,
      changeAddress
    }
  }
  
  /**
   * Execute send transaction
   */
  static async executeTransaction(inputs: SendInputs): Promise<SendResult> {
    const { wallet, seedPhrase } = useWalletStore.getState()
    
    if (!wallet) {
      throw new Error('No wallet available')
    }
    
    if (!seedPhrase) {
      throw new Error('No seed phrase available')
    }
    
    // Validate inputs
    const validation = this.validateInputs(inputs)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }
    
    // Prepare transaction
    const { selection, changeAddress } = await this.prepareTransaction(inputs)
    
    // Convert amount to satoshis
    const amountSats = this.convertToSatoshis(inputs.amount, inputs.currency)
    
    // Execute transaction
    console.log('🚀 [SendService] Executing transaction...')
    const result = await TransactionService.executeTransaction(
      selection,
      inputs.recipientAddress,
      amountSats,
      changeAddress,
      inputs.feeRate,
      seedPhrase
    )
    
    console.log(`✅ [SendService] Transaction completed: ${result.txid}`)
    
    // Add to pending transactions for immediate UI update
    this.addToPendingTransactions(result, inputs)
    
    return result
  }
  
  /**
   * Add transaction to pending store for immediate UI updates
   */
  private static addToPendingTransactions(result: SendResult, inputs: SendInputs): void {
    const { addPendingTransaction } = usePendingTransactionsStore.getState()
    
    // Convert amount to satoshis for pending transaction
    const amountSats = this.convertToSatoshis(inputs.amount, inputs.currency)
    const totalSats = amountSats + result.fee
    
    addPendingTransaction({
      id            : result.txid,
      txid          : result.txid,
      amount        : totalSats, // Total impact (amount + fee)
      recipient     : inputs.recipientAddress,
      fee           : result.fee,
      status        : 'sending',
      date          : new Date(),
      currency      : 'sats',
      type          : 'send',
      confirmations : 0
    })
    
    console.log(`✅ [SendService] Added to pending transactions: ${result.txid}`)
  }
} 