import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Switch } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { ArrowRight } from 'lucide-react-native'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import { Colors } from '@/src/constants/colors'
import { OnboardingContainer, OnboardingTitle } from '@/src/components/ui/OnboardingScreen'

interface SeedPhraseWarningScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function SeedPhraseWarningScreen({ onComplete, onBack }: SeedPhraseWarningScreenProps) {
  const [ toggle1, setToggle1 ] = useState(false)
  const [ toggle2, setToggle2 ] = useState(false)
  
  const canContinue = toggle1 && toggle2
  
  return (
    <OnboardingContainer>
      <BackButton onPress={onBack} />
      
      <View style={styles.content}>
        <OnboardingTitle style={{ marginTop: 200 }}>
          Two things you must understand
        </OnboardingTitle>
        
        <View style={styles.warningContainer}>
          <View style={styles.warningItem}>
            <View style={styles.warningRow}>
              <View style={styles.warningTextContainer}>
                <ThemedText style={styles.warningText}>
                  With bitcoin, you are your own bank. No one else has access to your private keys.
                </ThemedText>
              </View>
              <Switch
                value={toggle1}
                onValueChange={setToggle1}
                trackColor={{ false: '#E0E0E0', true: Colors.light.successGreen }}
                thumbColor={'#FFFFFF'}
              />
            </View>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.warningItem}>
            <View style={styles.warningRow}>
              <View style={styles.warningTextContainer}>
                <ThemedText style={styles.warningText}>
                  If you lose access to this app, and the backup we will help you create, your bitcoin cannot be recovered.
                </ThemedText>
              </View>
              <Switch
                value={toggle2}
                onValueChange={setToggle2}
                trackColor={{ false: '#E0E0E0', true: Colors.light.successGreen }}
                thumbColor={'#FFFFFF'}
              />
            </View>
          </View>
          
        </View>
      </View>
      
      <TouchableOpacity 
        style={[ styles.nextButton, !canContinue && styles.nextButtonDisabled ]} 
        onPress={onComplete}
        disabled={!canContinue}
      >
        <View style={styles.buttonContent}>
          <ThemedText style={styles.buttonText}>
            I Understand
          </ThemedText>
          <ArrowRight 
            size={20} 
            color="#FFFFFF" 
            style={styles.buttonIcon} 
          />
        </View>
      </TouchableOpacity>
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  content : {
    flex       : 1,
    alignItems : 'center',
    width      : '100%',
    paddingTop : 40,
  },
  warningContainer : {
    width     : '100%',
    marginTop : 40,
  },
  warningItem : {
    paddingVertical : 20,
  },
  warningRow : {
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'space-between',
  },
  warningTextContainer : {
    flex        : 1,
    marginRight : 15,
  },
  warningText : {
    fontSize   : 16,
    lineHeight : 22,
  },
  separator : {
    height          : 1,
    backgroundColor : '#E0E0E0',
    width           : '100%',
  },
  nextButton : {
    backgroundColor  : Colors.light.buttons.primary,
    paddingVertical  : 16,
    borderRadius     : 30,
    marginHorizontal : 30,
    marginBottom     : 50,
    width            : '100%',
  },
  nextButtonDisabled : {
    backgroundColor : '#CCCCCC',
  },
  buttonContent : {
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'center',
  },
  buttonText : {
    color       : '#FFFFFF',
    fontSize    : 16,
    fontWeight  : 'bold',
    marginRight : 8,
  },
  buttonIcon : {
    marginLeft : 4,
  },
}) 