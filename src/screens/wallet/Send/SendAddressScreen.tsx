import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { ThemedText } from '@/src/components/ThemedText'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSendStore } from '@/src/store/sendStore'
import { useFocusEffect } from '@react-navigation/native'
import { AddressInput } from '@/src/components/send/AddressInput'
import { SpeedOptionButton } from '@/src/components/send/SpeedOptionButton'
import { SpeedInfoModal } from '@/src/components/send/SpeedInfoModal'
import { CustomFeeModal } from '@/src/components/send/CustomFeeModal'
import { useAddressValidation } from '@/src/hooks/send/useAddressValidation'
import { useSpeedOptions } from '@/src/hooks/send/useSpeedOptions'
import { useCustomFee } from '@/src/hooks/send/useCustomFee'
import { getFormattedUsdFee } from '@/src/utils/send/speedOptions'
import { SpeedTier } from '@/src/types/transaction/send.types'

export default function SendAddressScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { 
    setAddress: setStoreAddress, 
    setSpeed: setStoreSpeed, 
    setCustomFee: setStoreCustomFee 
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
    setShowCustomFeeModal,
    handleNumberPress,
    handleCloseCustomFeeModal,
    handleConfirmCustomFee,
    resetCustomFee,
    hasPersistedFee
  } = useCustomFee()

  // Reset all states when leaving screen
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // This runs when screen loses focus (leaving the screen)
        resetAddress()
        resetSpeed()
        // Only reset custom fee if we're going back
        const isGoingBack = router.canGoBack()
        if (isGoingBack) {
          resetCustomFee()
        }
      }
    }, [])
  )

  // Check clipboard when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      checkClipboard()
    }, [])
  )

  const handleQRScan = () => {
    router.push({
      pathname : '/send/camera' as any
    })
  }

  const handleBackPress = () => {
    resetAddress()
    resetSpeed()
    resetCustomFee()
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
    handleSpeedChangeBase(newSpeed)
  }

  const handleCustomFeePress = () => {
    setShowCustomFeeModal(true)
  }

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
        <View style={styles.section}>
          <View style={styles.speedHeader}>
            <ThemedText style={styles.speedTitle}>Choose Confirmation Speed</ThemedText>
            <TouchableOpacity onPress={handleSpeedInfoPress}>
              <ThemedText style={styles.speedInfo}>what is this?</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.speedOptions}>
            {speedOptions.map((option) => (
              <SpeedOptionButton
                key={option.id}
                option={option}
                isSelected={speed === option.id}
                onPress={() => handleSpeedChange(option.id as any)}
              />
            ))}

            {hasPersistedFee && (
              <SpeedOptionButton
                option={{
                  id    : 'custom',
                  label : 'Custom',
                  fee   : {
                    sats : customFee.totalSats,
                    usd  : parseFloat(getFormattedUsdFee(customFee.totalSats))
                  }
                }}
                isSelected={speed === 'custom'}
                onPress={() => handleSpeedChange('custom')}
              />
            )}

            <TouchableOpacity 
              style={styles.customFeeButton}
              onPress={handleCustomFeePress}
            >
              <ThemedText style={styles.customFeeText}>Enter Custom fee</ThemedText>
              <ChevronRight size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Speed Info Modal */}
      <SpeedInfoModal
        visible={showSpeedInfoModal}
        onClose={handleCloseSpeedInfoModal}
      />

      {/* Custom Fee Modal */}
      <CustomFeeModal
        visible={showCustomFeeModal}
        customFee={customFee}
        onClose={handleCloseCustomFeeModal}
        onConfirm={handleConfirmCustomFee}
        onNumberPress={handleNumberPress}
      />

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
  section : {
    marginBottom : 32
  },
  speedHeader : {
    flexDirection : 'row',
    alignItems    : 'center',
    marginBottom  : 20
  },
  speedTitle : {
    fontSize    : 18,
    fontWeight  : '600',
    marginRight : 8
  },
  speedInfo : {
    color    : '#0066CC',
    fontSize : 14
  },
  speedOptions : {
    gap : 12
  },
  customFeeButton : {
    flexDirection   : 'row',
    justifyContent  : 'space-between',
    alignItems      : 'center',
    backgroundColor : '#fff',
    borderWidth     : 1,
    borderColor     : '#E5E5E5',
    borderRadius    : 12,
    padding         : 16,
    height          : 72
  },
  customFeeText : {
    fontSize   : 16,
    fontWeight : '500'
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