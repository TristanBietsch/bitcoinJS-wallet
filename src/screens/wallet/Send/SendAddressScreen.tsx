import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Stack, useRouter } from 'expo-router'

import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import ScreenFooter from '@/src/components/layout/ScreenFooter'
import ActionButton from '@/src/components/ui/Button/ActionButton'
import { AddressInput } from '@/src/components/features/Send/Address/AddressInput'
import { SpeedSelection } from '@/src/components/features/Send/Fees/SpeedSelection'
import { useSendAddressScreen } from '@/src/hooks/send/useSendAddressScreen'
import { getSpeedOptions } from '@/src/utils/send/speedOptions'
import { SpeedOption, SpeedTier, CustomFee } from '@/src/types/domain/transaction'

export default function SendAddressScreen() {
  const router = useRouter()
  
  const {
    address,
    addressError,
    selectedSpeed,
    customFeeRate,
    isLoadingFees,
    setAddress,
    setSelectedSpeed,
    setCustomFeeRate,
    handleContinue,
    loadFeeRates
  } = useSendAddressScreen()

  // State for proper speed selection component types
  const [ speedOptions, setSpeedOptions ] = useState<SpeedOption[]>([])
  
  // Modal state management
  const [ showSpeedInfoModal, setShowSpeedInfoModal ] = useState(false)
  const [ showCustomFeeModal, setShowCustomFeeModal ] = useState(false)
  const [ pendingInput, setPendingInput ] = useState('')

  // Load speed options for the component
  useEffect(() => {
    const loadSpeedOptions = async () => {
      try {
        const options = await getSpeedOptions()
        setSpeedOptions(options)
      } catch (error) {
        console.error('Failed to load speed options:', error)
      }
    }
    loadSpeedOptions()
  }, [])

  // Navigation handlers
  const handleBackPress = () => {
    router.push('/' as any) // Navigate back to home screen
  }

  const handleNextPress = () => {
    handleContinue() // This will navigate to /send/amount
  }

  // Address handlers
  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress) // Use the hook's setAddress function
  }

  const handleQRScan = () => {
    router.push('/send/camera' as any) // Navigate to QR scanner
  }

  // Fee selection handlers - map between component types and hook types
  const handleSpeedChange = (speed: SpeedTier) => {
    // Map SpeedTier to hook's speed type
    const hookSpeed = speed === 'standard' ? 'normal' : speed
    setSelectedSpeed(hookSpeed as 'economy' | 'normal' | 'express' | 'custom')
  }



  // Modal handlers
  const handleSpeedInfoPress = () => {
    setShowSpeedInfoModal(true)
  }
  
  const handleCloseSpeedInfoModal = () => {
    setShowSpeedInfoModal(false)
  }
  
  const handleCustomFeePress = () => {
    setShowCustomFeeModal(true)
    // Switch to custom speed when opening custom fee modal
    setSelectedSpeed('custom')
    // Initialize pending input with current custom fee rate
    setPendingInput(customFeeRate > 0 ? customFeeRate.toString() : '')
  }
  
  const handleCloseCustomFeeModal = () => {
    setShowCustomFeeModal(false)
    setPendingInput('')
  }
  
  const handleNumberPress = (num: string | 'backspace') => {
    if (num === 'backspace') {
      setPendingInput(prev => prev.slice(0, -1))
    } else {
      setPendingInput(prev => prev + num)
    }
  }
  
  const handleConfirmCustomFee = () => {
    // Convert pendingInput to fee rate (user enters sat/vB directly)
    const inputValue = parseFloat(pendingInput)
    if (inputValue && inputValue > 0) {
      // Update the fee rate in the hook (input is already in sat/vB)
      setCustomFeeRate(inputValue)
      
      // Close the modal and clear pending input
      setShowCustomFeeModal(false)
      setPendingInput('')
    }
  }
  
  const refreshSpeedOptions = loadFeeRates

  // Map hook data to component expectations
  const mappedSelectedSpeed: SpeedTier = selectedSpeed === 'normal' ? 'standard' : selectedSpeed as SpeedTier
  
  // Create customFee object - use pendingInput when modal is open, otherwise use stored rate
  const customFee: CustomFee = {
    totalSats : showCustomFeeModal 
      ? (pendingInput ? parseFloat(pendingInput) || 0 : 0)
      : customFeeRate, // Display the actual fee rate as sat/vB when modal is closed
    confirmationTime : 60,
    feeRate          : customFeeRate
  }
  const speed = mappedSelectedSpeed
  
  // Input validation - check if pendingInput is a valid number > 0
  const isInputValid = !pendingInput || (parseFloat(pendingInput) > 0 && !isNaN(parseFloat(pendingInput)))
  
  // Additional state
  const feeError = null
  const feeLoadError = null
  const isBackButtonDisabled = false

  return (
    <SafeAreaContainer>
      <Stack.Screen 
        options={{
          headerShown : false
        }} 
      />

      {/* Custom Back Button */}
      <BackButton onPress={handleBackPress} disabled={isBackButtonDisabled} />

      <View style={styles.content}>
        {/* Address Input Section */}
        <AddressInput
          value={address}
          error={addressError}
          onChangeText={handleAddressChange}
          onQRPress={handleQRScan}
        />

        {/* Speed Selection Section */}
        <SpeedSelection
          speedOptions={speedOptions}
          selectedSpeed={speed}
          customFee={customFee}
          showSpeedInfoModal={showSpeedInfoModal}
          showCustomFeeModal={showCustomFeeModal}
          isInputValid={isInputValid}
          onSpeedChange={handleSpeedChange}
          onSpeedInfoPress={handleSpeedInfoPress}
          onCloseSpeedInfoModal={handleCloseSpeedInfoModal}
          onCustomFeePress={handleCustomFeePress}
          onCloseCustomFeeModal={handleCloseCustomFeeModal}
          onCustomFeeChange={handleConfirmCustomFee}
          onNumberPress={handleNumberPress}
          pendingInput={pendingInput}
          feeError={feeError}
          isLoadingFees={isLoadingFees}
          feeLoadError={feeLoadError}
          onRefreshFees={refreshSpeedOptions}
        />
      </View>

      {/* Next Button in Footer */}
      <ScreenFooter>
        <ActionButton
          title="Next"
          onPress={handleNextPress}
          disabled={!address}
        />
      </ScreenFooter>
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  content : {
    flex      : 1,
    padding   : 20,
    marginTop : 80
  }
}) 