import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CurrencyType } from '@/src/types/domain/finance'
import { useSendTransactionStore } from './sendTransactionStore'

// Legacy compatibility interfaces
export interface TransactionData {
  recipientAddress: string
  amount: string
  currency: CurrencyType
  feeRate: number
  estimatedFee: number
  speed: 'economy' | 'standard' | 'express' | 'custom'
  note?: string
  label?: string
}

export interface TransactionParams {
  recipientAddress: string
  amountSat: number
  feeRate: number
  changeAddress: string
}

export interface FeeRates {
  economy: number
  standard: number
  express: number
  timestamp: number
}

/**
 * Legacy compatibility layer for the old transactionStore
 * This provides the same interface but uses the new SendTransactionStore underneath
 * @deprecated Use useSendTransactionStore directly for new code
 */
interface LegacyTransactionState {
  transaction: TransactionData
  feeRates: FeeRates | null
  isLoadingFees: boolean
  feeError: string | null
  isBuilding: boolean
  isSending: boolean
  error: string | null
  
  setRecipientAddress: (address: string) => void
  setAmount: (amount: string, currency: CurrencyType) => void
  setSpeed: (speed: TransactionData['speed']) => void
  setCustomFeeRate: (feeRate: number) => void
  loadFeeRates: () => Promise<void>
  updateEstimatedFee: (amount: number) => void
  buildTransaction: () => Promise<TransactionParams>
  reset: () => void
  isValid: () => boolean
  getValidationErrors: () => string[]
}

const DEFAULT_TRANSACTION: TransactionData = {
  recipientAddress : '',
  amount           : '0',
  currency         : 'SATS',
  feeRate          : 10,
  estimatedFee     : 2000,
  speed            : 'standard'
}

const DEFAULT_FEE_RATES: FeeRates = {
  economy   : 1,
  standard  : 10,
  express   : 25,
  timestamp : Date.now()
}

export const useTransactionStore = create<LegacyTransactionState>()(
  persist(
    (_set, get) => ({
      transaction   : { ...DEFAULT_TRANSACTION },
      feeRates      : null,
      isLoadingFees : false,
      feeError      : null,
      isBuilding    : false,
      isSending     : false,
      error         : null,

      setRecipientAddress : (address: string) => {
        useSendTransactionStore.getState().setRecipientAddress(address)
        const currentTx = get().transaction
        _set({ 
          transaction : { ...currentTx, recipientAddress: address },
          error       : null 
        })
      },

      setAmount : (amount: string, currency: CurrencyType = 'SATS') => {
        useSendTransactionStore.getState().setAmount(amount, currency)
        const currentTx = get().transaction
        _set({ 
          transaction : { ...currentTx, amount, currency },
          error       : null 
        })
      },

      setSpeed : (speed: TransactionData['speed']) => {
        const feeRates = get().feeRates || DEFAULT_FEE_RATES
        let feeRate: number
        
        switch (speed) {
          case 'economy':
            feeRate = feeRates.economy
            break
          case 'express':
            feeRate = feeRates.express
            break
          case 'custom':
            feeRate = get().transaction.feeRate
            break
          case 'standard':
          default:
            feeRate = feeRates.standard
            break
        }
        
        useSendTransactionStore.getState().setFeeRate(feeRate)
        const currentTx = get().transaction
        _set({ 
          transaction : { ...currentTx, speed, feeRate },
          error       : null 
        })
      },

      setCustomFeeRate : (feeRate: number) => {
        if (feeRate <= 0) {
          _set({ error: 'Fee rate must be greater than 0' })
          return
        }
        
        useSendTransactionStore.getState().setFeeRate(feeRate)
        const currentTx = get().transaction
        _set({ 
          transaction : { ...currentTx, speed: 'custom', feeRate },
          error       : null 
        })
      },

      loadFeeRates : async () => {
        _set({ isLoadingFees: true, feeError: null })
        
        try {
          const response = await fetch('https://mempool.space/testnet/api/v1/fees/recommended')
          
          if (!response.ok) {
            throw new Error('Failed to fetch fee rates')
          }
          
          const data = await response.json()
          
          const feeRates: FeeRates = {
            economy   : Math.max(1, data.economyFee || 1),
            standard  : Math.max(5, data.hourFee || 10),
            express   : Math.max(10, data.fastestFee || 25),
            timestamp : Date.now()
          }
          
          _set({ 
            feeRates,
            isLoadingFees : false,
            feeError      : null
          })
          
        } catch (error) {
          console.error('Failed to load fee rates:', error)
          _set({ 
            feeRates      : DEFAULT_FEE_RATES,
            isLoadingFees : false,
            feeError      : error instanceof Error ? error.message : 'Failed to load fee rates'
          })
        }
      },

      updateEstimatedFee : (amountSats: number) => {
        const inputCount = Math.ceil(amountSats / 50000)
        const outputCount = 2
        const estimatedSize = (inputCount * 148) + (outputCount * 34) + 10
        const estimatedFee = Math.ceil(estimatedSize * get().transaction.feeRate)
        
        const currentTx = get().transaction
        _set({ 
          transaction : { ...currentTx, estimatedFee }
        })
      },

      buildTransaction : async (): Promise<TransactionParams> => {
        const state = get()
        
        if (!state.isValid()) {
          const errors = state.getValidationErrors()
          throw new Error(`Transaction validation failed: ${errors.join(', ')}`)
        }
        
        _set({ isBuilding: true, error: null })
        
        try {
          const { transaction } = state
          
          const amountSat = transaction.currency === 'SATS'
            ? Math.floor(parseFloat(transaction.amount))
            : Math.floor(parseFloat(transaction.amount) * 100_000_000)
          
          if (amountSat <= 0) {
            throw new Error('Amount must be greater than 0')
          }
          
          if (transaction.feeRate <= 0) {
            throw new Error('Fee rate must be greater than 0')
          }
          
          const changeAddress = 'tb1qchangeaddresshere' // placeholder
          
          const params: TransactionParams = {
            recipientAddress : transaction.recipientAddress,
            amountSat,
            feeRate          : transaction.feeRate,
            changeAddress
          }
          
          _set({ isBuilding: false })
          return params
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to build transaction'
          _set({ isBuilding: false, error: errorMessage })
          throw error
        }
      },

      isValid : () => {
        const state = get()
        const errors = state.getValidationErrors()
        return errors.length === 0
      },

      getValidationErrors : () => {
        const { transaction } = get()
        const errors: string[] = []
        
        if (!transaction.recipientAddress.trim()) {
          errors.push('Recipient address is required')
        }
        
        const amount = parseFloat(transaction.amount)
        if (isNaN(amount) || amount <= 0) {
          errors.push('Amount must be greater than 0')
        }
        
        if (transaction.feeRate <= 0) {
          errors.push('Fee rate must be greater than 0')
        }
        
        return errors
      },

      reset : () => {
        useSendTransactionStore.getState().reset()
        _set({
          transaction : { ...DEFAULT_TRANSACTION },
          isBuilding  : false,
          isSending   : false,
          error       : null
        })
      }
    }),
    {
      name       : 'transaction-store-legacy',
      storage    : createJSONStorage(() => AsyncStorage),
      partialize : (state) => ({
        transaction : state.transaction,
        feeRates    : state.feeRates
      })
    }
  )
) 