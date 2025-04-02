import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { ChevronRight } from 'lucide-react-native'
import { SpeedOptionButton } from '@/src/components/features/Send/Fees/SpeedOptionButton'
import { SpeedInfoModal } from '@/src/components/features/Send/Fees/SpeedInfoModal'
import { CustomFeeModal } from '@/src/components/features/Send/Fees/CustomFeeModal'
import { getFormattedUsdFee } from '@/src/utils/send/speedOptions'
import { SpeedTier, CustomFee, SpeedOption } from '@/src/types/transaction/send.types'

interface SpeedSelectionProps {
  speedOptions: SpeedOption[]
  selectedSpeed: SpeedTier
  customFee: CustomFee
  showSpeedInfoModal: boolean
  showCustomFeeModal: boolean
  isInputValid: boolean
  onSpeedChange: (speed: SpeedTier) => void
  onSpeedInfoPress: () => void
  onCloseSpeedInfoModal: () => void
  onCustomFeePress: () => void
  onCloseCustomFeeModal: () => void
  onCustomFeeChange: (fee: CustomFee) => void
  onNumberPress: (num: string) => void
}

export const SpeedSelection: React.FC<SpeedSelectionProps> = ({
  speedOptions,
  selectedSpeed,
  customFee,
  showSpeedInfoModal,
  showCustomFeeModal,
  isInputValid,
  onSpeedChange,
  onSpeedInfoPress,
  onCloseSpeedInfoModal,
  onCustomFeePress,
  onCloseCustomFeeModal,
  onCustomFeeChange,
  onNumberPress,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.speedHeader}>
        <ThemedText style={styles.speedTitle}>Choose Confirmation Speed</ThemedText>
        <TouchableOpacity onPress={onSpeedInfoPress}>
          <ThemedText style={styles.speedInfo}>what is this?</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.speedOptions}>
        {speedOptions.map((option) => (
          <SpeedOptionButton
            key={option.id}
            option={option}
            isSelected={selectedSpeed === option.id}
            onPress={() => onSpeedChange(option.id as SpeedTier)}
          />
        ))}

        <SpeedOptionButton
          key="custom-fee"
          option={{
            id    : 'custom',
            label : 'Custom Fee',
            fee   : customFee ? {
              sats : customFee.totalSats,
              usd  : parseFloat(getFormattedUsdFee(customFee.totalSats))
            } : undefined
          }}
          isSelected={selectedSpeed === 'custom'}
          onPress={() => onSpeedChange('custom')}
        />
      </View>

      {selectedSpeed === 'custom' && (
        <TouchableOpacity
          style={styles.customFeeButton}
          onPress={onCustomFeePress}
        >
          <View style={styles.customFeeContent}>
            <ThemedText style={styles.customFeeText}>
              Set Custom Fee
            </ThemedText>
            <ChevronRight size={20} color="#000" />
          </View>
        </TouchableOpacity>
      )}

      <SpeedInfoModal
        visible={showSpeedInfoModal}
        onClose={onCloseSpeedInfoModal}
      />

      <CustomFeeModal
        visible={showCustomFeeModal}
        onClose={onCloseCustomFeeModal}
        onConfirm={() => onCustomFeeChange(customFee)}
        customFee={customFee}
        isInputValid={isInputValid}
        onNumberPress={onNumberPress}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  section : {
    marginTop : 24,
  },
  speedHeader : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    alignItems     : 'center',
    marginBottom   : 16,
  },
  speedTitle : {
    fontSize   : 16,
    fontWeight : '600',
  },
  speedInfo : {
    fontSize : 14,
    color    : '#666',
  },
  speedOptions : {
    gap : 8,
  },
  customFeeButton : {
    marginTop       : 16,
    padding         : 16,
    backgroundColor : '#f5f5f5',
    borderRadius    : 12,
  },
  customFeeContent : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    alignItems     : 'center',
  },
  customFeeText : {
    fontSize   : 16,
    fontWeight : '500',
  },
}) 