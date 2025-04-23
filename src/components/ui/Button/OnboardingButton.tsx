import React from 'react'
import { TouchableOpacity, View, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'
import { ArrowRight } from 'lucide-react-native'

interface OnboardingButtonProps {
  label: string
  onPress: () => void
  style?: ViewStyle
  textStyle?: TextStyle
  iconSize?: number
  iconStyle?: ViewStyle
}

/**
 * A reusable button component for onboarding flows with an arrow icon
 */
const OnboardingButton: React.FC<OnboardingButtonProps> = ({
  label,
  onPress,
  style,
  textStyle,
  iconSize = 20,
  iconStyle,
}) => {
  return (
    <TouchableOpacity 
      style={[ styles.button, style ]}
      onPress={onPress}
    >
      <View style={styles.buttonContent}>
        <ThemedText style={[ styles.buttonText, textStyle ]}>
          {label}
        </ThemedText>
        <ArrowRight 
          size={iconSize} 
          color={Colors.light.buttons.text} 
          style={[ styles.buttonIcon, iconStyle ]} 
        />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button : {
    width           : '80%',
    backgroundColor : Colors.light.buttons.primary,
    paddingVertical : 16,
    borderRadius    : 30,
    alignItems      : 'center',
    alignSelf       : 'center',
  },
  buttonContent : {
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'center',
  },
  buttonText : {
    color       : Colors.light.buttons.text,
    fontSize    : 16,
    fontWeight  : 'bold',
    marginRight : 8,
  },
  buttonIcon : {
    marginLeft : 4,
  },
})

export default OnboardingButton 