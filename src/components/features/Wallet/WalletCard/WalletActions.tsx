import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

interface WalletActionsProps {
  onSend: () => void;
  onReceive: () => void;
  onSwap?: () => void;
  onBackup?: () => void;
  showSwap?: boolean;
  showBackup?: boolean;
  disabled?: boolean;
}

const WalletActions: React.FC<WalletActionsProps> = ({
  onSend,
  onReceive,
  onSwap,
  onBackup,
  showSwap = false,
  showBackup = false,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.mainActionsRow}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[ styles.button, styles.primaryButton ]}
            onPress={onSend}
            disabled={disabled}
          >
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[ styles.button, styles.secondaryButton ]}
            onPress={onReceive}
            disabled={disabled}
          >
            <Text style={styles.buttonText}>Receive</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showSwap && onSwap && (
        <View style={styles.secondaryButtonRow}>
          <TouchableOpacity 
            style={[ styles.button, styles.outlineButton ]}
            onPress={onSwap}
            disabled={disabled}
          >
            <Text style={[ styles.buttonText, styles.outlineButtonText ]}>Swap</Text>
          </TouchableOpacity>
        </View>
      )}

      {showBackup && onBackup && (
        <View style={styles.secondaryButtonRow}>
          <TouchableOpacity 
            style={[ styles.button, styles.outlineButton ]}
            onPress={onBackup}
            disabled={disabled}
          >
            <Text style={[ styles.buttonText, styles.outlineButtonText ]}>Backup Wallet</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    padding : 16,
  },
  mainActionsRow : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    marginBottom   : 16,
  },
  buttonContainer : {
    flex             : 1,
    marginHorizontal : 4,
  },
  secondaryButtonRow : {
    marginTop : 8,
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
  secondaryButton : {
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

export default WalletActions 