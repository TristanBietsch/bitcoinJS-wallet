import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import { Colors } from '@/src/constants/colors'
import { TransactionConstants } from '@/src/constants/transaction'

interface TransactionDetailsErrorProps {
  onBackPress: () => void
  error?: Error | null
}

export const TransactionDetailsError: React.FC<TransactionDetailsErrorProps> = ({ 
  onBackPress,
  error 
}) => {
  return (
    <View style={[ styles.container, styles.centerContent ]}>
      <BackButton 
        onPress={onBackPress} 
        accessibilityLabel={TransactionConstants.accessibility.backButton}
      />
      <Text style={styles.errorText}>
        {error ? 'Error loading transaction' : 'Transaction not found'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : Colors.light.background,
  },
  centerContent : {
    justifyContent : 'center',
    alignItems     : 'center',
  },
  errorText : {
    fontSize  : 16,
    color     : Colors.light.errorRed,
    textAlign : 'center',
    marginTop : 16,
  },
}) 