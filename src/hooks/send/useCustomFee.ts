import { useState, useCallback, useEffect, useRef } from 'react'
import { CustomFee } from '@/src/types/domain/transaction'

// Set minimum fee to 150 sats
const MIN_FEE_SATS = 150

// Default transaction size for fee calculations (rough estimate)
// This should ideally be calculated based on actual UTXOs, but for now use a reasonable estimate
const DEFAULT_TX_SIZE_VBYTES = 200

const DEFAULT_CUSTOM_FEE: CustomFee = {
  totalSats        : 2000,
  confirmationTime : 60,
  feeRate          : 10  // sat/vB
}

/**
 * Calculate fee rate from total fee amount
 */
const calculateFeeRateFromSats = (totalSats: number): number => {
  return Math.ceil(totalSats / DEFAULT_TX_SIZE_VBYTES)
}



/**
 * Estimate confirmation time from fee rate (simplified model)
 */
const estimateConfirmationTime = (feeRate: number): number => {
  // Simplified estimation: higher fee rate = faster confirmation
  if (feeRate >= 20) return 10      // ~10 minutes
  if (feeRate >= 10) return 60      // ~1 hour  
  if (feeRate >= 5) return 360      // ~6 hours
  if (feeRate >= 2) return 720      // ~12 hours
  return 1440                       // ~24 hours
}

/**
 * Enhanced fee validation
 */
const validateFeeAmount = (totalSats: number, feeRate: number): string | null => {
  if (totalSats === 0) {
    return 'Fee cannot be zero'
  }
  
  if (totalSats < MIN_FEE_SATS) {
    return `Minimum fee is ${MIN_FEE_SATS} sats`
  }
  
  if (feeRate > 1000) {
    return 'Fee rate is exceptionally high (>1000 sat/vB)'
  }
  
  if (feeRate < 1) {
    return 'Fee rate too low (minimum 1 sat/vB)'
  }
  
  return null
}

export const useCustomFee = () => {
  const [ customFee, setCustomFee ] = useState<CustomFee>(DEFAULT_CUSTOM_FEE)
  const [ showCustomFeeModal, setShowCustomFeeModal ] = useState(false)
  const [ persistedFee, setPersistedFee ] = useState<CustomFee | null>(null)
  const [ pendingInput, setPendingInput ] = useState('')
  const [ feeError, setFeeError ] = useState<string | null>(null)
  
  // Track if we've initialized the input, so we don't override user edits
  const hasInitializedInput = useRef(false)

  // Validate the pending input
  const isInputValid = pendingInput !== '' && 
    !isNaN(parseInt(pendingInput)) && 
    parseInt(pendingInput) > 0 && // Must be greater than zero
    parseInt(pendingInput) >= MIN_FEE_SATS
    
  // Reset the input when opening the modal
  useEffect(() => {
    if (showCustomFeeModal && !hasInitializedInput.current) {
      // Initialize with current fee if we're editing
      const currentFee = persistedFee || customFee
      setPendingInput(currentFee.totalSats.toString())
      hasInitializedInput.current = true
      setFeeError(null)
    } else if (!showCustomFeeModal) {
      // Reset the initialization flag when modal closes
      hasInitializedInput.current = false
      setFeeError(null)
    }
  }, [ showCustomFeeModal, persistedFee, customFee ])

  // Handle number input
  const handleNumberPress = useCallback((num: string) => {
    // Use the functional form to ensure we're using the latest state
    setPendingInput((prev) => {
      let newValue = prev
      
      if (num === 'backspace') {
        // Handle backspace - remove the last character
        newValue = prev.slice(0, -1)
        console.log('Backspace pressed, new value:', newValue, 'old value:', prev)
      } else {
        // Handle number input
        newValue = prev + num
        console.log('Number pressed:', num, 'new value:', newValue)
      }
      
      // Handle empty input case
      if (!newValue || newValue === '') {
        setFeeError('Please enter a fee amount')
        return newValue
      }
      
      // Update the fee calculation if we have a valid number
      const totalSats = parseInt(newValue)
      if (!isNaN(totalSats)) {
        // Calculate fee rate from total sats
        const feeRate = calculateFeeRateFromSats(totalSats)
        
        // Set custom fee with calculated values
        setCustomFee({
          totalSats,
          feeRate,
          confirmationTime : estimateConfirmationTime(feeRate)
        })

        // Validate and show errors
        const validationError = validateFeeAmount(totalSats, feeRate)
        if (validationError) {
          setFeeError(validationError)
        } else {
          setFeeError(null)
        }
      } else {
        setFeeError('Invalid fee amount')
      }
      
      return newValue
    })
  }, [])

  // Close the modal without saving changes
  const handleCloseCustomFeeModal = useCallback(() => {
    setShowCustomFeeModal(false)
    setPendingInput('')
    setFeeError(null)
    
    // Revert to persisted fee if available
    if (persistedFee) {
      setCustomFee(persistedFee)
    }
  }, [ persistedFee ])

  // Confirm and save the custom fee
  const handleConfirmCustomFee = useCallback(() => {
    let finalFee = customFee
    
    // Validate fee amount
    if (!pendingInput || pendingInput === '') {
      setFeeError('Please enter a fee amount')
      return // Don't proceed if input is empty
    }
    
    const totalSats = parseInt(pendingInput)
    if (isNaN(totalSats)) {
      setFeeError('Invalid fee amount')
      return // Don't proceed if input is invalid
    }
    
    // Check for zero input first
    if (totalSats === 0) {
      setFeeError('Fee cannot be zero')
      return // Don't proceed if zero
    }
    
    // Then check for minimum fee
    if (totalSats < MIN_FEE_SATS) {
      setFeeError(`Minimum fee is ${MIN_FEE_SATS} sats`)
      return // Don't proceed if below minimum
    }
    
    // All validations passed, proceed with confirmation
    setPersistedFee(finalFee)
    setShowCustomFeeModal(false)
    setPendingInput('')
    setFeeError(null)
  }, [ customFee, pendingInput ])

  // Reset everything to default
  const resetCustomFee = useCallback(() => {
    setCustomFee(DEFAULT_CUSTOM_FEE)
    setPersistedFee(null)
    setShowCustomFeeModal(false)
    setPendingInput('')
    setFeeError(null)
  }, [])

  // Start editing the fee
  const startEditingFee = useCallback(() => {
    setPendingInput('') // Reset pending input first
    setShowCustomFeeModal(true)
    setFeeError(null)
    // Input will be initialized by the useEffect
  }, [])

  // Override setCustomFee to also set persistedFee when loading from store
  const setCustomFeeWithPersistence = useCallback((fee: CustomFee) => {
    setCustomFee(fee)
    setPersistedFee(fee)
  }, [])

  return {
    customFee       : persistedFee || customFee,
    showCustomFeeModal,
    setCustomFee    : setCustomFeeWithPersistence,
    setShowCustomFeeModal,
    handleNumberPress,
    handleCloseCustomFeeModal,
    handleConfirmCustomFee,
    resetCustomFee,
    hasPersistedFee : !!persistedFee,
    startEditingFee,
    pendingInput,
    feeError,
    isInputValid
  }
} 