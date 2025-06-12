/**
 * Transaction Validation Utilities
 * Provides comprehensive pre-flight validation for Bitcoin transactions
 * Integrates with existing services for complete validation coverage
 */

import type { NormalizedUTXO, TransactionOutput } from '../../types/tx.types'
import type { SendBTCError } from '../../types/errors.types'
import type { BitcoinWallet } from '../../services/bitcoin/wallet/bitcoinWalletService'
import { 
  analyzeTransactionSecurity, 
  requiresAdditionalConfirmation,
  type TransactionSecurityReport
} from '../../services/bitcoin/transactionSecurityService'
import { validateAddressForCurrentNetwork } from '../../services/bitcoin/addressValidationService'
import { validateCustomFeeRate, getEnhancedFeeEstimates } from '../../services/bitcoin/feeEstimationService'
import {
  createInsufficientFundsError,
  createAddressValidationError,
  createTransactionError,
  createFeeEstimationError
} from '../../types/errors.types'

export interface TransactionValidationResult {
  isValid: boolean
  errors: SendBTCError[]
  warnings: string[]
  securityReport: TransactionSecurityReport
  requiresConfirmation: boolean
  confirmationReasons: string[]
  estimatedTime: string
  recommendations: string[]
}

export interface ValidationContext {
  wallet: BitcoinWallet
  availableBalance: number
  networkFeeRates?: {
    economy: number
    slow: number
    normal: number
    fast: number
  }
}

/**
 * Performs comprehensive validation of a transaction before execution
 */
export async function validateTransactionForExecution(
  inputs: NormalizedUTXO[],
  outputs: TransactionOutput[],
  feeRate: number,
  estimatedFee: number,
  estimatedSize: number,
  context: ValidationContext
): Promise<TransactionValidationResult> {
  const errors: SendBTCError[] = []
  const warnings: string[] = []
  const recommendations: string[] = []

  // 1. Basic input validation
  const inputValidation = validateBasicInputs(inputs, outputs, feeRate, context.availableBalance)
  errors.push(...inputValidation.errors)
  warnings.push(...inputValidation.warnings)

  // 2. Address validation
  const addressValidation = await validateAllAddresses(outputs)
  errors.push(...addressValidation.errors)
  warnings.push(...addressValidation.warnings)

  // 3. Fee validation
  const feeValidation = await validateFeeSettings(feeRate, estimatedFee, outputs)
  errors.push(...feeValidation.errors)
  warnings.push(...feeValidation.warnings)
  recommendations.push(...feeValidation.recommendations)

  // 4. Security analysis
  const securityReport = analyzeTransactionSecurity(
    inputs,
    outputs,
    estimatedFee,
    estimatedSize,
    context.wallet
  )

  // Add security issues as errors/warnings
  securityReport.checks.forEach(check => {
    if (!check.passed) {
      if (check.severity === 'critical' || check.severity === 'error') {
        errors.push(createTransactionError('TRANSACTION_BUILD_FAILED', 'build'))
      } else if (check.severity === 'warning') {
        warnings.push(check.message)
      }
    }
  })

  // 5. Confirmation requirements
  const confirmationCheck = requiresAdditionalConfirmation(outputs, estimatedFee, context.wallet)

  // 6. Time estimation
  const estimatedTime = getTransactionTimeEstimate(feeRate, context.networkFeeRates)

  return {
    isValid              : errors.length === 0,
    errors,
    warnings,
    securityReport,
    requiresConfirmation : confirmationCheck.required,
    confirmationReasons  : confirmationCheck.reasons,
    estimatedTime,
    recommendations      : [ ...recommendations, ...securityReport.recommendations ]
  }
}

/**
 * Validates basic transaction inputs and structure
 */
function validateBasicInputs(
  inputs: NormalizedUTXO[],
  outputs: TransactionOutput[],
  feeRate: number,
  availableBalance: number
): { errors: SendBTCError[]; warnings: string[] } {
  const errors: SendBTCError[] = []
  const warnings: string[] = []

  // Check inputs exist
  if (!inputs || inputs.length === 0) {
    errors.push(createInsufficientFundsError(0, 0, { confirmed: 0, unconfirmed: 0 }))
    return { errors, warnings }
  }

  // Check outputs exist
  if (!outputs || outputs.length === 0) {
    errors.push(createTransactionError('TRANSACTION_BUILD_FAILED', 'build'))
    return { errors, warnings }
  }

  // Calculate values
  const totalInputValue = inputs.reduce((sum, input) => sum + input.value, 0)
  const totalOutputValue = outputs.reduce((sum, output) => sum + output.value, 0)

  // Check sufficient funds
  if (totalInputValue < totalOutputValue) {
    errors.push(createInsufficientFundsError(
      totalOutputValue,
      totalInputValue,
      { confirmed: availableBalance, unconfirmed: 0 }
    ))
  }

  // Check for dust outputs
  const dustThreshold = 546
  outputs.forEach((output, index) => {
    if (output.value <= dustThreshold) {
      // Create a specific error for this dust output
      const dustError = createTransactionError('TRANSACTION_BUILD_FAILED', 'build')
      dustError.message = `Output ${index + 1} value ${output.value} sats is below dust threshold (${dustThreshold} sats)`
      dustError.userMessage = `Transaction output ${index + 1} of ${output.value} sats is too small. Minimum amount is ${dustThreshold} sats.`
      errors.push(dustError)
    }
  })

  // Warn about many inputs (high fees)
  if (inputs.length > 20) {
    warnings.push(`Transaction uses ${inputs.length} inputs which may result in higher fees`)
  }

  return { errors, warnings }
}

/**
 * Validates all output addresses
 */
async function validateAllAddresses(
  outputs: TransactionOutput[]
): Promise<{ errors: SendBTCError[]; warnings: string[] }> {
  const errors: SendBTCError[] = []
  const warnings: string[] = []

  for (const [ index, output ] of outputs.entries()) {
    const validation = validateAddressForCurrentNetwork(output.address)
    
    if (!validation.isValid) {
      errors.push(createAddressValidationError(output.address, 'INVALID_ADDRESS'))
    } else {
      // Warn about legacy addresses (higher fees)
      if (validation.addressType === 'legacy') {
        warnings.push(`Output ${index + 1} uses legacy address (higher transaction fees)`)
      }
    }
  }

  return { errors, warnings }
}

/**
 * Validates fee settings and provides recommendations
 */
async function validateFeeSettings(
  feeRate: number,
  estimatedFee: number,
  outputs: TransactionOutput[]
): Promise<{ errors: SendBTCError[]; warnings: string[]; recommendations: string[] }> {
  const errors: SendBTCError[] = []
  const warnings: string[] = []
  const recommendations: string[] = []

  try {
    // Get current network fee rates
    const networkRates = await getEnhancedFeeEstimates()
    
    // Validate custom fee rate
    const feeValidation = validateCustomFeeRate(feeRate, networkRates)
    if (!feeValidation.isValid) {
      if (feeRate < 1) {
        errors.push(createFeeEstimationError('FEE_TOO_LOW', { 
          requestedFeeRate : feeRate, 
          suggestedFeeRate : networkRates.slow 
        }))
      } else if (feeRate > 1000) {
        warnings.push(`Fee rate is very high (${feeRate} sat/vB)`)
      }
    }

    // Check fee as percentage of transaction
    const totalAmount = outputs.reduce((sum, output) => sum + output.value, 0)
    const feePercentage = (estimatedFee / totalAmount) * 100

    if (feePercentage > 50) {
      warnings.push(`Fee (${estimatedFee} sats) is ${feePercentage.toFixed(1)}% of transaction amount`)
    } else if (feePercentage > 20) {
      warnings.push(`Fee is ${feePercentage.toFixed(1)}% of transaction amount`)
    }

    // Provide fee recommendations
    if (feeRate > networkRates.fast * 2) {
      recommendations.push(`Consider using a lower fee rate (current: ${feeRate}, fast: ${networkRates.fast} sat/vB)`)
    } else if (feeRate < networkRates.economy) {
      recommendations.push(`Consider using a higher fee rate for faster confirmation (minimum: ${networkRates.economy} sat/vB)`)
    }

  } catch (caughtError) {
    console.warn('Fee validation failed:', caughtError)
    warnings.push('Unable to validate fee against network rates')
  }

  return { errors, warnings, recommendations }
}

/**
 * Estimates transaction confirmation time based on fee rate
 */
function getTransactionTimeEstimate(
  feeRate: number,
  networkRates?: { economy: number; slow: number; normal: number; fast: number }
): string {
  if (!networkRates) {
    return 'Unknown (network data unavailable)'
  }

  if (feeRate >= networkRates.fast) {
    return '~10 minutes (next block)'
  } else if (feeRate >= networkRates.normal) {
    return '~30 minutes (2-3 blocks)'
  } else if (feeRate >= networkRates.slow) {
    return '~2 hours (6-12 blocks)'
  } else if (feeRate >= networkRates.economy) {
    return '~24 hours (144+ blocks)'
  } else {
    return 'May take several days (very low fee)'
  }
}

/**
 * Quick validation for real-time feedback during input
 */
export function validateTransactionInputs(
  recipientAddress: string,
  amount: number,
  availableBalance: number
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // Address validation
  if (!recipientAddress) {
    errors.push('Recipient address is required')
  } else {
    const addressValidation = validateAddressForCurrentNetwork(recipientAddress)
    if (!addressValidation.isValid) {
      errors.push(addressValidation.error || 'Invalid address')
    }
  }

  // Amount validation
  if (!amount || amount <= 0) {
    errors.push('Amount must be greater than 0')
  } else if (amount < 546) {
    errors.push('Amount too small (minimum 546 sats)')
  } else if (amount > availableBalance) {
    errors.push('Insufficient balance')
  } else if (amount > 100_000_000) {
    warnings.push('Large transaction amount (> 1 BTC)')
  }

  return {
    isValid : errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validates that UTXO selection covers the required amount plus fees
 */
export function validateUtxoSelection(
  selectedUtxos: NormalizedUTXO[],
  requiredAmount: number,
  estimatedFee: number
): { isValid: boolean; shortfall: number } {
  const totalSelected = selectedUtxos.reduce((sum, utxo) => sum + utxo.value, 0)
  const totalRequired = requiredAmount + estimatedFee
  const shortfall = Math.max(0, totalRequired - totalSelected)

  return {
    isValid : shortfall === 0,
    shortfall
  }
} 