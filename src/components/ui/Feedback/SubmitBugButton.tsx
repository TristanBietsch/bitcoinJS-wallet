import React from 'react'
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { shareContent } from '@/src/utils/file/fileSharing'

interface SubmitBugButtonProps {
  errorCode: string
  errorData: string | object
  buttonText?: string
  style?: ViewStyle
  textStyle?: TextStyle
}

/**
 * Component to create a submit bug button with error reporting functionality
 */
const SubmitBugButton: React.FC<SubmitBugButtonProps> = ({
  errorCode,
  errorData,
  buttonText = 'Submit Bug',
  style,
  textStyle
}) => {
  // Handle bug submission
  const handleSubmitBug = async () => {
    try {
      // Format data as string if it's an object
      const errorDataString = typeof errorData === 'string' 
        ? errorData 
        : JSON.stringify(errorData, null, 2)
      
      // Open email client with pre-filled bug report
      await shareContent(
        `Bug Report - ${errorCode}\n\nError Details:\n${errorDataString}\n\nPlease describe what you were doing when this error occurred:`,
        'Bug Report'
      )
    } catch (error) {
      console.error('Error submitting bug:', error)
    }
  }
  
  return (
    <TouchableOpacity 
      style={[ styles.button, style ]}
      onPress={handleSubmitBug}
    >
      <ThemedText style={[ styles.buttonText, textStyle ]}>
        {buttonText}
      </ThemedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button : {
    width           : '100%',
    padding         : 16,
    backgroundColor : '#2196F3', // Blue color for bug submission
    borderRadius    : 8,
    alignItems      : 'center',
    marginTop       : 'auto',
    marginBottom    : 20
  },
  buttonText : {
    color      : '#FFFFFF',
    fontSize   : 18,
    fontWeight : 'bold'
  }
})

export default SubmitBugButton 