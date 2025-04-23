import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import SimpleScreenLayout from '@/src/components/layout/SimpleScreenLayout'
import { useMenuNavigation } from '@/src/hooks/menu/useMenuNavigation'
import { SupportOptions, SecurityWarning } from '@/src/components/features/Support'

const SupportScreen = () => {
  const { handleClose } = useMenuNavigation()

  const handleDiscordPress = () => {
    // Handle Discord support option press
    console.log('Discord support pressed')
  }

  const handleFaqPress = () => {
    // Handle FAQ option press
    console.log('FAQ pressed')
  }

  return (
    <SimpleScreenLayout 
      title=""
      onBackPress={handleClose}
    >
      <View style={styles.container}>
        {/* Title Section */}
        <Text style={styles.titleText}>How can we help you?</Text>
        
        {/* Support Options Section */}
        <SupportOptions 
          onDiscordPress={handleDiscordPress}
          onFaqPress={handleFaqPress}
        />
        
        {/* Security Warning Section */}
        <SecurityWarning 
          message="For security reasons, we will never ask for your recovery phrase or private keys. Stay safe and don't share sensitive information with anyone."
        />
      </View>
    </SimpleScreenLayout>
  )
}

const styles = StyleSheet.create({
  container : {
    flex       : 1,
    padding    : 20,
    alignItems : 'center',
    width      : '100%',
  },
  titleText : {
    fontSize     : 22,
    fontWeight   : 'bold',
    textAlign    : 'center',
    marginTop    : 20,
    marginBottom : 100,
  }
})

export default SupportScreen 