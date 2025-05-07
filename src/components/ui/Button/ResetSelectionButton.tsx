import React from 'react'
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native'
import { RefreshCw } from 'lucide-react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'

interface ResetSelectionButtonProps {
  onPress: () => void
  disabled?: boolean
  iconSize?: number
  style?: ViewStyle
  label?: string
}

/**
 * A reusable button for resetting selections with a refresh icon
 */
const ResetSelectionButton: React.FC<ResetSelectionButtonProps> = ({
  onPress,
  disabled = false,
  iconSize = 16,
  style,
  label = 'Reset'
}) => {
  if (disabled) {
    return null
  }
  
  return (
    <TouchableOpacity 
      style={[ styles.resetButton, style ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.resetButtonContent}>
        <RefreshCw 
          size={iconSize} 
          color={Colors.light.buttons.primary} 
          style={styles.resetIcon}
        />
        <ThemedText style={styles.resetButtonText}>
          {label}
        </ThemedText>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  resetButton : {
    marginTop       : 20,
    paddingVertical : 8
  },
  resetButtonContent : {
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'center'
  },
  resetIcon : {
    marginRight : 4
  },
  resetButtonText : {
    color    : Colors.light.buttons.primary,
    fontSize : 16
  }
})

export default ResetSelectionButton 