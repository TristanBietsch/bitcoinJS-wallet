import React from 'react'
import { StyleSheet } from 'react-native'
import { useMenuNavigation } from '@/src/hooks/menu/useMenuNavigation'
import SimpleScreenLayout from '@/src/components/layout/SimpleScreenLayout'
import { ScrollView } from 'react-native-gesture-handler'
import { 
  AboutHeader, 
  TechnicalDetails, 
  ReleaseNotes
} from '@/src/components/features/About'
import '@/src/types/@types/about.d.ts'

const AboutScreen = () => {
  const { handleClose } = useMenuNavigation()
  
  // Release notes data
  const releaseNotes: About.ReleaseNotesData = {
    version      : 'Version 1.2.2',
    date         : 'Released March 22, 2025',
    bulletPoints : [
      'Added silent payments support',
      'Enhanced security for PIN entry',
      'Bug fixes and stability improvements'
    ],
    releaseHistoryUrl : 'https://github.com/nummuswallet/releases'
  }

  // Technical details data
  const technicalDetails: About.TechnicalDetailsData = {
    network  : 'Mainnet',
    platform : 'iOS 18.182',
    version  : 'v1.0'
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
        <AboutHeader />
        
        <TechnicalDetails 
          network={technicalDetails.network}
          platform={technicalDetails.platform}
          version={technicalDetails.version}
        />
        
        <ReleaseNotes 
          version={releaseNotes.version}
          date={releaseNotes.date}
          bulletPoints={releaseNotes.bulletPoints}
          releaseHistoryUrl={releaseNotes.releaseHistoryUrl}
        />
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
  }
})

export default AboutScreen 