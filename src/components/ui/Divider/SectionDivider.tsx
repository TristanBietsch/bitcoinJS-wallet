import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'

interface SectionDividerProps {
  style?: ViewStyle
}

/**
 * A simple horizontal divider for separating sections
 */
export const SectionDivider = ({ style }: SectionDividerProps) => (
  <View style={[ styles.sectionDivider, style ]} />
)

const styles = StyleSheet.create({
  sectionDivider : {
    height           : 1,
    backgroundColor  : '#E0E0E0',
    marginVertical   : 16,
    marginHorizontal : 16,
  }
})

export default SectionDivider 