import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'

interface BackButtonProps {
  onPress: () => void
  accessibilityLabel?: string
}

export const BackButton = ({ onPress, accessibilityLabel }: BackButtonProps) => (
  <TouchableOpacity 
    style={styles.backButton} 
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
  >
    <ChevronLeft size={24} color="black" />
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
}) 