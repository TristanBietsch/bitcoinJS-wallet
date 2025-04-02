import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ThemedText } from '@/src/components/common/ThemedText'
import { ThemedView } from '@/src/components/common/ThemedView'

interface SeedPhraseWarningScreenProps {
  onComplete: () => void;
}

export default function SeedPhraseWarningScreen({ onComplete }: SeedPhraseWarningScreenProps) {
  const [ hasConfirmed, setHasConfirmed ] = useState(false)

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Important Warning
      </ThemedText>
      <ThemedText type="default" style={styles.subtitle}>
        Please read carefully before proceeding
      </ThemedText>

      <View style={styles.warningContainer}>
        <View style={styles.warningItem}>
          <ThemedText type="defaultSemiBold">Your Seed Phrase is Critical</ThemedText>
          <ThemedText type="default" style={styles.warningDescription}>
            If you lose your seed phrase, you will permanently lose access to your funds
          </ThemedText>
        </View>

        <View style={styles.warningItem}>
          <ThemedText type="defaultSemiBold">Keep it Safe</ThemedText>
          <ThemedText type="default" style={styles.warningDescription}>
            Write down your seed phrase and store it in a secure location
          </ThemedText>
        </View>

        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={() => setHasConfirmed(!hasConfirmed)}
        >
          <View style={styles.checkboxContainer}>
            <View style={[ styles.checkbox, hasConfirmed && styles.checkboxChecked ]} />
            <ThemedText type="default" style={styles.checkboxText}>
              I understand that if I lose my seed phrase, I will lose access to my funds
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[ styles.button, !hasConfirmed && styles.buttonDisabled ]} 
        onPress={onComplete}
        disabled={!hasConfirmed}
      >
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          I Understand
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
  title : {
    fontSize     : 28,
    fontWeight   : 'bold',
    marginBottom : 10,
    textAlign    : 'center',
  },
  subtitle : {
    textAlign    : 'center',
    marginBottom : 40,
    opacity      : 0.7,
  },
  warningContainer : {
    gap          : 20,
    marginBottom : 40,
  },
  warningItem : {
    padding         : 16,
    backgroundColor : '#fff3f3',
    borderRadius    : 12,
    borderWidth     : 1,
    borderColor     : '#ffcdd2',
  },
  warningDescription : {
    opacity   : 0.7,
    marginTop : 4,
  },
  confirmButton : {
    marginTop : 20,
  },
  checkboxContainer : {
    flexDirection : 'row',
    alignItems    : 'center',
    gap           : 12,
  },
  checkbox : {
    width        : 24,
    height       : 24,
    borderRadius : 6,
    borderWidth  : 2,
    borderColor  : '#000',
  },
  checkboxChecked : {
    backgroundColor : '#000',
  },
  checkboxText : {
    flex : 1,
  },
  button : {
    backgroundColor : '#000',
    padding         : 16,
    borderRadius    : 12,
    alignItems      : 'center',
    marginTop       : 'auto',
  },
  buttonDisabled : {
    opacity : 0.5,
  },
  buttonText : {
    color    : '#fff',
    fontSize : 16,
  },
}) 