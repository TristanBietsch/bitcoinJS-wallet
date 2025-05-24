import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CurrencyType } from '@/src/types/domain/finance'

// Simple, clean transaction data structure
export interface TransactionData {
  // Core transaction details
  recipientAddress: string
  amount: string
  currency: CurrencyType
  
  // Fee information (simplified to single source of truth)
  feeRate: number        // sats/vbyte - the only fee value that matters
  estimatedFee: number   // total estimated fee in sats
  speed: 'economy' | 'standard' | 'express' | 'custom'
  
  // Optional metadata
  note?: string
  label?: string
}

// Transaction building parameters
export interface TransactionParams {
  recipientAddress : string
  amountSat        : number
  feeRate          : number
  changeAddress    : string
}

// Simple fee rates from network
export interface FeeRates {
  economy   : number   // sats/vbyte
  standard  : number   // sats/vbyte  
  express   : number   // sats/vbyte
  timestamp : number   // when fetched
}

interface TransactionState {
  // Current transaction being built
  transaction: TransactionData
  
  // Network fee rates
  feeRates: FeeRates | null
  isLoadingFees: boolean
  feeError: string | null
  
  // Transaction state
  isBuilding: boolean
  isSending: boolean
  error: string | null
  
  // Actions
  setRecipientAddress: (address: string) => void
  setAmount: (amount: string, currency: CurrencyType) => void
  setSpeed: (speed: TransactionData['speed']) => void
  setCustomFeeRate: (feeRate: number) => void
  
  // Fee management
  loadFeeRates: () => Promise<void>
  updateEstimatedFee: (amount: number) => void
  
  // Transaction lifecycle
  buildTransaction: () => Promise<TransactionParams>
  reset: () => void
  
  // Validation
  isValid: () => boolean
  getValidationErrors: () => string[]
}

// Default transaction
const DEFAULT_TRANSACTION: TransactionData = {
  recipientAddress : '',
  amount           : '0',
  currency         : 'SATS',
  feeRate          : 10, // reasonable default
  estimatedFee     : 2000, // reasonable default
  speed            : 'standard'
}

// Default fee rates (fallback)
const DEFAULT_FEE_RATES: FeeRates = {
  economy   : 1,
  standard  : 10,
  express   : 25,
  timestamp : Date.now()
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      // Initial state
      transaction   : { ...DEFAULT_TRANSACTION },
      feeRates      : null,
      isLoadingFees : false,
      feeError      : null,
      isBuilding    : false,
      isSending     : false,
      error         : null,

      // Basic setters
      setRecipientAddress : (address: string) => {
        set(state => ({
          transaction : { ...state.transaction, recipientAddress: address.trim() },
          error       : null
        }))
      },

      setAmount : (amount: string, currency: CurrencyType = 'SATS') => {
        set(state => {
          const newTransaction = { ...state.transaction, amount, currency }
          
          // Auto-update estimated fee when amount changes
          const amountSats = currency === 'SATS' 
            ? parseFloat(amount) || 0
            : (parseFloat(amount) || 0) * 100_000_000
          
          // Update estimated fee based on amount
          get().updateEstimatedFee(amountSats)
          
          const estimatedFee = Math.ceil(200 * newTransaction.feeRate) // rough estimate
          
          return {
            transaction : { ...newTransaction, estimatedFee },
            error       : null
          }
        })
      },

      setSpeed : (speed: TransactionData['speed']) => {
        set(state => {
          const feeRates = state.feeRates || DEFAULT_FEE_RATES
          let feeRate: number
          
          switch (speed) {
            case 'economy':
              feeRate = feeRates.economy
              break
            case 'express':
              feeRate = feeRates.express
              break
            case 'custom':
              feeRate = state.transaction.feeRate // keep current rate for custom
              break
            case 'standard':
            default:
              feeRate = feeRates.standard
              break
          }
          
          const estimatedFee = Math.ceil(200 * feeRate) // rough estimate
          
          return {
            transaction : {
              ...state.transaction,
              speed,
              feeRate,
              estimatedFee
            },
            error : null
          }
        })
      },

      setCustomFeeRate : (feeRate: number) => {
        if (feeRate <= 0) {
          set(state => ({
            error : 'Fee rate must be greater than 0'
          }))
          return
        }
        
        set(state => {
          const estimatedFee = Math.ceil(200 * feeRate) // rough estimate
          
          return {
            transaction : {
              ...state.transaction,
              speed : 'custom',
              feeRate,
              estimatedFee
            },
            error : null
          }
        })
      },

      // Fee rate loading
      loadFeeRates : async () => {
        set({ isLoadingFees: true, feeError: null })
        
        try {
          // This would call your existing fee estimation service
          // For now, using reasonable defaults
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
          
          console.log('Loaded fee rates:', feeRates)
          
          set(state => {
            // Update the current transaction's fee rate if using a standard speed
            let updatedTransaction = state.transaction
            if (state.transaction.speed !== 'custom') {
              const newFeeRate = feeRates[state.transaction.speed]
              const newEstimatedFee = Math.ceil(200 * newFeeRate)
              
              updatedTransaction = {
                ...state.transaction,
                feeRate      : newFeeRate,
                estimatedFee : newEstimatedFee
              }
            }
            
            return {
              feeRates,
              transaction   : updatedTransaction,
              isLoadingFees : false,
              feeError      : null
            }
          })
          
        } catch (error) {
          console.error('Failed to load fee rates:', error)
          
          set(_state => ({
            feeRates      : DEFAULT_FEE_RATES, // Use fallback
            isLoadingFees : false,
            feeError      : error instanceof Error ? error.message : 'Failed to load fee rates'
          }))
        }
      },

      updateEstimatedFee : (amountSats: number) => {
        set(_state => {
          // More accurate fee estimation based on amount (simplified)
          const inputCount = Math.ceil(amountSats / 50000) // rough estimate
          const outputCount = 2 // recipient + change
          const estimatedSize = (inputCount * 148) + (outputCount * 34) + 10 // rough vbyte calculation
          const estimatedFee = Math.ceil(estimatedSize * _state.transaction.feeRate)
          
          return {
            transaction : {
              ..._state.transaction,
              estimatedFee
            }
          }
        })
      },

      // Transaction building
      buildTransaction : async (): Promise<TransactionParams> => {
        const state = get()
        
        if (!state.isValid()) {
          const errors = state.getValidationErrors()
          throw new Error(`Transaction validation failed: ${errors.join(', ')}`)
        }
        
        set({ isBuilding: true, error: null })
        
        try {
          const { transaction } = state
          
          // Convert amount to satoshis
          const amountSat = transaction.currency === 'SATS'
            ? Math.floor(parseFloat(transaction.amount))
            : Math.floor(parseFloat(transaction.amount) * 100_000_000)
          
          if (amountSat <= 0) {
            throw new Error('Amount must be greater than 0')
          }
          
          if (transaction.feeRate <= 0) {
            throw new Error('Fee rate must be greater than 0')
          }
          
          // This would come from wallet store in real implementation
          const changeAddress = 'tb1qchangeaddresshere' // placeholder
          
          const params: TransactionParams = {
            recipientAddress : transaction.recipientAddress,
            amountSat,
            feeRate          : transaction.feeRate,
            changeAddress
          }
          
          console.log('Built transaction params:', params)
          
          set({ isBuilding: false })
          return params
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to build transaction'
          set({ isBuilding: false, error: errorMessage })
          throw error
        }
      },

      // Validation
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

      // Reset
      reset : () => {
        set({
          transaction : { ...DEFAULT_TRANSACTION },
          isBuilding  : false,
          isSending   : false,
          error       : null
        })
      }
    }),
    {
      name       : 'transaction-store',
      storage    : createJSONStorage(() => AsyncStorage),
      // Only persist the transaction data, not loading states
      partialize : (state) => ({
        transaction : state.transaction,
        feeRates    : state.feeRates
      })
    }
  )
) 