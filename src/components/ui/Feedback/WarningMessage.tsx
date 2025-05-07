import React, { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { AlertCircle } from 'lucide-react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface WarningMessageProps {
  message: string
  icon?: ReactNode
  iconSize?: number
  iconColor?: string
  style?: ViewStyle
  textStyle?: TextStyle
}

/**
 * A reusable component for displaying warning messages with an icon
 */
const WarningMessage: React.FC<WarningMessageProps> = ({
  message,
  icon,
  iconSize = 18,
  iconColor = '#E8AB2F', // Amber warning color
  style,
  textStyle
}) => {
  return (
    <View style={[ styles.container, style ]}>
      {icon || (
        <AlertCircle size={iconSize} color={iconColor} />
      )}
      <ThemedText style={[ styles.warningText, textStyle ]}>
        {message}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flexDirection     : 'row',
    alignItems        : 'center',
    marginTop         : 20,
    paddingHorizontal : 20,
  },
  warningText : {
    fontSize   : 14,
    marginLeft : 8,
    color      : '#E8AB2F', // Amber warning color
  }
})

export default WarningMessage 