import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  containerStyle?: object
  titleStyle?: object
  subtitleStyle?: object
}

/**
 * A reusable section header component with title and optional subtitle
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  containerStyle,
  titleStyle,
  subtitleStyle
}) => {
  return (
    <View style={[ styles.headerContainer, containerStyle ]}>
      <ThemedText type="title" style={[ styles.title, titleStyle ]}>
        {title}
      </ThemedText>
      
      {subtitle && (
        <ThemedText style={[ styles.subtitle, subtitleStyle ]}>
          {subtitle}
        </ThemedText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  headerContainer : {
    width      : '100%',
    alignItems : 'center',
    marginTop  : 20,
  },
  title : {
    fontSize     : 28,
    fontWeight   : 'bold',
    textAlign    : 'center',
    marginBottom : 10,
  },
  subtitle : {
    fontSize          : 16,
    textAlign         : 'center',
    marginBottom      : 20,
    paddingHorizontal : 20,
  },
})

export default SectionHeader 