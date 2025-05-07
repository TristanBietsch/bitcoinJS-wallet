import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import RequestAmountDisplay from './RequestAmountDisplay'

interface RequestAmountCardProps {
  satsAmount: string
  usdAmount: string
  title?: string
  style?: ViewStyle
}

/**
 * Component to display payment request amount in a card format
 */
const RequestAmountCard: React.FC<RequestAmountCardProps> = ({
  satsAmount,
  usdAmount,
  title = 'Payment Request',
  style
}) => {
  return (
    <View style={[ styles.container, style ]}>
      {title && (
        <ThemedText style={styles.title}>{title}</ThemedText>
      )}
      
      <View style={styles.amountDisplay}>
        <RequestAmountDisplay 
          satsAmount={satsAmount}
          usdAmount={usdAmount}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    width          : '100%',
    alignItems     : 'center',
    padding        : 16,
    marginVertical : 16,
  },
  title : {
    fontSize     : 16,
    fontWeight   : '500',
    marginBottom : 8,
    opacity      : 0.7,
  },
  amountDisplay : {
    marginVertical : 8,
  }
})

export default RequestAmountCard 