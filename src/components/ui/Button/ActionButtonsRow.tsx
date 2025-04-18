import React from 'react'
import { View, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'

interface ActionButton {
  label: string
  onPress: () => void
  isActive?: boolean
}

interface ActionButtonsRowProps {
  buttons: ActionButton[]
  style?: ViewStyle
  buttonStyle?: ViewStyle
  textStyle?: TextStyle
  activeButtonStyle?: ViewStyle
  activeTextStyle?: TextStyle
}

/**
 * Component to display a row of action buttons
 */
const ActionButtonsRow: React.FC<ActionButtonsRowProps> = ({
  buttons,
  style,
  buttonStyle,
  textStyle,
  activeButtonStyle,
  activeTextStyle
}) => {
  return (
    <View style={[ styles.container, style ]}>
      {buttons.map((button, index) => (
        <TouchableOpacity 
          key={`btn-${index}-${button.label}`}
          style={[
            styles.button,
            buttonStyle,
            button.isActive && styles.activeButton,
            button.isActive && activeButtonStyle
          ]}
          onPress={button.onPress}
        >
          <ThemedText 
            style={[
              styles.buttonText,
              textStyle,
              button.isActive && styles.activeButtonText,
              button.isActive && activeTextStyle
            ]}
          >
            {button.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    width          : '100%',
    marginBottom   : 40
  },
  button : {
    paddingVertical   : 10,
    paddingHorizontal : 20,
    borderWidth       : 1,
    borderColor       : '#E0E0E0',
    borderRadius      : 8,
    backgroundColor   : '#FFFFFF',
    flex              : 1,
    marginHorizontal  : 4,
    alignItems        : 'center'
  },
  buttonText : {
    fontSize : 16,
    color    : '#333'
  },
  activeButton : {
    backgroundColor : Colors.light.buttons.success,
    borderColor     : Colors.light.buttons.success
  },
  activeButtonText : {
    color : Colors.light.buttons.text
  }
})

export default ActionButtonsRow 