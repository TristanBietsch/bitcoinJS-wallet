/**
 * Enhanced Error Types for Send BTC Functionality
 * Provides granular error classification with user-friendly messaging and recovery suggestions
 */

export interface BaseError {
  code: string
  message: string
  userMessage: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  recoverable: boolean
  retryable: boolean
  context?: Record<string, any>
  timestamp: number
}

// Insufficient Funds Errors
export interface InsufficientFundsError extends BaseError {
  code: 'INSUFFICIENT_FUNDS'
  details: {
    requiredAmount: number
    availableAmount: number
    shortfall: number
    includesUnconfirmed: boolean
    confirmedBalance: number
    unconfirmedBalance: number
  }
}

// Address Validation Errors
export interface AddressValidationError extends BaseError {
  code: 'INVALID_ADDRESS' | 'WRONG_NETWORK' | 'OWN_ADDRESS'
  details: {
    address: string
    expectedNetwork?: string
    actualNetwork?: string
    addressType?: string
  }
}

// Fee Estimation Errors
export interface FeeEstimationError extends BaseError {
  code: 'FEE_ESTIMATION_FAILED' | 'FEE_TOO_HIGH' | 'FEE_TOO_LOW'
  details: {
    requestedFeeRate?: number
    suggestedFeeRate?: number
    networkFeeRates?: {
      economy: number
      normal: number
      fast: number
    }
  }
}

// Network Connectivity Errors
export interface NetworkError extends BaseError {
  code: 'NETWORK_TIMEOUT' | 'API_UNAVAILABLE' | 'BROADCAST_FAILED'
  details: {
    endpoint?: string
    httpStatus?: number
    retryCount?: number
    maxRetries?: number
  }
}

// Transaction Building Errors
export interface TransactionError extends BaseError {
  code: 'UTXO_SELECTION_FAILED' | 'TRANSACTION_BUILD_FAILED' | 'SIGNING_FAILED'
  details: {
    stage: 'utxo_fetch' | 'utxo_select' | 'build' | 'sign' | 'broadcast'
    utxoCount?: number
    inputCount?: number
    estimatedSize?: number
  }
}

// Security & Validation Errors
export interface SecurityError extends BaseError {
  code: 'MNEMONIC_UNAVAILABLE' | 'WALLET_LOCKED' | 'AMOUNT_TOO_LARGE'
  details: {
    requiredAmount?: number
    maxAllowedAmount?: number
    walletStatus?: string
  }
}

// Union type for all Send BTC errors
export type SendBTCError = 
  | InsufficientFundsError 
  | AddressValidationError 
  | FeeEstimationError 
  | NetworkError 
  | TransactionError 
  | SecurityError

// Error factory functions
export function createInsufficientFundsError(
  requiredAmount: number,
  availableAmount: number,
  balances: { confirmed: number; unconfirmed: number }
): InsufficientFundsError {
  const shortfall = requiredAmount - availableAmount
  
  return {
    code        : 'INSUFFICIENT_FUNDS',
    message     : `Insufficient funds: need ${requiredAmount} sats, have ${availableAmount} sats`,
    userMessage : `Insufficient funds. You need ${shortfall.toLocaleString()} more sats to complete this transaction.`,
    severity    : 'error',
    recoverable : true,
    retryable   : false,
    timestamp   : Date.now(),
    details     : {
      requiredAmount,
      availableAmount,
      shortfall,
      includesUnconfirmed : balances.unconfirmed > 0,
      confirmedBalance    : balances.confirmed,
      unconfirmedBalance  : balances.unconfirmed
    }
  }
}

export function createAddressValidationError(
  address: string,
  type: 'INVALID_ADDRESS' | 'WRONG_NETWORK' | 'OWN_ADDRESS',
  context?: { expectedNetwork?: string; actualNetwork?: string }
): AddressValidationError {
  const messages = {
    INVALID_ADDRESS : {
      message     : `Invalid Bitcoin address format: ${address}`,
      userMessage : 'Please enter a valid Bitcoin address.'
    },
    WRONG_NETWORK : {
      message     : `Address is for ${context?.actualNetwork} but expected ${context?.expectedNetwork}`,
      userMessage : `This address is for ${context?.actualNetwork}. Please use a ${context?.expectedNetwork} address.`
    },
    OWN_ADDRESS : {
      message     : `Cannot send to own address: ${address}`,
      userMessage : 'You cannot send Bitcoin to your own address. Please use a different recipient address.'
    }
  }

  return {
    code        : type,
    message     : messages[type].message,
    userMessage : messages[type].userMessage,
    severity    : 'error',
    recoverable : true,
    retryable   : false,
    timestamp   : Date.now(),
    details     : {
      address,
      expectedNetwork : context?.expectedNetwork,
      actualNetwork   : context?.actualNetwork
    }
  }
}

export function createFeeEstimationError(
  type: 'FEE_ESTIMATION_FAILED' | 'FEE_TOO_HIGH' | 'FEE_TOO_LOW',
  context?: { 
    requestedFeeRate?: number
    suggestedFeeRate?: number
    networkFeeRates?: { economy: number; normal: number; fast: number }
  }
): FeeEstimationError {
  const messages = {
    FEE_ESTIMATION_FAILED : {
      message     : 'Failed to estimate transaction fee',
      userMessage : 'Unable to calculate transaction fee. Please try again.'
    },
    FEE_TOO_HIGH : {
      message     : `Fee rate ${context?.requestedFeeRate} sat/vB is unusually high`,
      userMessage : `The fee rate you selected (${context?.requestedFeeRate} sat/vB) is very high. Consider using ${context?.suggestedFeeRate} sat/vB instead.`
    },
    FEE_TOO_LOW : {
      message     : `Fee rate ${context?.requestedFeeRate} sat/vB may be too low`,
      userMessage : `The fee rate you selected (${context?.requestedFeeRate} sat/vB) may result in slow confirmation. Consider using at least ${context?.suggestedFeeRate} sat/vB.`
    }
  }

  return {
    code        : type,
    message     : messages[type].message,
    userMessage : messages[type].userMessage,
    severity    : type === 'FEE_ESTIMATION_FAILED' ? 'error' : 'warning',
    recoverable : true,
    retryable   : type === 'FEE_ESTIMATION_FAILED',
    timestamp   : Date.now(),
    details     : {
      requestedFeeRate : context?.requestedFeeRate,
      suggestedFeeRate : context?.suggestedFeeRate,
      networkFeeRates  : context?.networkFeeRates
    }
  }
}

export function createNetworkError(
  type: 'NETWORK_TIMEOUT' | 'API_UNAVAILABLE' | 'BROADCAST_FAILED',
  context?: { endpoint?: string; httpStatus?: number; retryCount?: number }
): NetworkError {
  const messages = {
    NETWORK_TIMEOUT : {
      message     : `Network request timed out for ${context?.endpoint}`,
      userMessage : 'Network request timed out. Please check your connection and try again.'
    },
    API_UNAVAILABLE : {
      message     : `API service unavailable: ${context?.endpoint} (HTTP ${context?.httpStatus})`,
      userMessage : 'Bitcoin network service is temporarily unavailable. Please try again in a few moments.'
    },
    BROADCAST_FAILED : {
      message     : 'Failed to broadcast transaction to network',
      userMessage : 'Failed to submit transaction to the Bitcoin network. Please try again.'
    }
  }

  return {
    code        : type,
    message     : messages[type].message,
    userMessage : messages[type].userMessage,
    severity    : 'error',
    recoverable : true,
    retryable   : true,
    timestamp   : Date.now(),
    details     : {
      endpoint   : context?.endpoint,
      httpStatus : context?.httpStatus,
      retryCount : context?.retryCount || 0,
      maxRetries : 3
    }
  }
}

export function createTransactionError(
  type: 'UTXO_SELECTION_FAILED' | 'TRANSACTION_BUILD_FAILED' | 'SIGNING_FAILED',
  stage: 'utxo_fetch' | 'utxo_select' | 'build' | 'sign' | 'broadcast',
  context?: { utxoCount?: number; inputCount?: number; estimatedSize?: number }
): TransactionError {
  const messages = {
    UTXO_SELECTION_FAILED : {
      message     : `Failed to select suitable UTXOs for transaction`,
      userMessage : 'Unable to prepare transaction with available funds. This may be due to dust or unconfirmed transactions.'
    },
    TRANSACTION_BUILD_FAILED : {
      message     : `Failed to build transaction at stage: ${stage}`,
      userMessage : 'Failed to prepare your transaction. Please try again.'
    },
    SIGNING_FAILED : {
      message     : 'Failed to sign transaction',
      userMessage : 'Failed to sign your transaction. Please ensure your wallet is unlocked and try again.'
    }
  }

  return {
    code        : type,
    message     : messages[type].message,
    userMessage : messages[type].userMessage,
    severity    : 'error',
    recoverable : type !== 'SIGNING_FAILED',
    retryable   : type === 'TRANSACTION_BUILD_FAILED',
    timestamp   : Date.now(),
    details     : {
      stage,
      utxoCount     : context?.utxoCount,
      inputCount    : context?.inputCount,
      estimatedSize : context?.estimatedSize
    }
  }
}

export function createSecurityError(
  type: 'MNEMONIC_UNAVAILABLE' | 'WALLET_LOCKED' | 'AMOUNT_TOO_LARGE',
  context?: { requiredAmount?: number; maxAllowedAmount?: number }
): SecurityError {
  const messages = {
    MNEMONIC_UNAVAILABLE : {
      message     : 'Wallet mnemonic not available for signing',
      userMessage : 'Unable to access wallet credentials. Please ensure your wallet is properly set up.'
    },
    WALLET_LOCKED : {
      message     : 'Wallet is locked and requires authentication',
      userMessage : 'Your wallet is locked. Please unlock it to continue.'
    },
    AMOUNT_TOO_LARGE : {
      message     : `Amount ${context?.requiredAmount} exceeds security limit ${context?.maxAllowedAmount}`,
      userMessage : `Transaction amount is very large (${context?.requiredAmount?.toLocaleString()} sats). Please verify this is intentional.`
    }
  }

  return {
    code        : type,
    message     : messages[type].message,
    userMessage : messages[type].userMessage,
    severity    : type === 'AMOUNT_TOO_LARGE' ? 'warning' : 'error',
    recoverable : true,
    retryable   : false,
    timestamp   : Date.now(),
    details     : {
      requiredAmount   : context?.requiredAmount,
      maxAllowedAmount : context?.maxAllowedAmount,
      walletStatus     : type === 'WALLET_LOCKED' ? 'locked' : 'unknown'
    }
  }
}

// Error utility functions
export function isRetryable(error: SendBTCError): boolean {
  return error.retryable
}

export function isRecoverable(error: SendBTCError): boolean {
  return error.recoverable
}

export function getErrorSeverity(error: SendBTCError): 'info' | 'warning' | 'error' | 'critical' {
  return error.severity
}

export function formatErrorForUser(error: SendBTCError): string {
  return error.userMessage
}

export function shouldShowRetryButton(error: SendBTCError): boolean {
  return error.retryable && error.severity !== 'critical'
} 