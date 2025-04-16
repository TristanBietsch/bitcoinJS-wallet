import React from 'react'
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'

interface ActionButtonGroupProps {
  primaryText: string
  secondaryText?: string
  onPrimaryPress: () => void
  onSecondaryPress?: () => void
  style?: ViewStyle
}

/**
 * A component that renders a primary and optional secondary action button
 */
const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  primaryText,
  secondaryText,
  onPrimaryPress,
  onSecondaryPress,
  style
}) => {
  return (
    <View style={[ styles.buttonContainer, style ]}>
      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={onPrimaryPress}
      >
        <ThemedText style={styles.primaryButtonText}>{primaryText}</ThemedText>
      </TouchableOpacity>

      {secondaryText && onSecondaryPress && (
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={onSecondaryPress}
        >
          <ThemedText style={styles.secondaryButtonText}>{secondaryText}</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  buttonContainer : {
    width : '100%',
    gap   : 12,
  },
  primaryButton : {
    width           : '100%',
    height          : 56,
    backgroundColor : Colors.light.electricBlue,
    borderRadius    : 28,
    alignItems      : 'center',
    justifyContent  : 'center',
  },
  primaryButtonText : {
    color      : '#FFF',
    fontSize   : 16,
    fontWeight : '600',
  },
  secondaryButton : {
    width          : '100%',
    height         : 48,
    alignItems     : 'center',
    justifyContent : 'center',
  },
  secondaryButtonText : {
    color      : Colors.light.electricBlue,
    fontSize   : 16,
    fontWeight : '600',
  },
})

export default ActionButtonGroup 