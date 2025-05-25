import React, { ReactNode } from 'react'
import { View, StyleSheet, SafeAreaView } from 'react-native'

interface OnboardingContainerProps {
  children: ReactNode;
}

export default function OnboardingContainer({ children }: OnboardingContainerProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : '#FFFFFF',
  },
  content : {
    flex              : 1,
    paddingHorizontal : 24,
    paddingVertical   : 16,
    justifyContent    : 'space-between',
  },
}) 