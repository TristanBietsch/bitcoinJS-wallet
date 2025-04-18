import React from 'react'
import { View, StyleSheet, ViewStyle, Platform } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface JsonViewerProps {
  data: string | object
  style?: ViewStyle
  textStyle?: object
}

/**
 * Component to display formatted JSON data
 */
const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  style,
  textStyle
}) => {
  // Convert data to properly formatted JSON string if it's an object
  const jsonString = typeof data === 'string' 
    ? data 
    : JSON.stringify(data, null, 2)
    
  return (
    <View style={[ styles.container, style ]}>
      <ThemedText style={[ styles.text, textStyle ]}>
        {jsonString}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    width           : '100%',
    padding         : 16,
    backgroundColor : '#F5F5F5',
    borderRadius    : 8,
    marginBottom    : 24
  },
  text : {
    fontFamily : Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize   : 14,
    color      : '#333'
  }
})

export default JsonViewer 