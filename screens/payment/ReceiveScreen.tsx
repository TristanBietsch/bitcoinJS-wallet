import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
export default function SendScreen() {
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Receive Bitcoin',
          headerShown: true,
        }} 
      />
      <View style={styles.container}>
        <ThemedText style={{ fontSize: 20, fontWeight: 'bold', marginTop: 100, alignSelf: 'center' }}>Receive Bitcoin Screen</ThemedText>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
}); 