import React from 'react'
import { View, StyleSheet } from 'react-native'

interface SeparatorProps {
  color?: string;
}

export const Separator: React.FC<SeparatorProps> = ({
  color = '#E0E0E0'
}) => {
  return (
    <View style={[ styles.separator, { backgroundColor: color } ]} />
  )
}

const styles = StyleSheet.create({
  separator : {
    height : 1,
    width  : '100%',
  },
}) 