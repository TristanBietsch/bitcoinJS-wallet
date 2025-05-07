import React from 'react'
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'

interface PrimaryActionButtonProps {
  onPress: () => void
  label: string
  style?: ViewStyle
  textStyle?: TextStyle
  disabled?: boolean
}

/**
 * A primary action button with consistent styling
 */
const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  onPress,
  label,
  style,
  textStyle,
  disabled = false
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        style,
        disabled && styles.disabledButton
      ]} 
      onPress={onPress}
      disabled={disabled}
    >
      <ThemedText style={[ styles.buttonText, textStyle ]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button : {
    backgroundColor : Colors.light.buttons.primary,
    paddingVertical : 16,
    borderRadius    : 30,
    alignItems      : 'center',
    width           : '100%',
  },
  buttonText : {
    color      : Colors.light.buttons.text,
    fontSize   : 16,
    fontWeight : 'bold',
  },
  disabledButton : {
    opacity : 0.6,
  }
})

export default PrimaryActionButton 