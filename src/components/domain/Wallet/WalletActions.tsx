import React from 'react'
import { View, StyleSheet } from 'react-native'
import Button from '../ui/Button'

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
          <Button 
            title="Send" 
            onPress={onSend} 
            disabled={disabled}
            fullWidth
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button 
            title="Receive" 
            onPress={onReceive} 
            disabled={disabled}
            variant="secondary"
            fullWidth
          />
        </View>
      </View>

      {showSwap && onSwap && (
        <View style={styles.secondaryButtonRow}>
          <Button 
            title="Swap" 
            onPress={onSwap}
            variant="outline"
            disabled={disabled}
            fullWidth
          />
        </View>
      )}

      {showBackup && onBackup && (
        <View style={styles.secondaryButtonRow}>
          <Button 
            title="Backup Wallet" 
            onPress={onBackup}
            variant="outline"
            disabled={disabled}
            fullWidth
          />
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
})

export default WalletActions 