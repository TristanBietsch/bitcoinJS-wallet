import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Pressable, Clipboard, Alert, Platform, Modal } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { ThemedText } from '@/src/components/ThemedText'
import { ChevronRight, ChevronLeft, Turtle, Squirrel, Rabbit, Pencil } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { validateAddress } from '@/src/utils/validation/validateAddress'
import { useSendStore } from '@/src/store/sendStore'
import { useFocusEffect } from '@react-navigation/native'
import { transactionFees } from '@/tests/mockData/transactionData'

interface SpeedOption {
  id: string
  label: string
  fee?: {
    sats: number
    usd: number
  }
}

interface CustomFee {
  totalSats: number
  confirmationTime: number  // in minutes
  feeRate: number  // in sats/vbyte
}

const speedOptions: SpeedOption[] = [
  {
    id    : 'economy',
    label : 'Economy',
    fee   : {
      sats : transactionFees.tiers.economy.sats,
      usd  : transactionFees.tiers.economy.usd
    }
  },
  {
    id    : 'standard',
    label : 'Standard',
    fee   : {
      sats : transactionFees.tiers.standard.sats,
      usd  : transactionFees.tiers.standard.usd
    }
  },
  {
    id    : 'express',
    label : 'Express',
    fee   : {
      sats : transactionFees.tiers.express.sats,
      usd  : transactionFees.tiers.express.usd
    }
  }
]

export default function SendAddressScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { address, speed, setAddress, setSpeed, customFee: storeCustomFee, setCustomFee: setStoreCustomFee } = useSendStore()
  const [ addressError, setAddressError ] = useState<string | null>(null)
  const [ _clipboardAddress, setClipboardAddress ] = useState<string | null>(null)
  const [ showCustomFeeModal, setShowCustomFeeModal ] = useState(false)
  const [ customFee, setCustomFee ] = useState<CustomFee>({
    totalSats        : 2000,
    confirmationTime : 60,
    feeRate          : 5
  })
  const [ customFeeAdded, setCustomFeeAdded ] = useState(false)
  const [ _activeField, setActiveField ] = useState<string | null>(null)
  const [ isEditingTotalFee, setIsEditingTotalFee ] = useState(false)

  // Initialize customFee from store if available
  useFocusEffect(
    React.useCallback(() => {
      if (storeCustomFee) {
        setCustomFee(storeCustomFee)
        setCustomFeeAdded(true)
      }
    }, [ storeCustomFee ])
  )

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

  const handleCustomFeePress = () => {
    setShowCustomFeeModal(true)
  }

  const handleCloseCustomFeeModal = () => {
    // Reset to previous values if we cancel
    if (storeCustomFee) {
      setCustomFee(storeCustomFee)
    }
    setShowCustomFeeModal(false)
  }

  const handleConfirmCustomFee = () => {
    // Set custom fee and close modal
    setSpeed('custom')
    setCustomFeeAdded(true)
    setStoreCustomFee(customFee)
    setShowCustomFeeModal(false)
  }

  const handleTotalFeeChange = (value: string) => {
    const totalSats = parseInt(value.replace(/[^0-9]/g, '')) || 0
    // Keep the fee rate constant and adjust confirmation time
    const newCustomFee = {
      ...customFee,
      totalSats,
      // Use our mock data utility to calculate confirmation time
      confirmationTime : transactionFees.estimateConfirmationTime(customFee.feeRate),
    }
    setCustomFee(newCustomFee)
  }

  const handleConfirmationTimeChange = (value: string) => {
    const confirmationTime = parseInt(value) || 1
    // Calculate an appropriate fee rate for this confirmation time
    const feeRate = transactionFees.calculateRateFromTime(confirmationTime)
    
    const newCustomFee = {
      ...customFee,
      confirmationTime,
      feeRate,
      // Calculate total fee based on the new fee rate
      totalSats : transactionFees.calculateFeeFromRate(feeRate)
    }
    setCustomFee(newCustomFee)
  }

  const handleFeeRateChange = (value: string) => {
    const feeRate = parseInt(value) || 1
    
    const newCustomFee = {
      ...customFee,
      feeRate,
      // Calculate the new total fee and estimated confirmation time
      totalSats        : transactionFees.calculateFeeFromRate(feeRate),
      confirmationTime : transactionFees.estimateConfirmationTime(feeRate)
    }
    setCustomFee(newCustomFee)
  }

  // Format the fee for display in USD
  const getFormattedUsdFee = (sats: number) => {
    return (sats * transactionFees.conversion.satToDollar).toFixed(2)
  }

  // Helper to handle active states with tactile feedback (for future use)
  const _toggleEditField = (field: string) => {
    setActiveField(field)
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

            {customFeeAdded && (
              <TouchableOpacity
                style={[
                  styles.speedButton,
                  speed === 'custom' && styles.selectedSpeed
                ]}
                onPress={() => setSpeed('custom')}
              >
                <View style={styles.speedLeft}>
                  <ThemedText style={styles.speedLabel}>Custom</ThemedText>
                </View>
                <View style={styles.feeInfo}>
                  <ThemedText style={styles.satsAmount}>{customFee.totalSats} sats</ThemedText>
                  <ThemedText style={styles.usdAmount}>~${getFormattedUsdFee(customFee.totalSats)} USD</ThemedText>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.customFeeButton}
              onPress={handleCustomFeePress}
            >
              {!customFeeAdded ? (
                <>
                  <ThemedText style={styles.customFeeText}>Enter Custom fee</ThemedText>
                  <ChevronRight size={20} color="#000" />
                </>
              ) : (
                <>
                  <ThemedText style={styles.customFeeText}>Edit Custom fee: {customFee.totalSats} sats</ThemedText>
                  <ChevronRight size={20} color="#000" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Custom Fee Modal */}
      <Modal
        visible={showCustomFeeModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalBackButton} 
                onPress={handleCloseCustomFeeModal}
              >
                <ChevronLeft size={24} color="black" />
                <ThemedText style={styles.modalBackText}>Back</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.modalTitle}>Custom fee</ThemedText>
            </View>
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalSubtitle}>
                Change one of the values below and the others will adjust.
              </ThemedText>

              {/* Total Fee */}
              <View style={styles.feeInputRow}>
                <View style={styles.feeInputLabel}>
                  <ThemedText style={styles.feeInputTitle}>Total fee</ThemedText>
                  <ThemedText style={styles.feeInputSubtitle}>In sats</ThemedText>
                </View>
                <View style={styles.feeInputValueContainer}>
                  {isEditingTotalFee ? (
                    <TextInput
                      style={styles.feeInputActive}
                      value={customFee.totalSats.toString()}
                      onChangeText={handleTotalFeeChange}
                      keyboardType="numeric"
                      autoFocus={true}
                      onBlur={() => setIsEditingTotalFee(false)}
                    />
                  ) : (
                    <TouchableOpacity 
                      onPress={() => setIsEditingTotalFee(true)}
                      style={styles.editableFeeContainer}
                    >
                      <View style={styles.editableFeeValueWrapper}>
                        <ThemedText style={styles.feeInputValue}>
                          {customFee.totalSats}
                        </ThemedText>
                        <Pencil size={16} color="#666" style={styles.editIcon} />
                      </View>
                    </TouchableOpacity>
                  )}
                  <ThemedText style={styles.feeEuroValue}>~${getFormattedUsdFee(customFee.totalSats)} USD</ThemedText>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Confirmation Time */}
              <View style={styles.feeInputRow}>
                <View style={styles.feeInputLabel}>
                  <ThemedText style={styles.feeInputTitle}>Confirmation time</ThemedText>
                  <ThemedText style={styles.feeInputSubtitle}>In minutes</ThemedText>
                </View>
                <View style={styles.feeInputValueContainer}>
                  <TouchableOpacity style={styles.editableFeeContainer}>
                    <View style={styles.editableFeeValueWrapper}>
                      <TextInput
                        style={styles.feeInputValue}
                        value={customFee.confirmationTime.toString()}
                        onChangeText={handleConfirmationTimeChange}
                        keyboardType="numeric"
                        onFocus={() => setActiveField('confirmationTime')}
                        onBlur={() => setActiveField(null)}
                      />
                      <Pencil size={16} color="#666" style={styles.editIcon} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Fee Rate */}
              <View style={styles.feeInputRow}>
                <View style={styles.feeInputLabel}>
                  <ThemedText style={styles.feeInputTitle}>Fee rate</ThemedText>
                  <ThemedText style={styles.feeInputSubtitle}>In sat per vbyte</ThemedText>
                </View>
                <View style={styles.feeInputValueContainer}>
                  <TouchableOpacity style={styles.editableFeeContainer}>
                    <View style={styles.editableFeeValueWrapper}>
                      <TextInput
                        style={styles.feeInputValue}
                        value={customFee.feeRate.toString()}
                        onChangeText={handleFeeRateChange}
                        keyboardType="numeric"
                        onFocus={() => setActiveField('feeRate')}
                        onBlur={() => setActiveField(null)}
                      />
                      <Pencil size={16} color="#666" style={styles.editIcon} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <ThemedText style={styles.modalFooterText}>
                Adjust the fee values to customize your transaction priority.
              </ThemedText>

              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleConfirmCustomFee}
              >
                <ThemedText style={styles.confirmButtonText}>Confirm</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  },
  // Modal styles
  modalOverlay : {
    flex            : 1,
    backgroundColor : 'rgba(0, 0, 0, 0.5)',
    justifyContent  : 'flex-end',
  },
  modalContainer : {
    backgroundColor      : '#FFFFFF',
    borderTopLeftRadius  : 16,
    borderTopRightRadius : 16,
    height               : 550,
  },
  modalHeader : {
    paddingHorizontal : 20,
    paddingTop        : 20,
    paddingBottom     : 10,
    position          : 'relative',
    alignItems        : 'center',
  },
  modalBackButton : {
    position      : 'absolute',
    left          : 20,
    top           : 20,
    flexDirection : 'row',
    alignItems    : 'center',
  },
  modalBackText : {
    fontSize   : 16,
    fontWeight : '500',
  },
  modalTitle : {
    fontSize   : 22,
    fontWeight : '600',
  },
  modalContent : {
    padding : 20,
  },
  modalSubtitle : {
    fontSize     : 16,
    textAlign    : 'center',
    color        : '#666',
    marginBottom : 20,
  },
  feeInputRow : {
    flexDirection   : 'row',
    justifyContent  : 'space-between',
    alignItems      : 'center',
    paddingVertical : 15,
  },
  feeInputLabel : {
    flex : 1,
  },
  feeInputTitle : {
    fontSize   : 16,
    fontWeight : '500',
  },
  feeInputSubtitle : {
    fontSize  : 14,
    color     : '#666',
    marginTop : 4,
  },
  feeInputValueContainer : {
    alignItems : 'flex-end',
  },
  feeInputValue : {
    fontSize   : 18,
    fontWeight : '500',
    textAlign  : 'right',
    minWidth   : 80,
    padding    : 0,
  },
  feeInputActive : {
    fontSize          : 18,
    fontWeight        : '500',
    textAlign         : 'right',
    minWidth          : 80,
    borderWidth       : 1,
    borderColor       : '#FF0000',
    borderRadius      : 8,
    paddingVertical   : 6,
    paddingHorizontal : 12,
    backgroundColor   : '#FFF8F8',
  },
  editableFeeContainer : {
    flexDirection : 'row',
    alignItems    : 'center',
  },
  editableFeeValueWrapper : {
    flexDirection     : 'row',
    alignItems        : 'center',
    borderWidth       : 1,
    borderColor       : '#E0E0E0',
    borderRadius      : 8,
    paddingVertical   : 6,
    paddingHorizontal : 12,
    backgroundColor   : '#F9F9F9',
    minWidth          : 120,
    justifyContent    : 'flex-end',
  },
  editIcon : {
    marginLeft : 8,
  },
  feeEuroValue : {
    fontSize  : 14,
    color     : '#666',
    textAlign : 'right',
  },
  divider : {
    height          : 1,
    backgroundColor : '#E5E5E5',
  },
  modalFooter : {
    padding   : 20,
    marginTop : 'auto',
  },
  modalFooterText : {
    fontSize     : 14,
    color        : '#666',
    textAlign    : 'center',
    marginBottom : 20,
  },
  confirmButton : {
    backgroundColor : '#FF0000',
    borderRadius    : 12,
    height          : 56,
    justifyContent  : 'center',
    alignItems      : 'center',
  },
  confirmButtonText : {
    color      : '#fff',
    fontSize   : 16,
    fontWeight : '600',
  },
}) 