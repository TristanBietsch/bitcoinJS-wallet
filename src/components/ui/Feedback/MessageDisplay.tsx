import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface MessageDisplayProps {
  title: string
  subtitle?: string
  maxWidth?: number | string
  titleStyle?: object
  subtitleStyle?: object
  style?: ViewStyle
}

/**
 * A reusable component for displaying a title and optional subtitle
 */
const MessageDisplay: React.FC<MessageDisplayProps> = ({
  title,
  subtitle,
  maxWidth = '80%',
  titleStyle,
  subtitleStyle,
  style
}) => {
  return (
    <View style={[ styles.container, style ]}>
      <ThemedText style={[ styles.title, titleStyle ]}>
        {title}
      </ThemedText>
      
      {subtitle && (
        <ThemedText style={[ 
          styles.subtitle, 
          { maxWidth }, 
          subtitleStyle 
        ]}>
          {subtitle}
        </ThemedText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    alignItems   : 'center',
    marginBottom : 48,
  },
  title : {
    fontSize     : 32,
    fontWeight   : '600',
    marginBottom : 12,
  },
  subtitle : {
    fontSize  : 16,
    color     : '#666',
    textAlign : 'center',
  },
})

export default MessageDisplay 