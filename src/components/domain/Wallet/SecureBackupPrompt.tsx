import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS } from '@/src/types/theme/colors.types'
import Card from '@/src/components/common/Card'
import Button from '../ui/Button'

interface SecureBackupPromptProps {
  onBackupNow: () => void;
  onRemindLater: () => void;
  walletName?: string;
  daysCreated?: number;
}

const SecureBackupPrompt: React.FC<SecureBackupPromptProps> = ({
  onBackupNow,
  onRemindLater,
  walletName = 'Your wallet',
  daysCreated = 0,
}) => {
  const daysText = daysCreated === 0 
    ? 'today' 
    : daysCreated === 1 
      ? 'yesterday' 
      : `${daysCreated} days ago`

  return (
    <Card style={styles.card}>
      <View style={styles.warningHeader}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningTitle}>Backup Required</Text>
      </View>
      
      <Text style={styles.warningText}>
        {walletName} was created {daysText} and hasn't been backed up. 
        If your device is lost or damaged, your funds could be lost forever.
      </Text>
      
      <View style={styles.buttonsContainer}>
        <Button 
          title="Backup Now" 
          onPress={onBackupNow}
          fullWidth
        />
        <View style={styles.buttonSpacer} />
        <Button 
          title="Remind Later" 
          onPress={onRemindLater}
          variant="outline"
          fullWidth
        />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card : {
    backgroundColor  : COLORS.warningLight,
    borderLeftWidth  : 4,
    borderLeftColor  : COLORS.warning,
    marginHorizontal : 16,
    marginVertical   : 16,
  },
  warningHeader : {
    flexDirection : 'row',
    alignItems    : 'center',
    marginBottom  : 12,
  },
  warningIcon : {
    fontSize    : 20,
    marginRight : 8,
  },
  warningTitle : {
    fontSize   : 18,
    fontWeight : 'bold',
    color      : COLORS.warning,
  },
  warningText : {
    fontSize     : 14,
    lineHeight   : 20,
    color        : COLORS.text,
    marginBottom : 16,
  },
  buttonsContainer : {
    marginTop : 8,
  },
  buttonSpacer : {
    height : 12,
  },
})

export default SecureBackupPrompt 