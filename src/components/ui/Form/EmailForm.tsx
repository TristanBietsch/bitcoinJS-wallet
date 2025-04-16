import React from 'react'
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { ArrowRight } from 'lucide-react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'
import useColorScheme from '@/src/hooks/ui/useColorScheme'

interface EmailFormProps {
  email: string
  setEmail: (email: string) => void
  onSubmit: () => void
  isLoading: boolean
  buttonText?: string
}

/**
 * Reusable email input form with submit button
 */
const EmailForm: React.FC<EmailFormProps> = ({
  email,
  setEmail,
  onSubmit,
  isLoading,
  buttonText = 'Submit'
}) => {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme]
  
  return (
    <View style={styles.formContainer}>
      <TextInput
        style={[
          styles.emailInput,
          { 
            color       : colors.text, 
            borderColor : colorScheme === 'light' ? Colors.light.subtleBorder : colors.text 
          }
        ]}
        placeholder="Email Address"
        placeholderTextColor={colorScheme === 'light' ? Colors.light.inactiveGray : colors.icon}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
      />
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: colorScheme === 'light' ? Colors.light.errorRed : colors.tint }
        ]}
        onPress={onSubmit}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <ThemedText style={styles.buttonText}>{buttonText}</ThemedText>
            <ArrowRight size={20} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  formContainer : {
    width     : '100%',
    marginTop : 20,
  },
  emailInput : {
    width             : '100%',
    height            : 50,
    borderWidth       : 1,
    borderRadius      : 8,
    paddingHorizontal : 15,
    fontSize          : 16,
    marginBottom      : 15,
  },
  submitButton : {
    width          : '100%',
    height         : 50,
    borderRadius   : 25,
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'center',
  },
  buttonText : {
    color       : '#FFFFFF',
    fontSize    : 16,
    fontWeight  : '600',
    marginRight : 8,
  },
})

export default EmailForm 