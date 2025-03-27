import { useState, useCallback, useEffect, useRef } from 'react'
import { CustomFee } from '@/src/types/transaction/send.types'
import { transactionFees } from '@/tests/mockData/transactionData'

const DEFAULT_CUSTOM_FEE: CustomFee = {
  totalSats        : 2000,
  confirmationTime : 60,
  feeRate          : 5
}

export const useCustomFee = () => {
  const [ customFee, setCustomFee ] = useState<CustomFee>(DEFAULT_CUSTOM_FEE)
  const [ showCustomFeeModal, setShowCustomFeeModal ] = useState(false)
  const [ persistedFee, setPersistedFee ] = useState<CustomFee | null>(null)
  const [ pendingInput, setPendingInput ] = useState('')
  
  // Track if we've initialized the input, so we don't override user edits
  const hasInitializedInput = useRef(false)

  // Reset the input when opening the modal
  useEffect(() => {
    if (showCustomFeeModal && !hasInitializedInput.current) {
      // Initialize with current fee if we're editing
      const currentFee = persistedFee || customFee
      setPendingInput(currentFee.totalSats.toString())
      hasInitializedInput.current = true
    } else if (!showCustomFeeModal) {
      // Reset the initialization flag when modal closes
      hasInitializedInput.current = false
    }
  }, [ showCustomFeeModal, persistedFee, customFee ])

  // Handle number input
  const handleNumberPress = useCallback((num: string) => {
    // Use the functional form to ensure we're using the latest state
    setPendingInput((prev) => {
      let newValue = prev
      
      if (num === '⌫') {
        // Handle backspace - remove the last character
        newValue = prev.slice(0, -1)
        console.log('Backspace pressed, new value:', newValue, 'old value:', prev)
      } else {
        // Handle number input
        newValue = prev + num
        console.log('Number pressed:', num, 'new value:', newValue)
      }
      
      // Update the fee calculation if we have a valid number
      if (newValue && newValue !== '') {
        const totalSats = parseInt(newValue)
        if (!isNaN(totalSats)) {
          const feeRate = transactionFees.calculateRateFromTime(totalSats)
          setCustomFee({
            totalSats,
            feeRate,
            confirmationTime : transactionFees.estimateConfirmationTime(feeRate)
          })
        }
      }
      
      return newValue
    })
  }, [])

  // Close the modal without saving changes
  const handleCloseCustomFeeModal = useCallback(() => {
    setShowCustomFeeModal(false)
    setPendingInput('')
    
    // Revert to persisted fee if available
    if (persistedFee) {
      setCustomFee(persistedFee)
    }
  }, [ persistedFee ])

  // Confirm and save the custom fee
  const handleConfirmCustomFee = useCallback(() => {
    let finalFee = customFee
    
    // Handle empty input case - set to minimum fee
    if (!pendingInput || pendingInput === '') {
      const minTotalSats = 1000
      const feeRate = transactionFees.calculateRateFromTime(minTotalSats)
      finalFee = {
        totalSats        : minTotalSats,
        feeRate          : feeRate,
        confirmationTime : transactionFees.estimateConfirmationTime(feeRate)
      }
      setCustomFee(finalFee)
    }
    
    setPersistedFee(finalFee)
    setShowCustomFeeModal(false)
    setPendingInput('')
  }, [ customFee, pendingInput ])

  // Reset everything to default
  const resetCustomFee = useCallback(() => {
    setCustomFee(DEFAULT_CUSTOM_FEE)
    setPersistedFee(null)
    setShowCustomFeeModal(false)
    setPendingInput('')
  }, [])

  // Start editing the fee
  const startEditingFee = useCallback(() => {
    setPendingInput('') // Reset pending input first
    setShowCustomFeeModal(true)
    // Input will be initialized by the useEffect
  }, [])

  return {
    customFee       : persistedFee || customFee,
    showCustomFeeModal,
    setCustomFee,
    setShowCustomFeeModal,
    handleNumberPress,
    handleCloseCustomFeeModal,
    handleConfirmCustomFee,
    resetCustomFee,
    hasPersistedFee : !!persistedFee,
    startEditingFee,
    pendingInput
  }
} 