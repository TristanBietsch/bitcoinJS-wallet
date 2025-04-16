import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

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
    <View style={styles.card}>
      <View style={styles.warningHeader}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningTitle}>Backup Required</Text>
      </View>
      
      <Text style={styles.warningText}>
        {walletName} was created {daysText} and hasn't been backed up. 
        If your device is lost or damaged, your funds could be lost forever.
      </Text>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[ styles.button, styles.primaryButton ]}
          onPress={onBackupNow}
        >
          <Text style={styles.buttonText}>Backup Now</Text>
        </TouchableOpacity>
        <View style={styles.buttonSpacer} />
        <TouchableOpacity 
          style={[ styles.button, styles.outlineButton ]}
          onPress={onRemindLater}
        >
          <Text style={[ styles.buttonText, styles.outlineButtonText ]}>Remind Later</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card : {
    backgroundColor  : '#FFF5F5',
    borderLeftWidth  : 4,
    borderLeftColor  : '#FF4A6E',
    marginHorizontal : 16,
    marginVertical   : 16,
    padding          : 16,
    borderRadius     : 12,
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
    color      : '#FF4A6E',
  },
  warningText : {
    fontSize     : 14,
    lineHeight   : 20,
    color        : '#0A0B10',
    marginBottom : 16,
  },
  buttonsContainer : {
    marginTop : 8,
  },
  buttonSpacer : {
    height : 12,
  },
  button : {
    padding        : 12,
    borderRadius   : 8,
    alignItems     : 'center',
    justifyContent : 'center',
  },
  primaryButton : {
    backgroundColor : '#0085FF',
  },
  outlineButton : {
    backgroundColor : 'transparent',
    borderWidth     : 1,
    borderColor     : '#0085FF',
  },
  buttonText : {
    color      : '#FFFFFF',
    fontSize   : 16,
    fontWeight : '600',
  },
  outlineButtonText : {
    color : '#0085FF',
  },
})

export default SecureBackupPrompt 