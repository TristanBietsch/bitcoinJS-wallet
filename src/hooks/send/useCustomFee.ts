import { useState, useCallback } from 'react'
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

  const handleNumberPress = useCallback((num: string) => {
    if (num === '⌫') {
      setCustomFee(prev => ({
        ...prev,
        totalSats : Math.floor(prev.totalSats / 10)
      }))
      return
    }

    setCustomFee(prev => {
      const newValue = prev.totalSats.toString() + num
      const totalSats = parseInt(newValue)
      const feeRate = transactionFees.calculateRateFromTime(totalSats)
      return {
        totalSats,
        feeRate,
        confirmationTime : transactionFees.estimateConfirmationTime(feeRate)
      }
    })
  }, [])

  const handleCloseCustomFeeModal = useCallback(() => {
    setShowCustomFeeModal(false)
  }, [])

  const handleConfirmCustomFee = useCallback(() => {
    setShowCustomFeeModal(false)
  }, [])

  const resetCustomFee = useCallback(() => {
    setCustomFee(DEFAULT_CUSTOM_FEE)
    setShowCustomFeeModal(false)
  }, [])

  return {
    customFee,
    showCustomFeeModal,
    setCustomFee,
    setShowCustomFeeModal,
    handleNumberPress,
    handleCloseCustomFeeModal,
    handleConfirmCustomFee,
    resetCustomFee
  }
} 