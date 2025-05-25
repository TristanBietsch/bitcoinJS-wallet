import React from 'react'
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { BookOpen, ChevronRight } from 'lucide-react-native'
import SectionContainer from './SectionContainer'
import '@/src/types/@types/about.d.ts'

interface BulletItemProps {
  text: string
}

const BulletItem: React.FC<BulletItemProps> = ({ text }) => {
  return (
    <View style={styles.bulletItem}>
      <View style={styles.bullet} />
      <ThemedText style={styles.bulletText}>{text}</ThemedText>
    </View>
  )
}

const ReleaseNotes: React.FC<About.ReleaseNotesData> = ({
  version,
  date,
  bulletPoints,
  releaseHistoryUrl
}) => {
  const openReleaseHistory = () => {
    Linking.openURL(releaseHistoryUrl).catch((err) => 
      console.error('Error opening release history:', err)
    )
  }

  return (
    <SectionContainer
      icon={<BookOpen size={20} color="#000" />}
      title="Release Notes"
    >
      <View style={styles.releaseContainer}>
        <ThemedText style={styles.releaseVersion}>{version}</ThemedText>
        <ThemedText style={styles.releaseDate}>{date}</ThemedText>
        
        <View style={styles.bulletList}>
          {bulletPoints.map((point, index) => (
            <BulletItem key={index} text={point} />
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.viewHistoryLink}
          onPress={openReleaseHistory}
        >
          <ThemedText style={styles.viewHistoryText}>View full release history</ThemedText>
          <ChevronRight size={16} color="#0066CC" />
        </TouchableOpacity>
      </View>
    </SectionContainer>
  )
}

const styles = StyleSheet.create({
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

export default ReleaseNotes 