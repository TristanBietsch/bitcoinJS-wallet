/**
 * Transaction Parameter Conversion Utilities
 * Converts UI send state to Bitcoin transaction parameters
 */

import { CurrencyType } from '@/src/types/domain/finance'
import { useSendStore } from '@/src/store/sendStore'
import { useWalletStore } from '@/src/store/walletStore'

/**
 * Parameters required for Bitcoin transaction processing
 */
export interface BitcoinTransactionParams {
  recipientAddress: string
  amountSat: number
  feeRate: number
  changeAddress: string
}

/**
 * Convert UI state to Bitcoin transaction parameters
 * Updated to work with enhanced fee estimation system
 */
export function convertUIToBitcoinParams(): BitcoinTransactionParams {
  const sendState = useSendStore.getState()
  const walletState = useWalletStore.getState()
  
  // Get recipient address
  const recipientAddress = sendState.address
  if (!recipientAddress) {
    throw new Error('Recipient address is required')
  }
  
  // Convert amount to satoshis
  const amountSat = convertAmountToSatoshis(sendState.amount, sendState.currency)
  if (amountSat <= 0) {
    throw new Error('Amount must be greater than 0')
  }
  
  // Calculate fee rate using enhanced fee system
  const feeRate = calculateFeeRateFromStore(sendState)
  if (feeRate <= 0) {
    throw new Error('Fee rate must be greater than 0')
  }
  
  // Get change address from wallet
  const changeAddress = getChangeAddress(walletState.wallet)
  if (!changeAddress) {
    throw new Error('Change address not available')
  }
  
  return {
    recipientAddress,
    amountSat,
    feeRate,
    changeAddress
  }
}

/**
 * Calculate fee rate from enhanced store state
 */
function calculateFeeRateFromStore(sendState: any): number {
  // First priority: custom fee if speed is 'custom'
  if (sendState.speed === 'custom' && sendState.customFee) {
    return sendState.customFee.feeRate || 0
  }
  
  // Second priority: selected fee option from enhanced system
  if (sendState.selectedFeeOption) {
    return sendState.selectedFeeOption.satPerVbyte || 0
  }
  
  // Third priority: fee rates based on speed
  if (sendState.feeRates && sendState.speed) {
    switch (sendState.speed) {
      case 'economy':
        return sendState.feeRates.economy || 0
      case 'standard':
      case 'normal':
        return sendState.feeRates.standard || sendState.feeRates.normal || 0
      case 'priority':
      case 'fast':
        return sendState.feeRates.priority || sendState.feeRates.fast || 0
      default:
        return sendState.feeRates.standard || sendState.feeRates.normal || 0
    }
  }
  
  // Fallback based on speed setting
  switch (sendState.speed) {
    case 'economy':
      return 3 // Conservative economy rate
    case 'standard':
    case 'normal':
      return 10 // Standard rate
    case 'priority':
    case 'fast':
      return 20 // Fast rate
    default:
      console.warn('No fee rate found, using fallback of 10 sat/vbyte')
      return 10
  }
}

/**
 * Convert amount from UI currency to satoshis
 */
function convertAmountToSatoshis(amount: string, currency: CurrencyType): number {
  const numericAmount = parseFloat(amount)
  
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Invalid amount')
  }
  
  switch (currency) {
    case 'SATS':
      return Math.floor(numericAmount)
    case 'BTC':
      return Math.floor(numericAmount * 100_000_000) // Convert BTC to sats
    default:
      throw new Error(`Unsupported currency: ${currency}`)
  }
}

/**
 * Get change address from wallet
 */
function getChangeAddress(wallet: any): string | null {
  if (!wallet?.addresses?.nativeSegwit?.[0]) {
    return null
  }
  
  // Use the first native segwit address as change address
  // In a production wallet, you might want to derive a new change address
  return wallet.addresses.nativeSegwit[0]
}

/**
 * Validate transaction parameters before processing
 */
export function validateTransactionParams(params: BitcoinTransactionParams): void {
  if (!params.recipientAddress) {
    throw new Error('Recipient address is required')
  }
  
  if (params.amountSat <= 0) {
    throw new Error('Amount must be greater than 0')
  }
  
  if (params.feeRate <= 0) {
    throw new Error('Fee rate must be greater than 0')
  }
  
  if (!params.changeAddress) {
    throw new Error('Change address is required')
  }
  
  // Check for dust amount (546 sats minimum)
  const DUST_THRESHOLD = 546
  if (params.amountSat < DUST_THRESHOLD) {
    throw new Error(`Amount too small. Minimum amount is ${DUST_THRESHOLD} sats`)
  }
} 