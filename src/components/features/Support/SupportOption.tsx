import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { ChevronRight } from 'lucide-react-native'

interface SupportOptionProps {
  icon: React.ReactNode
  iconBackgroundColor: string
  title: string
  description: string
  onPress: () => void
}

const SupportOption: React.FC<SupportOptionProps> = ({
  icon,
  iconBackgroundColor,
  title,
  description,
  onPress
}) => {
  return (
    <TouchableOpacity style={styles.optionContainer} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
        {icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.headerText}>{title}</Text>
        <Text style={styles.subheaderText}>{description}</Text>
      </View>
      <ChevronRight size={24} color="#999" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  optionContainer : {
    flexDirection   : 'row',
    width           : '100%',
    marginBottom    : 40,
    alignItems      : 'center',
    paddingVertical : 8,
  },
  iconContainer : {
    width          : 60,
    height         : 60,
    borderRadius   : 30,
    justifyContent : 'center',
    alignItems     : 'center',
    marginRight    : 16,
  },
  textContainer : {
    flex : 1,
  },
  headerText : {
    fontSize     : 16,
    fontWeight   : 'bold',
    marginBottom : 4,
  },
  subheaderText : {
    fontSize : 14,
    color    : '#666',
  }
})

export default SupportOption 