import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CurrencyType } from '@/src/types/domain/finance'
import { validateAndSanitizeAddress } from '@/src/utils/validation/validateAddress'
import { validateBitcoinInput } from '@/src/utils/formatting/currencyUtils'
import { bitcoinjsNetwork } from '@/src/config/env'
import type { EnhancedUTXO } from '@/src/types/blockchain.types'
import type { NormalizedUTXO, BuildTransactionParams } from '@/src/types/tx.types'
import { buildTransaction } from '@/src/services/bitcoin/txBuilder'
import { broadcastTx } from '@/src/services/bitcoin/broadcast'
import { selectUtxosEnhanced } from '@/src/utils/bitcoin/utxo'
import { estimateTransactionSize } from '@/src/services/bitcoin/feeEstimationService'

// --- Core Types ---
export interface SendTransactionInputs {
  recipientAddress : string
  amount           : string
  currency         : CurrencyType
  feeRate          : number
}

export interface SendTransactionDerived {
  amountSats       : number
  isValidAddress   : boolean
  addressError?    : string
  amountError?     : string
  feeError?        : string
  totalSats        : number
  estimatedFee     : number
  estimatedSize    : number
}

export interface SendTransactionMeta {
  isBuilding       : boolean
  isBroadcasting   : boolean
  isCalculatingFee : boolean
  isLoadingUtxos   : boolean
  error?           : string
  txid?            : string
  txHex?           : string
}

export interface SendTransactionUtxoData {
  selectedUtxos    : NormalizedUTXO[]
  changeAddress?   : string
  changeAmount     : number
  totalUtxoValue   : number
}

// --- Main State Interface ---
interface SendTransactionState {
  // === INPUT STATE ===
  inputs : SendTransactionInputs

  // === DERIVED STATE ===
  derived : SendTransactionDerived

  // === UTXO STATE ===
  utxos : SendTransactionUtxoData

  // === META STATE ===
  meta : SendTransactionMeta

  // === COMPUTED GETTERS ===
  isValidTransaction : () => boolean
  getValidationErrors : () => string[]
  canBroadcast : () => boolean
  getTransactionSummary : () => {
    recipient : string
    amount    : number
    fee       : number
    total     : number
    currency  : CurrencyType
  }

  // === INPUT ACTIONS ===
  setRecipientAddress : (address: string) => void
  setAmount : (amount: string, currency?: CurrencyType) => void
  setCurrency : (currency: CurrencyType) => void
  setFeeRate : (feeRate: number) => void

  // === VALIDATION ACTIONS ===
  validateAddress : () => void
  validateAmount : () => void
  validateFee : () => void
  validateTransaction : () => boolean

  // === TRANSACTION LIFECYCLE ===
  calculateFeeAndUtxos : (availableUtxos: Array<EnhancedUTXO & { publicKey: Buffer }>, changeAddress: string) => void
  buildTransaction : () => Promise<{ psbt: any; fee: number }>
  broadcastTransaction : (signedTxHex: string) => Promise<string>

  // === UTILITY ACTIONS ===
  reset : () => void
  resetErrors : () => void
  resetMeta : () => void
}

// --- Default States ---
const DEFAULT_INPUTS: SendTransactionInputs = {
  recipientAddress : '',
  amount           : '0',
  currency         : 'SATS',
  feeRate          : 10
}

const DEFAULT_DERIVED: SendTransactionDerived = {
  amountSats     : 0,
  isValidAddress : false,
  totalSats      : 0,
  estimatedFee   : 0,
  estimatedSize  : 0
}

const DEFAULT_UTXOS: SendTransactionUtxoData = {
  selectedUtxos  : [],
  changeAmount   : 0,
  totalUtxoValue : 0
}

const DEFAULT_META: SendTransactionMeta = {
  isBuilding       : false,
  isBroadcasting   : false,
  isCalculatingFee : false,
  isLoadingUtxos   : false
}

// --- Store Implementation ---
export const useSendTransactionStore = create<SendTransactionState>()(
  persist(
    (set, get) => ({
      // === INITIAL STATE ===
      inputs  : { ...DEFAULT_INPUTS },
      derived : { ...DEFAULT_DERIVED },
      utxos   : { ...DEFAULT_UTXOS },
      meta    : { ...DEFAULT_META },

      // === COMPUTED GETTERS ===
      isValidTransaction : () => {
        const state = get()
        return (
          state.derived.isValidAddress &&
          state.derived.amountSats > 0 &&
          state.inputs.feeRate > 0 &&
          state.utxos.selectedUtxos.length > 0 &&
          !state.derived.addressError &&
          !state.derived.amountError &&
          !state.derived.feeError
        )
      },

      getValidationErrors : () => {
        const state = get()
        const errors: string[] = []

        if (!state.inputs.recipientAddress.trim()) {
          errors.push('Recipient address is required')
        } else if (state.derived.addressError) {
          errors.push(state.derived.addressError)
        }

        if (state.derived.amountSats <= 0) {
          errors.push('Amount must be greater than 0')
        } else if (state.derived.amountError) {
          errors.push(state.derived.amountError)
        }

        if (state.inputs.feeRate <= 0) {
          errors.push('Fee rate must be greater than 0')
        } else if (state.derived.feeError) {
          errors.push(state.derived.feeError)
        }

        if (state.utxos.selectedUtxos.length === 0 && state.derived.amountSats > 0) {
          errors.push('Insufficient funds')
        }

        return errors
      },

      canBroadcast : () => {
        const state = get()
        return state.isValidTransaction() && !!state.meta.txHex && !state.meta.isBroadcasting
      },

      getTransactionSummary : () => {
        const state = get()
        return {
          recipient : state.inputs.recipientAddress,
          amount    : state.derived.amountSats,
          fee       : state.derived.estimatedFee,
          total     : state.derived.totalSats,
          currency  : state.inputs.currency
        }
      },

      // === INPUT ACTIONS ===
      setRecipientAddress : (address: string) => {
        set(state => ({
          inputs : { ...state.inputs, recipientAddress: address.trim() },
          meta   : { ...state.meta, error: undefined }
        }))

        // Auto-validate address
        setTimeout(() => get().validateAddress(), 0)
      },

      setAmount : (amount: string, currency?: CurrencyType) => {
        const newCurrency = currency || get().inputs.currency

        set(state => ({
          inputs : { 
            ...state.inputs, 
            amount   : amount.trim(),
            currency : newCurrency
          },
          meta : { ...state.meta, error: undefined }
        }))

        // Auto-validate amount and recalculate derived values
        setTimeout(() => {
          get().validateAmount()
          // Trigger fee calculation if we have UTXOs
          const state = get()
          if (state.utxos.selectedUtxos.length > 0) {
            // This would trigger recalculation in the hook that manages UTXOs
          }
        }, 0)
      },

      setCurrency : (currency: CurrencyType) => {
        set(state => ({
          inputs : { ...state.inputs, currency },
          meta   : { ...state.meta, error: undefined }
        }))

        // Recalculate amount in satoshis
        setTimeout(() => get().validateAmount(), 0)
      },

      setFeeRate : (feeRate: number) => {
        set(state => ({
          inputs : { ...state.inputs, feeRate },
          meta   : { ...state.meta, error: undefined }
        }))

        // Auto-validate fee rate
        setTimeout(() => get().validateFee(), 0)
      },

      // === VALIDATION ACTIONS ===
      validateAddress : () => {
        const { recipientAddress } = get().inputs

        if (!recipientAddress.trim()) {
          set(state => ({
            derived : {
              ...state.derived,
              isValidAddress : false,
              addressError   : undefined
            }
          }))
          return
        }

        try {
          const validation = validateAndSanitizeAddress(recipientAddress, bitcoinjsNetwork)
          
          if (validation.isValid) {
            set(state => ({
              inputs  : { ...state.inputs, recipientAddress: validation.sanitizedAddress },
              derived : {
                ...state.derived,
                isValidAddress : true,
                addressError   : undefined
              }
            }))
          } else {
            set(state => ({
              derived : {
                ...state.derived,
                isValidAddress : false,
                addressError   : validation.error
              }
            }))
          }
        } catch (error) {
          set(state => ({
            derived : {
              ...state.derived,
              isValidAddress : false,
              addressError   : error instanceof Error ? error.message : 'Invalid address'
            }
          }))
        }
      },

      validateAmount : () => {
        const { amount, currency } = get().inputs

        if (!amount || amount === '0') {
          set(state => ({
            derived : {
              ...state.derived,
              amountSats  : 0,
              amountError : undefined,
              totalSats   : state.derived.estimatedFee
            }
          }))
          return
        }

        try {
          // Validate input format
          if (!validateBitcoinInput('', amount, currency)) {
            set(state => ({
              derived : {
                ...state.derived,
                amountError : 'Invalid amount format'
              }
            }))
            return
          }

          const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, ''))
          
          if (isNaN(numericAmount) || numericAmount <= 0) {
            set(state => ({
              derived : {
                ...state.derived,
                amountSats  : 0,
                amountError : 'Amount must be greater than 0'
              }
            }))
            return
          }

          // Convert to satoshis
          const amountSats = currency === 'BTC' 
            ? Math.round(numericAmount * 100_000_000)
            : Math.round(numericAmount)

          // Validate reasonable limits
          const MAX_SINGLE_TX = 100_000_000 // 1 BTC safety limit
          if (amountSats > MAX_SINGLE_TX) {
            set(state => ({
              derived : {
                ...state.derived,
                amountError : 'Amount exceeds maximum single transaction limit (1 BTC)'
              }
            }))
            return
          }

          // Validate dust amount (546 sats minimum)
          if (amountSats < 546) {
            set(state => ({
              derived : {
                ...state.derived,
                amountError : 'Amount too small (minimum 546 sats)'
              }
            }))
            return
          }

          set(state => ({
            derived : {
              ...state.derived,
              amountSats,
              amountError : undefined,
              totalSats   : amountSats + state.derived.estimatedFee
            }
          }))

        } catch {
          set(state => ({
            derived : {
              ...state.derived,
              amountError : 'Invalid amount'
            }
          }))
        }
      },

      validateFee : () => {
        const { feeRate } = get().inputs

        if (feeRate <= 0) {
          set(state => ({
            derived : {
              ...state.derived,
              feeError : 'Fee rate must be greater than 0'
            }
          }))
          return
        }

        // Warn about extremely high fees (over 1000 sat/vB)
        if (feeRate > 1000) {
          set(state => ({
            derived : {
              ...state.derived,
              feeError : 'Fee rate is unusually high'
            }
          }))
          return
        }

        set(state => ({
          derived : {
            ...state.derived,
            feeError : undefined
          }
        }))
      },

      validateTransaction : () => {
        const actions = get()
        actions.validateAddress()
        actions.validateAmount()
        actions.validateFee()
        
        return actions.isValidTransaction()
      },

      // === TRANSACTION LIFECYCLE ===
      calculateFeeAndUtxos : (availableUtxos: Array<EnhancedUTXO & { publicKey: Buffer }>, changeAddress: string) => {
        const state = get()
        
        if (state.derived.amountSats === 0 || availableUtxos.length === 0) {
          set(prevState => ({
            utxos   : { ...DEFAULT_UTXOS },
            derived : {
              ...prevState.derived,
              estimatedFee  : 0,
              estimatedSize : 0,
              totalSats     : prevState.derived.amountSats
            }
          }))
          return
        }

        set(prevState => ({
          meta : { ...prevState.meta, isCalculatingFee: true }
        }))

        try {
          const selectionResult = selectUtxosEnhanced(
            availableUtxos,
            state.derived.amountSats,
            state.inputs.feeRate,
            {
              preferAddressType  : 'native_segwit',
              includeUnconfirmed : false,
              minimizeInputs     : true
            }
          )

          if (selectionResult) {
            const inputTypes = selectionResult.selectedUtxos.map(utxo => utxo.addressType)
            const hasChange = selectionResult.changeAmount > 0
            const estimatedSize = estimateTransactionSize(
              selectionResult.selectedUtxos.length,
              1, // recipient output
              inputTypes,
              hasChange
            )

            set(prevState => ({
              utxos : {
                selectedUtxos  : selectionResult.selectedUtxos as NormalizedUTXO[],
                changeAddress,
                changeAmount   : selectionResult.changeAmount,
                totalUtxoValue : selectionResult.selectedUtxos.reduce((sum: number, utxo) => sum + utxo.value, 0)
              },
              derived : {
                ...prevState.derived,
                estimatedFee : selectionResult.totalFee,
                estimatedSize,
                totalSats    : prevState.derived.amountSats + selectionResult.totalFee
              },
              meta : {
                ...prevState.meta,
                isCalculatingFee : false,
                error            : undefined
              }
            }))
          } else {
            set(prevState => ({
              utxos   : { ...DEFAULT_UTXOS },
              derived : {
                ...prevState.derived,
                estimatedFee  : 0,
                estimatedSize : 0
              },
              meta : {
                ...prevState.meta,
                isCalculatingFee : false,
                error            : 'Insufficient funds to cover amount and fees'
              }
            }))
          }

        } catch (error) {
          set(prevState => ({
            meta : {
              ...prevState.meta,
              isCalculatingFee : false,
              error            : error instanceof Error ? error.message : 'Fee calculation failed'
            }
          }))
        }
      },

      buildTransaction : async () => {
        const state = get()
        
        if (!state.isValidTransaction()) {
          throw new Error(`Transaction validation failed: ${state.getValidationErrors().join(', ')}`)
        }

        set(prevState => ({
          meta : { ...prevState.meta, isBuilding: true, error: undefined }
        }))

        try {
          const buildParams: BuildTransactionParams = {
            inputs  : state.utxos.selectedUtxos,
            outputs : [ { 
              address : state.inputs.recipientAddress, 
              value   : state.derived.amountSats 
            } ],
            feeRate       : state.inputs.feeRate,
            changeAddress : state.utxos.changeAddress!,
            network       : bitcoinjsNetwork
          }

          const { psbt, feeDetails } = await buildTransaction(buildParams)

          set(prevState => ({
            meta : {
              ...prevState.meta,
              isBuilding : false
            },
            derived : {
              ...prevState.derived,
              estimatedFee : feeDetails.calculatedFee
            }
          }))

          return { psbt, fee: feeDetails.calculatedFee }

        } catch (error) {
          set(prevState => ({
            meta : {
              ...prevState.meta,
              isBuilding : false,
              error      : error instanceof Error ? error.message : 'Transaction build failed'
            }
          }))
          throw error
        }
      },

      broadcastTransaction : async (signedTxHex: string) => {
        set(prevState => ({
          meta : { 
            ...prevState.meta, 
            isBroadcasting : true, 
            txHex          : signedTxHex,
            error          : undefined 
          }
        }))

        try {
          const txid = await broadcastTx(signedTxHex)

          set(prevState => ({
            meta : {
              ...prevState.meta,
              isBroadcasting : false,
              txid
            }
          }))

          return txid

        } catch (error) {
          set(prevState => ({
            meta : {
              ...prevState.meta,
              isBroadcasting : false,
              error          : error instanceof Error ? error.message : 'Broadcast failed'
            }
          }))
          throw error
        }
      },

      // === UTILITY ACTIONS ===
      reset : () => {
        set({
          inputs  : { ...DEFAULT_INPUTS },
          derived : { ...DEFAULT_DERIVED },
          utxos   : { ...DEFAULT_UTXOS },
          meta    : { ...DEFAULT_META }
        })
      },

      resetErrors : () => {
        set(state => ({
          derived : {
            ...state.derived,
            addressError : undefined,
            amountError  : undefined,
            feeError     : undefined
          },
          meta : {
            ...state.meta,
            error : undefined
          }
        }))
      },

      resetMeta : () => {
        set(state => ({
          meta : {
            ...DEFAULT_META,
            // Preserve txid and txHex if set
            txid  : state.meta.txid,
            txHex : state.meta.txHex
          }
        }))
      }
    }),
    {
      name       : 'send-transaction-store',
      storage    : createJSONStorage(() => AsyncStorage),
      // Only persist inputs and derived state, not loading/error states
      partialize : (state) => ({
        inputs  : state.inputs,
        derived : {
          amountSats     : state.derived.amountSats,
          isValidAddress : state.derived.isValidAddress,
          totalSats      : state.derived.totalSats,
          estimatedFee   : state.derived.estimatedFee,
          estimatedSize  : state.derived.estimatedSize
        }
      })
    }
  )
) 