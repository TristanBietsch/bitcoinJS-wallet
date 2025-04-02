import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Stack } from 'expo-router'
import { ThemedText } from '@/src/components/ThemedText'
import { ChevronLeft } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AddressInput } from '@/src/components/send/AddressInput'
import { SpeedSelection } from '@/src/components/send/SpeedSelection'
import { useSendAddressScreen } from '@/src/hooks/send/useSendAddressScreen'

export default function SendAddressScreen() {
  const insets = useSafeAreaInsets()
  
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
    <View style={[
      styles.container,
      {
        paddingTop    : insets.top,
        paddingBottom : insets.bottom
      }
    ]}>
      <Stack.Screen 
        options={{
          headerShown : false
        }} 
      />

      {/* Custom Back Button */}
      <TouchableOpacity 
        style={[
          styles.backButton,
          {
            top : insets.top + 10
          }
        ]} 
        onPress={handleBackPress}
      >
        <ChevronLeft size={24} color="black" />
      </TouchableOpacity>

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
        />
      </View>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[ styles.nextButton, !address && styles.nextButtonDisabled ]}
          onPress={handleNextPress}
          disabled={!address}
        >
          <ThemedText style={styles.nextButtonText}>Next</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : '#fff'
  },
  content : {
    flex      : 1,
    padding   : 20,
    marginTop : 80
  },
  footer : {
    padding         : 20,
    backgroundColor : '#fff',
    borderTopWidth  : 1,
    borderTopColor  : '#F0F0F0'
  },
  nextButton : {
    backgroundColor : '#FF0000',
    borderRadius    : 12,
    height          : 56,
    justifyContent  : 'center',
    alignItems      : 'center'
  },
  nextButtonDisabled : {
    opacity : 0.5
  },
  nextButtonText : {
    color      : '#fff',
    fontSize   : 16,
    fontWeight : '600'
  },
  backButton : {
    position : 'absolute',
    left     : 10
  }
}) 