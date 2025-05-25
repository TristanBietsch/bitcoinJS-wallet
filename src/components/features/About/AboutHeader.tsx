import React from 'react'
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Github, Twitter, MessageCircle } from 'lucide-react-native'

interface SocialLinkProps {
  icon: React.ReactNode
  text: string
  url: string
}

const SocialLink: React.FC<SocialLinkProps> = ({ icon, text, url }) => {
  const handlePress = () => {
    Linking.openURL(url).catch((err) => console.error('Error opening link:', err))
  }

  return (
    <TouchableOpacity style={styles.socialButton} onPress={handlePress}>
      {icon}
      <ThemedText style={styles.socialText}>{text}</ThemedText>
    </TouchableOpacity>
  )
}

const AboutHeader: React.FC = () => {
  return (
    <View style={styles.headerSection}>
      <View style={styles.logoContainer}>
        <ThemedText style={styles.logoText}>LOGO</ThemedText>
      </View>
      
      <ThemedText style={styles.walletName}>
        Nummus Wallet is a free and open source wallet. Made by Tristan Bietsch.
      </ThemedText>
      
      {/* Social Media Links */}
      <View style={styles.socialLinks}>
        <SocialLink 
          icon={<Github size={24} color="#000" />} 
          text="Github" 
          url="https://github.com/nummuswallet" 
        />
        
        <SocialLink 
          icon={<Twitter size={24} color="#000" />} 
          text="Twitter" 
          url="https://twitter.com/nummuswallet" 
        />
        
        <SocialLink 
          icon={<MessageCircle size={24} color="#000" />} 
          text="Discord" 
          url="https://discord.gg/nummuswallet" 
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  headerSection : {
    alignItems   : 'center',
    marginBottom : 40,
    paddingTop   : 20
  },
  logoContainer : {
    width           : 130,
    height          : 130,
    backgroundColor : '#DDDDDD',
    justifyContent  : 'center',
    alignItems      : 'center',
    marginBottom    : 20
  },
  logoText : {
    fontSize   : 24,
    fontWeight : 'bold'
  },
  walletName : {
    fontSize          : 14,
    textAlign         : 'center',
    paddingHorizontal : 40,
    marginBottom      : 20,
    color             : '#666666'
  },
  socialLinks : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    width          : '80%',
    marginTop      : 10
  },
  socialButton : {
    alignItems : 'center'
  },
  socialText : {
    marginTop : 8,
    fontSize  : 12
  }
})

export default AboutHeader 