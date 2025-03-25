import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Pressable, Clipboard, Alert, Platform } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { ThemedText } from '@/src/components/ThemedText'
import { ChevronRight, ChevronLeft, Turtle, Squirrel, Rabbit } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { validateAddress } from '@/src/utils/validation/validateAddress'
import { useSendStore } from '@/src/store/sendStore'
import { useFocusEffect } from '@react-navigation/native'

interface SpeedOption {
  id: string
  label: string
  fee?: {
    sats: number
    usd: number
  }
}

const speedOptions: SpeedOption[] = [
  {
    id    : 'economy',
    label : 'Economy',
    fee   : {
      sats : 3000,
      usd  : 2.13
    }
  },
  {
    id    : 'standard',
    label : 'Standard',
    fee   : {
      sats : 5000,
      usd  : 3.55
    }
  },
  {
    id    : 'express',
    label : 'Express',
    fee   : {
      sats : 8000,
      usd  : 5.68
    }
  }
]

export default function SendAddressScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { address, speed, setAddress, setSpeed } = useSendStore()
  const [ addressError, setAddressError ] = useState<string | null>(null)
  const [ _clipboardAddress, setClipboardAddress ] = useState<string | null>(null)

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true

      const check = async () => {
        try {
          const clipboardContent = await Clipboard.getString()
          if (!isActive) return

          if (clipboardContent && !address) {
            const result = validateAddress(clipboardContent)
            if (result.isValid) {
              setClipboardAddress(clipboardContent)
              showPasteAlert(clipboardContent)
            }
          }
        } catch (error) {
          console.error('Error checking clipboard:', error)
        }
      }

      check()

      return () => {
        isActive = false
        setClipboardAddress(null)
      }
    }, [ address ])
  )

  const showPasteAlert = (detectedAddress: string) => {
    if (Platform.OS === 'ios') {
      Alert.alert(
        'Paste Bitcoin Address?',
        'A valid Bitcoin address was found in your clipboard. Use it?',
        [
          {
            text    : 'Cancel',
            style   : 'cancel',
            onPress : () => setClipboardAddress(null)
          },
          {
            text    : 'Paste',
            style   : 'default',
            onPress : () => {
              setAddress(detectedAddress)
              setAddressError(null)
              setClipboardAddress(null)
            }
          }
        ],
        { cancelable: false }
      )
    }
  }

  const handleAddressChange = (text: string) => {
    setAddress(text)
    if (text) {
      const result = validateAddress(text)
      setAddressError(result.error)
    } else {
      setAddressError(null)
    }
  }

  const handleQRScan = () => {
    router.push({
      pathname : '/send/camera' as any
    })
  }

  const handleSpeedInfoPress = () => {
    // Will implement modal later
    console.log('Show speed info modal')
  }

  const handleBackPress = () => {
    setAddress('')
    setSpeed('economy')
    router.back()
  }

  const handleNextPress = () => {
    const result = validateAddress(address)
    if (!result.isValid) {
      setAddressError(result.error)
      return
    }
    router.push({
      pathname : '/send/amount' as any,
      params   : {
        address,
        speed
      }
    })
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
        <View style={styles.section}>
          <View style={styles.addressSection}>
            <TextInput
              style={[
                styles.addressInput,
                addressError && styles.addressInputError
              ]}
              placeholder="Bitcoin Address"
              value={address}
              onChangeText={handleAddressChange}
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              multiline={false}
            />
            <TouchableOpacity 
              style={styles.qrButton}
              onPress={handleQRScan}
            >
              <View style={styles.qrIcon} />
            </TouchableOpacity>
          </View>
          {addressError && (
            <ThemedText style={styles.errorText}>{addressError}</ThemedText>
          )}
        </View>

        {/* Speed Selection Section */}
        <View style={styles.section}>
          <View style={styles.speedHeader}>
            <ThemedText style={styles.speedTitle}>Choose Confirmation Speed</ThemedText>
            <Pressable onPress={handleSpeedInfoPress}>
              <Text style={styles.speedInfo}>what is this?</Text>
            </Pressable>
          </View>

          <View style={styles.speedOptions}>
            {speedOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.speedButton,
                  speed === option.id && styles.selectedSpeed
                ]}
                onPress={() => setSpeed(option.id)}
              >
                <View style={styles.speedLeft}>
                  {option.id === 'economy' && <Turtle size={32} color="#000" />}
                  {option.id === 'standard' && <Squirrel size={32} color="#000" />}
                  {option.id === 'express' && <Rabbit size={32} color="#000" />}
                  <ThemedText style={styles.speedLabel}>{option.label}</ThemedText>
                </View>
                {option.fee && (
                  <View style={styles.feeInfo}>
                    <ThemedText style={styles.satsAmount}>{option.fee.sats} sats</ThemedText>
                    <ThemedText style={styles.usdAmount}>${option.fee.usd} USD</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.customFeeButton}>
              <ThemedText style={styles.customFeeText}>Enter Custom fee</ThemedText>
              <ChevronRight size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
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
  section : {
    marginBottom : 32
  },
  addressSection : {
    flexDirection : 'row'
  },
  addressInput : {
    flex              : 1,
    height            : 56,
    backgroundColor   : '#F5F5F5',
    borderRadius      : 12,
    paddingHorizontal : 16,
    marginRight       : 12,
    fontSize          : 16,
  },
  addressInputError : {
    backgroundColor : '#FFF5F5',
    borderWidth     : 1,
    borderColor     : '#FF0000'
  },
  errorText : {
    color      : '#FF0000',
    fontSize   : 14,
    marginTop  : 8,
    marginLeft : 4
  },
  qrButton : {
    width           : 56,
    height          : 56,
    backgroundColor : '#FF0000',
    borderRadius    : 12,
    justifyContent  : 'center',
    alignItems      : 'center'
  },
  qrIcon : {
    width           : 24,
    height          : 24,
    backgroundColor : '#fff',
    borderRadius    : 6
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
  speedButton : {
    flexDirection   : 'row',
    justifyContent  : 'space-between',
    alignItems      : 'center',
    backgroundColor : '#F5F5F5',
    borderRadius    : 12,
    padding         : 16,
    height          : 72
  },
  selectedSpeed : {
    backgroundColor : '#E5E5E5'
  },
  speedLeft : {
    flexDirection : 'row',
    alignItems    : 'center',
    gap           : 12
  },
  speedLabel : {
    fontSize   : 16,
    fontWeight : '500'
  },
  feeInfo : {
    alignItems : 'flex-end'
  },
  satsAmount : {
    fontSize   : 16,
    fontWeight : '500',
    color      : '#666'
  },
  usdAmount : {
    fontSize  : 14,
    color     : '#999',
    marginTop : 2
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