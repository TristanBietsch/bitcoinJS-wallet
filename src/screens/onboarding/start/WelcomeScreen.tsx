import React from 'react'
import { View, StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ThemedText } from '@/src/components/ThemedText'
import { ThemedView } from '@/src/components/ThemedView'

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {/* TODO: Replace with actual logo */}
          <View style={styles.logoPlaceholder} />
        </View>

        <ThemedText type="title" style={styles.title}>
          Welcome to Nummus
        </ThemedText>
        
        <ThemedText type="default" style={styles.description}>
          Your secure Bitcoin wallet for everyday transactions. Simple, safe, and always in your control.
        </ThemedText>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <ThemedText type="defaultSemiBold">🔒 Self-Custodial</ThemedText>
            <ThemedText type="default" style={styles.featureDescription}>
              You have full control of your funds
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <ThemedText type="defaultSemiBold">⚡️ Lightning-Fast</ThemedText>
            <ThemedText type="default" style={styles.featureDescription}>
              Send and receive Bitcoin instantly
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <ThemedText type="defaultSemiBold">🛡️ Secure by Design</ThemedText>
            <ThemedText type="default" style={styles.featureDescription}>
              Built with the latest security standards
            </ThemedText>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={onGetStarted}>
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          Get Started
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container : {
    flex    : 1,
    padding : 20,
  },
  content : {
    flex           : 1,
    alignItems     : 'center',
    justifyContent : 'center',
  },
  logoContainer : {
    marginBottom : 40,
  },
  logoPlaceholder : {
    width           : 120,
    height          : 120,
    backgroundColor : '#f5f5f5',
    borderRadius    : 60,
  },
  title : {
    fontSize     : 32,
    fontWeight   : 'bold',
    marginBottom : 16,
    textAlign    : 'center',
  },
  description : {
    fontSize          : 16,
    textAlign         : 'center',
    marginBottom      : 48,
    opacity           : 0.7,
    paddingHorizontal : 20,
  },
  features : {
    width : '100%',
    gap   : 24,
  },
  featureItem : {
    backgroundColor : '#f8f9fa',
    padding         : 16,
    borderRadius    : 12,
  },
  featureDescription : {
    marginTop : 4,
    opacity   : 0.7,
  },
  button : {
    backgroundColor : '#000',
    padding         : 16,
    borderRadius    : 12,
    alignItems      : 'center',
    width           : '100%',
  },
  buttonText : {
    color    : '#fff',
    fontSize : 16,
  },
}) 