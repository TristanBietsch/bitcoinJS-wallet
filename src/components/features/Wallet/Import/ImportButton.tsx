import React from 'react'
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'

interface ImportButtonProps {
  onPress: () => void
  disabled: boolean
  isLoading?: boolean
}

/**
 * Standardized import button component
 */
const ImportButton: React.FC<ImportButtonProps> = ({ onPress, disabled, isLoading = false }) => {
  const buttonOpacity = disabled ? 0.5 : 1
  
  return (
    <TouchableOpacity 
      style={[
        styles.button,
        { opacity: buttonOpacity }
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={Colors.light.buttons.text} />
      ) : (
        <ThemedText style={styles.buttonText}>
          Import
        </ThemedText>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button : {
    backgroundColor : Colors.light.buttons.primary,
    width           : '100%',
    borderRadius    : 30,
    paddingVertical : 16,
    alignItems      : 'center',
  },
  buttonText : {
    color      : Colors.light.buttons.text,
    fontSize   : 16,
    fontWeight : 'bold',
  }
})

export default ImportButton 