import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'

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
  const {
    address,
    addressError,
    isValidAddress,
    handleContinue
  } = useSendAddressScreen()

  // State for proper speed selection types
  const [ speedOptions, setSpeedOptions ] = useState<SpeedOption[]>([])
  const [ selectedSpeed, setSelectedSpeed ] = useState<SpeedTier>('standard')
  const [ customFee, setCustomFee ] = useState<CustomFee>({
    totalSats        : 0,
    confirmationTime : 60,
    feeRate          : 10
  })
  const [ isLoadingFees, setIsLoadingFees ] = useState(false)

  // Load speed options
  useEffect(() => {
    const loadSpeedOptions = async () => {
      setIsLoadingFees(true)
      try {
        const options = await getSpeedOptions()
        setSpeedOptions(options)
      } catch (error) {
        console.error('Failed to load speed options:', error)
      } finally {
        setIsLoadingFees(false)
      }
    }
    loadSpeedOptions()
  }, [])

  // Handlers
  const handleAddressChange = (_newAddress: string) => {
    // Use existing setAddress logic from hook if available
  }

  const handleBackPress = () => {
    // Navigate back
  }

  const handleQRScan = () => {
    // QR scan functionality
  }

  const handleSpeedChange = (speed: SpeedTier) => {
    setSelectedSpeed(speed)
  }

  const handleCustomFeeChange = (fee: CustomFee) => {
    setCustomFee(fee)
  }

  // Mock handlers for modal functionality
  const handleSpeedInfoPress = () => {}
  const handleCloseSpeedInfoModal = () => {}
  const handleCustomFeePress = () => {}
  const handleNumberPress = () => {}
  const handleCloseCustomFeeModal = () => {}
  const refreshSpeedOptions = () => {}

  // Additional handlers and state
  const speed = selectedSpeed
  const handleConfirmCustomFee = handleCustomFeeChange
  const handleNextPress = handleContinue
  
  // State for modals
  const showSpeedInfoModal = false
  const showCustomFeeModal = false
  const pendingInput = ''
  const feeError = null
  const feeLoadError = null
  const isInputValid = isValidAddress
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