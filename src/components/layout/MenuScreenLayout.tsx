import React, { ReactNode } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { X } from 'lucide-react-native'
import { Colors } from '@/src/constants/colors'
import AppHeader from '@/src/components/ui/Header/AppHeader'

interface MenuScreenLayoutProps {
  children: ReactNode
  onClose: () => void
}

/**
 * Layout component for the menu screen
 */
const MenuScreenLayout: React.FC<MenuScreenLayoutProps> = ({
  children,
  onClose
}) => {
  // Header with close button
  const closeButton = (
    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
      <X size={24} color={Colors.light.text} />
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <AppHeader rightComponent={closeButton} />
      <View style={styles.contentContainer}>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : Colors.light.background,
  },
  contentContainer : {
    flex     : 1,
    position : 'relative',
  },
  closeButton : {
    padding : 8,
  }
})

export default MenuScreenLayout 