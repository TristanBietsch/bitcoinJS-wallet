import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface FeatureChipsProps {
  features: string[];
}

export const FeatureChips: React.FC<FeatureChipsProps> = ({ features }) => {
  return (
    <View style={styles.container}>
      {features.map((feature, index) => (
        <View key={index} style={styles.chip}>
          <Text style={styles.chipText}>{feature}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flexDirection : 'row',
    flexWrap      : 'wrap',
    gap           : 8,
    padding       : 16,
  },
  chip : {
    backgroundColor   : '#f0f0f0',
    paddingVertical   : 8,
    paddingHorizontal : 16,
    borderRadius      : 20,
  },
  chipText : {
    fontSize : 14,
    color    : '#666',
  },
}) 