import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Eye, EyeOff } from 'lucide-react-native'
import { BlurView } from 'expo-blur'
import { ThemedText } from '@/src/components/ui/Text'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import OnboardingButton from '@/src/components/ui/Button/OnboardingButton'
import { Colors } from '@/src/constants/colors'

// Mock seed phrase for demonstration
const MOCK_SEED_PHRASE = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent',
  'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'
]

interface GenerateSeedWordsProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function GenerateSeedWords({ onComplete, onBack }: GenerateSeedWordsProps) {
  const [ seedRevealed, setSeedRevealed ] = useState(false)
  
  const toggleSeedVisibility = () => {
    setSeedRevealed(!seedRevealed)
  }
  
  // Divide words into two columns
  const leftColumnWords = MOCK_SEED_PHRASE.slice(0, 6)
  const rightColumnWords = MOCK_SEED_PHRASE.slice(6, 12)
  
  return (
    <OnboardingContainer>
      <BackButton onPress={onBack} />
      
      <View style={styles.content}>
        <ThemedText style={styles.title}>
          Backup Your Seed Phrase
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Write down these 12 words in order and store them securely.
        </ThemedText>
        
        <View style={styles.seedContainer}>
          <View style={styles.seedWordsContainer}>
            <View style={styles.column}>
              {leftColumnWords.map((word, index) => (
                <View key={index} style={styles.wordRow}>
                  <ThemedText style={styles.wordText}>
                    {index + 1}. {word}
                  </ThemedText>
                </View>
              ))}
            </View>
            
            <View style={styles.column}>
              {rightColumnWords.map((word, index) => (
                <View key={index} style={styles.wordRow}>
                  <ThemedText style={styles.wordText}>
                    {index + 7}. {word}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
          
          {!seedRevealed && (
            <TouchableOpacity 
              style={styles.revealOverlay} 
              activeOpacity={0.9}
              onPress={toggleSeedVisibility}
            >
              <BlurView intensity={70} tint="light" style={styles.revealBlur} />
              <View style={styles.tapToRevealContainer}>
                <View style={styles.revealContentRow}>
                  <Eye size={24} color="#222" />
                  <ThemedText style={styles.tapText}>
                    Tap To Reveal
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
        
        {seedRevealed && (
          <TouchableOpacity 
            style={styles.hideButton} 
            onPress={toggleSeedVisibility}
          >
            <EyeOff size={20} color="#000" />
            <ThemedText style={styles.hideButtonText}>Tap To Hide</ThemedText>
          </TouchableOpacity>
        )}
      </View>
      
      <OnboardingButton
        label="Verify Backup"
        onPress={onComplete}
        style={styles.confirmButton}
      />
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  content : {
    flex              : 1,
    alignItems        : 'center',
    paddingHorizontal : 20,
    marginTop         : 30,
  },
  title : {
    fontSize     : 32,
    fontWeight   : 'bold',
    textAlign    : 'center',
    marginBottom : 10,
    marginTop    : 120,
  },
  subtitle : {
    fontSize          : 16,
    textAlign         : 'center',
    marginBottom      : 40,
    paddingHorizontal : 20,
  },
  seedContainer : {
    backgroundColor : '#F5F5F5',
    borderRadius    : 20,
    width           : '100%',
    padding         : 20,
    minHeight       : 320,
    position        : 'relative',
    overflow        : 'hidden',
  },
  revealOverlay : {
    position       : 'absolute',
    top            : 0,
    left           : 0,
    right          : 0,
    bottom         : 0,
    justifyContent : 'center',
    alignItems     : 'center',
    zIndex         : 1,
  },
  revealBlur : {
    position : 'absolute',
    top      : 0,
    left     : 0,
    right    : 0,
    bottom   : 0,
  },
  tapToRevealContainer : {
    alignItems     : 'center',
    justifyContent : 'center',
    height         : '100%',
    zIndex         : 2,
  },
  revealContentRow : {
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'center',
  },
  tapText : {
    fontSize   : 16,
    fontWeight : '500',
    marginLeft : 8,
  },
  seedWordsContainer : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    width          : '100%',
  },
  column : {
    width : '48%',
  },
  wordRow : {
    paddingVertical : 12,
  },
  wordText : {
    fontSize : 16,
  },
  hideButton : {
    flexDirection   : 'row',
    alignItems      : 'center',
    justifyContent  : 'center',
    marginTop       : 20,
    paddingVertical : 10,
  },
  hideButtonText : {
    marginLeft : 8,
    fontSize   : 16,
    fontWeight : '500',
  },
  confirmButton : {
    backgroundColor : Colors.light.buttons.primary,
    marginBottom    : 50,
    width           : '100%',
  }
})
