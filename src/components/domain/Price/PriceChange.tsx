/**
 * Price change indicator component
 * Displays percentage change in Bitcoin price with appropriate color
 */
import React from 'react'
import { Text, StyleSheet } from 'react-native'
import { PriceChangeProps } from '@/src/types/price.types'

const PriceChange: React.FC<PriceChangeProps> = ({ changePercent, timeframe }) => {
  if (changePercent === null) return null
  
  const isPositive = changePercent > 0
  const color = isPositive ? '#00D782' : '#FF4D4D'
  const period = timeframe.label === '1d' ? '(24h)' : 
                timeframe.label === '1w' ? '(1W)' : 
                timeframe.label === '1m' ? '(1M)' :
                timeframe.label === '1y' ? '(1Y)' : ''
  
  return (
    <Text style={[ styles.priceChangeText, { color } ]}>
      {isPositive ? '↑' : '↓'} {Math.abs(changePercent).toFixed(2)}% {period}
    </Text>
  )
}

const styles = StyleSheet.create({
  priceChangeText : {
    fontFamily : 'Inter-Medium',
    fontSize   : 16,
    marginTop  : 5,
  },
})

export default PriceChange 