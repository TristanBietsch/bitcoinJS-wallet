import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  label, 
  onPress, 
  variant = 'primary',
  icon
}) => {
  return (
    <TouchableOpacity
      style={[ styles.button, variant === 'primary' ? styles.primaryButton : styles.secondaryButton ]}
      onPress={onPress}
    >
      {icon}
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button : {
    padding        : 12,
    borderRadius   : 8,
    alignItems     : 'center',
    justifyContent : 'center',
    marginVertical : 6,
    flexDirection  : 'row',
  },
  primaryButton : {
    backgroundColor : '#1565C0',
  },
  secondaryButton : {
    backgroundColor : '#2196F3',
  },
  buttonText : {
    color      : '#FFFFFF',
    fontSize   : 16,
    fontWeight : '600',
  },
}) 