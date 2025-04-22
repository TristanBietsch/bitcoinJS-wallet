import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface MenuItemProps {
  label: string
  onPress: () => void
  testID?: string
}

/**
 * Reusable menu item component
 */
const MenuItem: React.FC<MenuItemProps> = ({ 
  label, 
  onPress, 
  testID 
}) => {
  return (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress}
      testID={testID}
    >
      <ThemedText style={styles.menuText}>{label}</ThemedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  menuItem : {
    paddingVertical : 24,
    paddingLeft     : 16,
  },
  menuText : {
    fontSize   : 32,
    fontWeight : '500',
  }
})

export default MenuItem 