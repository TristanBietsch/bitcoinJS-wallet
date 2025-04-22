import React, { ReactNode } from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface SectionContainerProps {
  icon: ReactNode
  title: string
  children: ReactNode
}

const SectionContainer: React.FC<SectionContainerProps> = ({
  icon,
  title,
  children
}) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      </View>
      
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  sectionContainer : {
    marginBottom      : 30,
    width             : '100%',
    paddingHorizontal : 20
  },
  sectionHeader : {
    flexDirection : 'row',
    alignItems    : 'center',
    marginBottom  : 20
  },
  iconContainer : {
    width           : 36,
    height          : 36,
    backgroundColor : '#EEEEEE',
    borderRadius    : 8,
    justifyContent  : 'center',
    alignItems      : 'center',
    marginRight     : 12
  },
  sectionTitle : {
    fontSize   : 18,
    fontWeight : 'bold'
  }
})

export default SectionContainer 