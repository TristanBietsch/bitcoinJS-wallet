import React from 'react'
import { View, StyleSheet } from 'react-native'
import { MessageCircle, FileText } from 'lucide-react-native'
import SupportOption from './SupportOption'

interface SupportOptionsProps {
  onDiscordPress: () => void
  onFaqPress: () => void
}

const SupportOptions: React.FC<SupportOptionsProps> = ({
  onDiscordPress,
  onFaqPress
}) => {
  return (
    <View style={styles.container}>
      {/* Discord Support Option */}
      <SupportOption
        icon={<MessageCircle size={24} color="#fff" />}
        iconBackgroundColor="#5865F2"
        title="Discord Support"
        description="Join our community to contact the developer"
        onPress={onDiscordPress}
      />
      
      <View style={styles.divider} />
      
      {/* FAQ Support Option */}
      <SupportOption
        icon={<FileText size={24} color="#fff" />}
        iconBackgroundColor="#4ade80"
        title="Frequently Asked Questions"
        description="Find answers to common questions"
        onPress={onFaqPress}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    width : '100%',
  },
  divider : {
    height : 15,
  }
})

export default SupportOptions 