import React from 'react'
import { View, Modal, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'  
import { ChevronLeft } from 'lucide-react-native'
import { CustomFee } from '@/src/types/transaction/send.types'
import { NumberPad } from '@/src/components/Send/Amount/NumberPad'
import { getFormattedUsdFee } from '@/src/utils/send/speedOptions'

interface CustomFeeModalProps {
  visible: boolean
  customFee: CustomFee
  onClose: () => void
  onConfirm: () => void
  onNumberPress: (num: string | 'backspace') => void
  pendingInput?: string
  feeError?: string | null
  isInputValid?: boolean
}

export const CustomFeeModal: React.FC<CustomFeeModalProps> = ({
  visible,
  customFee,
  onClose,
  onConfirm,
  onNumberPress,
  pendingInput = '',
  feeError = null,
  isInputValid = true
}) => {
  // Display the pending input if available, otherwise use the customFee totalSats
  const displayValue = pendingInput !== undefined && pendingInput !== null ? pendingInput : customFee.totalSats.toString()
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalBackButton} 
              onPress={onClose}
            >
              <ChevronLeft size={24} color="black" />
              <ThemedText style={styles.modalBackText}>Back</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Custom fee</ThemedText>
          </View>

          <View style={styles.modalContent}>
            {/* Total Fee */}
            <View style={styles.feeInputRow}>
              <View style={styles.feeInputLabel}>
                <ThemedText style={styles.feeInputTitle}>Total fee</ThemedText>
                <ThemedText style={styles.feeInputSubtitle}>In sats</ThemedText>
              </View>
              <View style={styles.feeInputValueContainer}>
                <View style={[
                  styles.editableFeeValueWrapper, 
                  feeError ? styles.errorInput : null
                ]}>
                  <ThemedText style={styles.feeInputValue}>
                    {displayValue || ''}
                  </ThemedText>
                </View>
                <ThemedText style={styles.feeUsdValue}>
                  ~${getFormattedUsdFee(
                    displayValue && displayValue !== '' 
                      ? parseInt(displayValue) 
                      : customFee.totalSats
                  )} USD
                </ThemedText>
                {feeError && (
                  <Text style={styles.errorText}>{feeError}</Text>
                )}
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
                <View style={styles.readOnlyValueContainer}>
                  <ThemedText style={styles.feeInputValue}>
                    {customFee.confirmationTime}
                  </ThemedText>
                </View>
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
                <View style={styles.readOnlyValueContainer}>
                  <ThemedText style={styles.feeInputValue}>
                    {customFee.feeRate}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.modalFooter}>
            <NumberPad 
              onNumberPress={onNumberPress}
              onBackspace={() => onNumberPress('backspace')}
            />

            <TouchableOpacity 
              style={[
                styles.confirmButton,
                !isInputValid && styles.confirmButtonDisabled
              ]}
              onPress={onConfirm}
              disabled={!isInputValid}
            >
              <ThemedText style={styles.confirmButtonText}>Confirm</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay : {
    flex            : 1,
    backgroundColor : 'rgba(0, 0, 0, 0.5)',
    justifyContent  : 'flex-end'
  },
  modalContainer : {
    backgroundColor      : '#FFFFFF',
    borderTopLeftRadius  : 20,
    borderTopRightRadius : 20,
    minHeight            : '80%'
  },
  modalHeader : {
    paddingHorizontal : 20,
    paddingTop        : 16,
    paddingBottom     : 8,
    position          : 'relative',
    alignItems        : 'center',
    borderBottomWidth : 1,
    borderBottomColor : '#F0F0F0'
  },
  modalBackButton : {
    position      : 'absolute',
    left          : 16,
    top           : 16,
    flexDirection : 'row',
    alignItems    : 'center'
  },
  modalBackText : {
    fontSize   : 16,
    fontWeight : '500',
    color      : '#000'
  },
  modalTitle : {
    fontSize   : 18,
    fontWeight : '600',
    color      : '#000'
  },
  modalContent : {
    padding : 20
  },
  feeInputRow : {
    flexDirection   : 'row',
    justifyContent  : 'space-between',
    alignItems      : 'flex-start',
    paddingVertical : 12
  },
  feeInputLabel : {
    flex : 1
  },
  feeInputTitle : {
    fontSize     : 16,
    fontWeight   : '500',
    color        : '#000',
    marginBottom : 4
  },
  feeInputSubtitle : {
    fontSize : 14,
    color    : '#666'
  },
  feeInputValueContainer : {
    alignItems : 'flex-end'
  },
  feeInputValue : {
    fontSize   : 16,
    fontWeight : '500',
    color      : '#000',
    textAlign  : 'right'
  },
  editableFeeValueWrapper : {
    minWidth          : 120,
    paddingVertical   : 4,
    paddingHorizontal : 8,
    backgroundColor   : '#F5F5F5',
    borderRadius      : 8
  },
  feeUsdValue : {
    fontSize  : 14,
    color     : '#666',
    marginTop : 4
  },
  divider : {
    height          : 1,
    backgroundColor : '#F0F0F0',
    marginVertical  : 4
  },
  readOnlyValueContainer : {
    minWidth          : 120,
    paddingVertical   : 4,
    paddingHorizontal : 8
  },
  modalFooter : {
    padding         : 20,
    paddingTop      : 0,
    backgroundColor : '#FFFFFF'
  },
  confirmButton : {
    backgroundColor : '#FF0000',
    borderRadius    : 12,
    height          : 56,
    justifyContent  : 'center',
    alignItems      : 'center',
    marginTop       : 16
  },
  confirmButtonText : {
    color      : '#fff',
    fontSize   : 16,
    fontWeight : '600'
  },
  errorInput : {
    borderColor : '#FF0000',
    borderWidth : 1
  },
  errorText : {
    color     : '#FF0000',
    fontSize  : 12,
    marginTop : 4,
    textAlign : 'right'
  },
  confirmButtonDisabled : {
    backgroundColor : '#CCCCCC'
  }
}) 