import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface SecurityWarningProps {
  title?: string  // Optional title with default value
  message: string  // Required message
}

const SecurityWarning: React.FC<SecurityWarningProps> = ({
  title = 'Please note:',
  message
}) => {
  return (
    <View style={styles.warningContainer}>
      <Text style={styles.warningHeaderText}>{title}</Text>
      <Text style={styles.warningText}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  warningContainer : {
    backgroundColor : '#FFF9C4',
    padding         : 20,
    borderRadius    : 8,
    marginTop       : 'auto',
    marginBottom    : 20,
    width           : '100%',
  },
  warningHeaderText : {
    fontWeight   : 'bold',
    marginBottom : 8,
    fontSize     : 16,
  },
  warningText : {
    fontSize   : 14,
    lineHeight : 20,
  }
})

export default SecurityWarning 