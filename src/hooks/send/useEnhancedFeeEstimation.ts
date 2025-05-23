/**
 * Enhanced Fee Estimation Hook
 * Manages fee estimation, transaction size calculation, and fee option selection
 */

import { useEffect, useCallback, useState } from 'react'
import { useSendStore } from '../../store/sendStore'
import { useWalletStore } from '../../store/walletStore'
import { 
  getEnhancedFeeEstimates,
  calculateFeeOptions,
  estimateTransactionSize,
  validateCustomFeeRate
} from '../../services/bitcoin/feeEstimationService'
import { 
  fetchWalletUtxos,
  filterUtxosByConfirmation,
  enrichUtxosWithPublicKeys
} from '../../services/bitcoin/wallet/walletUtxoService'
import { selectUtxosEnhanced } from '../../utils/bitcoin/utxo'
import { seedPhraseService } from '../../services/bitcoin/wallet/seedPhraseService'
import { bitcoinjsNetwork } from '../../config/env'

interface FeeEstimationResult {
  selectedUtxos: any[]
  estimatedSize: number
  totalInputValue: number
  changeAmount: number
}

export function useEnhancedFeeEstimation() {
  const { wallet } = useWalletStore()
  const {
    amount,
    feeRates,
    feeOptions,
    selectedFeeOption,
    isLoadingFees,
    feeError,
    estimatedTxSize,
    setFeeRates,
    setFeeOptions,
    setSelectedFeeOption,
    setIsLoadingFees,
    setFeeError,
    setEstimatedTxSize
  } = useSendStore()

  const [lastEstimationParams, setLastEstimationParams] = useState<{
    amount: string
    feeRatesTimestamp?: number
  }>({ amount: '' })

  // Load fee rates on mount and periodically
  const loadFeeRates = useCallback(async () => {
    try {
      setIsLoadingFees(true)
      setFeeError(undefined)
      
      const rates = await getEnhancedFeeEstimates()
      setFeeRates(rates)
      
      return rates
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load fee rates'
      setFeeError(errorMessage)
      console.error('Error loading fee rates:', error)
      return null
    } finally {
      setIsLoadingFees(false)
    }
  }, [setFeeRates, setIsLoadingFees, setFeeError])

  // Estimate transaction size and UTXO selection
  const estimateTransaction = useCallback(async (
    amountSats: number,
    feeRatePerVByte: number
  ): Promise<FeeEstimationResult | null> => {
    if (!wallet) return null

    try {
      // Get mnemonic for UTXO operations
      const mnemonic = await seedPhraseService.retrieveSeedPhrase()
      if (!mnemonic) throw new Error('Mnemonic not available')

      // Fetch and prepare UTXOs
      const enhancedUtxos = await fetchWalletUtxos(wallet, mnemonic, bitcoinjsNetwork)
      const confirmedUtxos = filterUtxosByConfirmation(enhancedUtxos, false)
      const normalizedUtxos = enrichUtxosWithPublicKeys(confirmedUtxos, mnemonic, bitcoinjsNetwork)

      // Select UTXOs for the transaction
      const selectionResult = selectUtxosEnhanced(
        normalizedUtxos,
        amountSats,
        feeRatePerVByte,
        {
          preferAddressType: 'native_segwit',
          includeUnconfirmed: false,
          minimizeInputs: true
        }
      )

      if (!selectionResult) return null

      // Calculate transaction size
      const inputTypes = selectionResult.selectedUtxos.map(utxo => utxo.addressType)
      const estimatedSize = estimateTransactionSize(
        selectionResult.selectedUtxos.length,
        1, // recipient output
        inputTypes,
        selectionResult.changeAmount > 0 // has change output
      )

      return {
        selectedUtxos: selectionResult.selectedUtxos,
        estimatedSize,
        totalInputValue: selectionResult.totalSelectedValue,
        changeAmount: selectionResult.changeAmount
      }

    } catch (error) {
      console.error('Error estimating transaction:', error)
      return null
    }
  }, [wallet])

  // Calculate fee options based on estimated transaction size
  const calculateFeeOptionsForAmount = useCallback(async (amountSats: number) => {
    if (!feeRates || amountSats <= 0) return

    try {
      // Get a rough estimate of transaction size using normal fee rate
      const estimation = await estimateTransaction(amountSats, feeRates.normal)
      
      if (!estimation) {
        setFeeError('Insufficient funds for transaction')
        return
      }

      // Calculate fee options with the estimated size
      const options = await calculateFeeOptions(estimation.estimatedSize)
      setFeeOptions(options)
      setEstimatedTxSize(estimation.estimatedSize)

      // Set default selection to normal if not already selected
      if (!selectedFeeOption && options.length > 0) {
        const normalOption = options.find(opt => opt.name === 'Normal') || options[1]
        setSelectedFeeOption(normalOption)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error calculating fees'
      setFeeError(errorMessage)
      console.error('Error calculating fee options:', error)
    }
  }, [feeRates, estimateTransaction, setFeeOptions, setEstimatedTxSize, setFeeError, selectedFeeOption, setSelectedFeeOption])

  // Auto-load fee rates on mount
  useEffect(() => {
    loadFeeRates()
  }, [loadFeeRates])

  // Auto-calculate fee options when amount or fee rates change
  useEffect(() => {
    const amountSats = parseInt(amount) || 0
    const ratesTimestamp = feeRates?.lastUpdated
    
    // Only recalculate if amount or rates changed
    if (
      amountSats > 0 && 
      feeRates && 
      (
        lastEstimationParams.amount !== amount ||
        lastEstimationParams.feeRatesTimestamp !== ratesTimestamp
      )
    ) {
      calculateFeeOptionsForAmount(amountSats)
      setLastEstimationParams({ amount, feeRatesTimestamp: ratesTimestamp })
    }
  }, [amount, feeRates, calculateFeeOptionsForAmount, lastEstimationParams])

  // Validate custom fee rate
  const validateCustomFee = useCallback((customFeeRate: number) => {
    if (!feeRates) {
      return { isValid: false, message: 'Fee rates not loaded' }
    }
    return validateCustomFeeRate(customFeeRate, feeRates)
  }, [feeRates])

  // Manual refresh function
  const refreshFeeRates = useCallback(() => {
    return loadFeeRates()
  }, [loadFeeRates])

  // Get fee estimate for specific amount and rate
  const getFeeEstimate = useCallback(async (amountSats: number, feeRate: number) => {
    const estimation = await estimateTransaction(amountSats, feeRate)
    if (!estimation) return null

    return {
      estimatedFee: Math.ceil(estimation.estimatedSize * feeRate),
      estimatedSize: estimation.estimatedSize,
      totalRequired: amountSats + Math.ceil(estimation.estimatedSize * feeRate)
    }
  }, [estimateTransaction])

  return {
    // State
    feeRates,
    feeOptions,
    selectedFeeOption,
    isLoadingFees,
    feeError,
    estimatedTxSize,

    // Actions  
    loadFeeRates,
    refreshFeeRates,
    setSelectedFeeOption,
    calculateFeeOptionsForAmount,
    validateCustomFee,
    getFeeEstimate,

    // Computed
    hasValidFeeData: !!(feeRates && feeOptions && feeOptions.length > 0),
    isReady: !!(feeRates && !isLoadingFees)
  }
} 