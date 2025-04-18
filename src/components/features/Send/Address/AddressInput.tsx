import React from 'react'
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { QrCode } from 'lucide-react-native'
import { Colors } from '@/src/constants/colors'

interface AddressInputProps {
  value: string
  error: string | null
  onChangeText: (text: string) => void
  onQRPress: () => void
}

export const AddressInput: React.FC<AddressInputProps> = ({
  value,
  error,
  onChangeText,
  onQRPress
}) => {
  const handleTextChange = (text: string) => {
    // Only allow alphanumeric characters
    const filteredText = text.replace(/[^a-zA-Z0-9]/g, '')
    onChangeText(filteredText)
  }

  return (
    <View style={styles.container}>
      <View style={styles.addressSection}>
        <TextInput
          style={[
            styles.addressInput,
            error && styles.addressInputError
          ]}
          placeholder="Bitcoin Address"
          value={value}
          onChangeText={handleTextChange}
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          multiline={false}
        />
        <TouchableOpacity 
          style={styles.qrButton}
          onPress={onQRPress}
          accessibilityLabel="Scan QR Code"
        >
          <QrCode size={24} color={Colors.light.buttons.text} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    marginBottom : 32
  },
  addressSection : {
    flexDirection : 'row'
  },
  addressInput : {
    flex              : 1,
    height            : 56,
    backgroundColor   : '#F5F5F5',
    borderRadius      : 12,
    paddingHorizontal : 16,
    marginRight       : 12,
    fontSize          : 16
  },
  addressInputError : {
    backgroundColor : '#FFF5F5',
    borderWidth     : 1,
    borderColor     : Colors.light.buttons.danger
  },
  errorText : {
    color      : Colors.light.buttons.danger,
    fontSize   : 14,
    marginTop  : 8,
    marginLeft : 4
  },
  qrButton : {
    width           : 56,
    height          : 56,
    backgroundColor : Colors.light.buttons.primary,
    borderRadius    : 12,
    justifyContent  : 'center',
    alignItems      : 'center'
  }
}) 