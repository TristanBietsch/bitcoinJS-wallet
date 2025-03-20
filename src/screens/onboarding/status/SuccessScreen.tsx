import React from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';

interface SuccessScreenProps {
  onComplete: () => void;
  message?: string;
}

export default function SuccessScreen({ 
  onComplete, 
  message = "You're all set! Your Bitcoin wallet is ready to use."
}: SuccessScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Success!
      </ThemedText>
      <ThemedText type="default" style={styles.message}>
        {message}
      </ThemedText>

      <TouchableOpacity style={styles.button} onPress={onComplete}>
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          Continue
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