/**
 * Enhanced Transaction Processing Hook
 * Integrates all Bitcoin transaction services with real-time progress tracking,
 * comprehensive error handling, security validation, and performance optimization
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'expo-router'
import { useSendStore } from '../../store/sendStore'
import { useWalletStore } from '../../store/walletStore'
import { 
  useTransactionStatus,
  startTransactionTracking,
  trackProgress,
  trackError,
  trackTxid,
  resetTransactionTracking
} from '../../services/bitcoin/transactionStatusService'
import {
  analyzeTransactionSecurity,
  verifyTransaction,
  requiresAdditionalConfirmation
} from '../../services/bitcoin/transactionSecurityService'
import {
  createInsufficientFundsError,
  createAddressValidationError,
  createTransactionError,
  createNetworkError,
  createSecurityError,
  shouldShowRetryButton,
  type SendBTCError
} from '../../types/errors.types'
import { validateAddressForCurrentNetwork, isOwnAddress } from '../../services/bitcoin/addressValidationService'
import { fetchWalletUtxos, filterUtxosByConfirmation, enrichUtxosWithPublicKeys } from '../../services/bitcoin/wallet/walletUtxoService'
import { selectUtxosEnhanced } from '../../utils/bitcoin/utxo'
import { buildTransaction } from '../../services/bitcoin/txBuilder'
import { signTransaction } from '../../services/bitcoin/txSigner'
import { broadcastTx } from '../../services/bitcoin/broadcast'
import { enablePerformanceOptimization } from '../../services/bitcoin/performanceOptimizationService'
import { seedPhraseService } from '../../services/bitcoin/wallet/seedPhraseService'
import { bitcoinjsNetwork } from '../../config/env'
import type { TransactionOutput } from '../../types/tx.types'

interface EnhancedTransactionParams {
  recipientAddress: string
  amountSat: number
  feeRate: number
  changeAddress?: string
  skipSecurityChecks?: boolean
}

interface EnhancedTransactionResult {
  isLoading: boolean
  progress: number
  currentStage: string
  error: SendBTCError | null
  canRetry: boolean
  transactionId?: string
  securityWarnings: string[]
  requiresConfirmation: boolean
  confirmationReasons: string[]
}

export function useEnhancedTransactionProcessing(): {
  processTransaction: (params: EnhancedTransactionParams) => Promise<string>
  result: EnhancedTransactionResult
  retry: () => Promise<void>
  cancel: () => void
  confirmAndProceed: () => Promise<string>
} {
  const router = useRouter()
  const { wallet } = useWalletStore()
  const { reset: resetSendStore } = useSendStore()
  const { getStatus } = useTransactionStatus()
  
  const [ result, setResult ] = useState<EnhancedTransactionResult>({
    isLoading            : false,
    progress             : 0,
    currentStage         : '',
    error                : null,
    canRetry             : false,
    securityWarnings     : [],
    requiresConfirmation : false,
    confirmationReasons  : []
  })
  
  const lastParamsRef = useRef<EnhancedTransactionParams | null>(null)
  const isProcessingRef = useRef(false)

  // Enable performance optimization on mount
  useEffect(() => {
    if (wallet) {
      enablePerformanceOptimization(wallet)
    }
  }, [ wallet ])

  // Update result when transaction status changes
  useEffect(() => {
    const status = getStatus()
    if (status) {
      setResult(prev => ({
        ...prev,
        progress     : status.progress,
        currentStage : status.currentMessage,
        isLoading    : !status.isComplete && !status.isError
      }))
    }
  }, [ getStatus ])

  const processTransaction = useCallback(async (params: EnhancedTransactionParams): Promise<string> => {
    if (isProcessingRef.current) {
      throw new Error('Transaction already in progress')
    }

    isProcessingRef.current = true
    lastParamsRef.current = params
    
    try {
      // Reset state
      setResult({
        isLoading            : true,
        progress             : 0,
        currentStage         : 'Initializing transaction...',
        error                : null,
        canRetry             : false,
        securityWarnings     : [],
        requiresConfirmation : false,
        confirmationReasons  : []
      })

      resetTransactionTracking()
      const transactionId = startTransactionTracking()

      // Phase 1: Input Validation
      trackProgress('validating_inputs')
      
      if (!wallet) {
        throw createSecurityError('WALLET_LOCKED')
      }

      const addressValidation = validateAddressForCurrentNetwork(params.recipientAddress)
      if (!addressValidation.isValid) {
        throw createAddressValidationError(
          params.recipientAddress,
          'INVALID_ADDRESS'
        )
      }

      if (isOwnAddress(params.recipientAddress, wallet.addresses)) {
        throw createAddressValidationError(
          params.recipientAddress,
          'OWN_ADDRESS'
        )
      }

      // Phase 2: UTXO Management
      trackProgress('fetching_utxos')
      
      const mnemonic = await seedPhraseService.retrieveSeedPhrase()
      if (!mnemonic) {
        throw createSecurityError('MNEMONIC_UNAVAILABLE')
      }

      const enhancedUtxos = await fetchWalletUtxos(wallet, mnemonic, bitcoinjsNetwork)
      if (!enhancedUtxos || enhancedUtxos.length === 0) {
        throw createTransactionError('UTXO_SELECTION_FAILED', 'utxo_fetch')
      }

      const confirmedUtxos = filterUtxosByConfirmation(enhancedUtxos, false)
      const normalizedUtxos = enrichUtxosWithPublicKeys(confirmedUtxos, mnemonic, bitcoinjsNetwork)

      // Phase 3: UTXO Selection
      trackProgress('selecting_utxos')
      
      const outputs: TransactionOutput[] = [ {
        address : params.recipientAddress,
        value   : params.amountSat
      } ]

      const changeAddress = params.changeAddress || wallet.addresses.nativeSegwit[0]
      
      const selectionResult = selectUtxosEnhanced(normalizedUtxos, params.amountSat, params.feeRate, {
        preferAddressType  : 'native_segwit',
        minimizeInputs     : true,
        includeUnconfirmed : false
      })

      if (!selectionResult) {
        const totalAvailable = normalizedUtxos.reduce((sum, utxo) => sum + utxo.value, 0)
        throw createInsufficientFundsError(
          params.amountSat,
          totalAvailable,
          { confirmed: totalAvailable, unconfirmed: 0 }
        )
      }

      // Phase 4: Security Analysis
      if (!params.skipSecurityChecks) {
        const securityReport = analyzeTransactionSecurity(
          selectionResult.selectedUtxos,
          outputs,
          selectionResult.totalFee,
          200, // Estimated size - could be calculated more accurately
          wallet
        )

        if (!securityReport.isSecure) {
          throw createSecurityError('AMOUNT_TOO_LARGE', {
            requiredAmount   : params.amountSat,
            maxAllowedAmount : 100000000 // 1 BTC
          })
        }

        const confirmation = requiresAdditionalConfirmation(
          outputs,
          selectionResult.totalFee,
          wallet
        )

        if (confirmation.required) {
          setResult(prev => ({
            ...prev,
            requiresConfirmation : true,
            confirmationReasons  : confirmation.reasons,
            securityWarnings     : securityReport.warnings
          }))
          return transactionId // Pause for user confirmation
        }
      }

      // Phase 5: Transaction Building
      trackProgress('building_transaction')
      
      const { psbt, feeDetails } = buildTransaction({
        inputs  : selectionResult.selectedUtxos,
        outputs,
        feeRate : params.feeRate,
        changeAddress,
        network : bitcoinjsNetwork
      })

      console.log('Transaction built with fee details:', feeDetails)

      // Phase 6: Transaction Verification
      const verification = verifyTransaction(
        psbt,
        selectionResult.selectedUtxos,
        outputs,
        selectionResult.totalFee * 1.5 // 50% tolerance
      )

      if (!verification.inputsValid || !verification.outputsValid || !verification.feeReasonable) {
        throw createTransactionError('TRANSACTION_BUILD_FAILED', 'build')
      }

      // Phase 7: Transaction Signing
      trackProgress('signing_transaction')
      
      const signedTxHex = await signTransaction({ psbt, mnemonic, network: bitcoinjsNetwork })

      // Phase 8: Broadcasting
      trackProgress('broadcasting')
      
      const txid = await broadcastTx(signedTxHex)
      trackTxid(txid)

      // Phase 9: Completion
      trackProgress('completed')
      
      setResult(prev => ({
        ...prev,
        transactionId : txid,
        isLoading     : false
      }))

      // Navigate to success screen
      resetSendStore()
      router.replace({
        pathname : '/send/success',
        params   : { transactionId: txid }
      } as any)

      return txid

    } catch (error) {
      console.error('Transaction processing failed:', error)
      
      let sendError: SendBTCError
      
      if (error && typeof error === 'object' && 'code' in error) {
        sendError = error as SendBTCError
      } else if (error instanceof Error) {
        sendError = createNetworkError('NETWORK_TIMEOUT')
      } else {
        sendError = createTransactionError('TRANSACTION_BUILD_FAILED', 'build')
      }

      trackError(new Error(sendError.message))
      
      setResult(prev => ({
        ...prev,
        error     : sendError,
        canRetry  : shouldShowRetryButton(sendError),
        isLoading : false
      }))

      // Navigate to error screen
      router.replace('/send/error' as any)
      
      throw sendError
    } finally {
      isProcessingRef.current = false
    }
  }, [ wallet, router, resetSendStore ])

  const retry = useCallback(async () => {
    if (!lastParamsRef.current) {
      throw new Error('No previous transaction to retry')
    }
    
    await processTransaction(lastParamsRef.current)
  }, [ processTransaction ])

  const cancel = useCallback(() => {
    resetTransactionTracking()
    isProcessingRef.current = false
    setResult({
      isLoading            : false,
      progress             : 0,
      currentStage         : '',
      error                : null,
      canRetry             : false,
      securityWarnings     : [],
      requiresConfirmation : false,
      confirmationReasons  : []
    })
  }, [])

  const confirmAndProceed = useCallback(async (): Promise<string> => {
    if (!lastParamsRef.current) {
      throw new Error('No transaction awaiting confirmation')
    }

    // Continue with security checks bypassed
    return processTransaction({
      ...lastParamsRef.current,
      skipSecurityChecks : true
    })
  }, [ processTransaction ])

  return {
    processTransaction,
    result,
    retry,
    cancel,
    confirmAndProceed
  }
} 