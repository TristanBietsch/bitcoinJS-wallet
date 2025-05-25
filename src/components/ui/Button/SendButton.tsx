import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'

type SendButtonProps = {
  onPress: () => void
  label?: string
}

/**
 * Reusable send button component with standard styling
 */
export const SendButton = ({ onPress, label = 'Send' }: SendButtonProps) => {
  return (
    <TouchableOpacity 
      style={styles.sendButton}
      onPress={onPress}
    >
      <ThemedText style={styles.sendButtonText}>{label}</ThemedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  sendButton : {
    position        : 'absolute',
    bottom          : 40,
    left            : 20,
    right           : 20,
    height          : 56,
    backgroundColor : Colors.light.buttons.primary,
    borderRadius    : 28,
    alignItems      : 'center',
    justifyContent  : 'center'
  },
  sendButtonText : {
    color      : Colors.light.buttons.text,
    fontSize   : 16,
    fontWeight : '600'
  }
})

export default SendButton 