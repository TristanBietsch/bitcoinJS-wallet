import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
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

interface ConfirmSeedWordsScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function ConfirmSeedWordsScreen({ onComplete, onBack }: ConfirmSeedWordsScreenProps) {
  const [ selectedWords, setSelectedWords ] = useState<string[]>([])
  const [ availableWords, setAvailableWords ] = useState<string[]>([])
  const [ isVerified, setIsVerified ] = useState(false)
  
  // Shuffle and set available words
  useEffect(() => {
    const shuffled = [ ...MOCK_SEED_PHRASE ].sort(() => Math.random() - 0.5)
    setAvailableWords(shuffled)
  }, [])
  
  const handleWordSelect = (word: string) => {
    setSelectedWords([ ...selectedWords, word ])
    setAvailableWords(availableWords.filter(w => w !== word))
    
    // Check if all words are correctly selected
    if (selectedWords.length === MOCK_SEED_PHRASE.length - 1) {
      // Last word being selected
      const updatedSelected = [ ...selectedWords, word ]
      const isCorrect = updatedSelected.every((w, i) => w === MOCK_SEED_PHRASE[i])
      setIsVerified(isCorrect)
    }
  }
  
  const handleWordRemove = (index: number) => {
    const word = selectedWords[index]
    const newSelectedWords = [ ...selectedWords ]
    newSelectedWords.splice(index, 1)
    setSelectedWords(newSelectedWords)
    setAvailableWords([ ...availableWords, word ])
    setIsVerified(false)
  }
  
  const handleReset = () => {
    setSelectedWords([])
    setAvailableWords([ ...MOCK_SEED_PHRASE ].sort(() => Math.random() - 0.5))
    setIsVerified(false)
  }
  
  const handleComplete = () => {
    if (isVerified) {
      onComplete()
    }
  }
  
  // Calculate button style
  const buttonStyle = {
    ...styles.confirmButton,
    ...(isVerified ? {} : { opacity: 0.5 }),
  }
  
  return (
    <OnboardingContainer>
      <BackButton onPress={onBack} />
      
      <View style={styles.content}>
        <ThemedText style={styles.title}>
          Verify Your Backup
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Select the words in the correct order to verify your backup
        </ThemedText>
        
        {/* Selected Words Container */}
        <View style={styles.selectedWordsContainer}>
          {Array.from({ length: 12 }).map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.wordSlot,
                selectedWords[index] ? styles.wordSlotFilled : {}
              ]}
              onPress={() => selectedWords[index] && handleWordRemove(index)}
              disabled={!selectedWords[index]}
            >
              {selectedWords[index] ? (
                <ThemedText style={styles.selectedWord}>
                  {selectedWords[index]}
                </ThemedText>
              ) : (
                <ThemedText style={styles.wordPlaceholder}>
                  {index + 1}
                </ThemedText>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Available Words Container */}
        <View style={styles.availableWordsContainer}>
          {availableWords.map((word, index) => (
            <TouchableOpacity
              key={index}
              style={styles.availableWord}
              onPress={() => handleWordSelect(word)}
              disabled={selectedWords.length >= 12}
            >
              <ThemedText>
                {word}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={handleReset}
          disabled={selectedWords.length === 0}
        >
          <ThemedText style={[
            styles.resetButtonText,
            selectedWords.length === 0 && { opacity: 0.5 }
          ]}>
            Reset
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <OnboardingButton
        label="Confirm"
        onPress={handleComplete}
        style={buttonStyle}
      />
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  content : {
    flex              : 1,
    alignItems        : 'center',
    paddingHorizontal : 16,
    marginTop         : 60,
  },
  title : {
    fontSize     : 28,
    fontWeight   : 'bold',
    textAlign    : 'center',
    marginBottom : 10,
  },
  subtitle : {
    fontSize     : 16,
    textAlign    : 'center',
    marginBottom : 30,
  },
  selectedWordsContainer : {
    flexDirection   : 'row',
    flexWrap        : 'wrap',
    justifyContent  : 'center',
    backgroundColor : '#F5F5F5',
    borderRadius    : 16,
    padding         : 16,
    width           : '100%',
    marginBottom    : 20,
  },
  wordSlot : {
    width           : '45%',
    height          : 40,
    backgroundColor : '#E0E0E0',
    borderRadius    : 8,
    justifyContent  : 'center',
    alignItems      : 'center',
    margin          : 5,
  },
  wordSlotFilled : {
    backgroundColor : '#FFF',
  },
  selectedWord : {
    fontSize : 16,
  },
  wordPlaceholder : {
    opacity : 0.5,
  },
  availableWordsContainer : {
    flexDirection  : 'row',
    flexWrap       : 'wrap',
    justifyContent : 'center',
    marginBottom   : 20,
  },
  availableWord : {
    backgroundColor   : '#F5F5F5',
    paddingHorizontal : 16,
    paddingVertical   : 8,
    borderRadius      : 16,
    margin            : 4,
  },
  resetButton : {
    marginTop       : 10,
    paddingVertical : 8,
  },
  resetButtonText : {
    color    : Colors.light.buttons.primary,
    fontSize : 16,
  },
  confirmButton : {
    backgroundColor : Colors.light.buttons.primary,
    marginBottom    : 30,
    width           : '100%',
  },
  buttonDisabled : {
    opacity : 0.5,
  }
}) 