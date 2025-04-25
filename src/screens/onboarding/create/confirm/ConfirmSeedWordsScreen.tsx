import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import OnboardingButton from '@/src/components/ui/Button/OnboardingButton'
import { Colors } from '@/src/constants/colors'
import { RefreshCw } from 'lucide-react-native'

// Mock seed phrase for demonstration
const MOCK_SEED_PHRASE = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent',
  'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'
]

interface ConfirmSeedWordsScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

interface SelectedWord {
  word: string;
  order: number;
}

export default function ConfirmSeedWordsScreen({ onComplete, onBack }: ConfirmSeedWordsScreenProps) {
  const [ shuffledWords, setShuffledWords ] = useState<string[]>([])
  const [ selectedWords, setSelectedWords ] = useState<SelectedWord[]>([])
  
  // Shuffle words on component mount
  useEffect(() => {
    const shuffled = [ ...MOCK_SEED_PHRASE ].sort(() => Math.random() - 0.5)
    setShuffledWords(shuffled)
  }, [])
  
  const handleWordSelect = (word: string) => {
    // Check if word is already selected
    const isSelected = selectedWords.some(item => item.word === word)
    
    if (isSelected) {
      // If already selected, do nothing
      return
    }
    
    if (selectedWords.length < 12) {
      // Add word with current selection order
      const newSelection: SelectedWord = {
        word  : word,
        order : selectedWords.length + 1
      }
      
      setSelectedWords([ ...selectedWords, newSelection ])
    }
  }
  
  const getSelectionOrder = (word: string): number | null => {
    const selected = selectedWords.find(item => item.word === word)
    return selected ? selected.order : null
  }
  
  const resetSelection = () => {
    setSelectedWords([])
  }
  
  return (
    <OnboardingContainer>
      <BackButton onPress={onBack} />
      
      <View style={styles.content}>
        <ThemedText style={styles.title}>
          Verify Your Backup
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Select the words in the correct order of your seed phrase
        </ThemedText>
        
        {/* Word Grid */}
        <View style={styles.wordsContainer}>
          {shuffledWords.map((word, index) => {
            const selectionOrder = getSelectionOrder(word)
            const isSelected = selectionOrder !== null
            
            return (
              <TouchableOpacity
                key={index}
                style={styles.wordItem}
                onPress={() => handleWordSelect(word)}
                disabled={selectedWords.length >= 12 && !isSelected}
              >
                <ThemedText style={styles.wordText}>
                  {word}
                </ThemedText>
                
                {isSelected && (
                  <View style={styles.selectionOverlay}>
                    <Text style={styles.selectionOrderText}>
                      {selectionOrder}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
        
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={resetSelection}
          disabled={selectedWords.length === 0}
        >
          {selectedWords.length > 0 && (
            <View style={styles.resetButtonContent}>
              <RefreshCw 
                size={16} 
                color={Colors.light.buttons.primary} 
                style={styles.resetIcon}
              />
              <ThemedText style={styles.resetButtonText}>
                Reset
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <OnboardingButton
        label="Confirm"
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
    paddingHorizontal : 16,
    marginTop         : 60,
  },
  title : {
    fontSize     : 28,
    fontWeight   : 'bold',
    textAlign    : 'center',
    marginTop    : 110,
    marginBottom : 10,
  },
  subtitle : {
    fontSize     : 16,
    textAlign    : 'center',
    marginBottom : 90,
  },
  wordsContainer : {
    flexDirection  : 'row',
    flexWrap       : 'wrap',
    justifyContent : 'center',
    width          : '100%',
    marginBottom   : 20,
  },
  wordItem : {
    backgroundColor   : '#F5F5F5',
    paddingHorizontal : 16,
    paddingVertical   : 12,
    borderRadius      : 16,
    margin            : 6,
    position          : 'relative',
    minWidth          : '28%',
    alignItems        : 'center',
  },
  wordText : {
    fontSize : 16,
  },
  selectionOverlay : {
    position        : 'absolute',
    top             : 0,
    left            : 0,
    right           : 0,
    bottom          : 0,
    backgroundColor : 'rgba(0, 0, 0, 0.85)',
    borderRadius    : 16,
    justifyContent  : 'center',
    alignItems      : 'center',
  },
  selectionOrderText : {
    color      : '#FFFFFF',
    fontSize   : 18,
    fontWeight : 'bold',
  },
  resetButton : {
    marginTop       : 20,
    paddingVertical : 8,
  },
  resetButtonContent : {
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'center',
  },
  resetIcon : {
    marginRight : 4,
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
}) 