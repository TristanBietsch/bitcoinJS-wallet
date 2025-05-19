import React from 'react'
import { View, StyleSheet } from 'react-native'

interface ConfettiAnimationProps {
  autoPlay?: boolean;
}

export default function ConfettiAnimation({ autoPlay: _autoPlay = false }: ConfettiAnimationProps) {
  // This is a mock implementation
  // In a real app, you'd use something like lottie-react-native
  
  return (
    <View style={styles.container}>
      {/* Confetti animation would go here */}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    position      : 'absolute',
    top           : 0,
    left          : 0,
    right         : 0,
    bottom        : 0,
    pointerEvents : 'none',
  },
}) 