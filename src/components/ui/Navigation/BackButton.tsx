import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'

interface BackButtonProps {
  onPress: () => void
  accessibilityLabel?: string
  disabled?: boolean
}

export const BackButton = ({ onPress, accessibilityLabel, disabled = false }: BackButtonProps) => (
  <TouchableOpacity 
    style={[ styles.backButton, disabled && styles.disabled ]} 
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
    disabled={disabled}
  >
    <ChevronLeft size={24} color={disabled ? "#CCCCCC" : "black"} />
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  backButton : {
    position       : 'absolute',
    top            : 70,
    left           : 16,
    zIndex         : 10,
    width          : 40,
    height         : 40,
    borderRadius   : 20,
    justifyContent : 'center',
    alignItems     : 'center',
  },
  disabled : {
    opacity : 0.5,
  },
}) 