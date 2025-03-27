import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ThemedText'
import { Turtle, Squirrel, Rabbit } from 'lucide-react-native'
import { SpeedOption } from '@/src/types/transaction/send.types'

interface SpeedOptionButtonProps {
  option: SpeedOption
  isSelected: boolean
  onPress: () => void
}

export const SpeedOptionButton: React.FC<SpeedOptionButtonProps> = ({
  option,
  isSelected,
  onPress
}) => {
  const renderIcon = () => {
    switch (option.id) {
      case 'economy':
        return <Turtle size={32} color="#000" />
      case 'standard':
        return <Squirrel size={32} color="#000" />
      case 'express':
        return <Rabbit size={32} color="#000" />
      default:
        return null
    }
  }

  return (
    <TouchableOpacity
      style={[ styles.speedButton, isSelected && styles.selectedSpeed ]}
      onPress={onPress}
    >
      <View style={styles.speedLeft}>
        {renderIcon()}
        <ThemedText style={styles.speedLabel}>{option.label}</ThemedText>
      </View>
      {option.fee && (
        <View style={styles.feeInfo}>
          <ThemedText style={styles.satsAmount}>{option.fee.sats} sats</ThemedText>
          <ThemedText style={styles.usdAmount}>${option.fee.usd} USD</ThemedText>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
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
  }
}) 