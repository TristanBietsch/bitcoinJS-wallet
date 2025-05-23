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
import { estimateTransactionSize, getEnhancedFeeEstimates } from '@/src/services/bitcoin/feeEstimationService'
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
}

export const useSendAmount = () => {
  const router = useRouter()
  const { wallet } = useWalletStore()
  const { 
    speed,
    customFee,
    amount: persistedAmount,
    currency: persistedCurrency,
    setAmount,
    setCurrency,
    setEstimatedTxSize
  } = useSendStore()
  
  // Local state for amount and currency
  const [ amount, setLocalAmount ] = useState(persistedAmount)
  const [ currency, setLocalCurrency ] = useState<CurrencyType>(persistedCurrency || 'SATS')
  
  // Bitcoin functionality state
  const [ walletBalance, setWalletBalance ] = useState<BalanceState>({ confirmed: 0, unconfirmed: 0, total: 0 })
  const [ availableUtxos, setAvailableUtxos ] = useState<Array<EnhancedUTXO & { publicKey: Buffer }>>([])
  const [ feeCalculation, setFeeCalculation ] = useState<FeeCalculation | null>(null)
  const [ isLoadingBalance, setIsLoadingBalance ] = useState(true)
  const [ isCalculatingFee, setIsCalculatingFee ] = useState(false)
  const [ balanceError, setBalanceError ] = useState<string | null>(null)
  const [ validationError, setValidationError ] = useState<string | null>(null)

  // Convert amount to satoshis for calculations
  const getAmountInSats = useCallback((): number => {
    if (!amount || amount === '0') return 0
    
    const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, ''))
    if (isNaN(numericAmount)) return 0
    
    if (currency === 'BTC') {
      return Math.round(numericAmount * 100000000) // Convert BTC to sats
    } else {
      return Math.round(numericAmount) // Already in sats
    }
  }, [ amount, currency ])

  // Get current fee rate based on speed selection
  const getCurrentFeeRate = useCallback(async (): Promise<number> => {
    try {
      if (speed === 'custom' && customFee) {
        return customFee.feeRate
      }
      
      const feeRates = await getEnhancedFeeEstimates()
      
      switch (speed) {
        case 'economy': return feeRates.economy
        case 'standard': return feeRates.normal  
        case 'express': return feeRates.fast
        default: return feeRates.normal
      }
    } catch (error) {
      console.error('Error getting fee rate:', error)
      return 10 // Fallback fee rate
    }
  }, [ speed, customFee ])

  // Load wallet balance and UTXOs
  const loadWalletData = useCallback(async () => {
    if (!wallet) {
      setBalanceError('Wallet not available')
      setIsLoadingBalance(false)
      return
    }

    try {
      setIsLoadingBalance(true)
      setBalanceError(null)
      
      // Get mnemonic for UTXO operations
      const mnemonic = await seedPhraseService.retrieveSeedPhrase()
      if (!mnemonic) {
        throw new Error('Wallet mnemonic not available')
      }

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
      setBalanceError('Failed to load wallet balance')
    } finally {
      setIsLoadingBalance(false)
    }
  }, [ wallet ])

  // Calculate fee and UTXO selection for current amount
  const calculateTransactionFee = useCallback(async () => {
    const amountSats = getAmountInSats()
    if (amountSats === 0 || availableUtxos.length === 0) {
      setFeeCalculation(null)
      return
    }

    try {
      setIsCalculatingFee(true)
      
      const feeRate = await getCurrentFeeRate()
      
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
          totalRequired : amountSats + selectionResult.totalFee
        }

        setFeeCalculation(feeCalc)
        setEstimatedTxSize(estimatedSize) // Update store for next screen
        
        console.log('Fee calculation:', feeCalc)
      } else {
        setFeeCalculation(null)
      }
      
    } catch (error) {
      console.error('Error calculating transaction fee:', error)
      setFeeCalculation(null)
    } finally {
      setIsCalculatingFee(false)
    }
  }, [ getAmountInSats, availableUtxos, getCurrentFeeRate, setEstimatedTxSize ])

  // Validate amount against balance and UTXOs
  const validateAmount = useCallback(() => {
    const amountSats = getAmountInSats()
    
    if (amountSats === 0) {
      setValidationError(null)
      return
    }

    // Dust limit check
    const DUST_THRESHOLD = 546
    if (amountSats < DUST_THRESHOLD) {
      setValidationError(`Amount too small. Minimum is ${DUST_THRESHOLD} sats`)
      return
    }

    // Check if we have sufficient balance
    if (amountSats > walletBalance.confirmed) {
      setValidationError(`Insufficient funds. Available: ${walletBalance.confirmed} sats`)
      return
    }

    // Check if UTXOs can cover amount + fee
    if (feeCalculation === null && amountSats > 0) {
      setValidationError('Unable to calculate transaction fee')
      return
    }

    if (feeCalculation && feeCalculation.totalRequired > walletBalance.confirmed) {
      setValidationError(`Insufficient funds for amount + fee. Required: ${feeCalculation.totalRequired} sats`)
      return
    }

    setValidationError(null)
  }, [ getAmountInSats, walletBalance.confirmed, feeCalculation ])

  // Load wallet data on mount
  useEffect(() => {
    loadWalletData()
  }, [ loadWalletData ])

  // Recalculate fees when amount changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateTransactionFee()
    }, 500) // Debounce fee calculation

    return () => clearTimeout(timeoutId)
  }, [ calculateTransactionFee ])

  // Validate amount when it changes or fee calculation updates
  useEffect(() => {
    validateAmount()
  }, [ validateAmount ])

  // Handle currency change
  const handleCurrencyChange = (newCurrency: string) => {
    const newCurrencyType = newCurrency as CurrencyType
    setLocalCurrency(newCurrencyType)
    setCurrency(newCurrencyType)
  }
  
  // Handle input
  const handleNumberPress = (num: string) => {
    if (!validateBitcoinInput(amount, num, currency)) {
      return
    }
    
    setLocalAmount(prev => {
      const newAmount = prev === '0' && num !== '.' ? num :
        num === '.' && prev.includes('.') ? prev :
        prev + num
      setAmount(newAmount)
      return newAmount
    })
  }
  
  const handleBackspace = () => {
    setLocalAmount(prev => {
      const newAmount = prev.length <= 1 ? '0' : prev.slice(0, -1)
      setAmount(newAmount)
      return newAmount
    })
  }
  
  // Handle back navigation
  const handleBackPress = () => {
    router.back()
  }
  
  // Handle continue - now with proper validation
  const handleContinue = () => {
    if (validationError || !feeCalculation) return
    
    setAmount(amount)
    setCurrency(currency)
    
    router.push('/send/confirm' as any)
  }
  
  // Format displayed amount based on currency
  const getFormattedAmount = () => {
    return formatBitcoinAmount(amount, currency)
  }

  // Check if we can proceed
  const canProceed = !validationError && 
                    !isLoadingBalance && 
                    !isCalculatingFee && 
                    feeCalculation !== null && 
                    getAmountInSats() > 0

  return {
    // Display values
    amount : getFormattedAmount(),
    currency,
    
    // Bitcoin state
    walletBalance,
    feeCalculation,
    estimatedFee  : feeCalculation?.totalFee || 0,
    totalRequired : feeCalculation?.totalRequired || 0,
    
    // Loading and error states
    isLoadingBalance,
    isCalculatingFee,
    balanceError,
    validationError,
    
    // Validation
    canProceed,
    
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