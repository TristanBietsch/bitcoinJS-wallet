import React from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import { Colors } from '@/src/constants/colors'
import { TransactionConstants } from '@/src/constants/transaction'

interface TransactionDetailsLoadingProps {
  onBackPress: () => void
}

export const TransactionDetailsLoading: React.FC<TransactionDetailsLoadingProps> = ({ onBackPress }) => {
  return (
    <View style={[ styles.container, styles.centerContent ]}>
      <BackButton 
        onPress={onBackPress} 
        accessibilityLabel={TransactionConstants.accessibility.backButton}
      />
      <ActivityIndicator size="large" color={Colors.light.electricBlue} />
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
}) 