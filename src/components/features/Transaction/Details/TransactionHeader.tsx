import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Check } from 'lucide-react-native'

interface TransactionHeaderProps {
  type: 'send' | 'receive';
  showSuccessIcon?: boolean;
}

export const TransactionHeader: React.FC<TransactionHeaderProps> = ({ 
  type,
  showSuccessIcon = true 
}) => {
  return (
    <View style={styles.container}>
      {showSuccessIcon && (
        <View style={styles.iconContainer}>
          <Check size={28} color="#FFFFFF" />
        </View>
      )}
      <Text style={styles.title}>
        {type === 'send' ? 'Sent' : 'Received'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    alignItems     : 'center',
    justifyContent : 'center',
    marginBottom   : 32,
    marginTop      : 16,
  },
  iconContainer : {
    width           : 64,
    height          : 64,
    borderRadius    : 32,
    backgroundColor : '#00C853',
    justifyContent  : 'center',
    alignItems      : 'center',
    marginBottom    : 16,
    // Add notched edge effect
    borderWidth     : 0,
    borderColor     : '#00C853',
    shadowColor     : '#000',
    shadowOffset    : { width: 0, height: 1 },
    shadowOpacity   : 0.2,
    shadowRadius    : 2,
    elevation       : 3,
  },
  title : {
    fontSize   : 24,
    fontWeight : 'bold',
    color      : '#000000',
  },
}) 