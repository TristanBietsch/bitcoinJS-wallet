import React from 'react'
import { StyleSheet } from 'react-native'
import { FileLock2 } from 'lucide-react-native'
import { ThemedText } from '@/src/components/ui/Text'
import InfoScreen from '@/src/components/ui/InfoScreen/InfoScreen'
import { Colors } from '@/src/constants/colors'
import { SEED_PHRASE_PREPARATION } from '@/src/constants/securityContent'

interface PreparePhraseScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

/**
 * Screen that prepares users for the seed phrase backup process
 */
export default function PreparePhraseScreen({ onComplete, onBack }: PreparePhraseScreenProps) {
  return (
    <InfoScreen
      title={SEED_PHRASE_PREPARATION.TITLE}
      description={SEED_PHRASE_PREPARATION.DESCRIPTION}
      onPrimaryAction={onComplete}
      onBack={onBack}
      primaryButtonLabel={SEED_PHRASE_PREPARATION.BUTTON_LABEL}
      icon={
        <FileLock2 
          size={90} 
          color={Colors.light.buttons.primary} 
          style={styles.icon}
        />
      }
    >
      <ThemedText style={styles.securityText}>
        {SEED_PHRASE_PREPARATION.SECURITY_TEXT}
      </ThemedText>
    </InfoScreen>
  )
}

const styles = StyleSheet.create({
  icon : {
    marginBottom : 0
  },
  securityText : {
    textAlign    : 'center',
    fontSize     : 16,
    lineHeight   : 24,
    marginBottom : 60,
  }
}) 