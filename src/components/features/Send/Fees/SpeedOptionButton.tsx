import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Turtle, Squirrel, Rabbit } from 'lucide-react-native'
import { SpeedOption } from '@/src/types/domain/transaction'

interface SpeedOptionButtonProps {
  option: SpeedOption
  isSelected: boolean
  onPress: () => void
  disabled?: boolean
}

export const SpeedOptionButton: React.FC<SpeedOptionButtonProps> = ({
  option,
  isSelected,
  onPress,
  disabled = false
}) => {
  const renderIcon = () => {
    switch (option.id) {
      case 'economy':
        return <Turtle size={32} color={disabled ? "#ccc" : "#000"} />
      case 'standard':
        return <Squirrel size={32} color={disabled ? "#ccc" : "#000"} />
      case 'express':
        return <Rabbit size={32} color={disabled ? "#ccc" : "#000"} />
      default:
        return null
    }
  }

  return (
    <TouchableOpacity
      style={[ 
        styles.speedButton, 
        isSelected && styles.selectedSpeed,
        disabled && styles.disabledSpeed
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.speedLeft}>
        {renderIcon()}
        <View style={styles.speedLabelContainer}>
          <ThemedText style={styles.speedLabel}>{option.label}</ThemedText>
          {option.estimatedTime && (
            <ThemedText style={styles.estimatedTime}>{option.estimatedTime}</ThemedText>
          )}
        </View>
      </View>
      {option.fee && (
        <View style={styles.feeInfo}>
          <ThemedText style={styles.satsAmount}>{option.fee.sats} sats</ThemedText>
          {option.feeRate && (
            <ThemedText style={styles.feeRate}>{option.feeRate} sat/vB</ThemedText>
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  speedButton : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    alignItems     : 'center',
    borderRadius   : 12,
    padding        : 16,
    height         : 72
  },
  selectedSpeed : {
    backgroundColor : '#E5E5E5'
  },
  disabledSpeed : {
    backgroundColor : '#ccc'
  },
  speedLeft : {
    flexDirection : 'row',
    alignItems    : 'center',
    gap           : 12
  },
  speedLabelContainer : {
    flexDirection : 'column'
  },
  speedLabel : {
    fontSize   : 16,
    fontWeight : '500'
  },
  estimatedTime : {
    fontSize  : 12,
    color     : '#666',
    marginTop : 2
  },
  feeInfo : {
    alignItems : 'flex-end'
  },
  satsAmount : {
    fontSize   : 16,
    fontWeight : '500',
    color      : '#666'
  },
  feeRate : {
    fontSize  : 12,
    color     : '#999',
    marginTop : 2
  }
}) 