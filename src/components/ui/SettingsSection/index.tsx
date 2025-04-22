import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

const SettingsSection: React.FC<Settings.SettingsSectionProps> = ({
  title,
  children
}) => {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  section : {
    width        : '100%',
    marginTop    : 32,
    marginBottom : 24
  },
  sectionTitle : {
    fontSize     : 24,
    fontWeight   : 'bold',
    marginBottom : 20,
    paddingLeft  : 16
  }
})

export default SettingsSection 