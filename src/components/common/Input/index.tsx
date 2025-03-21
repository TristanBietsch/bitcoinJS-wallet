import React from 'react'
import { TextInput, View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../config/Colors'

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  secureTextEntry?: boolean;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
}

const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  secureTextEntry = false,
  error,
  autoCapitalize = 'none',
  keyboardType = 'default',
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[ styles.input, error && styles.inputError ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        placeholderTextColor={Colors.light.inactiveGray}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    marginBottom : 16,
    width        : '100%',
  },
  label : {
    fontSize     : 14,
    marginBottom : 8,
    color        : Colors.light.text,
    fontWeight   : '500',
  },
  input : {
    backgroundColor : Colors.light.background,
    borderWidth     : 1,
    borderColor     : Colors.light.subtleBorder,
    borderRadius    : 8,
    padding         : 12,
    fontSize        : 16,
    color           : Colors.light.text,
  },
  inputError : {
    borderColor : Colors.light.errorRed,
  },
  errorText : {
    color     : Colors.light.errorRed,
    fontSize  : 12,
    marginTop : 4,
  },
})

export default Input 