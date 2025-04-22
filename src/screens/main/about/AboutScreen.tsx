import React from 'react'
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import { useMenuNavigation } from '@/src/hooks/menu/useMenuNavigation'
import SimpleScreenLayout from '@/src/components/layout/SimpleScreenLayout'
import { ThemedText } from '@/src/components/ui/Text'
import { Github, Twitter, MessageCircle, BookOpen, Info, ChevronRight } from 'lucide-react-native'
import { ScrollView } from 'react-native-gesture-handler'


const AboutScreen = () => {
  const { handleClose } = useMenuNavigation()

  // Open external links
  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error opening link:', err))
  }

  return (
    <SimpleScreenLayout 
      title=""
      onBackPress={handleClose}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <ThemedText style={styles.logoText}>LOGO</ThemedText>
          </View>
          
          <ThemedText style={styles.walletName}>
            Nummus Wallet is a free and open source wallet. Made by Tristan Bietsch.
          </ThemedText>
          
          {/* Social Media Links */}
          <View style={styles.socialLinks}>
            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={() => openLink('https://github.com/nummuswallet')}
            >
              <Github size={24} color="#000" />
              <ThemedText style={styles.socialText}>Github</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={() => openLink('https://twitter.com/nummuswallet')}
            >
              <Twitter size={24} color="#000" />
              <ThemedText style={styles.socialText}>Twitter</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton} 
              onPress={() => openLink('https://discord.gg/nummuswallet')}
            >
              <MessageCircle size={24} color="#000" />
              <ThemedText style={styles.socialText}>Discord</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Technical Details Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Info size={20} color="#000" />
            </View>
            <ThemedText style={styles.sectionTitle}>Technical Details</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Network</ThemedText>
            <ThemedText style={styles.detailValue}>Mainnet</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Running On</ThemedText>
            <ThemedText style={styles.detailValue}>iOS 18.182</ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Wallet Version</ThemedText>
            <ThemedText style={styles.detailValue}>v1.0</ThemedText>
          </View>
        </View>
        
        {/* Release Notes Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <BookOpen size={20} color="#000" />
            </View>
            <ThemedText style={styles.sectionTitle}>Release Notes</ThemedText>
          </View>
          
          <View style={styles.releaseContainer}>
            <ThemedText style={styles.releaseVersion}>Version 1.2.2</ThemedText>
            <ThemedText style={styles.releaseDate}>Released March 22, 2025</ThemedText>
            
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <ThemedText style={styles.bulletText}>Added silent payments support</ThemedText>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <ThemedText style={styles.bulletText}>Enhanced security for PIN entry</ThemedText>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <ThemedText style={styles.bulletText}>Bug fixes and stability improvements</ThemedText>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.viewHistoryLink}
              onPress={() => openLink('https://github.com/nummuswallet/releases')}
            >
              <ThemedText style={styles.viewHistoryText}>View full release history</ThemedText>
              <ChevronRight size={16} color="#0066CC" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SimpleScreenLayout>
  )
}

const styles = StyleSheet.create({
  scrollView : {
    flex  : 1,
    width : '100%'
  },
  scrollContent : {
    paddingBottom : 40
  },
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
  },
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
  },
  detailRow : {
    flexDirection     : 'row',
    justifyContent    : 'space-between',
    paddingVertical   : 12,
    borderBottomWidth : 1,
    borderBottomColor : '#EEEEEE'
  },
  detailLabel : {
    fontSize : 16,
    color    : '#666666'
  },
  detailValue : {
    fontSize   : 16,
    fontWeight : '500'
  },
  releaseContainer : {
    paddingTop : 10
  },
  releaseVersion : {
    fontSize   : 16,
    fontWeight : 'bold'
  },
  releaseDate : {
    fontSize     : 14,
    color        : '#666666',
    marginTop    : 4,
    marginBottom : 16
  },
  bulletList : {
    marginTop : 10
  },
  bulletItem : {
    flexDirection : 'row',
    alignItems    : 'center',
    marginBottom  : 10
  },
  bullet : {
    width           : 6,
    height          : 6,
    borderRadius    : 3,
    backgroundColor : '#000',
    marginRight     : 10
  },
  bulletText : {
    fontSize : 14
  },
  viewHistoryLink : {
    flexDirection : 'row',
    alignItems    : 'center',
    marginTop     : 16
  },
  viewHistoryText : {
    fontSize    : 14,
    color       : '#0066CC',
    marginRight : 4
  }
})

export default AboutScreen 