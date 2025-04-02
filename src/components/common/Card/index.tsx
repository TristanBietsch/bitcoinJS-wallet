import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { Colors } from '@/src/constants/colors'

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
}

const Card: React.FC<CardProps> = ({ children, style, elevation = 2 }) => {
  return (
    <View style={[ styles.card, { elevation }, style ]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card : {
    backgroundColor : Colors.light.background,
    borderRadius    : 12,
    padding         : 16,
    marginVertical  : 8,
    shadowColor     : Colors.light.subtleBorder,
    shadowOffset    : { width: 0, height: 2 },
    shadowOpacity   : 0.1,
    shadowRadius    : 4,
  },
})

export default Card 