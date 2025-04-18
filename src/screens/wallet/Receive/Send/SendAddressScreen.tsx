import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'

import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import ScreenFooter from '@/src/components/layout/ScreenFooter'
import ActionButton from '@/src/components/ui/Button/ActionButton'
import { AddressInput } from '@/src/components/features/Send/Address/AddressInput'
import { SpeedSelection } from '@/src/components/features/Send/Fees/SpeedSelection'
import { useSendAddressScreen } from '@/src/hooks/send/useSendAddressScreen'

export default function SendAddressScreen() {
  const {
    // State
    address,
    addressError,
    speed,
    showSpeedInfoModal,
    speedOptions,
    customFee,
    showCustomFeeModal,
    isInputValid,
    pendingInput,
    feeError,
    
    // Handlers
    handleAddressChange,
    handleQRScan,
    handleBackPress,
    handleNextPress,
    handleSpeedChange,
    handleSpeedInfoPress,
    handleCloseSpeedInfoModal,
    handleCustomFeePress,
    handleNumberPress,
    handleCloseCustomFeeModal,
    handleConfirmCustomFee
  } = useSendAddressScreen()

  return (
    <SafeAreaContainer>
      <Stack.Screen 
        options={{
          headerShown : false
        }} 
      />

      {/* Custom Back Button */}
      <BackButton onPress={handleBackPress} />

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