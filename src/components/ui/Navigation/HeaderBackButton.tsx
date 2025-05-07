import React from 'react'
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'

interface HeaderBackButtonProps {
  onPress: () => void
  style?: ViewStyle
  color?: string
  size?: number
}

/**
 * A header back button component with consistent styling
 */
export const HeaderBackButton: React.FC<HeaderBackButtonProps> = ({
  onPress,
  style,
  color = 'black',
  size = 24
}) => {
  return (
    <TouchableOpacity 
      style={[ styles.backButton, style ]} 
      onPress={onPress}
      accessibilityLabel="Go back"
    >
      <ChevronLeft size={size} color={color} />
    </TouchableOpacity>
  )
}

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
  }
})

export default HeaderBackButton 