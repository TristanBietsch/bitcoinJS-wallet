import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useSendStore } from '@/src/store/sendStore'
import { useSendTransactionStore } from '@/src/store/sendTransactionStore'
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
import { seedPhraseService } from '@/src/services/bitcoin/wallet/seedPhraseService'
import { bitcoinjsNetwork } from '@/src/config/env'
import type { EnhancedUTXO } from '@/src/types/blockchain.types'

interface BalanceState {
  confirmed: number
  unconfirmed: number
  total: number
}

interface UseSendAmountReturn {
  // Display values
  amount: string
  currency: CurrencyType
  
  // Balance state
  walletBalance: BalanceState
  estimatedFee: number
  totalRequired: number
  
  // Loading states
  isLoadingBalance: boolean
  isCalculatingFee: boolean
  
  // Validation
  canProceedToNext: boolean
  
  // Handlers
  handleCurrencyChange: (currency: string) => void
  handleNumberPress: (num: string) => void
  handleBackspace: () => void
  handleBackPress: () => void
  handleContinue: () => void
  
  // Actions
  refreshBalance: () => Promise<void>
}

/**
 * Hook for managing the Send Amount screen
 * Simplified version that integrates with the new transaction architecture
 */
export function useSendAmount(): UseSendAmountReturn {
  const router = useRouter()
  const { wallet } = useWalletStore()
  const sendStore = useSendStore()
  const sendTransactionStore = useSendTransactionStore()
  
  // Local state for amount and currency
  const [ rawAmount, setRawAmount ] = useState(sendStore.amount || '0')
  const [ currency, setLocalCurrency ] = useState<CurrencyType>(sendStore.currency || 'SATS')
  
  // State
  const [ walletBalance, setWalletBalance ] = useState<BalanceState>({ confirmed: 0, unconfirmed: 0, total: 0 })
  const [ availableUtxos, setAvailableUtxos ] = useState<Array<EnhancedUTXO & { publicKey: Buffer }>>([])
  const [ isLoadingBalance, setIsLoadingBalance ] = useState(true)
  const [ isCalculatingFee, setIsCalculatingFee ] = useState(false)
  
  // Get values from transaction store
  const estimatedFee = sendTransactionStore.derived.estimatedFee
  const totalRequired = sendTransactionStore.derived.amountSats + sendTransactionStore.derived.estimatedFee
  
  // Convert amount to satoshis
  const getAmountInSats = useCallback((): number => {
    if (!rawAmount || rawAmount === '0') return 0
    
    const numericAmount = parseFloat(rawAmount.replace(/[^0-9.]/g, ''))
    if (isNaN(numericAmount)) return 0
    
    if (currency === 'BTC') {
      return Math.round(numericAmount * 100000000)
    } else {
      return Math.round(numericAmount)
    }
  }, [ rawAmount, currency ])
  
  // Load wallet balance
  const loadWalletData = useCallback(async () => {
    if (!wallet) {
      console.error('Wallet not available')
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
      
      // Fetch wallet UTXOs
      const enhancedUtxos = await fetchWalletUtxos(wallet, mnemonic, bitcoinjsNetwork)
      const confirmedUtxos = filterUtxosByConfirmation(enhancedUtxos, false)
      const normalizedUtxos = enrichUtxosWithPublicKeys(confirmedUtxos, mnemonic, bitcoinjsNetwork)
      
      // Calculate balance
      const balance = calculateBalanceFromEnhancedUtxos(enhancedUtxos)
      
      setWalletBalance(balance)
      setAvailableUtxos(normalizedUtxos)
      
      // Use first native segwit address as change address
      const changeAddress = wallet.addresses.nativeSegwit[0]
      if (changeAddress && normalizedUtxos.length > 0) {
        // Calculate initial fees
        sendTransactionStore.calculateFeeAndUtxos(normalizedUtxos, changeAddress)
      }
      
    } catch (error) {
      console.error('Error loading wallet data:', error)
    } finally {
      setIsLoadingBalance(false)
    }
  }, [ wallet, sendTransactionStore ])
  
  // Update transaction store when amount changes
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setIsCalculatingFee(true)
      
      try {
      // Update amount in both stores
      const amountStr = rawAmount || '0'
      sendStore.setAmount(amountStr)
      sendStore.setCurrency(currency)
        sendTransactionStore.setAmount(amountStr, currency)
      sendTransactionStore.setCurrency(currency)
      
      // Recalculate fees if we have UTXOs
      if (availableUtxos.length > 0 && wallet?.addresses.nativeSegwit[0]) {
        sendTransactionStore.calculateFeeAndUtxos(availableUtxos, wallet.addresses.nativeSegwit[0])
      }
      } catch (error) {
        console.error('Error updating transaction data:', error)
      } finally {
      setIsCalculatingFee(false)
      }
    }, 500) // Debounce
    
    return () => clearTimeout(timeoutId)
  }, [ rawAmount, currency, availableUtxos, wallet, sendStore, sendTransactionStore ])
  
  // Validation
  const canProceedToNext = !isLoadingBalance && 
                          !isCalculatingFee && 
                          getAmountInSats() > 0 &&
                          sendTransactionStore.isValidTransaction() &&
                          totalRequired <= walletBalance.confirmed
  
  // Handlers
  const handleCurrencyChange = useCallback((newCurrency: string) => {
    setLocalCurrency(newCurrency as CurrencyType)
  }, [])
  
  const handleNumberPress = useCallback((num: string) => {
    const isValid = validateBitcoinInput(rawAmount, num, currency)
    if (!isValid) return
    
    setRawAmount(prev => {
      const newAmount = prev === '0' && num !== '.' ? num :
        num === '.' && prev.includes('.') ? prev :
        prev + num
      return newAmount
    })
  }, [ rawAmount, currency ])
  
  const handleBackspace = useCallback(() => {
    setRawAmount(prev => {
      const newAmount = prev.length <= 1 ? '0' : prev.slice(0, -1)
      return newAmount
    })
  }, [])
  
  const handleBackPress = useCallback(() => {
    router.back()
  }, [ router ])
  
  const handleContinue = useCallback(() => {
    if (!canProceedToNext) {
      console.error('Cannot proceed - validation failed')
      return
    }
    
    // Ensure fee rate is set from previous screen
    const feeRate = sendStore.selectedFeeOption?.feeRate || 
                   (sendStore.speed === 'custom' ? sendStore.customFee?.feeRate : 0) || 
                   10 // fallback
    
    sendTransactionStore.setFeeRate(feeRate)
    
    console.log('Proceeding to confirmation with:', {
      amount : getAmountInSats(),
      currency,
      feeRate,
      estimatedFee,
      totalRequired
    })
    
    router.push('/send/confirm' as any)
  }, [ canProceedToNext, getAmountInSats, currency, estimatedFee, totalRequired, router, sendStore, sendTransactionStore ])
  
  // Format displayed amount
  const getFormattedAmount = useCallback(() => {
    return formatBitcoinAmount(rawAmount, currency)
  }, [ rawAmount, currency ])
  
  // Load wallet data on mount
  useEffect(() => {
    loadWalletData()
  }, [ loadWalletData ])
  
  return {
    // Display values
    amount : getFormattedAmount(),
    currency,
    
    // Balance state
    walletBalance,
    estimatedFee,
    totalRequired,
    
    // Loading states
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