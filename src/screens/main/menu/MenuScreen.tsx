import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { router } from 'expo-router'
import { X } from 'lucide-react-native'
import { Colors } from '@/src/constants/colors'
import AppHeader from '@/src/components/ui/Header/AppHeader'

const MenuScreen = () => {
  const handleClose = () => {
    router.back()
  }

  const handleNavigation = (route: string) => {
    router.push(route as any)
  }

  // Header with close button
  const closeButton = (
    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
      <X size={24} color={Colors.light.text} />
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <AppHeader rightComponent={closeButton} />
      
      <View style={styles.menuItems}>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => handleNavigation('/settings')}
        >
          <ThemedText style={styles.menuText}>Settings</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => handleNavigation('/about')}
        >
          <ThemedText style={styles.menuText}>About</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => handleNavigation('/example')}
        >
          <ThemedText style={styles.menuText}>Example</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => handleNavigation('/support')}
        >
          <ThemedText style={styles.menuText}>Support</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => handleNavigation('/feedback')}
        >
          <ThemedText style={styles.menuText}>Feedback</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => handleNavigation('/legal')}
        >
          <ThemedText style={styles.menuText}>Legal</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : Colors.light.background,
  },
  closeButton : {
    padding : 8,
  },
  menuItems : {
    paddingTop        : 40,
    paddingHorizontal : 20,
  },
  menuItem : {
    paddingVertical : 16,
  },
  menuText : {
    fontSize : 16,
  }
})

export default MenuScreen 