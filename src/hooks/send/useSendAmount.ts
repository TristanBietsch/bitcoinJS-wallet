import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useSendStore } from '@/src/store/sendStore'
import { useWalletStore } from '@/src/store/walletStore'
import { CurrencyType } from '@/src/types/domain/finance'
import { validateBitcoinInput } from '@/src/utils/formatting/currencyUtils'
import { formatBitcoinAmount } from '@/src/utils/formatting/formatCurrencyValue'
import { 
  fetchWalletUtxos, 
  filterUtxosByConfirmation, 
  enrichUtxosWithPublicKeys,
  calculateBalanceFromEnhancedUtxos 
} from '@/src/services/bitcoin/wallet/walletUtxoService'
import { selectUtxosEnhanced } from '@/src/utils/bitcoin/utxo'
import { estimateTransactionSize } from '@/src/services/bitcoin/feeEstimationService'
import { seedPhraseService } from '@/src/services/bitcoin/wallet/seedPhraseService'
import { bitcoinjsNetwork } from '@/src/config/env'
import type { EnhancedUTXO } from '@/src/types/blockchain.types'

interface BalanceState {
  confirmed: number
  unconfirmed: number
  total: number
}

interface FeeCalculation {
  selectedUtxos: Array<EnhancedUTXO & { publicKey: Buffer }>
  estimatedSize: number
  totalFee: number
  changeAmount: number
  totalRequired: number // amount + fee
  feeRate: number
}

export const useSendAmount = () => {
  const router = useRouter()
  const { wallet } = useWalletStore()
  const { 
    address: destinationAddress,
    speed,
    customFee,
    selectedFeeOption,
    feeRates,
    amount: persistedAmount,
    currency: persistedCurrency,
    setAmount,
    setCurrency,
    setEstimatedTxSize
  } = useSendStore()
  
  // Local state for amount and currency
  const [ rawAmount, setRawAmount ] = useState(persistedAmount)
  const [ currency, setLocalCurrency ] = useState<CurrencyType>(persistedCurrency || 'SATS')
  
  // Bitcoin functionality state
  const [ walletBalance, setWalletBalance ] = useState<BalanceState>({ confirmed: 0, unconfirmed: 0, total: 0 })
  const [ availableUtxos, setAvailableUtxos ] = useState<Array<EnhancedUTXO & { publicKey: Buffer }>>([])
  const [ feeCalculation, setFeeCalculation ] = useState<FeeCalculation | null>(null)
  const [ isLoadingBalance, setIsLoadingBalance ] = useState(true)
  const [ isCalculatingFee, setIsCalculatingFee ] = useState(false)

  // Convert amount to satoshis for calculations
  const getAmountInSats = useCallback((): number => {
    if (!rawAmount || rawAmount === '0') return 0
    
    const numericAmount = parseFloat(rawAmount.replace(/[^0-9.]/g, ''))
    if (isNaN(numericAmount)) return 0
    
    if (currency === 'BTC') {
      return Math.round(numericAmount * 100000000) // Convert BTC to sats
    } else {
      return Math.round(numericAmount) // Already in sats
    }
  }, [ rawAmount, currency ])

  // Get current fee rate from previous screen selection
  const getCurrentFeeRate = useCallback((): number => {
    try {
      if (speed === 'custom' && customFee) {
        return customFee.feeRate
      }
      
      if (selectedFeeOption) {
        return selectedFeeOption.feeRate
      }
      
      if (feeRates) {
        switch (speed) {
          case 'economy': 
            return feeRates.economy
          case 'standard': 
            return feeRates.normal  
          case 'express': 
            return feeRates.fast
          default: 
            return feeRates.normal
        }
      }
      
      return 10 // Fallback fee rate
    } catch (error) {
      console.error('Error getting fee rate:', error)
      return 10 // Fallback fee rate
    }
  }, [ speed, customFee, selectedFeeOption, feeRates ])

  // Load wallet balance and UTXOs
  const loadWalletData = useCallback(async () => {
    if (!wallet) {
      console.error('Wallet not available for balance loading')
      setIsLoadingBalance(false)
      return
    }

    try {
      setIsLoadingBalance(true)
      
      // Get mnemonic for UTXO operations
      const mnemonic = await seedPhraseService.retrieveSeedPhrase()
      if (!mnemonic) {
        throw new Error('Wallet mnemonic not available')
      }

      console.log('Loading wallet data for testnet:', bitcoinjsNetwork === require('bitcoinjs-lib').networks.testnet)

      // Fetch wallet UTXOs
      const enhancedUtxos = await fetchWalletUtxos(wallet, mnemonic, bitcoinjsNetwork)
      const confirmedUtxos = filterUtxosByConfirmation(enhancedUtxos, false)
      const normalizedUtxos = enrichUtxosWithPublicKeys(confirmedUtxos, mnemonic, bitcoinjsNetwork)

      // Calculate balance
      const balance = calculateBalanceFromEnhancedUtxos(enhancedUtxos)
      
      setWalletBalance(balance)
      setAvailableUtxos(normalizedUtxos)
      
      console.log('Wallet balance loaded:', balance)
      console.log('Available UTXOs:', normalizedUtxos.length)
      
    } catch (error) {
      console.error('Error loading wallet data:', error)
    } finally {
      setIsLoadingBalance(false)
    }
  }, [ wallet ])

  // Calculate fee and UTXO selection for current amount using fee from previous screen
  const calculateTransactionFee = useCallback(async () => {
    const amountSats = getAmountInSats()
    if (amountSats === 0 || availableUtxos.length === 0) {
      setFeeCalculation(null)
      return
    }

    try {
      setIsCalculatingFee(true)
      
      const feeRate = getCurrentFeeRate()
      console.log('Calculating transaction fee with rate:', feeRate, 'for amount:', amountSats)
      
      // Select UTXOs for this amount
      const selectionResult = selectUtxosEnhanced(
        availableUtxos,
        amountSats,
        feeRate,
        {
          preferAddressType  : 'native_segwit',
          includeUnconfirmed : false,
          minimizeInputs     : true
        }
      )

      if (selectionResult) {
        // Calculate real transaction size based on selected UTXOs
        const inputTypes = selectionResult.selectedUtxos.map(utxo => utxo.addressType)
        const hasChange = selectionResult.changeAmount > 0
        const estimatedSize = estimateTransactionSize(
          selectionResult.selectedUtxos.length,
          1, // recipient output
          inputTypes,
          hasChange
        )

        const feeCalc: FeeCalculation = {
          selectedUtxos : selectionResult.selectedUtxos,
          estimatedSize,
          totalFee      : selectionResult.totalFee,
          changeAmount  : selectionResult.changeAmount,
          totalRequired : amountSats + selectionResult.totalFee,
          feeRate
        }

        setFeeCalculation(feeCalc)
        setEstimatedTxSize(estimatedSize) // Update store for next screen
        
        console.log('Fee calculation successful:', feeCalc)
      } else {
        console.warn('Could not select UTXOs for amount:', amountSats)
        setFeeCalculation(null)
      }
      
    } catch (error) {
      console.error('Error calculating transaction fee:', error)
      setFeeCalculation(null)
    } finally {
      setIsCalculatingFee(false)
    }
  }, [ getAmountInSats, availableUtxos, getCurrentFeeRate, setEstimatedTxSize ])

  // Validate transaction (console logs only, no UI errors)
  const validateTransaction = useCallback(() => {
    // Validate previous screen data
    if (!destinationAddress || destinationAddress.trim() === '') {
      console.error('No destination address selected')
      return false
    }

    if (!speed) {
      console.error('No fee speed selected')
      return false
    }

    // Validate custom fee if speed is custom
    if (speed === 'custom' && (!customFee || !customFee.feeRate || customFee.feeRate <= 0)) {
      console.error('Invalid custom fee selected')
      return false
    }

    const amountSats = getAmountInSats()
    
    if (amountSats === 0) {
      console.log('Amount is zero, validation skipped')
      return false
    }

    // Maximum single transaction limit (prevent accidentally large sends)
    const MAX_SINGLE_TX = 100000000 // 1 BTC limit for safety
    if (amountSats > MAX_SINGLE_TX) {
      console.error(`Amount exceeds maximum single transaction limit: ${amountSats} > ${MAX_SINGLE_TX}`)
      return false
    }

    // Check if we have any available balance
    if (walletBalance.confirmed === 0) {
      console.error('No confirmed funds available')
      return false
    }

    // Check if amount exceeds available balance
    if (amountSats > walletBalance.confirmed) {
      const shortfall = amountSats - walletBalance.confirmed
      console.error(`Insufficient funds. Need ${shortfall} more sats. Available: ${walletBalance.confirmed}, Requested: ${amountSats}`)
      return false
    }

    // Check if we have UTXOs available for selection
    if (availableUtxos.length === 0 && !isLoadingBalance) {
      console.error('No spendable UTXOs available')
      return false
    }

    // Check if UTXOs can cover amount + fee
    if (feeCalculation === null && amountSats > 0 && availableUtxos.length > 0) {
      console.error('Unable to calculate transaction fee')
      return false
    }

    if (feeCalculation && feeCalculation.totalRequired > walletBalance.confirmed) {
      const feeAmount = feeCalculation.totalFee
      const totalNeeded = feeCalculation.totalRequired
      const available = walletBalance.confirmed
      const shortfall = totalNeeded - available
      
      console.error(`Insufficient funds for amount + fee. Need ${totalNeeded} sats (${amountSats} + ${feeAmount} fee) but only ${available} available. Short by ${shortfall} sats.`)
      return false
    }

    // Warn if fee is unusually high compared to amount
    if (feeCalculation && feeCalculation.totalFee > amountSats * 0.1) {
      console.warn(`High fee warning: Network fee (${feeCalculation.totalFee} sats) is more than 10% of send amount (${amountSats} sats)`)
      // Don't return false, just warn
    }

    console.log('Transaction validation passed')
    return true
  }, [ destinationAddress, speed, customFee, getAmountInSats, walletBalance.confirmed, feeCalculation, availableUtxos.length, isLoadingBalance ])

  // Check if we can proceed to next screen
  const canProceedToNext = !isLoadingBalance && 
                          !isCalculatingFee && 
                          feeCalculation !== null && 
                          getAmountInSats() > 0 &&
                          validateTransaction()

  // Enhanced continue handler with comprehensive validation
  const handleContinue = useCallback(() => {
    // Validate transaction
    if (!validateTransaction()) {
      console.error('Transaction validation failed, cannot proceed')
      return
    }

    // Validate current amount and fee calculation
    if (!feeCalculation) {
      console.error('No fee calculation available, cannot proceed')
      return
    }

    // Ensure we have all required data
    if (!destinationAddress || !speed) {
      console.error('Missing required transaction data:', { destinationAddress, speed })
      return
    }

    // Save current state to store ONLY when proceeding
    setAmount(rawAmount)
    setCurrency(currency)
    
    console.log('Proceeding to confirmation with:', {
      destinationAddress,
      amount : getAmountInSats(),
      feeCalculation,
      speed,
      customFee
    })
    
    router.push('/send/confirm' as any)
  }, [ validateTransaction, feeCalculation, destinationAddress, speed, setAmount, rawAmount, setCurrency, currency, getAmountInSats, customFee, router ])

  // Load wallet data on mount
  useEffect(() => {
    loadWalletData()
  }, [ loadWalletData ])

  // Recalculate fees when amount changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateTransactionFee()
    }, 500) // Debounce fee calculation

    return () => clearTimeout(timeoutId)
  }, [ calculateTransactionFee ])

  // Handle currency change - DO NOT UPDATE STORE IMMEDIATELY
  const handleCurrencyChange = useCallback((newCurrency: string) => {
    const newCurrencyType = newCurrency as CurrencyType
    setLocalCurrency(newCurrencyType)
    // Only update store when proceeding to next screen
  }, [])
  
  // Handle input - DO NOT UPDATE STORE IMMEDIATELY
  const handleNumberPress = useCallback((num: string) => {
    // Use the raw amount (not formatted) for validation
    const isValid = validateBitcoinInput(rawAmount, num, currency)
    
    if (!isValid) {
      return
    }
    
    setRawAmount(prev => {
      const newAmount = prev === '0' && num !== '.' ? num :
        num === '.' && prev.includes('.') ? prev :
        prev + num
      // Only update store when proceeding to next screen
      return newAmount
    })
  }, [ rawAmount, currency ])
  
  const handleBackspace = useCallback(() => {
    setRawAmount(prev => {
      const newAmount = prev.length <= 1 ? '0' : prev.slice(0, -1)
      // Only update store when proceeding to next screen
      return newAmount
    })
  }, [])
  
  // Handle back navigation
  const handleBackPress = useCallback(() => {
    router.back()
  }, [ router ])
  
  // Format displayed amount based on currency
  const getFormattedAmount = useCallback(() => {
    return formatBitcoinAmount(rawAmount, currency)
  }, [ rawAmount, currency ])

  return {
    // Display values
    amount : getFormattedAmount(), // Formatted for display
    currency,
    
    // Bitcoin state
    walletBalance,
    feeCalculation,
    estimatedFee  : feeCalculation?.totalFee || 0,
    totalRequired : feeCalculation?.totalRequired || 0,
    
    // Loading states only (no error states for UI)
    isLoadingBalance,
    isCalculatingFee,
    
    // Validation
    canProceedToNext,
    
    // Handlers
    handleCurrencyChange,
    handleNumberPress,
    handleBackspace,
    handleBackPress,
    handleContinue,
    
    // Actions
    refreshBalance : loadWalletData
  }
} 