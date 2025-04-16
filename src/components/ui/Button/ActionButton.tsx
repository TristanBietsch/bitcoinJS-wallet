import React from 'react'
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface ActionButtonProps {
  onPress: () => void
  title: string
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  backgroundColor?: string
  accessibilityLabel?: string
}

/**
 * A reusable action button component with consistent styling
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  onPress,
  title,
  disabled = false,
  loading = false,
  style,
  textStyle,
  backgroundColor = '#FF0000',
  accessibilityLabel
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button,
        { backgroundColor },
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <ThemedText style={[ styles.buttonText, textStyle ]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button : {
    borderRadius   : 12,
    height         : 56,
    justifyContent : 'center',
    alignItems     : 'center',
  },
  buttonDisabled : {
    opacity : 0.5,
  },
  buttonText : {
    color      : '#fff',
    fontSize   : 16,
    fontWeight : '600',
  },
})

export default ActionButton 