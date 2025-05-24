import React, { useEffect, useState, useCallback } from 'react'
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { ChevronRight, AlertCircle, RefreshCw } from 'lucide-react-native'
import { SpeedOptionButton } from '@/src/components/features/Send/Fees/SpeedOptionButton'
import { SpeedInfoModal } from '@/src/components/features/Send/Fees/SpeedInfoModal'
import { CustomFeeModal } from '@/src/components/features/Send/Fees/CustomFeeModal'
import { getSpeedOptions } from '@/src/utils/send/speedOptions'

import { SpeedTier, CustomFee, SpeedOption } from '@/src/types/domain/transaction'

interface SpeedSelectionProps {
  speedOptions: SpeedOption[]
  selectedSpeed: SpeedTier
  customFee: CustomFee
  showSpeedInfoModal: boolean
  showCustomFeeModal: boolean
  isInputValid: boolean
  isLoadingFees?: boolean
  feeLoadError?: string | null
  onSpeedChange: (speed: SpeedTier) => void
  onSpeedInfoPress: () => void
  onCloseSpeedInfoModal: () => void
  onCustomFeePress: () => void
  onCloseCustomFeeModal: () => void
  onCustomFeeChange: (fee: CustomFee) => void
  onNumberPress: (num: string) => void
  onRefreshFees?: () => void
  pendingInput?: string
  feeError?: string | null
}

export const SpeedSelection: React.FC<SpeedSelectionProps> = ({
  speedOptions: propSpeedOptions,
  selectedSpeed,
  customFee,
  showSpeedInfoModal,
  showCustomFeeModal,
  isInputValid,
  isLoadingFees: propIsLoadingFees = false,
  feeLoadError: propFeeLoadError,
  onSpeedChange,
  onSpeedInfoPress,
  onCloseSpeedInfoModal,
  onCustomFeePress,
  onCloseCustomFeeModal,
  onCustomFeeChange,
  onNumberPress,
  onRefreshFees,
  pendingInput,
  feeError
}) => {
  // Local state for fee loading
  const [ localSpeedOptions, setLocalSpeedOptions ] = useState<SpeedOption[]>([])
  const [ isLoadingLocalFees, setIsLoadingLocalFees ] = useState(false)
  const [ localFeeLoadError, setLocalFeeLoadError ] = useState<string | null>(null)

  // Use prop values if available, otherwise use local values
  const speedOptions = propSpeedOptions.length > 0 ? propSpeedOptions : localSpeedOptions
  const isLoadingFees = propIsLoadingFees || isLoadingLocalFees
  const feeLoadError = propFeeLoadError || localFeeLoadError

  // Load fees on component mount
  const loadFees = useCallback(async () => {
    // Only load if no prop speed options are provided
    if (propSpeedOptions.length === 0) {
      setIsLoadingLocalFees(true)
      setLocalFeeLoadError(null)
      try {
        const options = await getSpeedOptions()
        setLocalSpeedOptions(options)
        console.log('SpeedSelection: Loaded fee options', options)
      } catch (error) {
        console.error('SpeedSelection: Failed to load fees', error)
        setLocalFeeLoadError('Failed to load current fee rates')
      } finally {
        setIsLoadingLocalFees(false)
      }
    }
  }, [ propSpeedOptions ])

  // Load fees on mount and when prop speed options change
  useEffect(() => {
    loadFees()
  }, [ loadFees ])

  // Refresh handler that uses prop handler if available, otherwise local handler
  const handleRefreshFees = useCallback(() => {
    if (onRefreshFees) {
      onRefreshFees()
    } else {
      loadFees()
    }
  }, [ onRefreshFees, loadFees ])

  return (
    <View style={styles.section}>
      <View style={styles.speedHeader}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.speedTitle}>Choose Confirmation Speed</ThemedText>
          {isLoadingFees && (
            <ActivityIndicator size="small" color="#666" style={styles.loadingIndicator} />
          )}
        </View>
        <TouchableOpacity onPress={onSpeedInfoPress}>
          <ThemedText style={styles.speedInfo}>what is this?</ThemedText>
        </TouchableOpacity>
      </View>

      {feeLoadError && (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <AlertCircle size={16} color="#ff6b6b" />
            <ThemedText style={styles.errorText}>{feeLoadError}</ThemedText>
          </View>
          <TouchableOpacity onPress={handleRefreshFees} style={styles.refreshButton}>
            <RefreshCw size={16} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.speedOptions}>
        {speedOptions.map((option) => (
          <SpeedOptionButton
            key={option.id}
            option={option}
            isSelected={selectedSpeed === option.id}
            onPress={() => onSpeedChange(option.id as SpeedTier)}
            disabled={isLoadingFees}
          />
        ))}

        <SpeedOptionButton
          key="custom-fee"
          option={{
            id    : 'custom',
            label : 'Custom Fee',
            fee   : customFee ? {
              sats : customFee.totalSats
            } : undefined,
            feeRate : customFee?.feeRate
          }}
          isSelected={selectedSpeed === 'custom'}
          onPress={() => onSpeedChange('custom')}
          disabled={isLoadingFees}
        />
      </View>

      {selectedSpeed === 'custom' && (
        <TouchableOpacity
          style={styles.customFeeButton}
          onPress={onCustomFeePress}
          disabled={isLoadingFees}
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
        pendingInput={pendingInput}
        feeError={feeError}
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
  titleContainer : {
    flexDirection : 'row',
    alignItems    : 'center',
  },
  speedTitle : {
    fontSize   : 16,
    fontWeight : '600',
  },
  loadingIndicator : {
    marginLeft : 8,
  },
  speedInfo : {
    fontSize : 14,
    color    : '#666',
  },
  errorContainer : {
    flexDirection   : 'row',
    justifyContent  : 'space-between',
    alignItems      : 'center',
    backgroundColor : '#fff5f5',
    borderRadius    : 8,
    padding         : 12,
    marginBottom    : 12,
    borderLeftWidth : 3,
    borderLeftColor : '#ff6b6b',
  },
  errorContent : {
    flexDirection : 'row',
    alignItems    : 'center',
    flex          : 1,
  },
  errorText : {
    fontSize   : 14,
    color      : '#cc4b4b',
    marginLeft : 8,
    flex       : 1,
  },
  refreshButton : {
    padding : 4,
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