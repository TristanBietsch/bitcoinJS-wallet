/**
 * Screen that displays detailed error information
 * TODO: This screen needs to be completed once the required dependencies are implemented
 */
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Colors } from '@/src/constants/colors'

export default function SendErrorDetailsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Error Details</Text>
      <Text style={styles.subtitle}>This screen is under development</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    justifyContent  : 'center',
    alignItems      : 'center',
    backgroundColor : Colors.light.background,
  },
  title : {
    fontSize     : 24,
    fontWeight   : 'bold',
    color        : Colors.light.text,
    marginBottom : 16,
  },
  subtitle : {
    fontSize : 16,
    color    : Colors.light.text,
  },
})
