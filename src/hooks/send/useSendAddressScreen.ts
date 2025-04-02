import React from 'react'
import { useRouter } from 'expo-router'
import { useSendStore } from '@/src/store/sendStore'
import { useAddressValidation } from '@/src/hooks/send/useAddressValidation'
import { useSpeedOptions } from '@/src/hooks/send/useSpeedOptions'
import { useCustomFee } from '@/src/hooks/send/useCustomFee'
import { SpeedTier } from '@/src/types/transaction/send.types'

export const useSendAddressScreen = () => {
  const router = useRouter()
  const { 
    address: storedAddress, 
    speed: storedSpeed, 
    customFee: storedCustomFee,
    setAddress: setStoreAddress, 
    setSpeed: setStoreSpeed, 
    setCustomFee: setStoreCustomFee,
    reset: resetStore
  } = useSendStore()
  
  const {
    address,
    addressError,
    handleAddressChange,
    checkClipboard,
    resetAddress
  } = useAddressValidation()

  const {
    speed,
    showSpeedInfoModal,
    speedOptions,
    handleSpeedChange: handleSpeedChangeBase,
    handleSpeedInfoPress,
    handleCloseSpeedInfoModal,
    resetSpeed
  } = useSpeedOptions()

  const {
    customFee,
    showCustomFeeModal,
    setCustomFee,
    setShowCustomFeeModal,
    handleNumberPress,
    handleCloseCustomFeeModal,
    handleConfirmCustomFee,
    resetCustomFee,
    hasPersistedFee,
    startEditingFee,
    pendingInput,
    feeError,
    isInputValid
  } = useCustomFee()

  // Load data from store when screen is focused
  React.useEffect(() => {
    // First check if we have data in the store
    if (storedAddress) {
      // If we have an address in the store, use it and don't check clipboard
      handleAddressChange(storedAddress)
    } else {
      // Only check clipboard if we don't have an address yet
      checkClipboard()
    }
    
    // Handle custom fee first since it should override speed
    if (storedCustomFee) {
      setCustomFee(storedCustomFee)
      handleSpeedChangeBase('custom')
    } else if (storedSpeed) {
      handleSpeedChangeBase(storedSpeed as SpeedTier)
    }
  }, [ storedAddress, storedSpeed, storedCustomFee ])

  const handleQRScan = () => {
    router.push({
      pathname : '/send/camera' as any
    })
  }

  const handleBackPress = () => {
    resetAddress()
    resetSpeed()
    resetCustomFee()
    resetStore() // Reset store when explicitly going back to home
    router.back()
  }

  const handleNextPress = () => {
    if (!address || addressError) return
    
    setStoreAddress(address)
    setStoreSpeed(speed)
    if (speed === 'custom') {
      setStoreCustomFee(customFee)
    }
    
    router.push({
      pathname : '/send/amount' as any,
      params   : {
        address,
        speed
      }
    })
  }

  const handleSpeedChange = (newSpeed: SpeedTier) => {
    if (newSpeed === 'custom') {
      setShowCustomFeeModal(true)
      return
    }
    // Clear custom fee when switching to a standard speed tier
    setStoreCustomFee(undefined)
    handleSpeedChangeBase(newSpeed)
  }

  const handleCustomFeeButtonConfirm = () => {
    // Once custom fee is confirmed, set speed to 'custom'
    handleSpeedChangeBase('custom')
  }
  
  const handleCustomFeePress = () => {
    startEditingFee()
  }

  return {
    // State
    address,
    addressError,
    speed,
    showSpeedInfoModal,
    speedOptions,
    customFee,
    showCustomFeeModal,
    hasPersistedFee,
    pendingInput,
    feeError,
    isInputValid,
    
    // Handlers
    handleAddressChange,
    handleQRScan,
    handleBackPress,
    handleNextPress,
    handleSpeedChange,
    handleSpeedInfoPress,
    handleCloseSpeedInfoModal,
    handleCustomFeeButtonConfirm,
    handleCustomFeePress,
    handleNumberPress,
    handleCloseCustomFeeModal,
    handleConfirmCustomFee
  }
} 