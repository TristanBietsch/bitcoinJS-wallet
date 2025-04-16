import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { fonts } from '@/src/constants/fonts'

interface ActivityHeaderProps {
  title?: string
}

/**
 * A reusable header component for activity screens
 */
export const ActivityHeader = ({ title = 'Activity' }: ActivityHeaderProps) => {
  return (
    <View style={styles.header}>
      <ThemedText type="title" style={styles.headerTitle}>
        {title}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  header : {
    paddingHorizontal : 16,
    paddingTop        : 78,
    paddingBottom     : 16,
    backgroundColor   : '#FFFFFF',
  },
  headerTitle : {
    fontSize   : 28,
    fontFamily : fonts.bold,
    textAlign  : 'center',
  },
})

export default ActivityHeader 