import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface ErrorInfoDisplayProps {
  errorCode: string
  additionalInfo?: Record<string, string | number>
  style?: ViewStyle
}

/**
 * Component to display error code and additional information
 */
const ErrorInfoDisplay: React.FC<ErrorInfoDisplayProps> = ({
  errorCode,
  additionalInfo = {},
  style
}) => {
  return (
    <View style={[ styles.container, style ]}>
      <View style={styles.infoRow}>
        <ThemedText style={styles.infoLabel}>Error code</ThemedText>
        <ThemedText style={styles.infoValue}>{errorCode}</ThemedText>
      </View>
      
      {/* Display any additional information pairs */}
      {Object.entries(additionalInfo).map(([ key, value ]) => (
        <View key={key} style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>{key}</ThemedText>
          <ThemedText style={styles.infoValue}>{value}</ThemedText>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    width        : '100%',
    marginBottom : 20
  },
  infoRow : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    marginBottom   : 8,
    width          : '100%'
  },
  infoLabel : {
    fontSize : 16,
    opacity  : 0.7
  },
  infoValue : {
    fontSize   : 16,
    fontWeight : 'bold'
  }
})

export default ErrorInfoDisplay 