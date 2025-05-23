/**
 * Transaction Security Service
 * Provides security validations, transaction verification, and risk assessment
 */

import { Psbt } from 'bitcoinjs-lib'
import { validateAddressForCurrentNetwork, isOwnAddress } from './addressValidationService'
import type { NormalizedUTXO, TransactionOutput } from '../../types/tx.types'
import type { BitcoinWallet } from './wallet/bitcoinWalletService'

export interface SecurityCheck {
  type: string
  passed: boolean
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  details?: Record<string, any>
}

export interface TransactionSecurityReport {
  isSecure: boolean
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  checks: SecurityCheck[]
  recommendations: string[]
  warnings: string[]
  blockers: string[]
}

export interface TransactionVerification {
  inputsValid: boolean
  outputsValid: boolean
  amountsValid: boolean
  feeReasonable: boolean
  totalInputValue: number
  totalOutputValue: number
  calculatedFee: number
  effectiveFeeRate: number
}

// Security thresholds (configurable)
const SECURITY_THRESHOLDS = {
  maxTransactionAmount   : 100000000, // 1 BTC in sats
  maxFeeRate             : 1000,                // 1000 sat/vB
  maxFeePercentage       : 50,             // 50% of transaction amount
  dustThreshold          : 546,               // Standard dust limit
  maxInputCount          : 100,               // Reasonable UTXO limit
  maxOutputCount         : 100,              // Reasonable output limit
  warningAmountThreshold : 10000000  // 0.1 BTC warning threshold
}

/**
 * Performs comprehensive security analysis of a transaction before signing
 */
export function analyzeTransactionSecurity(
  inputs: NormalizedUTXO[],
  outputs: TransactionOutput[],
  calculatedFee: number,
  estimatedSize: number,
  wallet: BitcoinWallet
): TransactionSecurityReport {
  const checks: SecurityCheck[] = []
  const recommendations: string[] = []
  const warnings: string[] = []
  const blockers: string[] = []

  // Input validation checks
  checks.push(...validateInputs(inputs))
  
  // Output validation checks  
  checks.push(...validateOutputs(outputs, wallet))
  
  // Amount and fee validation
  checks.push(...validateAmountsAndFees(inputs, outputs, calculatedFee, estimatedSize))
  
  // Privacy and security checks
  checks.push(...performPrivacyChecks(inputs, outputs, wallet))
  
  // Risk assessment checks
  checks.push(...assessTransactionRisks(inputs, outputs, calculatedFee))

  // Categorize results
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  let isSecure = true

  checks.forEach(check => {
    if (!check.passed) {
      if (check.severity === 'critical') {
        blockers.push(check.message)
        riskLevel = 'critical'
        isSecure = false
      } else if (check.severity === 'error') {
        blockers.push(check.message)
        if (riskLevel !== 'critical') riskLevel = 'high'
        isSecure = false
      } else if (check.severity === 'warning') {
        warnings.push(check.message)
        if (riskLevel === 'low') riskLevel = 'medium'
      }
    }
  })

  // Generate recommendations
  if (calculatedFee > getTotalOutputValue(outputs) * 0.1) {
    recommendations.push('Consider using a lower fee rate to reduce transaction cost')
  }
  
  if (inputs.length > 20) {
    recommendations.push('Consider consolidating UTXOs in a separate transaction to reduce fees')
  }

  return {
    isSecure,
    riskLevel,
    checks,
    recommendations,
    warnings,
    blockers
  }
}

/**
 * Verifies a built transaction against expected parameters
 */
export function verifyTransaction(
  psbt: Psbt,
  expectedInputs: NormalizedUTXO[],
  expectedOutputs: TransactionOutput[],
  maxAllowedFee: number
): TransactionVerification {
  try {
    const tx = psbt.extractTransaction()
    
    // Verify input count and values
    const inputsValid = tx.ins.length === expectedInputs.length
    const totalInputValue = expectedInputs.reduce((sum, utxo) => sum + utxo.value, 0)
    
    // Verify output count and values  
    const outputsValid = tx.outs.length <= expectedOutputs.length + 1 // +1 for potential change
    const totalOutputValue = tx.outs.reduce((sum, out) => sum + out.value, 0)
    
    // Calculate and verify fee
    const calculatedFee = totalInputValue - totalOutputValue
    const feeReasonable = calculatedFee > 0 && calculatedFee <= maxAllowedFee
    
    // Verify amounts match expectations
    const expectedTotal = getTotalOutputValue(expectedOutputs)
    const amountsValid = totalOutputValue >= expectedTotal && totalOutputValue <= totalInputValue
    
    // Calculate effective fee rate
    const effectiveFeeRate = calculatedFee / tx.virtualSize()

    return {
      inputsValid,
      outputsValid,
      amountsValid,
      feeReasonable,
      totalInputValue,
      totalOutputValue,
      calculatedFee,
      effectiveFeeRate
    }
    
  } catch (error) {
    console.error('Transaction verification failed:', error)
    return {
      inputsValid      : false,
      outputsValid     : false,
      amountsValid     : false,
      feeReasonable    : false,
      totalInputValue  : 0,
      totalOutputValue : 0,
      calculatedFee    : 0,
      effectiveFeeRate : 0
    }
  }
}

/**
 * Checks if transaction requires additional user confirmation based on risk factors
 */
export function requiresAdditionalConfirmation(
  outputs: TransactionOutput[],
  calculatedFee: number,
  wallet: BitcoinWallet
): {
  required: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  
  const totalAmount = getTotalOutputValue(outputs)
  
  // Large amount confirmation
  if (totalAmount > SECURITY_THRESHOLDS.warningAmountThreshold) {
    reasons.push(`Large transaction amount: ${totalAmount.toLocaleString()} sats`)
  }
  
  // High fee confirmation
  if (calculatedFee > totalAmount * 0.1) {
    reasons.push(`High transaction fee: ${calculatedFee.toLocaleString()} sats (${((calculatedFee/totalAmount)*100).toFixed(1)}% of amount)`)
  }
  
  // External address confirmation
  outputs.forEach((output, index) => {
    if (!isOwnAddress(output.address, wallet.addresses)) {
      const validation = validateAddressForCurrentNetwork(output.address)
      if (validation.isValid && validation.addressType === 'legacy') {
        reasons.push(`Output ${index + 1} uses legacy address format (higher fees)`)
      }
    }
  })

  return {
    required : reasons.length > 0,
    reasons
  }
}

// Helper validation functions
function validateInputs(inputs: NormalizedUTXO[]): SecurityCheck[] {
  const checks: SecurityCheck[] = []
  
  // Check input count
  checks.push({
    type     : 'input_count',
    passed   : inputs.length <= SECURITY_THRESHOLDS.maxInputCount,
    severity : inputs.length > SECURITY_THRESHOLDS.maxInputCount ? 'warning' : 'info',
    message  : inputs.length > SECURITY_THRESHOLDS.maxInputCount 
      ? `High input count (${inputs.length}) may result in high fees`
      : `Input count acceptable (${inputs.length})`,
    details : { inputCount: inputs.length }
  })
  
  // Check for dust inputs
  const dustInputs = inputs.filter(input => input.value <= SECURITY_THRESHOLDS.dustThreshold)
  checks.push({
    type     : 'dust_inputs',
    passed   : dustInputs.length === 0,
    severity : dustInputs.length > 0 ? 'warning' : 'info',
    message  : dustInputs.length > 0 
      ? `${dustInputs.length} dust inputs detected (may increase fees)`
      : 'No dust inputs detected',
    details : { dustInputCount: dustInputs.length }
  })
  
  return checks
}

function validateOutputs(outputs: TransactionOutput[], wallet: BitcoinWallet): SecurityCheck[] {
  const checks: SecurityCheck[] = []
  
  // Check output count
  checks.push({
    type     : 'output_count',
    passed   : outputs.length <= SECURITY_THRESHOLDS.maxOutputCount,
    severity : outputs.length > SECURITY_THRESHOLDS.maxOutputCount ? 'error' : 'info',
    message  : outputs.length > SECURITY_THRESHOLDS.maxOutputCount
      ? `Too many outputs (${outputs.length})`
      : `Output count acceptable (${outputs.length})`,
    details : { outputCount: outputs.length }
  })
  
  // Validate each output address
  outputs.forEach((output, index) => {
    const validation = validateAddressForCurrentNetwork(output.address)
    checks.push({
      type     : `output_${index}_address`,
      passed   : validation.isValid,
      severity : validation.isValid ? 'info' : 'error',
      message  : validation.isValid 
        ? `Output ${index + 1} address valid (${validation.addressType})`
        : `Output ${index + 1} address invalid: ${validation.error}`,
      details : { outputIndex: index, address: output.address, validation }
    })
    
    // Check for dust outputs
    checks.push({
      type     : `output_${index}_dust`,
      passed   : output.value > SECURITY_THRESHOLDS.dustThreshold,
      severity : output.value <= SECURITY_THRESHOLDS.dustThreshold ? 'error' : 'info',
      message  : output.value <= SECURITY_THRESHOLDS.dustThreshold
        ? `Output ${index + 1} is dust (${output.value} sats)`
        : `Output ${index + 1} amount acceptable (${output.value} sats)`,
      details : { outputIndex: index, amount: output.value }
    })
  })
  
  return checks
}

function validateAmountsAndFees(
  inputs: NormalizedUTXO[],
  outputs: TransactionOutput[],
  calculatedFee: number,
  estimatedSize: number
): SecurityCheck[] {
  const checks: SecurityCheck[] = []
  
  const totalInputValue = inputs.reduce((sum, input) => sum + input.value, 0)
  const totalOutputValue = getTotalOutputValue(outputs)
  const effectiveFeeRate = calculatedFee / estimatedSize
  
  // Check fee reasonableness
  checks.push({
    type     : 'fee_rate',
    passed   : effectiveFeeRate <= SECURITY_THRESHOLDS.maxFeeRate,
    severity : effectiveFeeRate > SECURITY_THRESHOLDS.maxFeeRate ? 'warning' : 'info',
    message  : effectiveFeeRate > SECURITY_THRESHOLDS.maxFeeRate
      ? `Very high fee rate: ${effectiveFeeRate.toFixed(1)} sat/vB`
      : `Fee rate acceptable: ${effectiveFeeRate.toFixed(1)} sat/vB`,
    details : { feeRate: effectiveFeeRate, fee: calculatedFee }
  })
  
  // Check fee as percentage of transaction
  const feePercentage = (calculatedFee / totalOutputValue) * 100
  checks.push({
    type     : 'fee_percentage',
    passed   : feePercentage <= SECURITY_THRESHOLDS.maxFeePercentage,
    severity : feePercentage > SECURITY_THRESHOLDS.maxFeePercentage ? 'warning' : 'info',
    message  : feePercentage > SECURITY_THRESHOLDS.maxFeePercentage
      ? `High fee relative to amount: ${feePercentage.toFixed(1)}%`
      : `Fee percentage acceptable: ${feePercentage.toFixed(1)}%`,
    details : { feePercentage, fee: calculatedFee, amount: totalOutputValue }
  })
  
  return checks
}

function performPrivacyChecks(
  inputs: NormalizedUTXO[],
  outputs: TransactionOutput[],
  wallet: BitcoinWallet
): SecurityCheck[] {
  const checks: SecurityCheck[] = []
  
  // Check address reuse
  const addressTypes = new Set(inputs.map(input => input.addressType))
  checks.push({
    type     : 'address_type_mixing',
    passed   : addressTypes.size === 1,
    severity : addressTypes.size > 1 ? 'info' : 'info',
    message  : addressTypes.size > 1
      ? `Mixed address types detected (may reduce privacy)`
      : 'Consistent address types used',
    details : { addressTypes: Array.from(addressTypes) }
  })
  
  return checks
}

function assessTransactionRisks(
  inputs: NormalizedUTXO[],
  outputs: TransactionOutput[],
  calculatedFee: number
): SecurityCheck[] {
  const checks: SecurityCheck[] = []
  
  const totalAmount = getTotalOutputValue(outputs)
  
  // Large transaction warning
  checks.push({
    type     : 'large_transaction',
    passed   : totalAmount <= SECURITY_THRESHOLDS.maxTransactionAmount,
    severity : totalAmount > SECURITY_THRESHOLDS.maxTransactionAmount ? 'warning' : 'info',
    message  : totalAmount > SECURITY_THRESHOLDS.maxTransactionAmount
      ? `Large transaction amount: ${totalAmount.toLocaleString()} sats`
      : `Transaction amount acceptable: ${totalAmount.toLocaleString()} sats`,
    details : { amount: totalAmount }
  })
  
  return checks
}

function getTotalOutputValue(outputs: TransactionOutput[]): number {
  return outputs.reduce((sum, output) => sum + output.value, 0)
} 