/**
 * Consolidated Bitcoin Transaction Service
 * Combines functionality from txBuilder, txSigner, broadcast, and transaction services
 */
import * as bitcoin from 'bitcoinjs-lib'
import * as bip39 from 'bip39'
import { BIP32Factory } from 'bip32'
import { ECPairFactory } from 'ecpair'
import { getEccLib } from './config/eccProvider'
import { broadcastTx as broadcastViaBlockchain } from './blockchain'
import { validateTransactionHex, logTransactionAnalysis } from '@/src/utils/bitcoin/transactionValidator'
import { validateAndSanitizeAddress } from '@/src/utils/validation/validateAddress'
import { DUST_THRESHOLD, estimateTxVirtualBytes } from '@/src/utils/bitcoin/utils'
import type {
  BuildTransactionParams,
  TransactionFeeDetails,
  NormalizedUTXO,
  TransactionOutput,
  SignTransactionParams
} from '@/src/types/tx.types'
import { BitcoinTransaction } from '@/src/types/api'

// Initialize ECC and Bitcoin libraries
const ecc = getEccLib()
const bip32 = BIP32Factory(ecc)
bitcoin.initEccLib(ecc)
const ECPair = ECPairFactory(ecc)

// Constants
const PLACEHOLDER_MASTER_FINGERPRINT = Buffer.from('00000000', 'hex')

/**
 * Consolidated Transaction Service
 */
export class TransactionService {
  
  /**
   * TRANSACTION BUILDING
   */

  /**
   * Validate address and create script
   */
  static validateAddressAndCreateScript(address: string, network: bitcoin.Network): Buffer {
    console.log(`Creating script for address: "${address}" on network: ${network.bech32}`)
    
    try {
      // First sanitize the address
      const addressValidation = validateAndSanitizeAddress(address, network)
      if (!addressValidation.isValid) {
        throw new Error(`Address validation failed: ${addressValidation.error}`)
      }
      
      const sanitizedAddress = addressValidation.sanitizedAddress
      console.log(`Address sanitized: "${address}" -> "${sanitizedAddress}" (${addressValidation.addressType})`)
      
      // Try to decode the sanitized address
      const decoded = bitcoin.address.toOutputScript(sanitizedAddress, network)
      console.log(`Successfully created script for ${sanitizedAddress}, script length: ${decoded.length}`)
      return decoded
      
    } catch (error) {
      console.error(`Failed to create script for address ${address}:`, error)
      
      // Provide more detailed error information
      if (error instanceof Error) {
        if (error.message.includes('Invalid character')) {
          throw new Error(`Address contains invalid characters: ${address}`)
        } else if (error.message.includes('Invalid checksum')) {
          throw new Error(`Address has invalid checksum: ${address}`)
        } else if (error.message.includes('Invalid prefix')) {
          throw new Error(`Address has invalid network prefix for ${network.bech32}: ${address}`)
        }
      }
      
      throw new Error(`Invalid address ${address} for network ${network.bech32}. Original error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Select UTXOs for transaction
   */
  static selectUTXOs(
    utxos: NormalizedUTXO[],
    targetAmount: number,
    feeRate: number
  ): { selectedUTXOs: NormalizedUTXO[]; totalInput: number; estimatedFee: number } {
    // Sort UTXOs by value (largest first for efficiency)
    const sortedUTXOs = [ ...utxos ].sort((a, b) => b.value - a.value)
    
    const selectedUTXOs: NormalizedUTXO[] = []
    let totalInput = 0
    
    // Simple greedy selection algorithm
    for (const utxo of sortedUTXOs) {
      selectedUTXOs.push(utxo)
      totalInput += utxo.value
      
      // Estimate transaction size with current inputs
      const estimatedVBytes = estimateTxVirtualBytes(selectedUTXOs.length, 2) // Assuming 2 outputs
      const estimatedFee = estimatedVBytes * feeRate
      
      // Check if we have enough for target amount + fee
      if (totalInput >= targetAmount + estimatedFee) {
        return { selectedUTXOs, totalInput, estimatedFee }
      }
    }
    
    throw new Error('Insufficient funds: not enough UTXOs to cover target amount and fees')
  }

  /**
   * Build transaction PSBT
   */
  static buildTransaction(params: BuildTransactionParams): { psbt: bitcoin.Psbt; feeDetails: TransactionFeeDetails } {
    const { inputs, outputs, feeRate, network, changeAddress } = params
    
    console.log('🔨 [TxBuilder] Building transaction with:', {
      utxoCount   : inputs.length,
      outputCount : outputs.length,
      feeRate,
      network     : network.bech32,
      changeAddress
    })

    // Calculate total output amount
    const totalOutput = outputs.reduce((sum, output) => sum + output.value, 0)
    
    // Select UTXOs
    const { selectedUTXOs, totalInput, estimatedFee } = this.selectUTXOs(inputs, totalOutput, feeRate)
    
    // Calculate change
    const change = totalInput - totalOutput - estimatedFee
    
    // Initialize PSBT
    const psbt = new bitcoin.Psbt({ network })
    
    // Add inputs
    for (const utxo of selectedUTXOs) {
      console.log(`Adding input: ${utxo.txid}:${utxo.vout} (${utxo.value} sats)`)
      
      psbt.addInput({
        hash        : utxo.txid,
        index       : utxo.vout,
        witnessUtxo : {
          script : this.validateAddressAndCreateScript(utxo.address || '', network),
          value  : utxo.value
        },
        bip32Derivation : [ {
          masterFingerprint : PLACEHOLDER_MASTER_FINGERPRINT,
          path              : `m/44'/0'/0'/0/${utxo.addressIndex || 0}`,
          pubkey            : Buffer.alloc(33) // Placeholder
        } ]
      })
    }
    
    // Add outputs
    for (const output of outputs) {
      console.log(`Adding output: ${output.address} (${output.value} sats)`)
      
      psbt.addOutput({
        address : output.address,
        value   : output.value
      })
    }
    
    // Add change output if needed
    if (change > DUST_THRESHOLD) {
      console.log(`Adding change output: ${changeAddress} (${change} sats)`)
      psbt.addOutput({
        address : changeAddress,
        value   : change
      })
    }
    
    const feeDetails: TransactionFeeDetails = {
      feeRate,
      estimatedWeight : estimateTxVirtualBytes(selectedUTXOs.length, outputs.length + (change > DUST_THRESHOLD ? 1 : 0)),
      calculatedFee   : estimatedFee
    }
    
    console.log('✅ [TxBuilder] Transaction built successfully:', feeDetails)
    return { psbt, feeDetails }
  }

  /**
   * TRANSACTION SIGNING
   */

  /**
   * Sign transaction PSBT
   */
  static async signTransaction(params: SignTransactionParams): Promise<string> {
    const { psbt, mnemonic, network } = params

    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic seed phrase provided for signing.')
    }

    const seed = await bip39.mnemonicToSeed(mnemonic)
    const root = bip32.fromSeed(seed, network)

    // Sign each input
    psbt.data.inputs.forEach((input, index) => {
      if (!input.bip32Derivation || input.bip32Derivation.length === 0) {
        console.warn(`Input ${index} is missing BIP32 derivation information. Cannot sign this input.`)
        return
      }

      // Use the first derivation path (assuming single signature)
      const derivation = input.bip32Derivation[0]
      const childNode = root.derivePath(derivation.path)
      
      if (!childNode.privateKey) {
        throw new Error(`Failed to derive private key for path: ${derivation.path}`)
      }

      const keyPair = ECPair.fromPrivateKey(Buffer.from(childNode.privateKey), { network })
      
      try {
        // Ensure keyPair has Buffer publicKey for compatibility
        const signer = {
          ...keyPair,
          publicKey : Buffer.from(keyPair.publicKey)
        }
        psbt.signInput(index, signer as any)
        console.log(`✅ [TxSigner] Successfully signed input ${index}`)
      } catch (error) {
        console.error(`❌ [TxSigner] Failed to sign input ${index}:`, error)
        throw new Error(`Failed to sign input ${index}: ${error instanceof Error ? error.message : String(error)}`)
      }
    })

    // Finalize all inputs
    for (let i = 0; i < psbt.inputCount; i++) {
      try {
        psbt.finalizeInput(i)
      } catch (error) {
        console.error(`❌ [TxSigner] Failed to finalize input ${i}:`, error)
        throw new Error(`Failed to finalize input ${i}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Extract the final transaction
    const tx = psbt.extractTransaction()
    const txHex = tx.toHex()
    
    console.log('✅ [TxSigner] Transaction signed successfully')
    console.log(`Transaction hex: ${txHex.substring(0, 40)}... (${txHex.length} chars)`)
    
    return txHex
  }

  /**
   * TRANSACTION BROADCASTING
   */

  /**
   * Broadcast transaction to network
   */
  static async broadcastTransaction(txHex: string): Promise<string> {
    if (!txHex || typeof txHex !== 'string' || txHex.length === 0) {
      throw new Error('Transaction hex is required to broadcast and must be a non-empty string.')
    }

    // Validate transaction before attempting broadcast
    console.log('🔍 [Broadcast] Validating transaction before broadcast...')
    const validation = validateTransactionHex(txHex)
    
    if (!validation.isValid) {
      console.error('❌ [Broadcast] Transaction validation failed:', validation.errors)
      logTransactionAnalysis(txHex)
      throw new Error(`Transaction validation failed: ${validation.errors.join(', ')}`)
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️ [Broadcast] Transaction warnings:', validation.warnings)
    }

    logTransactionAnalysis(txHex)

    try {
      console.log('📡 [Broadcast] Attempting to broadcast transaction...')
      const txid = await broadcastViaBlockchain(txHex)
      console.log('✅ [Broadcast] Transaction broadcast successful:', txid)
      return txid
    } catch (error) {
      console.error('❌ [Broadcast] Error while broadcasting transaction:', error instanceof Error ? error.message : String(error))
      
      // Provide more context about the transaction that failed
      console.error('❌ [Broadcast] Failed transaction details:')
      console.error(`   - Hex: ${txHex.substring(0, 40)}...`)
      console.error(`   - Length: ${txHex.length} chars (${txHex.length / 2} bytes)`)
      
      throw error
    }
  }

  /**
   * TRANSACTION HISTORY AND ANALYSIS
   */

  /**
   * Get transaction history (sorted by time)
   */
  static async getTransactionHistory(
    count: number = 20,
    skip: number = 0
  ): Promise<BitcoinTransaction[]> {
    try {
      // This would integrate with wallet service for transaction history
      // For now, return empty array as placeholder but log the pagination parameters
      console.log(`📋 [Transaction] Getting transaction history with pagination: count=${count}, skip=${skip}`)
      
      // TODO: Implement actual transaction history retrieval
      // This would typically:
      // 1. Connect to wallet service or blockchain API
      // 2. Fetch transactions with proper pagination
      // 3. Apply skip offset and count limit
      // 4. Sort by timestamp descending
      
      // Placeholder implementation that respects the parameters
      const allTransactions: BitcoinTransaction[] = [] // Would fetch from actual source
      
      // Apply pagination logic
      const paginatedTransactions = allTransactions
        .slice(skip, skip + count)
        .sort((a, b) => b.time - a.time)
      
      console.log(`📋 [Transaction] Returning ${paginatedTransactions.length} transactions (requested ${count}, skipped ${skip})`)
      return paginatedTransactions
    } catch (error) {
      console.error(`Failed to get transaction history (count: ${count}, skip: ${skip}):`, error)
      return []
    }
  }

  /**
   * Analyze transaction for potential issues
   */
  static analyzeTransaction(txHex: string): {
    isValid: boolean
    errors: string[]
    warnings: string[]
    details: any
  } {
    return validateTransactionHex(txHex)
  }

  /**
   * COMPLETE TRANSACTION FLOW
   */

  /**
   * Build, sign, and broadcast a complete transaction
   */
  static async sendTransaction(params: {
    inputs: NormalizedUTXO[]
    outputs: TransactionOutput[]
    feeRate: number
    network: bitcoin.Network
    changeAddress: string
    mnemonic: string
  }): Promise<{ txid: string; feeDetails: TransactionFeeDetails }> {
    try {
      console.log('🚀 [Transaction] Starting complete transaction flow...')
      
      // 1. Build the transaction
      const { psbt, feeDetails } = this.buildTransaction({
        inputs        : params.inputs,
        outputs       : params.outputs,
        feeRate       : params.feeRate,
        network       : params.network,
        changeAddress : params.changeAddress
      })
      
      // 2. Sign the transaction
      const txHex = await this.signTransaction({
        psbt,
        mnemonic : params.mnemonic,
        network  : params.network
      })
      
      // 3. Broadcast the transaction
      const txid = await this.broadcastTransaction(txHex)
      
      console.log('🎉 [Transaction] Complete transaction flow successful!')
      return { txid, feeDetails }
      
    } catch (error) {
      console.error('❌ [Transaction] Complete transaction flow failed:', error)
      throw error
    }
  }

  /**
   * UTILITY FUNCTIONS
   */

  /**
   * Estimate transaction fee
   */
  static estimateTransactionFee(
    inputCount: number,
    outputCount: number,
    feeRate: number
  ): number {
    const estimatedVBytes = estimateTxVirtualBytes(inputCount, outputCount)
    return estimatedVBytes * feeRate
  }

  /**
   * Check if amount is above dust threshold
   */
  static isAboveDustThreshold(amount: number): boolean {
    return amount > DUST_THRESHOLD
  }

  /**
   * Convert transaction to readable format
   */
  static parseTransaction(txHex: string): bitcoin.Transaction {
    return bitcoin.Transaction.fromHex(txHex)
  }
}

// Export singleton-style static methods as default
export default TransactionService