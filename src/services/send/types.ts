import { EnhancedUTXO } from '@/src/types/blockchain.types'
import { CurrencyType } from '@/src/types/domain/finance/currency.types'

// Extended UTXO type with public key
export interface UTXOWithKey extends EnhancedUTXO {
  publicKey: Buffer
}

// Send transaction input data
export interface SendInputs {
  recipientAddress: string
  amount: string
  currency: CurrencyType
  feeRate: number
}

// Send transaction validation result
export interface SendValidation {
  isValid: boolean
  errors: string[]
}

// UTXO selection result
export interface UTXOSelection {
  selectedUtxos: UTXOWithKey[]
  totalInput: number
  changeAmount: number
  totalFee: number
  estimatedSize: number
}

// Transaction build result
export interface TransactionBuildResult {
  psbt: any
  fee: number
  txHex: string
}

// Send transaction result
export interface SendResult {
  txid: string
  fee: number
  amount: number
} 