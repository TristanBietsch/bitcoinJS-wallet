import { useTransactionStore } from '@/src/store/transactionStore'
import { useWalletStore } from '@/src/store/walletStore'
import { buildTransaction } from '@/src/services/bitcoin/txBuilder'
import { broadcastTx } from '@/src/services/bitcoin/broadcast'
import { signTransaction } from '@/src/services/bitcoin/txSigner'
import { validateAndSanitizeAddress } from '@/src/utils/validation/validateAddress'
import { bitcoinjsNetwork } from '@/src/config/env'
import { fetchWalletUtxos, enrichUtxosWithPublicKeys, filterUtxosByConfirmation } from '@/src/services/bitcoin/wallet/walletUtxoService'
import { selectUtxosEnhanced } from '@/src/utils/bitcoin/utxo'
import { TransactionOutput } from '@/src/types/tx.types'

export interface TransactionResult {
  txid: string
  fee: number
  amount: number
}

export class TransactionService {
  
  /**
   * Execute a complete transaction from current store state
   */
  static async executeTransaction(): Promise<TransactionResult> {
    const transactionStore = useTransactionStore.getState()
    const walletStore = useWalletStore.getState()
    
    if (!walletStore.wallet) {
      throw new Error('No wallet available')
    }
    
    if (!walletStore.seedPhrase) {
      throw new Error('No seed phrase available for signing')
    }
    
    // Validate transaction state
    if (!transactionStore.isValid()) {
      const errors = transactionStore.getValidationErrors()
      throw new Error(`Transaction validation failed: ${errors.join(', ')}`)
    }
    
    const { transaction } = transactionStore
    
    // Validate and sanitize address
    const addressValidation = validateAndSanitizeAddress(
      transaction.recipientAddress, 
      bitcoinjsNetwork
    )
    
    if (!addressValidation.isValid) {
      throw new Error(`Invalid recipient address: ${addressValidation.error}`)
    }
    
    console.log('✅ Address validation passed:', {
      original  : transaction.recipientAddress,
      sanitized : addressValidation.sanitizedAddress,
      type      : addressValidation.addressType
    })
    
    // Convert amount to satoshis
    const amountSat = transaction.currency === 'SATS'
      ? Math.floor(parseFloat(transaction.amount))
      : Math.floor(parseFloat(transaction.amount) * 100_000_000)
    
    if (amountSat <= 0) {
      throw new Error('Amount must be greater than 0')
    }
    
    if (transaction.feeRate <= 0) {
      throw new Error(`Invalid fee rate: ${transaction.feeRate}. Fee rate must be greater than 0.`)
    }
    
    console.log('✅ Fee rate validation passed:', transaction.feeRate)
    
    // Use first native segwit address as change address
    const changeAddress = walletStore.wallet.addresses.nativeSegwit[0]
    if (!changeAddress) {
      throw new Error('No change address available')
    }
    
    // Fetch UTXOs for the wallet
    console.log('🔍 Fetching UTXOs...')
    const rawUtxos = await fetchWalletUtxos(walletStore.wallet, walletStore.seedPhrase, bitcoinjsNetwork)
    
    // Filter for confirmed UTXOs
    const confirmedUtxos = filterUtxosByConfirmation(rawUtxos, false)
    
    // Enrich UTXOs with public keys and derivation paths
    const enrichedUtxos = await enrichUtxosWithPublicKeys(
      confirmedUtxos,
      walletStore.seedPhrase,
      bitcoinjsNetwork
    )
    
    console.log('✅ UTXOs fetched and enriched:', enrichedUtxos.length)
    
    // Select UTXOs for the transaction
    const selectionResult = selectUtxosEnhanced(
      enrichedUtxos,
      amountSat,
      transaction.feeRate,
      {
        preferAddressType  : 'native_segwit',
        includeUnconfirmed : false,
        minimizeInputs     : true
      }
    )
    
    if (!selectionResult) {
      throw new Error('Insufficient funds to cover the amount and transaction fee.')
    }
    
    console.log('✅ UTXOs selected:', {
      inputs     : selectionResult.selectedUtxos.length,
      totalValue : selectionResult.selectedUtxos.reduce((sum, utxo) => sum + utxo.value, 0),
      fee        : selectionResult.totalFee
    })
    
    // Build the Bitcoin transaction
    const recipientOutput: TransactionOutput = { 
      address : addressValidation.sanitizedAddress, 
      value   : amountSat 
    }
    
    const buildParams = {
      inputs        : selectionResult.selectedUtxos,
      outputs       : [ recipientOutput ],
      feeRate       : transaction.feeRate,
      changeAddress : changeAddress,
      network       : bitcoinjsNetwork,
    }
    
    const { psbt, feeDetails } = buildTransaction(buildParams)
    
    console.log('✅ Bitcoin transaction built:', { 
      fee     : feeDetails.calculatedFee, 
      inputs  : psbt.inputCount, 
      outputs : psbt.data.outputs.length 
    })
    
    // Sign the transaction
    const signedTxHex = await signTransaction({
      psbt,
      mnemonic : walletStore.seedPhrase,
      network  : bitcoinjsNetwork,
    })
    
    console.log('✅ Transaction signed and finalized')
    
    // Extract transaction ID
    const tx = psbt.extractTransaction()
    const txid = tx.getId()
    
    console.log('✅ Transaction extracted:', { txid, size: signedTxHex.length / 2 })
    
    // Broadcast the transaction
    const broadcastTxid = await broadcastTx(signedTxHex)
    
    console.log('✅ Transaction broadcasted:', broadcastTxid)
    
    return {
      txid   : broadcastTxid,
      fee    : feeDetails.calculatedFee,
      amount : amountSat
    }
  }
  
  /**
   * Estimate fee for current transaction
   */
  static async estimateFee(): Promise<number> {
    const transactionStore = useTransactionStore.getState()
    const walletStore = useWalletStore.getState()
    
    if (!walletStore.wallet || !transactionStore.isValid()) {
      return 0
    }
    
    try {
      const { transaction } = transactionStore
      
      // Convert amount to satoshis
      const amountSat = transaction.currency === 'SATS'
        ? parseFloat(transaction.amount)
        : parseFloat(transaction.amount) * 100_000_000
      
      // Rough fee estimation based on transaction size
      const inputCount = Math.ceil(amountSat / 50000) // rough estimate
      const outputCount = 2 // recipient + change
      const estimatedSize = (inputCount * 148) + (outputCount * 34) + 10 // rough vbyte calculation
      const estimatedFee = Math.ceil(estimatedSize * transaction.feeRate)
      
      return estimatedFee
      
    } catch (error) {
      console.error('Fee estimation failed:', error)
      return 0
    }
  }
  
  /**
   * Prepare transaction data for display
   */
  static getTransactionSummary() {
    const { transaction } = useTransactionStore.getState()
    
    const amountSat = transaction.currency === 'SATS'
      ? parseFloat(transaction.amount)
      : parseFloat(transaction.amount) * 100_000_000
    
    const totalSat = amountSat + transaction.estimatedFee
    
    return {
      recipientAddress : transaction.recipientAddress,
      amount           : amountSat,
      fee              : transaction.estimatedFee,
      feeRate          : transaction.feeRate,
      total            : totalSat,
      currency         : transaction.currency,
      speed            : transaction.speed
    }
  }
} 