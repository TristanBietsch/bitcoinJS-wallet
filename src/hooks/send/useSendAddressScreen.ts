import { useCallback, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useSendStore } from '@/src/store/sendStore'
import { useAddressValidation } from '@/src/hooks/send/useAddressValidation'
import { useSpeedOptions } from '@/src/hooks/send/useSpeedOptions'
import { useCustomFee } from '@/src/hooks/send/useCustomFee'
import { useProgressiveFeeLoading } from '@/src/hooks/send/useProgressiveFeeLoading'
import { SpeedTier } from '@/src/types/domain/transaction'
import { validateAndSanitizeAddress } from '@/src/utils/validation/validateAddress'
import { bitcoinjsNetwork } from '@/src/config/env'

export const useSendAddressScreen = () => {
  const router = useRouter()
  const { 
    address: storedAddress, 
    speed: storedSpeed, 
    customFee: storedCustomFee,
    setAddress: setStoreAddress, 
    setSpeed: setStoreSpeed, 
    setCustomFee: setStoreCustomFee,
    setSelectedFeeOption: setStoreSelectedFeeOption,
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
    isLoadingFees,
    feeLoadError,
    handleSpeedChange: handleSpeedChangeBase,
    handleSpeedInfoPress,
    handleCloseSpeedInfoModal,
    resetSpeed,
    refreshSpeedOptions
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

  // Progressive fee loading with infinite loop fix applied
  const { state: feeState } = useProgressiveFeeLoading()

  // Load data from store when screen is focused
  useEffect(() => {
    // First check if we have data in the store
    if (storedAddress) {
      // Validate the address from the store
      const validationResult = validateAndSanitizeAddress(storedAddress, bitcoinjsNetwork)
      
      if (validationResult.isValid) {
        // If we have a valid address in the store, use it and don't check clipboard
        handleAddressChange(storedAddress)
      } else {
        // If the stored address is invalid, reset it
        resetStore()
        // Then check clipboard
        checkClipboard()
      }
    } else {
      // Only check clipboard if we don't have an address yet
      checkClipboard()
    }
    
    // Handle custom fee first since it should override speed
    if (storedCustomFee) {
      setCustomFee(storedCustomFee)
      handleSpeedChangeBase('custom')
      setStoreSelectedFeeOption(undefined) // Clear selectedFeeOption for custom
    } else if (storedSpeed) {
      handleSpeedChangeBase(storedSpeed as SpeedTier)
      
      // Also set the selectedFeeOption for standard speeds
      if (storedSpeed !== 'custom') {
        const selectedSpeedOption = speedOptions.find(option => option.id === storedSpeed)
        if (selectedSpeedOption && selectedSpeedOption.fee && selectedSpeedOption.feeRate) {
          const feeOption = {
            name            : selectedSpeedOption.label,
            feeRate         : selectedSpeedOption.feeRate,
            totalFee        : selectedSpeedOption.fee.sats,
            estimatedBlocks : selectedSpeedOption.estimatedBlocks || 6,
            estimatedTime   : selectedSpeedOption.estimatedTime || '~1 hour'
          }
          setStoreSelectedFeeOption(feeOption)
          console.log('Restored selectedFeeOption for stored speed:', storedSpeed, feeOption)
        }
      }
    }
  }, [ 
    storedAddress, 
    storedSpeed, 
    storedCustomFee,
    speedOptions,
    checkClipboard,
    handleAddressChange,
    handleSpeedChangeBase,
    resetStore,
    setCustomFee,
    setStoreSelectedFeeOption
  ])

  const handleQRScan = () => {
    router.push('/send/camera' as any)
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
    
    // Only update store when user explicitly moves forward (prevents circular dependencies)
    setStoreAddress(address)
    setStoreSpeed(speed)
    if (speed === 'custom') {
      setStoreCustomFee(customFee)
      setStoreSelectedFeeOption(undefined) // Clear selectedFeeOption for custom
    } else {
      // For standard speeds, ensure selectedFeeOption is set
      const selectedSpeedOption = speedOptions.find(option => option.id === speed)
      if (selectedSpeedOption && selectedSpeedOption.fee && selectedSpeedOption.feeRate) {
        const feeOption = {
          name            : selectedSpeedOption.label,
          feeRate         : selectedSpeedOption.feeRate,
          totalFee        : selectedSpeedOption.fee.sats,
          estimatedBlocks : selectedSpeedOption.estimatedBlocks || 6,
          estimatedTime   : selectedSpeedOption.estimatedTime || '~1 hour'
        }
        setStoreSelectedFeeOption(feeOption)
      }
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
      // Clear selectedFeeOption when switching to custom
      setStoreSelectedFeeOption(undefined)
      setShowCustomFeeModal(true)
      return
    }
    
    // Clear custom fee when switching to a standard speed tier
    setStoreCustomFee(undefined)
    
    // Find the corresponding speed option and set it as selectedFeeOption
    const selectedSpeedOption = speedOptions.find(option => option.id === newSpeed)
    if (selectedSpeedOption && selectedSpeedOption.fee && selectedSpeedOption.feeRate) {
      // Convert SpeedOption to FeeOption format for the store
      const feeOption = {
        name            : selectedSpeedOption.label,
        feeRate         : selectedSpeedOption.feeRate,
        totalFee        : selectedSpeedOption.fee.sats,
        estimatedBlocks : selectedSpeedOption.estimatedBlocks || 6,
        estimatedTime   : selectedSpeedOption.estimatedTime || '~1 hour'
      }
      setStoreSelectedFeeOption(feeOption)
      console.log('Set selectedFeeOption for speed:', newSpeed, feeOption)
    } else {
      console.warn('Could not find speed option for:', newSpeed)
      setStoreSelectedFeeOption(undefined)
    }
    
    handleSpeedChangeBase(newSpeed)
  }

  const handleCustomFeeButtonConfirm = () => {
    // Once custom fee is confirmed, set speed to 'custom'
    handleSpeedChangeBase('custom')
  }
  
  const handleCustomFeeConfirm = useCallback(() => {
    // Set speed to custom first
    handleSpeedChangeBase('custom')
    // Then confirm the custom fee
    handleConfirmCustomFee()
  }, [ handleSpeedChangeBase, handleConfirmCustomFee ])

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
    
    // Fee loading state for enhanced UX
    feeLoading : feeState.isLoading || feeState.isBackgroundRefreshing,
    isLoadingFees,
    feeLoadError,
    
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
    handleConfirmCustomFee : handleCustomFeeConfirm,
    refreshSpeedOptions
  }
} 