import React, { ReactNode } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { ThemedText } from './Text'
import { ArrowRight } from 'lucide-react-native'
import { BackButton } from './Navigation/BackButton'
import { Colors } from '@/src/constants/colors'
import { OnboardingContainer, OnboardingTitle } from './OnboardingScreen'

interface OnboardingWarningScreenProps {
  title: string;
  onComplete: () => void;
  onBack: () => void;
  children: ReactNode;
  canContinue?: boolean;
  continueButtonText?: string;
}

export const OnboardingWarningScreen: React.FC<OnboardingWarningScreenProps> = ({
  title,
  onComplete,
  onBack,
  children,
  canContinue = true,
  continueButtonText = 'I Understand'
}) => {
  return (
    <OnboardingContainer>
      <BackButton onPress={onBack} />
      
      <View style={styles.content}>
        <OnboardingTitle style={{ marginTop: 200 }}>
          {title}
        </OnboardingTitle>
        
        <View style={styles.warningContainer}>
          {children}
        </View>
      </View>
      
      <TouchableOpacity 
        style={[ styles.nextButton, !canContinue && styles.nextButtonDisabled ]} 
        onPress={onComplete}
        disabled={!canContinue}
      >
        <View style={styles.buttonContent}>
          <ThemedText style={styles.buttonText}>
            {continueButtonText}
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