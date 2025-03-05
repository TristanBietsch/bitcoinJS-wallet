import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function WaitlistScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <ThemedText type="title">Waitlist Screen</ThemedText>
        <ThemedText type="default">
          Join our waitlist for early access.
        </ThemedText>
        <ThemedText type="default" style={styles.content}>
          Sign up to be notified when we launch.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCE4EC',
    paddingBottom: 100,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    marginTop: 10,
    textAlign: 'center',
  },
}); 