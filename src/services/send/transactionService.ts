import { buildTransaction } from '@/src/services/bitcoin/txBuilder'
import { signTransaction } from '@/src/services/bitcoin/txSigner'
import { broadcastTx } from '@/src/services/bitcoin/broadcast'
import { bitcoinjsNetwork } from '@/src/config/env'
import { TransactionBuildResult, SendResult, UTXOSelection } from './types'
import { BuildTransactionParams } from '@/src/types/tx.types'

/**
 * Simplified Transaction Service
 * Handles building, signing, and broadcasting transactions
 */
export class TransactionService {
  
  /**
   * Build a transaction from UTXO selection
   */
  static async buildTransaction(
    selection: UTXOSelection,
    recipientAddress: string,
    amount: number,
    changeAddress: string,
    feeRate: number
  ): Promise<TransactionBuildResult> {
    const buildParams: BuildTransactionParams = {
      inputs  : selection.selectedUtxos,
      outputs : [ { address: recipientAddress, value: amount } ],
      feeRate,
      changeAddress,
      network : bitcoinjsNetwork
    }

    const { psbt, feeDetails } = buildTransaction(buildParams)
    
    return {
      psbt,
      fee   : feeDetails.calculatedFee,
      txHex : '' // Will be set after signing
    }
  }

  /**
   * Sign a transaction
   */
  static async signTransaction(
    psbt: any,
    mnemonic: string
  ): Promise<string> {
    return signTransaction({
      psbt,
      mnemonic,
      network : bitcoinjsNetwork
    })
  }

  /**
   * Broadcast a transaction
   */
  static async broadcastTransaction(txHex: string): Promise<string> {
    return broadcastTx(txHex)
  }

  /**
   * Complete transaction flow: build, sign, and broadcast
   */
  static async executeTransaction(
    selection: UTXOSelection,
    recipientAddress: string,
    amount: number,
    changeAddress: string,
    feeRate: number,
    mnemonic: string
  ): Promise<SendResult> {
    // Build transaction
    const buildResult = await this.buildTransaction(
      selection,
      recipientAddress,
      amount,
      changeAddress,
      feeRate
    )

    // Sign transaction
    const signedTxHex = await this.signTransaction(buildResult.psbt, mnemonic)

    // Broadcast transaction
    const txid = await this.broadcastTransaction(signedTxHex)

    return {
      txid,
      fee : buildResult.fee,
      amount
    }
  }
} 