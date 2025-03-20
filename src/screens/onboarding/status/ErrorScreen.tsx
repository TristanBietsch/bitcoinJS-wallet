import React from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface ErrorScreenProps {
  onRetry: () => void;
  message?: string;
}

export default function ErrorScreen({ 
  onRetry, 
  message = "Something went wrong. Please try again."
}: ErrorScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Error
      </ThemedText>
      <ThemedText type="default" style={styles.message}>
        {message}
      </ThemedText>

      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          Try Again
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#FF3B30',
  },
  message: {
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.7,
  },
  button: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
}); 